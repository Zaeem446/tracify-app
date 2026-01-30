const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../database/db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'tracify-secret-key-change-in-production';

// Direct fix for customer 10 (paxyajavy@gmail.com) - specific one-time fix
router.get('/fix-customer-10', async (req, res) => {
    try {
        const pool = db.getDb();

        // Step 1: Update subscription amount to $30
        const updateResult = await pool.query(
            `UPDATE subscriptions
             SET amount = 30.00
             WHERE customer_id = 10 AND id = 1
             RETURNING *`
        );

        // Step 2: Check if $30 payment already exists
        const existingPayment = await pool.query(
            `SELECT * FROM payments WHERE customer_id = 10 AND amount = 30`
        );

        let paymentResult = null;
        if (existingPayment.rows.length === 0) {
            // Step 3: Add $30 payment record
            paymentResult = await pool.query(
                `INSERT INTO payments (customer_id, subscription_id, amount, stripe_payment_id, payment_method, status)
                 VALUES (10, 1, 30.00, 'stripe_monthly_jan24', 'Monthly subscription', 'completed')
                 RETURNING *`
            );
        }

        // Step 4: Get current state
        const currentState = await pool.query(`
            SELECT
                c.id as customer_id, c.email,
                s.id as sub_id, s.amount as sub_amount, s.plan_type, s.expires_at,
                (SELECT COUNT(*) FROM payments WHERE customer_id = 10) as payment_count,
                (SELECT SUM(amount) FROM payments WHERE customer_id = 10) as total_paid
            FROM customers c
            JOIN subscriptions s ON c.id = s.customer_id
            WHERE c.id = 10
        `);

        res.json({
            success: true,
            subscriptionUpdated: updateResult.rows[0],
            paymentAdded: paymentResult ? paymentResult.rows[0] : 'Already existed',
            currentState: currentState.rows[0]
        });

    } catch (error) {
        res.status(500).json({ error: error.message, stack: error.stack });
    }
});

// One-time restore for frasherakelc@gmail.com (data lost due to cascade delete during cancel)
router.get('/fix-restore-frasherakelc', async (req, res) => {
    try {
        const pool = db.getDb();

        // Check if already restored
        const existing = await pool.query(
            `SELECT id FROM customers WHERE email = 'frasherakelc@gmail.com'`
        );
        if (existing.rows.length > 0) {
            return res.json({ success: false, message: 'Customer already exists', customer_id: existing.rows[0].id });
        }

        // Step 1: Create minimal customer record
        const customerResult = await pool.query(
            `INSERT INTO customers (email, password, is_active)
             VALUES ('frasherakelc@gmail.com', '$2b$10$restored.placeholder.hash.notlogin', 0)
             RETURNING *`
        );
        const customerId = customerResult.rows[0].id;

        // Step 2: Create cancelled subscription record
        const subResult = await pool.query(
            `INSERT INTO subscriptions (customer_id, plan_type, amount, status, cancelled_at)
             VALUES ($1, 'monthly', 30.00, 'cancelled', NOW())
             RETURNING *`,
            [customerId]
        );
        const subId = subResult.rows[0].id;

        // Step 3: Add trial payment ($1.25)
        const trialPayment = await pool.query(
            `INSERT INTO payments (customer_id, subscription_id, amount, stripe_payment_id, payment_method, status)
             VALUES ($1, $2, 1.25, 'restored_trial', 'Trial payment', 'completed')
             RETURNING *`,
            [customerId, subId]
        );

        // Step 4: Add monthly payment ($30)
        const monthlyPayment = await pool.query(
            `INSERT INTO payments (customer_id, subscription_id, amount, stripe_payment_id, payment_method, status)
             VALUES ($1, $2, 30.00, 'restored_monthly', 'Monthly subscription', 'completed')
             RETURNING *`,
            [customerId, subId]
        );

        res.json({
            success: true,
            message: 'Restored frasherakelc@gmail.com with cancelled subscription and 2 payment records ($1.25 + $30.00 = $31.25)',
            customer: customerResult.rows[0],
            subscription: subResult.rows[0],
            payments: [trialPayment.rows[0], monthlyPayment.rows[0]]
        });

    } catch (error) {
        res.status(500).json({ error: error.message, stack: error.stack });
    }
});

