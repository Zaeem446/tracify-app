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
            amount: 2.00,
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

// Stripe Price ID for monthly subscription
const MONTHLY_PRICE_ID = 'price_1TIADCIggzd46qoMesRQlnq7';
const TRIAL_AMOUNT = 200; // $2.00 in cents

// ============================================================
// Reusable: Create a Stripe Checkout Session for a customer
// Used by both signup (auth.js) and the /payment page button
// ============================================================
async function createCheckoutSessionForCustomer(customerId, customerEmail) {
    if (!stripe) {
        throw new Error('Stripe not configured');
    }

    const appUrl = process.env.APP_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        line_items: [
            // One-time $2.00 trial fee (charged immediately on first invoice)
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'Tracify 24-Hour Trial',
                        description: 'Full access to all platform features for 24 hours'
                    },
                    unit_amount: TRIAL_AMOUNT, // $2.00 in cents
                },
                quantity: 1,
            },
            // Recurring $30/month subscription (starts after trial)
            {
                price: MONTHLY_PRICE_ID,
                quantity: 1,
            },
        ],
        subscription_data: {
            trial_period_days: 1, // 1-day trial, $30 charges after 24h
            metadata: {
                tracifyCustomerId: String(customerId),
            },
        },
        client_reference_id: String(customerId),
        customer_email: customerEmail,
        success_url: `${appUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/payment?cancelled=true`,
        metadata: {
            tracifyCustomerId: String(customerId),
        },
    });

    return session;
}

// Export for use in auth.js
router.createCheckoutSessionForCustomer = createCheckoutSessionForCustomer;

