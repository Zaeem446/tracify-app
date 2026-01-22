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

// Process payment (development mode or manual processing)
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

        if (stripe && paymentMethodId && !paymentMethodId.startsWith('dev_')) {
            // Real Stripe processing
            try {
                console.log('Processing Stripe payment...', { customerId, amount, planType });

                // Create or get Stripe customer
                const customer = await db.customers.findById(customerId);
                console.log('Creating Stripe customer for:', customer.email);

                const stripeCustomer = await stripe.customers.create({
                    email: customer.email,
                    metadata: { tracifyCustomerId: customerId }
                });
                stripeCustomerId = stripeCustomer.id;
                console.log('Stripe customer created:', stripeCustomerId);

                // Attach payment method
                console.log('Attaching payment method:', paymentMethodId);
                await stripe.paymentMethods.attach(paymentMethodId, {
                    customer: stripeCustomerId
                });
                console.log('Payment method attached successfully');

                // Create and confirm payment
                console.log('Creating payment intent...');
                const paymentIntent = await stripe.paymentIntents.create({
                    amount: Math.round(amount * 100), // Convert to cents
                    currency: 'usd',
                    customer: stripeCustomerId,
                    payment_method: paymentMethodId,
                    confirm: true,
                    automatic_payment_methods: {
                        enabled: true,
                        allow_redirects: 'never'
                    }
                });

                console.log('Payment intent created:', paymentIntent.id, 'Status:', paymentIntent.status);

                if (paymentIntent.status !== 'succeeded') {
                    console.error('Payment not succeeded:', paymentIntent.status);
                    return res.status(400).json({
                        error: `Payment ${paymentIntent.status}. Please try a different card.`
                    });
                }

                stripePaymentId = paymentIntent.id;
                console.log('✅ Stripe payment successful!');
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
            console.log(`\n💳 DEV MODE: Payment of $${amount} processed for customer ${customerId}\n`);
        }

        // Create subscription record
        const subscriptionResult = await db.subscriptions.create(
            customerId,
            planType,
            amount,
            expiresAt.toISOString(),
            stripeCustomerId,
            null // subscription ID (not using Stripe subscriptions for trial)
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
                expiresAt: expiresAt.toISOString()
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
        if (stripe && subscription.stripe_subscription_id) {
            await stripe.subscriptions.cancel(subscription.stripe_subscription_id);
        }

        // Update local record
        await db.subscriptions.cancel(subscription.id);

        res.json({
            success: true,
            message: 'Subscription cancelled successfully'
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
router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
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

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            console.log('Payment succeeded:', event.data.object.id);
            break;
        case 'payment_intent.payment_failed':
            console.log('Payment failed:', event.data.object.id);
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
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
