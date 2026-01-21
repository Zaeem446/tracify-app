const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'tracify.db');
let db = null;
let SQL = null;

async function getDb() {
    if (db) return db;

    SQL = await initSqlJs();

    // Load existing database or create new one
    if (fs.existsSync(dbPath)) {
        const fileBuffer = fs.readFileSync(dbPath);
        db = new SQL.Database(fileBuffer);
    } else {
        db = new SQL.Database();
    }

    return db;
}

function saveDb() {
    if (db) {
        const data = db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(dbPath, buffer);
    }
}

async function initialize() {
    const database = await getDb();

    // Create customers table
    database.run(`
        CREATE TABLE IF NOT EXISTS customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            phone_to_track TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_login DATETIME,
            is_active INTEGER DEFAULT 1
        )
    `);

    // Create subscriptions table
    database.run(`
        CREATE TABLE IF NOT EXISTS subscriptions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_id INTEGER NOT NULL,
            plan_type TEXT NOT NULL,
            amount REAL NOT NULL,
            currency TEXT DEFAULT 'PKR',
            status TEXT DEFAULT 'active',
            stripe_subscription_id TEXT,
            stripe_customer_id TEXT,
            started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            expires_at DATETIME,
            cancelled_at DATETIME,
            FOREIGN KEY (customer_id) REFERENCES customers(id)
        )
    `);

    // Create payments table
    database.run(`
        CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_id INTEGER NOT NULL,
            subscription_id INTEGER,
            amount REAL NOT NULL,
            currency TEXT DEFAULT 'PKR',
            status TEXT DEFAULT 'pending',
            stripe_payment_id TEXT,
            payment_method TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (customer_id) REFERENCES customers(id),
            FOREIGN KEY (subscription_id) REFERENCES subscriptions(id)
        )
    `);

    // Create tracking_requests table
    database.run(`
        CREATE TABLE IF NOT EXISTS tracking_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_id INTEGER NOT NULL,
            phone_number TEXT NOT NULL,
            country_code TEXT,
            status TEXT DEFAULT 'pending',
            consent_given INTEGER DEFAULT 0,
            location_lat REAL,
            location_lng REAL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            consent_at DATETIME,
            FOREIGN KEY (customer_id) REFERENCES customers(id)
        )
    `);

    // Create admin_users table
    database.run(`
        CREATE TABLE IF NOT EXISTS admin_users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            email TEXT,
            role TEXT DEFAULT 'admin',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_login DATETIME
        )
    `);

    // Create sessions table for customer sessions
    database.run(`
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_id INTEGER NOT NULL,
            token TEXT UNIQUE NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            expires_at DATETIME NOT NULL,
            FOREIGN KEY (customer_id) REFERENCES customers(id)
        )
    `);

    // Create default admin if not exists
    const adminCheck = database.exec("SELECT id FROM admin_users WHERE username = 'admin'");
    if (adminCheck.length === 0 || adminCheck[0].values.length === 0) {
        const hashedPassword = bcrypt.hashSync('admin123', 10);
        database.run("INSERT INTO admin_users (username, password, email, role) VALUES (?, ?, ?, ?)", [
            'admin',
            hashedPassword,
            'admin@tracify.com',
            'superadmin'
        ]);
        console.log('Default admin created - Username: admin, Password: admin123');
    }

    saveDb();
    console.log('Database initialized successfully');
}

// Helper functions to convert sql.js results to objects
function resultToObject(result) {
    if (!result || result.length === 0 || result[0].values.length === 0) return null;
    const columns = result[0].columns;
    const values = result[0].values[0];
    const obj = {};
    columns.forEach((col, i) => obj[col] = values[i]);
    return obj;
}

function resultToArray(result) {
    if (!result || result.length === 0) return [];
    const columns = result[0].columns;
    return result[0].values.map(values => {
        const obj = {};
        columns.forEach((col, i) => obj[col] = values[i]);
        return obj;
    });
}

