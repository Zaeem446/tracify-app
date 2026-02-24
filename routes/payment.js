const express = require('express');
const db = require('../database/db');

const router = express.Router();

// Initialize Stripe (will be null if no key configured)
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
}

// Get Stripe configuration (publishable key only - safe to expose)
router.get('/stripe-config', (req, res) => {
    res.json({
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || null
    });
});

// Middleware to check customer authentication
async function requireCustomerAuth(req, res, next) {
    const sessionToken = req.cookies.session_token;

    if (!sessionToken) {
        return res.status(401).json({ error: 'Please login to continue' });
    }

    const session = await db.sessions.findByToken(sessionToken);
    if (!session) {
        return res.status(401).json({ error: 'Session expired. Please login again.' });
    }

    req.customerId = session.customer_id;
    req.customerEmail = session.email;
    next();
}

// Get pricing plans
router.get('/plans', (req, res) => {
    res.json({
        trial: {
            id: 'trial',
            name: 'Trial Period',
            amount: 1.25,
            currency: 'USD',
            duration: '24 hours',
            description: 'Full access to all platform services for 24 hours'
        },
        monthly: {
            id: 'monthly',
            name: 'Monthly Subscription',
            amount: 30.00,
            currency: 'USD',
            duration: '30 days',
            description: 'Unlimited access with monthly billing'
        }
    });
});

// Create payment intent (for Stripe)
router.post('/create-intent', requireCustomerAuth, async (req, res) => {
    try {
        const { planType } = req.body;
        const amounts = { trial: 1.25, monthly: 30.00 };
        const amount = amounts[planType] || amounts.trial;

        if (stripe) {
            // Real Stripe payment
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amount * 100), // Stripe expects amount in cents (smallest currency unit)
                currency: 'usd',
                metadata: {
                    customerId: req.customerId,
                    planType
                }
            });

            res.json({
                clientSecret: paymentIntent.client_secret,
                amount,
                planType
            });
        } else {
            // Development mode - simulate payment intent
            res.json({
                clientSecret: 'dev_' + Date.now(),
                amount,
                planType,
                devMode: true
            });
        }
    } catch (error) {
        console.error('Payment intent error:', error);
        res.status(500).json({ error: 'Failed to create payment' });
    }
});

// Stripe Price ID for monthly subscription
const MONTHLY_PRICE_ID = 'price_1T33q3RevHepjMisaypfhlkG';
const TRIAL_AMOUNT = 125; // $1.25 in cents

