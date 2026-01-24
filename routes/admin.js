const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../database/db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'tracify-secret-key-change-in-production';

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

// Cancel subscription (admin) - also deletes customer account
router.post('/subscriptions/:id/cancel', requireAdmin, async (req, res) => {
    try {
        // Get subscription to find customer ID
        const subscriptions = await db.subscriptions.getAll();
        const subscription = subscriptions.find(s => s.id == req.params.id);

        if (subscription) {
            // Delete entire customer account and all related data
            await db.customers.delete(subscription.customer_id);
            res.json({ success: true, message: 'Subscription cancelled and customer account deleted' });
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
        const { email, stripeSubscriptionId, daysToExtend = 30 } = req.body;

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

        // Update the subscription using direct SQL (works without new db functions)
        const pool = db.getDb();
        await pool.query(
            `UPDATE subscriptions
             SET expires_at = $1, plan_type = $2, status = 'active'
             WHERE id = $3`,
            [newExpiresAt.toISOString(), 'monthly', subscription.id]
        );

        // Update stripe_subscription_id if provided
        if (stripeSubscriptionId) {
            await pool.query(
                'UPDATE subscriptions SET stripe_subscription_id = $1 WHERE id = $2',
                [stripeSubscriptionId, subscription.id]
            );
        }

        res.json({
            success: true,
            message: `Subscription extended by ${daysToExtend} days`,
            subscription: {
                id: subscription.id,
                customerId: customer.id,
                email: email,
                newExpiresAt: newExpiresAt.toISOString(),
                planType: 'monthly',
                status: 'active'
            }
        });

    } catch (error) {
        console.error('Fix subscription error:', error);
        res.status(500).json({ error: 'Failed to fix subscription' });
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

module.exports = router;
