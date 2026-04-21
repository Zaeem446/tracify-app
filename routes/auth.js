const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../database/db');
const { sendPasswordEmail } = require('../utils/email');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'tracify-secret-key-change-in-production';

// Lazy-load payment routes to get createCheckoutSessionForCustomer
let _createCheckoutSession = null;
function getCreateCheckoutSession() {
    if (!_createCheckoutSession) {
        const paymentRoutes = require('./payment');
        _createCheckoutSession = paymentRoutes.createCheckoutSessionForCustomer;
    }
    return _createCheckoutSession;
}

// Generate random password
function generatePassword(length = 8) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

// Customer signup - creates account and sends password via email
router.post('/signup', async (req, res) => {
    try {
        const { email, phoneToTrack, countryCode, source, plan } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Check if customer already exists
        const existingCustomer = await db.customers.findByEmail(email);
        if (existingCustomer) {
            return res.status(400).json({ error: 'An account with this email already exists. Please login.' });
        }

        // Generate password
        const password = generatePassword();

        // Create customer
        const result = await db.customers.create(email, password);
        const customerId = result.lastInsertRowid;

        // Store phone to track if provided
        if (phoneToTrack) {
            await db.customers.updatePhoneToTrack(customerId, `${countryCode || ''}${phoneToTrack}`);
        }

        // Store source landing page
        if (source) {
            await db.customers.updateSource(customerId, source);
        }

        // Create session token
        const sessionToken = uuidv4();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours
        await db.sessions.create(customerId, sessionToken, expiresAt);

        // Send password via email
        await sendPasswordEmail(email, password);

        // Return session token for auto-login
        const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;
        res.cookie('session_token', sessionToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            sameSite: 'lax',
            secure: isProduction, // Required for HTTPS
            path: '/'
        });

        console.log('Session created for customer:', customerId, 'Token:', sessionToken.substring(0, 8) + '...');

        // Try to create Stripe Checkout Session for direct redirect
        let checkoutUrl = null;
        try {
            const createCheckoutSession = getCreateCheckoutSession();
            if (createCheckoutSession) {
                const session = await createCheckoutSession(customerId, email, plan || source);
                checkoutUrl = session.url;
                console.log('Checkout session created during signup:', session.id);
            }
        } catch (checkoutError) {
            console.error('Checkout session creation failed (will fallback to /payment):', checkoutError.message);
        }

        res.json({
            success: true,
            message: 'Account created! Password sent to your email.',
            customerId,
            email,
            password, // Include password for testing (remove in production)
            checkoutUrl, // Stripe Checkout URL for direct redirect
            redirectTo: '/payment' // Fallback if checkoutUrl is null
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Failed to create account. Please try again.' });
    }
});

// Customer login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const customer = await db.customers.findByEmail(email);
        if (!customer) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const validPassword = bcrypt.compareSync(password, customer.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Update last login
        await db.customers.updateLastLogin(customer.id);

        // Create session
        const sessionToken = uuidv4();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days
        await db.sessions.create(customer.id, sessionToken, expiresAt);

        const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;
        res.cookie('session_token', sessionToken, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: 'lax',
            secure: isProduction,
            path: '/'
        });

        console.log('Login session created for customer:', customer.id);

        // Check if has active subscription
        const subscription = await db.subscriptions.findActiveByCustomerId(customer.id);

        res.json({
            success: true,
            email: customer.email,
            hasSubscription: !!subscription,
            redirectTo: subscription ? '/dashboard' : '/payment'
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed. Please try again.' });
    }
});

// Check session / Get current user
router.get('/me', async (req, res) => {
    try {
        const sessionToken = req.cookies.session_token;
        console.log('Auth check - session_token exists:', !!sessionToken);
        console.log('All cookies:', req.cookies);

        if (!sessionToken) {
            console.log('No session token in cookies');
            return res.status(401).json({ error: 'Not authenticated' });
        }

        console.log('Looking up session token:', sessionToken.substring(0, 8) + '...');
        const session = await db.sessions.findByToken(sessionToken);
        console.log('Session found:', !!session, session ? `customer_id: ${session.customer_id}` : '');

        if (!session) {
            console.log('Session not found in database');
            return res.status(401).json({ error: 'Session expired' });
        }

        console.log('Looking up customer:', session.customer_id);
        const customer = await db.customers.findById(session.customer_id);
        console.log('Customer found:', !!customer);

        if (!customer) {
            console.log('Customer not found for session');
            return res.status(401).json({ error: 'Customer not found' });
        }

        const subscription = await db.subscriptions.findActiveByCustomerId(customer.id);
        console.log('Subscription found:', !!subscription);

        res.json({
            authenticated: true,
            customer: {
                id: customer.id,
                email: customer.email,
                phoneToTrack: customer.phone_to_track
            },
            subscription: subscription ? {
                planType: subscription.plan_type,
                status: subscription.status,
                expiresAt: subscription.expires_at
            } : null
        });

    } catch (error) {
        console.error('Auth check error:', error.message);
        console.error('Auth check error stack:', error.stack);
        res.status(500).json({ error: 'Authentication check failed: ' + error.message });
    }
});

// Logout
router.post('/logout', async (req, res) => {
    const sessionToken = req.cookies.session_token;

    if (sessionToken) {
        await db.sessions.delete(sessionToken);
    }

    res.clearCookie('session_token');
    res.json({ success: true, message: 'Logged out successfully' });
});

// Admin login
router.post('/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log('Admin login attempt for:', username);

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        console.log('Looking up admin user...');
        const admin = await db.admin.findByUsername(username);
        console.log('Admin found:', admin ? 'yes' : 'no');

        if (!admin) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        console.log('Checking password...');
        const validPassword = bcrypt.compareSync(password, admin.password);
        console.log('Password valid:', validPassword);

        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Update last login
        await db.admin.updateLastLogin(admin.id);

        // Create JWT token for admin
        const token = jwt.sign(
            { id: admin.id, username: admin.username, role: admin.role },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.cookie('admin_token', token, {
            httpOnly: true,
            maxAge: 8 * 60 * 60 * 1000, // 8 hours
            sameSite: 'lax'
        });

        res.json({
            success: true,
            admin: {
                id: admin.id,
                username: admin.username,
                role: admin.role
            }
        });

    } catch (error) {
        console.error('Admin login error:', error.message);
        console.error('Full error:', error);
        res.status(500).json({ error: 'Login failed: ' + error.message });
    }
});

// Admin auth check
router.get('/admin/me', (req, res) => {
    try {
        const token = req.cookies.admin_token;

        if (!token) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({
            authenticated: true,
            admin: {
                id: decoded.id,
                username: decoded.username,
                role: decoded.role
            }
        });

    } catch (error) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
});

// Admin logout
router.post('/admin/logout', (req, res) => {
    res.clearCookie('admin_token');
    res.json({ success: true });
});

module.exports = router;