// Process payment - charges $1.25 trial, then sets up $30/month recurring
router.post('/process', requireCustomerAuth, async (req, res) => {
    try {
        const { planType, paymentMethodId, cardLast4 } = req.body;
        const customerId = req.customerId;

        const amounts = { trial: 1.25, monthly: 30.00 };
        const amount = amounts[planType] || amounts.trial;

        // Calculate expiry based on plan type
        const now = new Date();
        let expiresAt;
        if (planType === 'trial') {
            expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
        } else {
            expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
        }

        let stripeCustomerId = null;
        let stripePaymentId = null;
        let stripeSubscriptionId = null;

        if (stripe && paymentMethodId && !paymentMethodId.startsWith('dev_')) {
            // Real Stripe processing
            try {
                console.log('Processing Stripe payment...', { customerId, amount, planType });

                // Get customer from database
                const customer = await db.customers.findById(customerId);
                console.log('Creating Stripe customer for:', customer.email);

                // Create Stripe customer
                const stripeCustomer = await stripe.customers.create({
                    email: customer.email,
                    metadata: { tracifyCustomerId: String(customerId) }
                });
                stripeCustomerId = stripeCustomer.id;
                console.log('Stripe customer created:', stripeCustomerId);

                // Attach payment method to customer
                console.log('Attaching payment method:', paymentMethodId);
                await stripe.paymentMethods.attach(paymentMethodId, {
                    customer: stripeCustomerId
                });

                // Set as default payment method
                await stripe.customers.update(stripeCustomerId, {
                    invoice_settings: {
                        default_payment_method: paymentMethodId
                    }
                });
                console.log('Payment method attached and set as default');

                // Step 1: Charge $1.25 trial fee immediately
                console.log('Charging $1.25 trial fee...');
                const paymentIntent = await stripe.paymentIntents.create({
                    amount: TRIAL_AMOUNT,
                    currency: 'usd',
                    customer: stripeCustomerId,
                    payment_method: paymentMethodId,
                    confirm: true,
                    description: 'Tracify 24-Hour Trial',
                    automatic_payment_methods: {
                        enabled: true,
                        allow_redirects: 'never'
                    }
                });

                if (paymentIntent.status !== 'succeeded') {
                    console.error('Trial payment not succeeded:', paymentIntent.status);
                    return res.status(400).json({
                        error: `Payment ${paymentIntent.status}. Please try a different card.`
                    });
                }

                stripePaymentId = paymentIntent.id;
                console.log('✅ Trial payment successful:', stripePaymentId);

                // Step 2: Create subscription that starts after 24 hours
                console.log('Creating recurring subscription (starts in 24 hours)...');
                const trialEnd = Math.floor(Date.now() / 1000) + (24 * 60 * 60); // 24 hours from now

                const subscription = await stripe.subscriptions.create({
                    customer: stripeCustomerId,
                    items: [{ price: MONTHLY_PRICE_ID }],
                    trial_end: trialEnd,
                    default_payment_method: paymentMethodId,
                    collection_method: 'charge_automatically',
                    payment_settings: {
                        payment_method_types: ['card'],
                        save_default_payment_method: 'on_subscription'
                    },
                    metadata: {
                        tracifyCustomerId: String(customerId),
                        trialPaymentId: stripePaymentId
                    }
                });

                stripeSubscriptionId = subscription.id;
                console.log('✅ Subscription created:', stripeSubscriptionId);
                console.log('   Trial ends:', new Date(trialEnd * 1000).toISOString());
                console.log('   First $30 charge will be on:', new Date(trialEnd * 1000).toISOString());

            } catch (stripeError) {
                console.error('❌ Stripe error details:', {
                    message: stripeError.message,
                    type: stripeError.type,
                    code: stripeError.code,
                    decline_code: stripeError.decline_code
                });
                return res.status(400).json({
                    error: stripeError.message || 'Payment failed. Please try again.'
                });
            }
        } else {
            // Development mode - simulate successful payment
            stripePaymentId = 'dev_pay_' + Date.now();
            stripeSubscriptionId = 'dev_sub_' + Date.now();
            console.log(`\n💳 DEV MODE: Trial payment of $${amount} processed for customer ${customerId}`);
            console.log(`📅 DEV MODE: Subscription created, will charge $30/month after 24 hours\n`);
        }

        // Create subscription record in database
        const subscriptionResult = await db.subscriptions.create(
            customerId,
            planType,
            amount,
            expiresAt.toISOString(),
            stripeCustomerId,
            stripeSubscriptionId
        );

        // Create payment record
        await db.payments.create(
            customerId,
            subscriptionResult.lastInsertRowid,
            amount,
            stripePaymentId,
            cardLast4 ? `card_${cardLast4}` : 'card',
            'completed'
        );

        res.json({
            success: true,
            subscription: {
                id: subscriptionResult.lastInsertRowid,
                planType,
                amount,
                expiresAt: expiresAt.toISOString(),
                recurringAmount: 30.00,
                recurringStartsAt: expiresAt.toISOString()
            },
            redirectTo: '/dashboard'
        });

    } catch (error) {
        console.error('Payment processing error:', error);
        res.status(500).json({ error: 'Payment failed. Please try again.' });
    }
});

// Get customer's subscription status
router.get('/subscription', requireCustomerAuth, async (req, res) => {
    try {
        const subscription = await db.subscriptions.findActiveByCustomerId(req.customerId);

        if (!subscription) {
            return res.json({ hasSubscription: false });
        }

        res.json({
            hasSubscription: true,
            subscription: {
                id: subscription.id,
                planType: subscription.plan_type,
                status: subscription.status,
                amount: subscription.amount,
                startedAt: subscription.started_at,
                expiresAt: subscription.expires_at
            }
        });
    } catch (error) {
        console.error('Subscription check error:', error);
        res.status(500).json({ error: 'Failed to check subscription' });
    }
});

// Cancel subscription
router.post('/cancel', requireCustomerAuth, async (req, res) => {
    try {
        const subscription = await db.subscriptions.findActiveByCustomerId(req.customerId);

        if (!subscription) {
            return res.status(404).json({ error: 'No active subscription found' });
        }

        // If using real Stripe subscription, cancel it
        if (stripe && subscription.stripe_subscription_id && !subscription.stripe_subscription_id.startsWith('dev_')) {
            try {
                console.log('Cancelling Stripe subscription:', subscription.stripe_subscription_id);
                await stripe.subscriptions.cancel(subscription.stripe_subscription_id);
                console.log('✅ Stripe subscription cancelled');
            } catch (stripeError) {
                console.error('Stripe cancel error:', stripeError.message);
                // Continue anyway to update local record
            }
        }

        // Update local record
        await db.subscriptions.cancel(subscription.id);

        res.json({
            success: true,
            message: 'Subscription cancelled successfully. You will not be charged again.'
        });

    } catch (error) {
        console.error('Cancel subscription error:', error);
        res.status(500).json({ error: 'Failed to cancel subscription' });
    }
});

// Payment history
router.get('/history', requireCustomerAuth, async (req, res) => {
    try {
        const payments = await db.payments.getByCustomerId(req.customerId);
        res.json({ payments });
    } catch (error) {
        console.error('Payment history error:', error);
        res.status(500).json({ error: 'Failed to fetch payment history' });
    }
});