// Create payment intent (for Stripe) - kept for backward compat
router.post('/create-intent', requireCustomerAuth, async (req, res) => {
    try {
        const { planType } = req.body;
        const amounts = { trial: 2.00, monthly: 30.00 };
        const amount = amounts[planType] || amounts.trial;

        if (stripe) {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amount * 100),
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

// Process payment - kept for backward compat
router.post('/process', requireCustomerAuth, async (req, res) => {
    try {
        const { planType, paymentMethodId, cardLast4 } = req.body;
        const customerId = req.customerId;

        const amounts = { trial: 2.00, monthly: 30.00 };
        const amount = amounts[planType] || amounts.trial;

        const now = new Date();
        let expiresAt;
        if (planType === 'trial') {
            expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        } else {
            expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        }

        let stripeCustomerId = null;
        let stripePaymentId = null;
        let stripeSubscriptionId = null;

        if (stripe && paymentMethodId && !paymentMethodId.startsWith('dev_')) {
            try {
                console.log('Processing Stripe payment...', { customerId, amount, planType });

                const customer = await db.customers.findById(customerId);
                console.log('Creating Stripe customer for:', customer.email);

                const stripeCustomer = await stripe.customers.create({
                    email: customer.email,
                    metadata: { tracifyCustomerId: String(customerId) }
                });
                stripeCustomerId = stripeCustomer.id;

                await stripe.paymentMethods.attach(paymentMethodId, {
                    customer: stripeCustomerId
                });

                await stripe.customers.update(stripeCustomerId, {
                    invoice_settings: {
                        default_payment_method: paymentMethodId
                    }
                });

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
                    return res.status(400).json({
                        error: `Payment ${paymentIntent.status}. Please try a different card.`
                    });
                }

                stripePaymentId = paymentIntent.id;

                const trialEnd = Math.floor(Date.now() / 1000) + (24 * 60 * 60);
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
            } catch (stripeError) {
                console.error('Stripe error:', stripeError.message);
                return res.status(400).json({
                    error: stripeError.message || 'Payment failed. Please try again.'
                });
            }
        } else {
            stripePaymentId = 'dev_pay_' + Date.now();
            stripeSubscriptionId = 'dev_sub_' + Date.now();
        }

        const subscriptionResult = await db.subscriptions.create(
            customerId,
            planType,
            amount,
            expiresAt.toISOString(),
            stripeCustomerId,
            stripeSubscriptionId
        );

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

        if (stripe && subscription.stripe_subscription_id && !subscription.stripe_subscription_id.startsWith('dev_')) {
            try {
                await stripe.subscriptions.cancel(subscription.stripe_subscription_id);
            } catch (stripeError) {
                console.error('Stripe cancel error:', stripeError.message);
            }
        }

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

// ============================================================
// Create Stripe Checkout Session (called by /payment page button)
// ============================================================
router.post('/create-checkout-session', requireCustomerAuth, async (req, res) => {
    try {
        if (!stripe) {
            return res.status(500).json({ error: 'Stripe not configured' });
        }

        const customer = await db.customers.findById(req.customerId);
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        const session = await createCheckoutSessionForCustomer(req.customerId, customer.email);

        res.json({ checkoutUrl: session.url });

    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: error.message || 'Failed to create checkout session' });
    }
});

// ============================================================
// Verify Checkout Session (called by /payment-success page)
// ============================================================
router.get('/verify-session', requireCustomerAuth, async (req, res) => {
    try {
        const { session_id } = req.query;

        if (!session_id) {
            return res.status(400).json({ error: 'Session ID is required' });
        }

        if (!stripe) {
            return res.status(500).json({ error: 'Stripe not configured' });
        }

        // Retrieve the Checkout Session from Stripe
        const session = await stripe.checkout.sessions.retrieve(session_id, {
            expand: ['subscription'],
        });

        if (session.payment_status !== 'paid') {
            return res.status(400).json({ error: 'Payment not completed' });
        }

        const tracifyCustomerId = parseInt(session.client_reference_id || session.metadata.tracifyCustomerId);

        if (tracifyCustomerId !== req.customerId) {
            return res.status(403).json({ error: 'Session does not belong to this customer' });
        }

        // Idempotency: check if subscription already exists for this Stripe subscription
        const stripeSubscriptionId = session.subscription?.id || session.subscription;
        if (stripeSubscriptionId) {
            const existing = await db.subscriptions.findByStripeSubscriptionId(stripeSubscriptionId);
            if (existing) {
                return res.json({
                    success: true,
                    message: 'Subscription already active',
                    redirectTo: '/dashboard'
                });
            }
        }

        // Create subscription record in DB
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        const stripeCustomerId = session.customer;

        const subscriptionResult = await db.subscriptions.create(
            tracifyCustomerId,
            'trial',
            2.00,
            expiresAt.toISOString(),
            stripeCustomerId,
            stripeSubscriptionId
        );

        // Create payment record
        await db.payments.create(
            tracifyCustomerId,
            subscriptionResult.lastInsertRowid,
            2.00,
            session.payment_intent || session.id,
            'card',
            'completed'
        );

        console.log(`Checkout verified: customer ${tracifyCustomerId}, subscription ${stripeSubscriptionId}`);

        res.json({
            success: true,
            message: 'Payment verified successfully',
            redirectTo: '/dashboard'
        });

    } catch (error) {
        console.error('Verify session error:', error);
        res.status(500).json({ error: 'Failed to verify payment session' });
    }
});

// ============================================================
// Stripe Webhook
// ============================================================
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

    console.log(`Webhook received: ${event.type}`);

    try {
        switch (event.type) {
            // ============================================================
            // NEW: Handle Stripe Checkout Session completion
            // ============================================================
            case 'checkout.session.completed': {
                const session = event.data.object;
                const tracifyCustomerId = parseInt(session.client_reference_id || (session.metadata && session.metadata.tracifyCustomerId));
                const stripeSubscriptionId = session.subscription;
                const stripeCustomerId = session.customer;

                console.log(`Checkout completed: customer ${tracifyCustomerId}, subscription ${stripeSubscriptionId}`);

                if (!tracifyCustomerId || !stripeSubscriptionId) {
                    console.log('Missing customer or subscription ID in checkout session');
                    break;
                }

                // Idempotency: check if already created by verify-session
                const existing = await db.subscriptions.findByStripeSubscriptionId(stripeSubscriptionId);
                if (existing) {
                    console.log(`Subscription ${stripeSubscriptionId} already exists (created by verify-session)`);
                    break;
                }

                // Create subscription record
                const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
                const subscriptionResult = await db.subscriptions.create(
                    tracifyCustomerId,
                    'trial',
                    2.00,
                    expiresAt.toISOString(),
                    stripeCustomerId,
                    stripeSubscriptionId
                );

                // Create payment record
                await db.payments.create(
                    tracifyCustomerId,
                    subscriptionResult.lastInsertRowid,
                    2.00,
                    session.payment_intent || session.id,
                    'card',
                    'completed'
                );

                console.log(`Subscription created via webhook for customer ${tracifyCustomerId}`);
                break;
            }

            case 'invoice.payment_succeeded': {
                const invoice = event.data.object;
                const stripeSubscriptionId = invoice.subscription;
                const amountPaid = invoice.amount_paid / 100;

                console.log(`Invoice payment succeeded: $${amountPaid} for subscription ${stripeSubscriptionId}`);

                // Skip if this is the initial trial payment (amount is $2.00 or less)
                if (amountPaid <= 2.50) {
                    console.log('Skipping trial payment - already recorded during signup');
                    break;
                }

                const subscription = await db.subscriptions.findByStripeSubscriptionId(stripeSubscriptionId);

                if (subscription) {
                    const newExpiresAt = new Date();
                    newExpiresAt.setDate(newExpiresAt.getDate() + 30);

                    await db.subscriptions.extendSubscription(
                        subscription.id,
                        newExpiresAt.toISOString(),
                        'monthly'
                    );

                    await db.payments.create(
                        subscription.customer_id,
                        subscription.id,
                        amountPaid,
                        invoice.payment_intent || invoice.id,
                        'card',
                        'completed'
                    );

                    console.log(`Subscription ${subscription.id} extended, payment of $${amountPaid} recorded`);
                } else {
                    console.log(`No subscription found for Stripe ID: ${stripeSubscriptionId}`);
                }
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object;
                const stripeSubscriptionId = invoice.subscription;

                console.log(`Invoice payment failed for subscription ${stripeSubscriptionId}`);

                const subscription = await db.subscriptions.findByStripeSubscriptionId(stripeSubscriptionId);

                if (subscription) {
                    await db.subscriptions.updateStatus(subscription.id, 'expired');
                    console.log(`Subscription ${subscription.id} marked as expired`);
                }
                break;
            }

            case 'customer.subscription.updated': {
                const stripeSubscription = event.data.object;
                const stripeSubscriptionId = stripeSubscription.id;
                const status = stripeSubscription.status;

                console.log(`Subscription ${stripeSubscriptionId} updated to: ${status}`);

                const subscription = await db.subscriptions.findByStripeSubscriptionId(stripeSubscriptionId);

                if (subscription) {
                    let ourStatus = 'active';
                    if (status === 'canceled' || status === 'unpaid') {
                        ourStatus = 'cancelled';
                    } else if (status === 'past_due') {
                        ourStatus = 'expired';
                    }

                    if (ourStatus !== 'active') {
                        await db.subscriptions.updateStatus(subscription.id, ourStatus);
                        console.log(`Subscription ${subscription.id} status updated to ${ourStatus}`);
                    }
                }
                break;
            }

            case 'customer.subscription.deleted': {
                const stripeSubscription = event.data.object;
                const stripeSubscriptionId = stripeSubscription.id;

                console.log(`Subscription ${stripeSubscriptionId} deleted`);

                const subscription = await db.subscriptions.findByStripeSubscriptionId(stripeSubscriptionId);

                if (subscription) {
                    await db.subscriptions.cancel(subscription.id);
                    console.log(`Subscription ${subscription.id} cancelled`);
                }
                break;
            }

            case 'charge.succeeded': {
                console.log(`Charge succeeded: ${event.data.object.id}`);
                break;
            }

            case 'charge.failed': {
                console.log(`Charge failed: ${event.data.object.id}`);
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }
    } catch (error) {
        console.error('Webhook processing error:', error);
    }

    res.json({ received: true });
});

module.exports = router;