// Customer functions
const customerQueries = {
    create: (email, password) => {
        const hashedPassword = bcrypt.hashSync(password, 10);
        db.run('INSERT INTO customers (email, password) VALUES (?, ?)', [email, hashedPassword]);
        saveDb();
        // Get the actual last inserted ID by querying max id
        const result = db.exec('SELECT MAX(id) as id FROM customers');
        const lastId = result[0]?.values[0]?.[0] || 1;
        return { lastInsertRowid: lastId };
    },

    findByEmail: (email) => {
        const result = db.exec('SELECT * FROM customers WHERE email = ?', [email]);
        return resultToObject(result);
    },

    findById: (id) => {
        const result = db.exec('SELECT * FROM customers WHERE id = ?', [id]);
        return resultToObject(result);
    },

    updateLastLogin: (id) => {
        db.run("UPDATE customers SET last_login = datetime('now') WHERE id = ?", [id]);
        saveDb();
    },

    updatePhoneToTrack: (id, phone) => {
        db.run('UPDATE customers SET phone_to_track = ? WHERE id = ?', [phone, id]);
        saveDb();
    },

    getAll: () => {
        const result = db.exec(`
            SELECT c.*,
                   s.plan_type, s.status as subscription_status, s.started_at as subscription_started,
                   s.expires_at as subscription_expires
            FROM customers c
            LEFT JOIN subscriptions s ON c.id = s.customer_id AND s.status = 'active'
            ORDER BY c.created_at DESC
        `);
        return resultToArray(result);
    },

    getCount: () => {
        const result = db.exec('SELECT COUNT(*) as count FROM customers');
        return resultToObject(result);
    },

    getRecentCustomers: (limit = 10) => {
        const result = db.exec(`
            SELECT c.*, s.plan_type, s.status as subscription_status
            FROM customers c
            LEFT JOIN subscriptions s ON c.id = s.customer_id
            ORDER BY c.created_at DESC
            LIMIT ?
        `, [limit]);
        return resultToArray(result);
    },

    delete: (id) => {
        // Delete related data first (sessions, tracking requests, payments, subscriptions)
        db.run('DELETE FROM sessions WHERE customer_id = ?', [id]);
        db.run('DELETE FROM tracking_requests WHERE customer_id = ?', [id]);
        db.run('DELETE FROM payments WHERE customer_id = ?', [id]);
        db.run('DELETE FROM subscriptions WHERE customer_id = ?', [id]);
        db.run('DELETE FROM customers WHERE id = ?', [id]);
        saveDb();
    },

    deleteByEmail: (email) => {
        const customer = resultToObject(db.exec('SELECT id FROM customers WHERE email = ?', [email]));
        if (customer) {
            db.run('DELETE FROM sessions WHERE customer_id = ?', [customer.id]);
            db.run('DELETE FROM tracking_requests WHERE customer_id = ?', [customer.id]);
            db.run('DELETE FROM payments WHERE customer_id = ?', [customer.id]);
            db.run('DELETE FROM subscriptions WHERE customer_id = ?', [customer.id]);
            db.run('DELETE FROM customers WHERE id = ?', [customer.id]);
            saveDb();
            return true;
        }
        return false;
    },

    hasActiveSubscription: (email) => {
        const result = db.exec(`
            SELECT s.id FROM subscriptions s
            JOIN customers c ON s.customer_id = c.id
            WHERE c.email = ? AND s.status = 'active' AND s.expires_at > datetime('now')
            LIMIT 1
        `, [email]);
        return result.length > 0 && result[0].values.length > 0;
    }
};

// Subscription functions
const subscriptionQueries = {
    create: (customerId, planType, amount, expiresAt, stripeCustomerId = null, stripeSubscriptionId = null) => {
        db.run(`
            INSERT INTO subscriptions (customer_id, plan_type, amount, expires_at, stripe_customer_id, stripe_subscription_id)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [customerId, planType, amount, expiresAt, stripeCustomerId, stripeSubscriptionId]);
        saveDb();
        const result = db.exec('SELECT MAX(id) as id FROM subscriptions');
        const lastId = result[0]?.values[0]?.[0] || 1;
        return { lastInsertRowid: lastId };
    },

    findByCustomerId: (customerId) => {
        const result = db.exec('SELECT * FROM subscriptions WHERE customer_id = ? ORDER BY started_at DESC', [customerId]);
        return resultToArray(result);
    },

    findActiveByCustomerId: (customerId) => {
        const result = db.exec(`
            SELECT * FROM subscriptions
            WHERE customer_id = ? AND status = 'active' AND expires_at > datetime('now')
            ORDER BY started_at DESC LIMIT 1
        `, [customerId]);
        return resultToObject(result);
    },

    getAll: () => {
        const result = db.exec(`
            SELECT s.*, c.email as customer_email
            FROM subscriptions s
            JOIN customers c ON s.customer_id = c.id
            ORDER BY s.started_at DESC
        `);
        return resultToArray(result);
    },

    getStats: () => {
        const result = db.exec(`
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
                SUM(CASE WHEN status = 'expired' THEN 1 ELSE 0 END) as expired,
                SUM(CASE WHEN plan_type = 'trial' THEN 1 ELSE 0 END) as trials,
                SUM(CASE WHEN plan_type = 'monthly' THEN 1 ELSE 0 END) as monthly
            FROM subscriptions
        `);
        return resultToObject(result) || { total: 0, active: 0, cancelled: 0, expired: 0, trials: 0, monthly: 0 };
    },

    cancel: (id) => {
        db.run("UPDATE subscriptions SET status = 'cancelled', cancelled_at = datetime('now') WHERE id = ?", [id]);
        saveDb();
    },

    updateStatus: (id, status) => {
        db.run('UPDATE subscriptions SET status = ? WHERE id = ?', [status, id]);
        saveDb();
    }
};

// Payment functions
const paymentQueries = {
    create: (customerId, subscriptionId, amount, stripePaymentId, paymentMethod, status = 'completed') => {
        db.run(`
            INSERT INTO payments (customer_id, subscription_id, amount, stripe_payment_id, payment_method, status)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [customerId, subscriptionId, amount, stripePaymentId, paymentMethod, status]);
        saveDb();
    },

    getAll: () => {
        const result = db.exec(`
            SELECT p.*, c.email as customer_email
            FROM payments p
            JOIN customers c ON p.customer_id = c.id
            ORDER BY p.created_at DESC
        `);
        return resultToArray(result);
    },

    getByCustomerId: (customerId) => {
        const result = db.exec('SELECT * FROM payments WHERE customer_id = ? ORDER BY created_at DESC', [customerId]);
        return resultToArray(result);
    },

    getTotalRevenue: () => {
        const result = db.exec("SELECT SUM(amount) as total FROM payments WHERE status = 'completed'");
        return resultToObject(result) || { total: 0 };
    },

    getRevenueByPeriod: (days = 30) => {
        const result = db.exec(`
            SELECT DATE(created_at) as date, SUM(amount) as amount
            FROM payments
            WHERE status = 'completed' AND created_at >= datetime('now', '-' || ? || ' days')
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        `, [days]);
        return resultToArray(result);
    }
};