// Stripe webhook (for production use)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    if (!stripe) {
        return res.status(400).json({ error: 'Stripe not configured' });
    }

    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log(`📩 Webhook received: ${event.type}`);

    try {
        switch (event.type) {
            case 'invoice.payment_succeeded': {
                const invoice = event.data.object;
                const stripeSubscriptionId = invoice.subscription;
                const amountPaid = invoice.amount_paid / 100; // Convert cents to dollars

                console.log(`💰 Invoice payment succeeded: $${amountPaid} for subscription ${stripeSubscriptionId}`);

                // Skip if this is the initial trial payment (amount is $1.25 or less)
                if (amountPaid <= 1.50) {
                    console.log('   Skipping trial payment - already recorded during signup');
                    break;
                }

                // Find subscription in our database
                const subscription = await db.subscriptions.findByStripeSubscriptionId(stripeSubscriptionId);

                if (subscription) {
                    // Extend subscription by 30 days from now
                    const newExpiresAt = new Date();
                    newExpiresAt.setDate(newExpiresAt.getDate() + 30);

                    await db.subscriptions.extendSubscription(
                        subscription.id,
                        newExpiresAt.toISOString(),
                        'monthly'
                    );

                    console.log(`✅ Subscription ${subscription.id} extended to ${newExpiresAt.toISOString()}`);

                    // Record the payment
                    await db.payments.create(
                        subscription.customer_id,
                        subscription.id,
                        amountPaid,
                        invoice.payment_intent || invoice.id,
                        'card',
                        'completed'
                    );

                    console.log(`✅ Payment of $${amountPaid} recorded for customer ${subscription.customer_id}`);
                } else {
                    console.log(`⚠️ No subscription found for Stripe ID: ${stripeSubscriptionId}`);
                }
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object;
                const stripeSubscriptionId = invoice.subscription;

                console.log(`❌ Invoice payment failed for subscription ${stripeSubscriptionId}`);

                const subscription = await db.subscriptions.findByStripeSubscriptionId(stripeSubscriptionId);

                if (subscription) {
                    // Mark subscription as expired due to payment failure
                    await db.subscriptions.updateStatus(subscription.id, 'expired');
                    console.log(`⚠️ Subscription ${subscription.id} marked as expired due to payment failure`);
                }
                break;
            }

            case 'customer.subscription.updated': {
                const stripeSubscription = event.data.object;
                const stripeSubscriptionId = stripeSubscription.id;
                const status = stripeSubscription.status;

                console.log(`🔄 Subscription ${stripeSubscriptionId} updated to status: ${status}`);

                const subscription = await db.subscriptions.findByStripeSubscriptionId(stripeSubscriptionId);

                if (subscription) {
                    // Map Stripe status to our status
                    let ourStatus = 'active';
                    if (status === 'canceled' || status === 'unpaid') {
                        ourStatus = 'cancelled';
                    } else if (status === 'past_due') {
                        ourStatus = 'expired';
                    }

                    if (ourStatus !== 'active') {
                        await db.subscriptions.updateStatus(subscription.id, ourStatus);
                        console.log(`✅ Subscription ${subscription.id} status updated to ${ourStatus}`);
                    }
                }
                break;
            }

            case 'customer.subscription.deleted': {
                const stripeSubscription = event.data.object;
                const stripeSubscriptionId = stripeSubscription.id;

                console.log(`🗑️ Subscription ${stripeSubscriptionId} deleted/cancelled`);

                const subscription = await db.subscriptions.findByStripeSubscriptionId(stripeSubscriptionId);

                if (subscription) {
                    await db.subscriptions.cancel(subscription.id);
                    console.log(`✅ Subscription ${subscription.id} marked as cancelled`);
                }
                break;
            }

            case 'charge.succeeded': {
                console.log(`💳 Charge succeeded: ${event.data.object.id}`);
                break;
            }

            case 'charge.failed': {
                console.log(`❌ Charge failed: ${event.data.object.id}`);
                break;
            }

            default:
                console.log(`ℹ️ Unhandled event type: ${event.type}`);
        }
    } catch (error) {
        console.error('❌ Webhook processing error:', error);
        // Still return 200 to acknowledge receipt
    }

    res.json({ received: true });
});

// Create Stripe Checkout Session (NEW - for direct Stripe Checkout)
router.post('/create-checkout-session', async (req, res) => {
    try {
        if (!stripe) {
            return res.status(500).json({ error: 'Stripe not configured. Please add your Stripe keys to .env file.' });
        }

        const { priceId, mode, successUrl, cancelUrl } = req.body;

        if (!priceId) {
            return res.status(400).json({ error: 'Price ID is required' });
        }

        // Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            mode: mode || 'payment', // 'payment' for one-time, 'subscription' for recurring
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: successUrl || `${req.headers.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: cancelUrl || `${req.headers.origin}/payment?cancelled=true`,
        });

        res.json({ sessionId: session.id });

    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: error.message || 'Failed to create checkout session' });
    }
});

module.exports = router;