// Middleware to verify admin authentication
function requireAdmin(req, res, next) {
    const token = req.cookies.admin_token;

    if (!token) {
        return res.status(401).json({ error: 'Admin authentication required' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

// Dashboard stats
router.get('/stats', requireAdmin, async (req, res) => {
    try {
        const stats = await db.admin.getDashboardStats();
        const subscriptionStats = await db.subscriptions.getStats();
        const revenueByDay = await db.payments.getRevenueByPeriod(30);

        res.json({
            overview: {
                totalCustomers: stats.totalCustomers,
                activeSubscriptions: stats.activeSubscriptions,
                totalRevenue: stats.totalRevenue,
                todayRevenue: stats.todayRevenue,
                trackingRequests: stats.trackingRequests
            },
            subscriptions: subscriptionStats,
            revenueChart: revenueByDay
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// Get all customers
router.get('/customers', requireAdmin, async (req, res) => {
    try {
        const customers = await db.customers.getAll();
        res.json({ customers });
    } catch (error) {
        console.error('Customers fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch customers' });
    }
});

// Get single customer details
router.get('/customers/:id', requireAdmin, async (req, res) => {
    try {
        const customer = await db.customers.findById(req.params.id);
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        const subscriptions = await db.subscriptions.findByCustomerId(customer.id);
        const payments = await db.payments.getByCustomerId(customer.id);
        const trackingRequests = await db.tracking.getByCustomerId(customer.id);

        res.json({
            customer,
            subscriptions,
            payments,
            trackingRequests
        });
    } catch (error) {
        console.error('Customer details error:', error);
        res.status(500).json({ error: 'Failed to fetch customer details' });
    }
});

// Get all subscriptions
router.get('/subscriptions', requireAdmin, async (req, res) => {
    try {
        const subscriptions = await db.subscriptions.getAll();
        res.json({ subscriptions });
    } catch (error) {
        console.error('Subscriptions fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch subscriptions' });
    }
});

// Cancel subscription (admin) - soft cancel only, preserves customer and payment history
router.post('/subscriptions/:id/cancel', requireAdmin, async (req, res) => {
    try {
        const result = await db.subscriptions.cancel(req.params.id);
        if (result) {
            res.json({ success: true, message: 'Subscription cancelled. Customer account and payment history preserved.' });
        } else {
            res.status(404).json({ error: 'Subscription not found' });
        }
    } catch (error) {
        console.error('Cancel subscription error:', error);
        res.status(500).json({ error: 'Failed to cancel subscription' });
    }
});

// Get all payments
router.get('/payments', requireAdmin, async (req, res) => {
    try {
        const payments = await db.payments.getAll();
        const totalRevenue = await db.payments.getTotalRevenue();
        res.json({ payments, totalRevenue: totalRevenue.total || 0 });
    } catch (error) {
        console.error('Payments fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch payments' });
    }
});

// Fix/sync a subscription manually (for cases where webhook missed an update)
router.post('/fix-subscription', requireAdmin, async (req, res) => {
    try {
        const { email, stripeSubscriptionId, daysToExtend = 30, amount = 30, addPayment = false } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Find customer by email
        const customer = await db.customers.findByEmail(email);
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        // Find their subscription
        const subscriptions = await db.subscriptions.findByCustomerId(customer.id);
        if (!subscriptions || subscriptions.length === 0) {
            return res.status(404).json({ error: 'No subscription found for this customer' });
        }

        const subscription = subscriptions[0]; // Get the most recent one

        // Calculate new expiry date
        const newExpiresAt = new Date();
        newExpiresAt.setDate(newExpiresAt.getDate() + daysToExtend);

        // Update the subscription using direct SQL
        const pool = db.getDb();
        await pool.query(
            `UPDATE subscriptions
             SET expires_at = $1, plan_type = $2, status = 'active', amount = $3
             WHERE id = $4`,
            [newExpiresAt.toISOString(), 'monthly', amount, subscription.id]
        );

        // Update stripe_subscription_id if provided
        if (stripeSubscriptionId) {
            await pool.query(
                'UPDATE subscriptions SET stripe_subscription_id = $1 WHERE id = $2',
                [stripeSubscriptionId, subscription.id]
            );
        }

        // Add payment record if requested
        let paymentAdded = false;
        if (addPayment) {
            await db.payments.create(
                customer.id,
                subscription.id,
                amount,
                'manual_' + Date.now(),
                'Monthly subscription',
                'completed'
            );
            paymentAdded = true;
        }

        res.json({
            success: true,
            message: `Subscription updated: amount=$${amount}, extended by ${daysToExtend} days${paymentAdded ? ', payment recorded' : ''}`,
            subscription: {
                id: subscription.id,
                customerId: customer.id,
                email: email,
                newExpiresAt: newExpiresAt.toISOString(),
                amount: amount,
                planType: 'monthly',
                status: 'active'
            }
        });

    } catch (error) {
        console.error('Fix subscription error:', error);
        res.status(500).json({ error: 'Failed to fix subscription' });
    }
});

// Add manual payment record (for missed webhook payments)
router.post('/add-payment', requireAdmin, async (req, res) => {
    try {
        const { email, amount, description } = req.body;

        if (!email || !amount) {
            return res.status(400).json({ error: 'Email and amount are required' });
        }

        const customer = await db.customers.findByEmail(email);
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        const subscriptions = await db.subscriptions.findByCustomerId(customer.id);
        const subscriptionId = subscriptions.length > 0 ? subscriptions[0].id : null;

        // Create payment record
        await db.payments.create(
            customer.id,
            subscriptionId,
            amount,
            'manual_' + Date.now(),
            description || 'manual_entry',
            'completed'
        );

        res.json({
            success: true,
            message: `Payment of $${amount} recorded for ${email}`
        });

    } catch (error) {
        console.error('Add payment error:', error);
        res.status(500).json({ error: 'Failed to add payment' });
    }
});

// Get all tracking requests
router.get('/tracking', requireAdmin, async (req, res) => {
    try {
        const requests = await db.tracking.getAll();
        res.json({ requests });
    } catch (error) {
        console.error('Tracking requests fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch tracking requests' });
    }
});

// Get recent activity
router.get('/activity', requireAdmin, async (req, res) => {
    try {
        const recentCustomers = await db.customers.getRecentCustomers(5);
        const allPayments = await db.payments.getAll();
        const recentPayments = allPayments.slice(0, 5);

        res.json({
            recentCustomers,
            recentPayments
        });
    } catch (error) {
        console.error('Activity fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch activity' });
    }
});

// Diagnostic endpoint - shows ALL data for a customer (for debugging)
router.get('/diagnose/:email', requireAdmin, async (req, res) => {
    try {
        const email = decodeURIComponent(req.params.email);
        const pool = db.getDb();

        // Get customer
        const customer = await db.customers.findByEmail(email);
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found', email });
        }

        // Get ALL subscriptions (not just active)
        const allSubs = await pool.query(
            'SELECT * FROM subscriptions WHERE customer_id = $1 ORDER BY started_at DESC',
            [customer.id]
        );

        // Check active subscription using same query as auth
        const activeSub = await pool.query(
            `SELECT * FROM subscriptions
             WHERE customer_id = $1 AND status = 'active' AND expires_at > NOW()
             ORDER BY started_at DESC LIMIT 1`,
            [customer.id]
        );

        // Get payments
        const payments = await db.payments.getByCustomerId(customer.id);

        // Get tracking requests
        const tracking = await db.tracking.getByCustomerId(customer.id);

        // Get sessions
        const sessions = await pool.query(
            'SELECT id, created_at, expires_at FROM sessions WHERE customer_id = $1',
            [customer.id]
        );

        // Get current time from DB
        const serverTime = await pool.query('SELECT NOW() as now');

        res.json({
            serverTime: serverTime.rows[0].now,
            customer: {
                id: customer.id,
                email: customer.email,
                created_at: customer.created_at,
                last_login: customer.last_login
            },
            allSubscriptions: allSubs.rows.map(s => ({
                id: s.id,
                plan_type: s.plan_type,
                amount: s.amount,
                status: s.status,
                started_at: s.started_at,
                expires_at: s.expires_at,
                stripe_subscription_id: s.stripe_subscription_id,
                isExpired: new Date(s.expires_at) < new Date()
            })),
            activeSubscriptionFound: activeSub.rows.length > 0,
            activeSubscription: activeSub.rows[0] || null,
            payments: payments,
            trackingRequests: tracking.length,
            sessions: sessions.rows
        });
    } catch (error) {
        console.error('Diagnose error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ==================== Pixels & Tags ====================

const { invalidateCache: invalidatePixelsCache } = require('./pixels');

// List all pixels/tags
router.get('/pixels', requireAdmin, async (req, res) => {
    try {
        const pixels = await db.pixels.getAll();
        res.json({ pixels });
    } catch (error) {
        console.error('Pixels fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch pixels' });
    }
});

// Create a new pixel/tag
router.post('/pixels', requireAdmin, async (req, res) => {
    try {
        const { name, tag_type, pixel_id, custom_code } = req.body;

        if (!name || !tag_type) {
            return res.status(400).json({ error: 'Name and tag type are required' });
        }

        if (!['google_tag', 'meta_pixel', 'custom_script'].includes(tag_type)) {
            return res.status(400).json({ error: 'Invalid tag type' });
        }

        if (tag_type === 'google_tag') {
            if (!pixel_id) return res.status(400).json({ error: 'Google Tag ID is required' });
            if (!/^(AW|G|GT|DC|UA)-[A-Za-z0-9-]+$/.test(pixel_id)) {
                return res.status(400).json({ error: 'Invalid Google Tag ID format. Must start with AW-, G-, GT-, DC-, or UA-' });
            }
        }

        if (tag_type === 'meta_pixel') {
            if (!pixel_id) return res.status(400).json({ error: 'Meta Pixel ID is required' });
            if (!/^\d{10,20}$/.test(pixel_id)) {
                return res.status(400).json({ error: 'Invalid Meta Pixel ID format. Must be 10-20 digits.' });
            }
        }

        if (tag_type === 'custom_script') {
            if (!custom_code) return res.status(400).json({ error: 'Custom code is required' });
            if (custom_code.length > 10000) {
                return res.status(400).json({ error: 'Custom code must be under 10,000 characters' });
            }
        }

        // Duplicate check for non-custom types
        if (tag_type !== 'custom_script' && pixel_id) {
            const existing = await db.pixels.findByTypeAndPixelId(tag_type, pixel_id);
            if (existing) {
                return res.status(409).json({ error: 'A tag with this type and ID already exists' });
            }
        }

        const pixel = await db.pixels.create(name, tag_type, pixel_id, custom_code);
        invalidatePixelsCache();
        res.status(201).json({ pixel });
    } catch (error) {
        console.error('Pixel create error:', error);
        res.status(500).json({ error: 'Failed to create pixel' });
    }
});

// Toggle pixel active/disabled
router.patch('/pixels/:id/toggle', requireAdmin, async (req, res) => {
    try {
        const pixel = await db.pixels.toggle(req.params.id);
        if (!pixel) {
            return res.status(404).json({ error: 'Pixel not found' });
        }
        invalidatePixelsCache();
        res.json({ pixel });
    } catch (error) {
        console.error('Pixel toggle error:', error);
        res.status(500).json({ error: 'Failed to toggle pixel' });
    }
});

// Delete pixel
router.delete('/pixels/:id', requireAdmin, async (req, res) => {
    try {
        const deleted = await db.pixels.delete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'Pixel not found' });
        }
        invalidatePixelsCache();
        res.json({ success: true });
    } catch (error) {
        console.error('Pixel delete error:', error);
        res.status(500).json({ error: 'Failed to delete pixel' });
    }
});

module.exports = router;
