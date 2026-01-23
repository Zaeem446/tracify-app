const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// PostgreSQL connection pool for Supabase/Neon (via Vercel)
console.log('Setting up PostgreSQL connection...');

// Use the non-pooling URL for serverless (recommended by Vercel)
const connectionString = process.env.POSTGRES_URL_NON_POOLING
    || process.env.POSTGRES_URL
    || '';

console.log('Connection string exists:', !!connectionString);

// For Vercel + Supabase/Neon, we need proper SSL config
const pool = new Pool({
    connectionString: connectionString,
    ssl: {
        rejectUnauthorized: false,
        require: true
    }
});

// Workaround for self-signed cert issue - set NODE_TLS_REJECT_UNAUTHORIZED
if (process.env.NODE_ENV === 'production') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

pool.on('error', (err) => {
    console.error('PostgreSQL pool error:', err);
});

// Initialize database tables
async function initialize() {
    console.log('Initializing PostgreSQL database...');

    const client = await pool.connect();
    try {
        // Create tables if they don't exist
        await client.query(`
            CREATE TABLE IF NOT EXISTS customers (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                phone_to_track VARCHAR(50),
                created_at TIMESTAMP DEFAULT NOW(),
                last_login TIMESTAMP,
                is_active INTEGER DEFAULT 1
            );

            CREATE TABLE IF NOT EXISTS subscriptions (
                id SERIAL PRIMARY KEY,
                customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
                plan_type VARCHAR(50) NOT NULL,
                amount DECIMAL(10,2) NOT NULL,
                currency VARCHAR(10) DEFAULT 'USD',
                status VARCHAR(50) DEFAULT 'active',
                stripe_subscription_id VARCHAR(255),
                stripe_customer_id VARCHAR(255),
                started_at TIMESTAMP DEFAULT NOW(),
                expires_at TIMESTAMP,
                cancelled_at TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS payments (
                id SERIAL PRIMARY KEY,
                customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
                subscription_id INTEGER,
                amount DECIMAL(10,2) NOT NULL,
                currency VARCHAR(10) DEFAULT 'USD',
                status VARCHAR(50) DEFAULT 'completed',
                stripe_payment_id VARCHAR(255),
                payment_method VARCHAR(100),
                created_at TIMESTAMP DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS tracking_requests (
                id SERIAL PRIMARY KEY,
                customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
                phone_number VARCHAR(50) NOT NULL,
                country_code VARCHAR(10),
                status VARCHAR(50) DEFAULT 'pending',
                consent_given INTEGER DEFAULT 0,
                location_lat DECIMAL(10,8),
                location_lng DECIMAL(11,8),
                created_at TIMESTAMP DEFAULT NOW(),
                consent_at TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS admin_users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                email VARCHAR(255),
                role VARCHAR(50) DEFAULT 'admin',
                created_at TIMESTAMP DEFAULT NOW(),
                last_login TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS sessions (
                id SERIAL PRIMARY KEY,
                customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
                token VARCHAR(255) UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT NOW(),
                expires_at TIMESTAMP NOT NULL
            );
        `);

        // Create default admin if not exists
        const adminCheck = await client.query(
            'SELECT id FROM admin_users WHERE username = $1',
            ['admin']
        );

        if (adminCheck.rows.length === 0) {
            const hashedPassword = bcrypt.hashSync('admin123', 10);
            await client.query(
                'INSERT INTO admin_users (username, password, email, role) VALUES ($1, $2, $3, $4)',
                ['admin', hashedPassword, 'admin@tracify.com', 'superadmin']
            );
            console.log('Default admin created - Username: admin, Password: admin123');
        }

        console.log('Database initialized successfully (PostgreSQL)');
    } catch (err) {
        console.error('Database initialization error:', err);
        throw err;
    } finally {
        client.release();
    }
}

