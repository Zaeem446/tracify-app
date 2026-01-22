const bcrypt = require('bcryptjs');

// In-memory database for Vercel serverless
// Note: Data resets on each deployment - use a cloud database for production
let customers = [];
let subscriptions = [];
let payments = [];
let trackingRequests = [];
let adminUsers = [];
let sessions = [];

let idCounters = {
    customers: 1,
    subscriptions: 1,
    payments: 1,
    trackingRequests: 1,
    sessions: 1
};

async function initialize() {
    console.log('Initializing in-memory database for serverless...');

    // Create default admin if not exists
    const existingAdmin = adminUsers.find(a => a.username === 'admin');
    if (!existingAdmin) {
        const hashedPassword = bcrypt.hashSync('admin123', 10);
        adminUsers.push({
            id: 1,
            username: 'admin',
            password: hashedPassword,
            email: 'admin@tracify.com',
            role: 'superadmin',
            created_at: new Date().toISOString(),
            last_login: null
        });
        console.log('Default admin created - Username: admin, Password: admin123');
    }

    console.log('Database initialized successfully (in-memory mode)');
}

// Customer functions
const customerQueries = {
    create: (email, password) => {
        const hashedPassword = bcrypt.hashSync(password, 10);
        const customer = {
            id: idCounters.customers++,
            email,
            password: hashedPassword,
            phone_to_track: null,
            created_at: new Date().toISOString(),
            last_login: null,
            is_active: 1
        };
        customers.push(customer);
        return { lastInsertRowid: customer.id };
    },

    findByEmail: (email) => {
        return customers.find(c => c.email === email) || null;
    },

    findById: (id) => {
        return customers.find(c => c.id === id) || null;
    },

    updateLastLogin: (id) => {
        const customer = customers.find(c => c.id === id);
        if (customer) customer.last_login = new Date().toISOString();
    },

    updatePhoneToTrack: (id, phone) => {
        const customer = customers.find(c => c.id === id);
        if (customer) customer.phone_to_track = phone;
    },

    getAll: () => {
        return customers.map(c => {
            const sub = subscriptions.find(s => s.customer_id === c.id && s.status === 'active');
            return {
                ...c,
                plan_type: sub?.plan_type,
                subscription_status: sub?.status,
                subscription_started: sub?.started_at,
                subscription_expires: sub?.expires_at
            };
        });
    },

    getCount: () => ({ count: customers.length }),

    getRecentCustomers: (limit = 10) => {
        return customers.slice(-limit).reverse().map(c => {
            const sub = subscriptions.find(s => s.customer_id === c.id);
            return { ...c, plan_type: sub?.plan_type, subscription_status: sub?.status };
        });
    },

    delete: (id) => {
        sessions = sessions.filter(s => s.customer_id !== id);
        trackingRequests = trackingRequests.filter(t => t.customer_id !== id);
        payments = payments.filter(p => p.customer_id !== id);
        subscriptions = subscriptions.filter(s => s.customer_id !== id);
        customers = customers.filter(c => c.id !== id);
    },

    deleteByEmail: (email) => {
        const customer = customers.find(c => c.email === email);
        if (customer) {
            customerQueries.delete(customer.id);
            return true;
        }
        return false;
    },

    hasActiveSubscription: (email) => {
        const customer = customers.find(c => c.email === email);
        if (!customer) return false;
        const now = new Date().toISOString();
        return subscriptions.some(s =>
            s.customer_id === customer.id &&
            s.status === 'active' &&
            s.expires_at > now
        );
    }
};

// Subscription functions
const subscriptionQueries = {
    create: (customerId, planType, amount, expiresAt, stripeCustomerId = null, stripeSubscriptionId = null) => {
        const sub = {
            id: idCounters.subscriptions++,
            customer_id: customerId,
            plan_type: planType,
            amount,
            currency: 'USD',
            status: 'active',
            stripe_subscription_id: stripeSubscriptionId,
            stripe_customer_id: stripeCustomerId,
            started_at: new Date().toISOString(),
            expires_at: expiresAt,
            cancelled_at: null
        };
        subscriptions.push(sub);
        return { lastInsertRowid: sub.id };
    },

    findByCustomerId: (customerId) => {
        return subscriptions.filter(s => s.customer_id === customerId).reverse();
    },

    findActiveByCustomerId: (customerId) => {
        const now = new Date().toISOString();
        return subscriptions.find(s =>
            s.customer_id === customerId &&
            s.status === 'active' &&
            s.expires_at > now
        ) || null;
    },

    getAll: () => {
        return subscriptions.map(s => {
            const customer = customers.find(c => c.id === s.customer_id);
            return { ...s, customer_email: customer?.email };
        }).reverse();
    },

    getStats: () => {
        return {
            total: subscriptions.length,
            active: subscriptions.filter(s => s.status === 'active').length,
            cancelled: subscriptions.filter(s => s.status === 'cancelled').length,
            expired: subscriptions.filter(s => s.status === 'expired').length,
            trials: subscriptions.filter(s => s.plan_type === 'trial').length,
            monthly: subscriptions.filter(s => s.plan_type === 'monthly').length
        };
    },

    cancel: (id) => {
        const sub = subscriptions.find(s => s.id === id);
        if (sub) {
            sub.status = 'cancelled';
            sub.cancelled_at = new Date().toISOString();
        }
    },

    updateStatus: (id, status) => {
        const sub = subscriptions.find(s => s.id === id);
        if (sub) sub.status = status;
    }
};

