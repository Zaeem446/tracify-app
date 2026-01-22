require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const db = require('./database/db');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payment');
const trackingRoutes = require('./routes/tracking');
const contactRoutes = require('./routes/contact');
const subscriptionRoutes = require('./routes/subscription');

const app = express();

// Supported languages for URL routing
const SUPPORTED_LANGUAGES = [
    'cs', 'de', 'en', 'es', 'el', 'fr', 'hu', 'fi', 'et', 'hi',
    'zh_HK', 'th', 'bn', 'ms', 'ko', 'hr', 'id', 'ja', 'sv', 'it',
    'bg', 'sr', 'uk', 'he', 'sk', 'da', 'ar', 'nl', 'no', 'pl',
    'zh', 'pt', 'ro', 'sl', 'tr', 'pt_BR', 'vi', 'bs', 'tk', 'zu',
    'ru', 'lv', 'lt', 'fil', 'zh-TW'
];
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize database (async-safe) - MUST be before routes
let dbInitialized = false;
const initDb = async () => {
    if (!dbInitialized) {
        try {
            await db.initialize();
            dbInitialized = true;
            console.log('Database initialized');
        } catch (err) {
            console.error('Database init error:', err);
        }
    }
};

// Initialize on first request (lazy loading for serverless)
app.use(async (req, res, next) => {
    await initDb();
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/subscription', subscriptionRoutes);

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve admin panel
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Serve admin login
app.get('/admin/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-login.html'));
});

// Serve customer dashboard
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Serve payment page
app.get('/payment', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'payment.html'));
});

// Serve account settings page
app.get('/account', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'account.html'));
});

// Serve contact page
app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});

// Serve cancel subscription page
app.get('/cancel', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'cancel.html'));
});

// Language-prefixed routes (e.g., /en, /tr, /de)
// Main page with language
app.get('/:lang', (req, res, next) => {
    const lang = req.params.lang;
    if (SUPPORTED_LANGUAGES.includes(lang)) {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    } else {
        next(); // Not a language code, continue to next route
    }
});

// Language-prefixed dashboard
app.get('/:lang/dashboard', (req, res, next) => {
    const lang = req.params.lang;
    if (SUPPORTED_LANGUAGES.includes(lang)) {
        res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
    } else {
        next();
    }
});

// Language-prefixed payment
app.get('/:lang/payment', (req, res, next) => {
    const lang = req.params.lang;
    if (SUPPORTED_LANGUAGES.includes(lang)) {
        res.sendFile(path.join(__dirname, 'public', 'payment.html'));
    } else {
        next();
    }
});

// Language-prefixed account
app.get('/:lang/account', (req, res, next) => {
    const lang = req.params.lang;
    if (SUPPORTED_LANGUAGES.includes(lang)) {
        res.sendFile(path.join(__dirname, 'public', 'account.html'));
    } else {
        next();
    }
});

// Language-prefixed contact
app.get('/:lang/contact', (req, res, next) => {
    const lang = req.params.lang;
    if (SUPPORTED_LANGUAGES.includes(lang)) {
        res.sendFile(path.join(__dirname, 'public', 'contact.html'));
    } else {
        next();
    }
});

// Language-prefixed cancel
app.get('/:lang/cancel', (req, res, next) => {
    const lang = req.params.lang;
    if (SUPPORTED_LANGUAGES.includes(lang)) {
        res.sendFile(path.join(__dirname, 'public', 'cancel.html'));
    } else {
        next();
    }
});

// For local development only
if (process.env.NODE_ENV !== 'production') {
    initDb().then(() => {
        app.listen(PORT, () => {
            console.log(`Tracify server running on http://localhost:${PORT}`);
            console.log(`Admin panel: http://localhost:${PORT}/admin`);
        });
    });
}

// Export for Vercel serverless
module.exports = app;