// Customer functions
const customerQueries = {
    create: async (email, password) => {
        const hashedPassword = bcrypt.hashSync(password, 10);
        const result = await pool.query(
            'INSERT INTO customers (email, password) VALUES ($1, $2) RETURNING id',
            [email, hashedPassword]
        );
        return { lastInsertRowid: result.rows[0].id };
    },

    findByEmail: async (email) => {
        const result = await pool.query(
            'SELECT * FROM customers WHERE email = $1',
            [email]
        );
        return result.rows[0] || null;
    },

    findById: async (id) => {
        const result = await pool.query(
            'SELECT * FROM customers WHERE id = $1',
            [id]
        );
        return result.rows[0] || null;
    },

    updateLastLogin: async (id) => {
        await pool.query(
            'UPDATE customers SET last_login = NOW() WHERE id = $1',
            [id]
        );
    },

    updatePhoneToTrack: async (id, phone) => {
        await pool.query(
            'UPDATE customers SET phone_to_track = $1 WHERE id = $2',
            [phone, id]
        );
    },

    getAll: async () => {
        const result = await pool.query(`
            SELECT c.*, s.plan_type, s.status as subscription_status,
                   s.started_at as subscription_started, s.expires_at as subscription_expires
            FROM customers c
            LEFT JOIN subscriptions s ON c.id = s.customer_id AND s.status = 'active'
            ORDER BY c.created_at DESC
        `);
        return result.rows;
    },

    getCount: async () => {
        const result = await pool.query('SELECT COUNT(*) as count FROM customers');
        return { count: parseInt(result.rows[0].count) };
    },

    getRecentCustomers: async (limit = 10) => {
        const result = await pool.query(`
            SELECT c.*, s.plan_type, s.status as subscription_status
            FROM customers c
            LEFT JOIN subscriptions s ON c.id = s.customer_id
            ORDER BY c.created_at DESC
            LIMIT $1
        `, [limit]);
        return result.rows;
    },

    delete: async (id) => {
        await pool.query('DELETE FROM customers WHERE id = $1', [id]);
    },

    deleteByEmail: async (email) => {
        const result = await pool.query(
            'DELETE FROM customers WHERE email = $1 RETURNING id',
            [email]
        );
        return result.rowCount > 0;
    },

    hasActiveSubscription: async (email) => {
        const result = await pool.query(`
            SELECT s.id FROM subscriptions s
            JOIN customers c ON s.customer_id = c.id
            WHERE c.email = $1 AND s.status = 'active' AND s.expires_at > NOW()
        `, [email]);
        return result.rows.length > 0;
    }
};

// Subscription functions
const subscriptionQueries = {
    create: async (customerId, planType, amount, expiresAt, stripeCustomerId = null, stripeSubscriptionId = null) => {
        const result = await pool.query(
            `INSERT INTO subscriptions (customer_id, plan_type, amount, expires_at, stripe_customer_id, stripe_subscription_id)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
            [customerId, planType, amount, expiresAt, stripeCustomerId, stripeSubscriptionId]
        );
        return { lastInsertRowid: result.rows[0].id };
    },

    findByCustomerId: async (customerId) => {
        const result = await pool.query(
            'SELECT * FROM subscriptions WHERE customer_id = $1 ORDER BY started_at DESC',
            [customerId]
        );
        return result.rows;
    },

    findActiveByCustomerId: async (customerId) => {
        const result = await pool.query(
            `SELECT * FROM subscriptions
             WHERE customer_id = $1 AND status = 'active' AND expires_at > NOW()
             ORDER BY started_at DESC LIMIT 1`,
            [customerId]
        );
        return result.rows[0] || null;
    },

    getAll: async () => {
        const result = await pool.query(`
            SELECT s.*, c.email as customer_email
            FROM subscriptions s
            JOIN customers c ON s.customer_id = c.id
            ORDER BY s.started_at DESC
        `);
        return result.rows;
    },

    getStats: async () => {
        const result = await pool.query(`
            SELECT
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE status = 'active') as active,
                COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled,
                COUNT(*) FILTER (WHERE status = 'expired') as expired,
                COUNT(*) FILTER (WHERE plan_type = 'trial') as trials,
                COUNT(*) FILTER (WHERE plan_type = 'monthly') as monthly
            FROM subscriptions
        `);
        return result.rows[0];
    },

    cancel: async (id) => {
        await pool.query(
            `UPDATE subscriptions SET status = 'cancelled', cancelled_at = NOW() WHERE id = $1`,
            [id]
        );
    },

    updateStatus: async (id, status) => {
        await pool.query(
            'UPDATE subscriptions SET status = $1 WHERE id = $2',
            [status, id]
        );
    }
};

// Payment functions
const paymentQueries = {
    create: async (customerId, subscriptionId, amount, stripePaymentId, paymentMethod, status = 'completed') => {
        await pool.query(
            `INSERT INTO payments (customer_id, subscription_id, amount, stripe_payment_id, payment_method, status)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [customerId, subscriptionId, amount, stripePaymentId, paymentMethod, status]
        );
    },

    getAll: async () => {
        const result = await pool.query(`
            SELECT p.*, c.email as customer_email
            FROM payments p
            JOIN customers c ON p.customer_id = c.id
            ORDER BY p.created_at DESC
        `);
        return result.rows;
    },

    getByCustomerId: async (customerId) => {
        const result = await pool.query(
            'SELECT * FROM payments WHERE customer_id = $1 ORDER BY created_at DESC',
            [customerId]
        );
        return result.rows;
    },

    getTotalRevenue: async () => {
        const result = await pool.query(
            `SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'completed'`
        );
        return { total: parseFloat(result.rows[0].total) };
    },

    getRevenueByPeriod: async (days = 30) => {
        const result = await pool.query(`
            SELECT DATE(created_at) as date, SUM(amount) as amount
            FROM payments
            WHERE status = 'completed' AND created_at >= NOW() - INTERVAL '${days} days'
            GROUP BY DATE(created_at)
            ORDER BY date
        `);
        return result.rows;
    }
};

