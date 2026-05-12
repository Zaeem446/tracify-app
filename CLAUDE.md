# Tracify Project Context

## Overview
Tracify is a consent-based phone tracking SaaS. Users enter a phone number, the system sends an SMS with a consent link, and if the recipient agrees, their GPS location is shared back to the user's dashboard. Subscription billing via Stripe.

## Key URLs
- **Production:** https://tracify-geo.com
- **Admin Panel:** https://tracify-geo.com/admin
- **GitHub:** https://github.com/Zaeem446/tracify-app
- **Local path:** /Users/zaeemaslam853/Projects/claude new project/
- **Local dev:** `PORT=3078 node server.js` (DB won't connect without POSTGRES_URL in .env)

## Tech Stack
- **Backend:** Node.js + Express (`server.js`, 402 lines)
- **Database:** PostgreSQL on Supabase (connection via `POSTGRES_URL` or `POSTGRES_URL_NON_POOLING`)
- **Hosting:** Vercel serverless (`api/index.js` re-exports `server.js`, `vercel.json` rewrites all to `/api`)
- **Payments:** Stripe (live mode — Checkout Sessions + webhooks)
- **SMS:** Twilio (`utils/sms.js`)
- **Email:** Nodemailer via SMTP (`utils/email.js`)
- **Geo Detection:** FreeIPAPI (`routes/geo.js` → `https://us.freeipapi.com/api/json`)
- **Analytics:** Microsoft Clarity (`wmi5ds3irc`), Google Ads + Meta Pixel (dynamic via DB)

## Project Structure
```
server.js              - Express app, middleware, route mounting, geo-blocking, SEO routing
api/index.js           - Vercel serverless entry (re-exports server.js)
vercel.json            - Vercel config (rewrites all to /api, 30s timeout)

routes/
  auth.js              - Customer signup/login/logout, admin auth (JWT)
  payment.js           - Stripe Checkout, cancel, history, webhook handler
  tracking.js          - Send SMS, consent flow, tracking history
  subscription.js      - Cancel from /cancel page, delete account
  admin.js             - Admin dashboard API, customer/sub/payment CRUD, pixels, funnel stats
  contact.js           - Contact form → email
  geo.js               - FreeIPAPI country detection
  pixels.js            - Serve dynamic tracking tags as JS
  lookup.js            - Twilio phone number carrier lookup

database/
  db.js                - PostgreSQL pool, all CRUD queries, table initialization

utils/
  email.js             - Nodemailer: password emails, tracking consent SMS, contact form
  sms.js               - Twilio SMS sending
  seo.js               - Server-side meta injection, sitemap.xml, robots.txt
  seo-schemas.js       - JSON-LD schema builders (Organization, FAQ, HowTo, Article, etc.)
  localization.js      - Currency conversion, country-to-language mapping

public/
  index.html           - Main landing page ($30/mo)
  dashboard.html       - Customer dashboard (auth required)
  account.html         - Account settings + subscription management
  payment.html         - Stripe Checkout page
  payment-success.html - Post-payment verification
  admin.html           - Admin panel
  admin-login.html     - Admin login
  contact.html         - Contact form
  cancel.html          - Public cancellation page
  faq.html             - FAQ page
  how-it-works.html    - How it works
  privacy.html         - Privacy policy
  terms.html           - Terms of service
  blocked.html         - Geoblocked country page
  script.js            - Main landing page JS (signup/login modals, phone input, i18n)
  styles.css           - Main landing page CSS

  go/index.html        - Ad landing page ($19.99/mo) — also served at go.tracify-geo.com
  track/index.html     - Family safety landing ($14.99/mo)
  find/index.html      - Device finder landing ($14.98/mo)
  start/index.html     - GPS locator landing ($19.98/mo)
  here/index.html      - Bi-weekly landing ($4.99/mo)
  child/index.html     - Child safety landing ($17.99/mo)
  lostphone/index.html - Lost phone landing ($17.98/mo)

  blog/                - 16 SEO blog posts + index
  js/                  - Frontend utilities (i18n, geo-detect, stripe, currency, phone)
  translations/        - 45 language JSON files (UI strings)
  translations/seo/    - 45 language JSON files (SEO meta)
  og/                  - Open Graph images

scripts/               - Translation generation/fix scripts (one-time use)
plans/                 - Architecture plan docs
```

## Database Tables (8)
| Table | Key Columns | Purpose |
|---|---|---|
| `customers` | id, email, password (bcrypt), phone_to_track, source, is_active | User accounts |
| `subscriptions` | customer_id, plan_type, amount, status, stripe_subscription_id, expires_at | Plans (active/cancelled/expired) |
| `payments` | customer_id, subscription_id, amount, stripe_payment_id, status | Transaction history |
| `tracking_requests` | customer_id, phone_number, consent_given, location_lat/lng | SMS requests + GPS data |
| `sessions` | customer_id, token (UUID), expires_at | Customer auth sessions |
| `admin_users` | username, password (bcrypt), role | Admin accounts (JWT auth) |
| `pixels_tags` | name, tag_type, pixel_id, custom_code, is_active | Google/Meta/custom tracking tags |
| `funnel_events` | source, stage, session_id | Visitor journey tracking |

## Auth System
- **Customers:** Cookie-based sessions. `session_token` cookie → `sessions` table → `customers` table. Signup = 24h session, Login = 7d session. Passwords auto-generated and emailed on signup.
- **Admin:** JWT in `admin_token` cookie, 8h expiry. Credentials: `admin` / `Amazon@786@`
- **NO forgot/reset password feature exists** — users who lose their password have no way to recover it.

## API Routes
| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/signup` | None | Create account, email password, create Stripe checkout |
| POST | `/api/auth/login` | None | Customer login |
| GET | `/api/auth/me` | Cookie | Check session / get user data |
| POST | `/api/auth/logout` | Cookie | Clear session |
| POST | `/api/auth/admin/login` | None | Admin JWT login |
| GET | `/api/auth/admin/me` | JWT | Check admin auth |
| GET | `/api/payment/stripe-config` | None | Get publishable key |
| POST | `/api/payment/create-checkout-session` | Cookie | Start Stripe Checkout |
| GET | `/api/payment/verify-session` | Cookie | Verify payment, create sub in DB |
| GET | `/api/payment/subscription` | Cookie | Check subscription status |
| POST | `/api/payment/cancel` | Cookie | Cancel subscription (soft cancel) |
| GET | `/api/payment/history` | Cookie | Payment history |
| POST | `/api/payment/webhook` | Stripe sig | Stripe webhook handler |
| POST | `/api/tracking/request` | Cookie+Sub | Send consent SMS (rate limited 1/3hrs) |
| GET | `/api/tracking/history` | Cookie+Sub | Tracking request history |
| GET | `/api/tracking/consent/:id` | None | Recipient consent page |
| POST | `/api/tracking/consent/:id` | None | Submit GPS location |
| POST | `/api/subscription/cancel` | None | Cancel from /cancel page (manual) |
| POST | `/api/subscription/cancel-account` | Cookie | Delete account entirely |
| GET | `/api/geo/detect` | None | FreeIPAPI country detection |
| POST | `/api/contact/send` | None | Contact form → email |
| GET | `/api/lookup/phone` | None | Twilio carrier lookup |
| GET | `/api/pixels/active` | None | Dynamic tracking tags as JS |
| POST | `/api/funnel` | None | Log funnel event |
| GET | `/api/admin/stats` | JWT | Dashboard stats |
| GET | `/api/admin/customers` | JWT | All customers |
| GET | `/api/admin/customers/:id` | JWT | Customer details |
| GET | `/api/admin/subscriptions` | JWT | All subscriptions |
| POST | `/api/admin/subscriptions/:id/cancel` | JWT | Cancel subscription |
| GET | `/api/admin/payments` | JWT | All payments |
| POST | `/api/admin/add-payment` | JWT | Manual payment entry |
| POST | `/api/admin/fix-subscription` | JWT | Extend/fix subscription |
| GET | `/api/admin/tracking` | JWT | All tracking requests |
| GET | `/api/admin/funnel` | JWT | Funnel analytics |
| GET | `/api/admin/diagnose/:email` | JWT | Debug customer data |

## Subscription & Payment Flow
1. User visits landing page → enters phone number → signup modal
2. `POST /api/auth/signup` → account created, password emailed, Stripe Checkout Session created
3. Stripe Checkout: $0.50 trial (one-time) + monthly subscription (1-day trial period)
4. After payment → `/payment-success` → `GET /api/payment/verify-session` → creates subscription + payment in DB
5. Monthly: Stripe charges → webhook `invoice.payment_succeeded` → extends sub 30 days + records payment
6. Failed payment: webhook → marks subscription expired
7. Cancel: `POST /api/payment/cancel` → cancels Stripe sub + soft-cancels in DB (preserves all data)

## Pricing by Landing Page
| Source | Path | Monthly | Stripe Price ID |
|---|---|---|---|
| main | `/` | $30.00 | `price_1TIADCIggzd46qoMesRQlnq7` |
| go | `/go` | $19.99 | `price_1TOlBLIggzd46qoM1vxwPRlv` |
| track | `/track` | $14.99 | `price_1TOlCcIggzd46qoMiNL1Ii4p` |
| find | `/find` | $14.98 | `price_1TOlDPIggzd46qoMePMApfor` |
| start | `/start` | $19.98 | `price_1TPDSGIggzd46qoMl1mZjQ9y` |
| here | `/here` | $4.99 | `price_1TPbEpIggzd46qoM6k7rDlUy` |
| child | `/child` | $17.99 | `price_1TRIpTIggzd46qoMILE389kV` |
| lostphone | `/lostphone` | $17.98 | `price_1TRLZXIggzd46qoMQqAM4kS4` |

All have $0.50 trial with 24-hour full access.

## SMS/Tracking Flow
1. Dashboard: user enters phone + country code + custom message
2. `POST /api/tracking/request` → rate limited 1 SMS per 3 hours
3. Twilio sends SMS with consent link: `/api/tracking/consent/:trackingId`
4. Recipient clicks → consent page → "Share My Location" → browser `navigator.geolocation`
5. `POST /api/tracking/consent/:trackingId` → saves lat/lng to DB
6. Dashboard shows location on map

## Geoblocking & Geo Detection
- **Geoblocking:** Middleware in `server.js` reads `x-vercel-ip-country` header → blocks CU, IR, KP, SY, RU → serves `blocked.html`. Only works on Vercel (header absent locally).
- **Geo Detection:** `GET /api/geo/detect` → FreeIPAPI with API key → returns countryCode, language, phoneCode, timezone. Client caches in localStorage for 1 hour.

## i18n System
- **45 language files** in `public/translations/*.json`
- **Client-side:** `public/js/i18n.js` replaces text via `data-i18n` attributes at runtime
- **CRITICAL:** i18n overrides HTML text. Changing HTML alone won't work if a translation key exists. Always update `en.json` (and ideally all 44 other language files) when changing user-visible text.
- **SEO translations:** Separate files in `public/translations/seo/`
- **RTL support:** Arabic (`ar`) and Hebrew (`he`)
- **Language routing:** `/:lang/page` routes (e.g., `/fr/contact`, `/de/dashboard`)
- **Auto-detection:** `public/js/geo-detect.js` calls `/api/geo/detect` → maps country → language

## SEO System
- Server-side meta injection via `<!--SEO_HEAD-->` marker in HTML templates (`utils/seo.js`)
- Generates: title, description, OG tags, Twitter cards, hreflang alternates, JSON-LD schemas
- Dynamic `sitemap.xml` and `robots.txt`
- Noindex pages: dashboard, account, payment, payment-success, cancel, admin
- 16 blog posts with Article schema

## Two Cancel Paths
1. **Self-service (account page):** `POST /api/payment/cancel` — cancels Stripe sub + sets DB status to `cancelled`. Preserves customer + payment history.
2. **Cancel page (/cancel):** `POST /api/subscription/cancel` — just shows "ticket submitted" message. No actual cancellation — handled manually via admin.
3. **Account deletion:** `POST /api/subscription/cancel-account` — deletes customer entirely (CASCADE deletes subs, payments, tracking, sessions).

## Phone Validation
- Landing pages (`script.js`): regex `/^[\d\s-]{7,15}$/` + `maxlength="15"`
- Dashboard (`dashboard.html`): same regex + `maxlength="15"` (added May 2026)
- Backend (`routes/tracking.js`): same regex server-side

## Environment Variables
```
STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET
JWT_SECRET
APP_URL (https://tracify-geo.com)
POSTGRES_URL, POSTGRES_URL_NON_POOLING
SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, SMTP_FROM
TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
FREEIPAPI_KEY
PORT (default 3000, use 3078 locally)
```

## Admin Panel Features
- Dashboard stats (customers, subs, revenue, tracking requests)
- Customer management (view, search, sort)
- Subscription management (view, cancel, fix/extend)
- Payment history (view, add manual payments)
- Tracking request logs
- Funnel analytics (per landing page: visited → searched → report → signup → paid)
- Pixel/tag CRUD (Google Tags, Meta Pixels, custom scripts)
- Diagnostics endpoint (`/api/admin/diagnose/:email`)

## Known Gaps / Missing Features
- **No forgot/reset password** — users who lose their emailed password cannot recover their account
- **No email change** — users cannot update their email address
- **No password change** — no self-service password update in account settings

## Recent Changes
- **May 2026:** Cancellation friction (button → "Manage Account", subscription card collapsed on account page), phone validation on dashboard + backend, all 45 translation files updated
- **Apr 2026:** Microsoft Clarity analytics added to all 40 HTML pages
- **Apr 2026:** SMS consent & OTP language added to Terms/Privacy for Twilio toll-free verification
- **Apr 2026:** /lostphone landing page added
- **Jan 2026:** Fixed cancel endpoint to not delete customer data, admin panel search/sort, restored frasherakelc payment records

## Deployment
- Push to `main` → Vercel auto-deploys
- `vercel.json`: all requests rewrite to `api/index.js` which exports the Express app
- DB lazy-initialized on first request (serverless-friendly)
- Function timeout: 30 seconds