// Payment functions
const paymentQueries = {
    create: (customerId, subscriptionId, amount, stripePaymentId, paymentMethod, status = 'completed') => {
        const payment = {
            id: idCounters.payments++,
            customer_id: customerId,
            subscription_id: subscriptionId,
            amount,
            currency: 'USD',
            status,
            stripe_payment_id: stripePaymentId,
            payment_method: paymentMethod,
            created_at: new Date().toISOString()
        };
        payments.push(payment);
    },

    getAll: () => {
        return payments.map(p => {
            const customer = customers.find(c => c.id === p.customer_id);
            return { ...p, customer_email: customer?.email };
        }).reverse();
    },

    getByCustomerId: (customerId) => {
        return payments.filter(p => p.customer_id === customerId).reverse();
    },

    getTotalRevenue: () => {
        const total = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
        return { total };
    },

    getRevenueByPeriod: (days = 30) => {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        return payments
            .filter(p => p.status === 'completed' && new Date(p.created_at) >= cutoff)
            .map(p => ({ date: p.created_at.split('T')[0], amount: p.amount }));
    }
};

// Tracking functions
const trackingQueries = {
    create: (customerId, phoneNumber, countryCode) => {
        const request = {
            id: idCounters.trackingRequests++,
            customer_id: customerId,
            phone_number: phoneNumber,
            country_code: countryCode,
            status: 'pending',
            consent_given: 0,
            location_lat: null,
            location_lng: null,
            created_at: new Date().toISOString(),
            consent_at: null
        };
        trackingRequests.push(request);
        return { lastInsertRowid: request.id };
    },

    getByCustomerId: (customerId) => {
        return trackingRequests.filter(t => t.customer_id === customerId).reverse();
    },

    getAll: () => {
        return trackingRequests.map(t => {
            const customer = customers.find(c => c.id === t.customer_id);
            return { ...t, customer_email: customer?.email };
        }).reverse();
    },

    updateConsent: (id, lat, lng) => {
        const request = trackingRequests.find(t => t.id === id);
        if (request) {
            request.consent_given = 1;
            request.location_lat = lat;
            request.location_lng = lng;
            request.consent_at = new Date().toISOString();
            request.status = 'completed';
        }
    }
};

// Admin functions
const adminQueries = {
    findByUsername: (username) => {
        return adminUsers.find(a => a.username === username) || null;
    },

    updateLastLogin: (id) => {
        const admin = adminUsers.find(a => a.id === id);
        if (admin) admin.last_login = new Date().toISOString();
    },

    getDashboardStats: () => {
        return {
            totalCustomers: customers.length,
            activeSubscriptions: subscriptions.filter(s => s.status === 'active').length,
            totalRevenue: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
            todayRevenue: payments.filter(p => {
                const today = new Date().toISOString().split('T')[0];
                return p.status === 'completed' && p.created_at.startsWith(today);
            }).reduce((sum, p) => sum + p.amount, 0),
            trackingRequests: trackingRequests.length
        };
    }
};

// Session functions
const sessionQueries = {
    create: (customerId, token, expiresAt) => {
        const session = {
            id: idCounters.sessions++,
            customer_id: customerId,
            token,
            created_at: new Date().toISOString(),
            expires_at: expiresAt
        };
        sessions.push(session);
    },

    findByToken: (token) => {
        const now = new Date().toISOString();
        const session = sessions.find(s => s.token === token && s.expires_at > now);
        if (!session) return null;
        const customer = customers.find(c => c.id === session.customer_id);
        return { ...session, email: customer?.email, customer_id: session.customer_id };
    },

    delete: (token) => {
        sessions = sessions.filter(s => s.token !== token);
    },

    deleteExpired: () => {
        const now = new Date().toISOString();
        sessions = sessions.filter(s => s.expires_at > now);
    }
};

module.exports = {
    initialize,
    getDb: () => null, // Not used in memory mode
    customers: customerQueries,
    subscriptions: subscriptionQueries,
    payments: paymentQueries,
    tracking: trackingQueries,
    admin: adminQueries,
    sessions: sessionQueries
};