// Tracking functions
const trackingQueries = {
    create: async (customerId, phoneNumber, countryCode) => {
        const result = await pool.query(
            `INSERT INTO tracking_requests (customer_id, phone_number, country_code)
             VALUES ($1, $2, $3) RETURNING id`,
            [customerId, phoneNumber, countryCode]
        );
        return { lastInsertRowid: result.rows[0].id };
    },

    getByCustomerId: async (customerId) => {
        const result = await pool.query(
            'SELECT * FROM tracking_requests WHERE customer_id = $1 ORDER BY created_at DESC',
            [customerId]
        );
        return result.rows;
    },

    getAll: async () => {
        const result = await pool.query(`
            SELECT t.*, c.email as customer_email
            FROM tracking_requests t
            JOIN customers c ON t.customer_id = c.id
            ORDER BY t.created_at DESC
        `);
        return result.rows;
    },

    updateConsent: async (id, lat, lng) => {
        await pool.query(
            `UPDATE tracking_requests
             SET consent_given = 1, location_lat = $1, location_lng = $2, consent_at = NOW(), status = 'completed'
             WHERE id = $3`,
            [lat, lng, id]
        );
    },

    getLastRequestTime: async (customerId) => {
        const result = await pool.query(
            `SELECT created_at FROM tracking_requests
             WHERE customer_id = $1
             ORDER BY created_at DESC
             LIMIT 1`,
            [customerId]
        );
        return result.rows[0]?.created_at || null;
    }
};

// Admin functions
const adminQueries = {
    findByUsername: async (username) => {
        const result = await pool.query(
            'SELECT * FROM admin_users WHERE username = $1',
            [username]
        );
        return result.rows[0] || null;
    },

    updateLastLogin: async (id) => {
        await pool.query(
            'UPDATE admin_users SET last_login = NOW() WHERE id = $1',
            [id]
        );
    },

    getDashboardStats: async () => {
        const stats = await pool.query(`
            SELECT
                (SELECT COUNT(*) FROM customers) as total_customers,
                (SELECT COUNT(*) FROM subscriptions WHERE status = 'active') as active_subscriptions,
                (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'completed') as total_revenue,
                (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'completed' AND DATE(created_at) = CURRENT_DATE) as today_revenue,
                (SELECT COUNT(*) FROM tracking_requests) as tracking_requests
        `);
        const row = stats.rows[0];
        return {
            totalCustomers: parseInt(row.total_customers),
            activeSubscriptions: parseInt(row.active_subscriptions),
            totalRevenue: parseFloat(row.total_revenue),
            todayRevenue: parseFloat(row.today_revenue),
            trackingRequests: parseInt(row.tracking_requests)
        };
    }
};

// Session functions
const sessionQueries = {
    create: async (customerId, token, expiresAt) => {
        await pool.query(
            'INSERT INTO sessions (customer_id, token, expires_at) VALUES ($1, $2, $3)',
            [customerId, token, expiresAt]
        );
    },

    findByToken: async (token) => {
        const result = await pool.query(`
            SELECT s.*, c.email
            FROM sessions s
            JOIN customers c ON s.customer_id = c.id
            WHERE s.token = $1 AND s.expires_at > NOW()
        `, [token]);
        return result.rows[0] || null;
    },

    delete: async (token) => {
        await pool.query('DELETE FROM sessions WHERE token = $1', [token]);
    },

    deleteExpired: async () => {
        await pool.query('DELETE FROM sessions WHERE expires_at <= NOW()');
    }
};

module.exports = {
    initialize,
    getDb: () => pool,
    customers: customerQueries,
    subscriptions: subscriptionQueries,
    payments: paymentQueries,
    tracking: trackingQueries,
    admin: adminQueries,
    sessions: sessionQueries
};
