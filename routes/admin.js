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
router.get('/stats', requireAdmin, (req, res) => {
    try {
        const stats = db.admin.getDashboardStats();
        const subscriptionStats = db.subscriptions.getStats();
        const revenueByDay = db.payments.getRevenueByPeriod(30);

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
router.get('/customers', requireAdmin, (req, res) => {
    try {
        const customers = db.customers.getAll();
        res.json({ customers });
    } catch (error) {
        console.error('Customers fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch customers' });
    }
});

// Get single customer details
router.get('/customers/:id', requireAdmin, (req, res) => {
    try {
        const customer = db.customers.findById(req.params.id);
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        const subscriptions = db.subscriptions.findByCustomerId(customer.id);
        const payments = db.payments.getByCustomerId(customer.id);
        const trackingRequests = db.tracking.getByCustomerId(customer.id);

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
router.get('/subscriptions', requireAdmin, (req, res) => {
    try {
        const subscriptions = db.subscriptions.getAll();
        res.json({ subscriptions });
    } catch (error) {
        console.error('Subscriptions fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch subscriptions' });
    }
});

// Cancel subscription (admin) - also deletes customer account
router.post('/subscriptions/:id/cancel', requireAdmin, (req, res) => {
    try {
        // Get subscription to find customer ID
        const subscriptions = db.subscriptions.getAll();
        const subscription = subscriptions.find(s => s.id == req.params.id);

        if (subscription) {
            // Delete entire customer account and all related data
            db.customers.delete(subscription.customer_id);
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
router.get('/payments', requireAdmin, (req, res) => {
    try {
        const payments = db.payments.getAll();
        const totalRevenue = db.payments.getTotalRevenue();
        res.json({ payments, totalRevenue: totalRevenue.total || 0 });
    } catch (error) {
        console.error('Payments fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch payments' });
    }
});

// Get all tracking requests
router.get('/tracking', requireAdmin, (req, res) => {
    try {
        const requests = db.tracking.getAll();
        res.json({ requests });
    } catch (error) {
        console.error('Tracking requests fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch tracking requests' });
    }
});

// Get recent activity
router.get('/activity', requireAdmin, (req, res) => {
    try {
        const recentCustomers = db.customers.getRecentCustomers(5);
        const recentPayments = db.payments.getAll().slice(0, 5);

        res.json({
            recentCustomers,
            recentPayments
        });
    } catch (error) {
        console.error('Activity fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch activity' });
    }
});

module.exports = router;
