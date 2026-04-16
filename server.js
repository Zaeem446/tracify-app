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
const geoRoutes = require('./routes/geo');
const pixelsRoutes = require('./routes/pixels');
const seo = require('./utils/seo');

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
// Skip JSON parsing for Stripe webhook (needs raw body for signature verification)
app.use((req, res, next) => {
    if (req.originalUrl === '/api/payment/webhook') {
        next(); // Skip JSON parsing - webhook route uses express.raw()
    } else {
        express.json()(req, res, next);
    }
});
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Geo-blocking: restrict access from sanctioned countries
const BLOCKED_COUNTRIES = ['CU', 'IR', 'KP', 'SY', 'RU'];
app.use((req, res, next) => {
    const country = req.headers['x-vercel-ip-country'];
    if (country && BLOCKED_COUNTRIES.includes(country)) {
        return res.status(403).sendFile(path.join(__dirname, 'public', 'blocked.html'));
    }
    next();
});

// index: false so our SEO-injecting route handlers run for `/`, `/en`, etc.,
// instead of express.static serving raw index.html without meta injection.
app.use(express.static(path.join(__dirname, 'public'), { index: false }));

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

// Version check endpoint (to verify deployments)
const DEPLOY_VERSION = '2026-01-24-v3';
app.get('/api/version', (req, res) => {
    res.json({ version: DEPLOY_VERSION, timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/geo', geoRoutes);
app.use('/api/pixels', pixelsRoutes);

// ============================================================
// SEO: robots.txt + sitemap.xml (MUST be before /:lang catch-all)
// ============================================================
app.get('/robots.txt', (req, res) => {
    res.set('Content-Type', 'text/plain; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(seo.ROBOTS_TXT);
});

app.get('/sitemap.xml', (req, res) => {
    res.set('Content-Type', 'application/xml; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(seo.buildSitemap());
});

// ============================================================
// Helpers: pick lang (from param or default 'en')
// ============================================================
function langOrEn(req) {
    const l = req.params && req.params.lang;
    return SUPPORTED_LANGUAGES.includes(l) ? l : 'en';
}

// ============================================================
// FAQPage JSON-LD built from existing i18n keys (English only;
// other languages inherit via default breadcrumb + org schemas).
// ============================================================
let _faqSchemaCache = null;
function faqSchemaForLang(lang) {
    if (lang !== 'en' || _faqSchemaCache) return _faqSchemaCache;
    try {
        const enPath = path.join(__dirname, 'public', 'translations', 'en.json');
        const tr = JSON.parse(require('fs').readFileSync(enPath, 'utf8'));
        const schemas = require('./utils/seo-schemas');
        const qas = [];
        if (tr.faq) {
            for (let i = 1; i <= 9; i++) {
                const q = tr.faq[`q${i}`];
                const a = tr.faq[`a${i}`];
                if (q && a) qas.push({ q, a });
            }
        }
        if (qas.length > 0) _faqSchemaCache = schemas.faqPage(qas);
    } catch (e) {
        console.warn('[seo] FAQ schema build failed:', e.message);
    }
    return _faqSchemaCache;
}

// ============================================================
// Indexable HTML pages — SEO-rendered
// ============================================================

// Home
function serveHome(req, res) {
    return seo.renderLocalizedPage(res, {
        templateFile: 'index.html',
        pageKey: 'home',
        pagePath: '/',
        lang: langOrEn(req),
        extraSchemas: [faqSchemaForLang(langOrEn(req))].filter(Boolean)
    });
}
app.get('/', serveHome);
app.get('/:lang', (req, res, next) => {
    if (SUPPORTED_LANGUAGES.includes(req.params.lang)) return serveHome(req, res);
    next();
});

// Contact
function serveContact(req, res) {
    return seo.renderLocalizedPage(res, {
        templateFile: 'contact.html',
        pageKey: 'contact',
        pagePath: '/contact',
        lang: langOrEn(req)
    });
}
app.get('/contact', serveContact);
app.get('/:lang/contact', (req, res, next) => {
    if (SUPPORTED_LANGUAGES.includes(req.params.lang)) return serveContact(req, res);
    next();
});

// Privacy
function servePrivacy(req, res) {
    return seo.renderLocalizedPage(res, {
        templateFile: 'privacy.html',
        pageKey: 'privacy',
        pagePath: '/privacy',
        lang: langOrEn(req)
    });
}
app.get('/privacy', servePrivacy);
app.get('/:lang/privacy', (req, res, next) => {
    if (SUPPORTED_LANGUAGES.includes(req.params.lang)) return servePrivacy(req, res);
    next();
});

// Terms
function serveTerms(req, res) {
    return seo.renderLocalizedPage(res, {
        templateFile: 'terms.html',
        pageKey: 'terms',
        pagePath: '/terms',
        lang: langOrEn(req)
    });
}
app.get('/terms', serveTerms);
app.get('/:lang/terms', (req, res, next) => {
    if (SUPPORTED_LANGUAGES.includes(req.params.lang)) return serveTerms(req, res);
    next();
});

// How It Works
function serveHowItWorks(req, res) {
    const lang = langOrEn(req);
    const schemas = require('./utils/seo-schemas');
    return seo.renderLocalizedPage(res, {
        templateFile: 'how-it-works.html',
        pageKey: 'howItWorks',
        pagePath: '/how-it-works',
        lang,
        extraSchemas: [schemas.howTo({
            name: 'How to Track a Phone Number with Tracify',
            description: 'Locate any phone in three consent-based steps using Tracify.',
            steps: [
                { name: 'Enter the phone number', text: 'Type the phone number you want to locate and customize the SMS message.', url: `${seo.SITE}/how-it-works#step-1` },
                { name: 'Send the consent SMS',  text: 'Tracify sends your custom SMS asking the recipient to share their location.', url: `${seo.SITE}/how-it-works#step-2` },
                { name: 'Receive the GPS location', text: 'As soon as the recipient consents, you see the exact location in your dashboard.', url: `${seo.SITE}/how-it-works#step-3` }
            ]
        })]
    });
}
app.get('/how-it-works', serveHowItWorks);
app.get('/:lang/how-it-works', (req, res, next) => {
    if (SUPPORTED_LANGUAGES.includes(req.params.lang)) return serveHowItWorks(req, res);
    next();
});

// FAQ
function serveFaq(req, res) {
    const lang = langOrEn(req);
    return seo.renderLocalizedPage(res, {
        templateFile: 'faq.html',
        pageKey: 'faq',
        pagePath: '/faq',
        lang,
        extraSchemas: [faqSchemaForLang('en')].filter(Boolean)
    });
}
app.get('/faq', serveFaq);
app.get('/:lang/faq', (req, res, next) => {
    if (SUPPORTED_LANGUAGES.includes(req.params.lang)) return serveFaq(req, res);
    next();
});

// Blog index
app.get('/blog', (req, res) => {
    return seo.renderLocalizedPage(res, {
        templateFile: 'blog/index.html',
        pageKey: 'blog',
        pagePath: '/blog',
        lang: 'en'
    });
});

// Blog posts
const BLOG_POSTS = {
    'how-to-track-a-phone-number':      'blogPost_howToTrack',
    'phone-tracker-apps-comparison':    'blogPost_comparison',
    'is-tracking-a-phone-number-legal': 'blogPost_legality',
    'find-lost-phone-by-number':        'blogPost_findLost'
};

app.get('/blog/:slug', (req, res, next) => {
    const slug = req.params.slug;
    const pageKey = BLOG_POSTS[slug];
    if (!pageKey) return next();
    const schemas = require('./utils/seo-schemas');
    return seo.renderLocalizedPage(res, {
        templateFile: `blog/${slug}.html`,
        pageKey,
        pagePath: `/blog/${slug}`,
        lang: 'en',
        extraSchemas: [schemas.article({
            headline: (seo.getPageSeo('en', pageKey).title || ''),
            description: seo.getPageSeo('en', pageKey).description || '',
            url: `${seo.SITE}/blog/${slug}`,
            datePublished: '2026-01-01',
            dateModified: '2026-01-01',
            image: seo.getPageSeo('en', pageKey).image
        })]
    });
});

// ============================================================
// Noindex pages (auth / tool / flow pages) — serve with
// robots meta injected, no body changes, no SEO marker required.
// ============================================================
app.get('/admin', (req, res) => seo.renderNoindexPage(res, 'admin.html'));
app.get('/admin/login', (req, res) => seo.renderNoindexPage(res, 'admin-login.html'));

function serveDashboard(req, res) { return seo.renderNoindexPage(res, 'dashboard.html'); }
app.get('/dashboard', serveDashboard);
app.get('/:lang/dashboard', (req, res, next) => {
    if (SUPPORTED_LANGUAGES.includes(req.params.lang)) return serveDashboard(req, res);
    next();
});

function servePayment(req, res) { return seo.renderNoindexPage(res, 'payment.html'); }
app.get('/payment', servePayment);
app.get('/:lang/payment', (req, res, next) => {
    if (SUPPORTED_LANGUAGES.includes(req.params.lang)) return servePayment(req, res);
    next();
});

function servePaymentSuccess(req, res) { return seo.renderNoindexPage(res, 'payment-success.html'); }
app.get('/payment-success', servePaymentSuccess);
app.get('/:lang/payment-success', (req, res, next) => {
    if (SUPPORTED_LANGUAGES.includes(req.params.lang)) return servePaymentSuccess(req, res);
    next();
});

function serveAccount(req, res) { return seo.renderNoindexPage(res, 'account.html'); }
app.get('/account', serveAccount);
app.get('/:lang/account', (req, res, next) => {
    if (SUPPORTED_LANGUAGES.includes(req.params.lang)) return serveAccount(req, res);
    next();
});

function serveCancel(req, res) { return seo.renderNoindexPage(res, 'cancel.html'); }
app.get('/cancel', serveCancel);
app.get('/:lang/cancel', (req, res, next) => {
    if (SUPPORTED_LANGUAGES.includes(req.params.lang)) return serveCancel(req, res);
    next();
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
