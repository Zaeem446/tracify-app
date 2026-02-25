# Tracify Project Context

## Overview
Tracify is a phone tracking SaaS application with subscription billing.

## Tech Stack
- **Backend:** Node.js + Express (`server.js`)
- **Database:** PostgreSQL on Supabase (connection via `POSTGRES_URL` env var)
- **Hosting:** Vercel (serverless)
- **Payments:** Stripe (live mode)
- **SMS:** Twilio

## Key URLs
- **Production:** https://tracify-geo.com
- **Admin Panel:** https://tracify-geo.com/admin
- **GitHub:** https://github.com/Zaeem446/tracify-app

## Project Structure
```
/routes
  admin.js      - Admin API endpoints
  auth.js       - Customer auth
  pixels.js     - Tracking pixels/tags
  stripe.js     - Payment webhooks
/database
  db.js         - PostgreSQL connection + all queries
/public
  admin.html    - Admin dashboard
  admin-login.html
  index.html    - Landing page
  dashboard.html - Customer dashboard
```

## Database Tables
- `customers` - User accounts (email, password, phone_to_track)
- `subscriptions` - Plan details (plan_type, amount, status, expires_at)
- `payments` - Transaction history
- `tracking_requests` - Location tracking data
- `pixels_tags` - Google/Meta pixels
- `sessions` - Auth sessions
- `admin_users` - Admin accounts

## Subscription Flow
1. Customer pays $0.50 trial (24 hours)
2. After trial, charged $30/month via Stripe subscription
3. Webhooks update subscription status in DB

## Important Notes
- **Cancel behavior:** Soft-cancel only (sets status='cancelled'), preserves customer + payment history
- **Local dev:** Won't work without POSTGRES_URL in .env (DB is on Supabase)
- **Stripe keys:** Live mode in production, stored in Vercel env vars

## Recent Changes (Jan 2026)
- Fixed cancel endpoint to not delete customer data
- Added search/sort to all admin panel tabs
- Restored frasherakelc@gmail.com payment records ($1.25 + $30)

## Admin Credentials
- Username: admin
- Password: Amazon@786@