// Tracking functions
const trackingQueries = {
    create: (customerId, phoneNumber, countryCode) => {
        db.run(`
            INSERT INTO tracking_requests (customer_id, phone_number, country_code)
            VALUES (?, ?, ?)
        `, [customerId, phoneNumber, countryCode]);
        saveDb();
        const result = db.exec('SELECT MAX(id) as id FROM tracking_requests');
        const lastId = result[0]?.values[0]?.[0] || 1;
        return { lastInsertRowid: lastId };
    },

    getByCustomerId: (customerId) => {
        const result = db.exec('SELECT * FROM tracking_requests WHERE customer_id = ? ORDER BY created_at DESC', [customerId]);
        return resultToArray(result);
    },

    getAll: () => {
        const result = db.exec(`
            SELECT t.*, c.email as customer_email
            FROM tracking_requests t
            JOIN customers c ON t.customer_id = c.id
            ORDER BY t.created_at DESC
        `);
        return resultToArray(result);
    },

    updateConsent: (id, lat, lng) => {
        db.run(`
            UPDATE tracking_requests
            SET consent_given = 1, location_lat = ?, location_lng = ?, consent_at = datetime('now'), status = 'completed'
            WHERE id = ?
        `, [lat, lng, id]);
        saveDb();
    }
};

// Admin functions
const adminQueries = {
    findByUsername: (username) => {
        const result = db.exec('SELECT * FROM admin_users WHERE username = ?', [username]);
        return resultToObject(result);
    },

    updateLastLogin: (id) => {
        db.run("UPDATE admin_users SET last_login = datetime('now') WHERE id = ?", [id]);
        saveDb();
    },

    getDashboardStats: () => {
        const customers = db.exec('SELECT COUNT(*) as count FROM customers');
        const activeSubscriptions = db.exec("SELECT COUNT(*) as count FROM subscriptions WHERE status = 'active'");
        const totalRevenue = db.exec("SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'completed'");
        const todayRevenue = db.exec("SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'completed' AND DATE(created_at) = DATE('now')");
        const trackingRequests = db.exec('SELECT COUNT(*) as count FROM tracking_requests');

        return {
            totalCustomers: resultToObject(customers)?.count || 0,
            activeSubscriptions: resultToObject(activeSubscriptions)?.count || 0,
            totalRevenue: resultToObject(totalRevenue)?.total || 0,
            todayRevenue: resultToObject(todayRevenue)?.total || 0,
            trackingRequests: resultToObject(trackingRequests)?.count || 0
        };
    }
};

// Session functions
const sessionQueries = {
    create: (customerId, token, expiresAt) => {
        db.run('INSERT INTO sessions (customer_id, token, expires_at) VALUES (?, ?, ?)', [customerId, token, expiresAt]);
        saveDb();
    },

    findByToken: (token) => {
        const result = db.exec(`
            SELECT s.*, c.email, c.id as customer_id
            FROM sessions s
            JOIN customers c ON s.customer_id = c.id
            WHERE s.token = ? AND s.expires_at > datetime('now')
        `, [token]);
        return resultToObject(result);
    },

    delete: (token) => {
        db.run('DELETE FROM sessions WHERE token = ?', [token]);
        saveDb();
    },

    deleteExpired: () => {
        db.run("DELETE FROM sessions WHERE expires_at <= datetime('now')");
        saveDb();
    }
};

module.exports = {
    initialize,
    getDb,
    customers: customerQueries,
    subscriptions: subscriptionQueries,
    payments: paymentQueries,
    tracking: trackingQueries,
    admin: adminQueries,
    sessions: sessionQueries
};
