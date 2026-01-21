# 🚀 Tracify Stripe Integration - Setup Guide

## ✅ What's Already Done:

1. **✓ Pricing Updated Everywhere:**
   - Homepage: $1.25 trial, $30 monthly
   - Cancel page: Updated prices
   - Backend API: Updated to USD pricing
   - Payment routes: Configured for new prices

2. **✓ Files Created:**
   - `/public/js/pricing-config.js` - Centralized pricing configuration
   - `/public/js/stripe-integration.js` - Frontend Stripe Checkout integration
   - `/routes/payment.js` - Backend API with Stripe Checkout endpoint

3. **✓ Features Implemented:**
   - Stripe Checkout Session creation
   - Payment success/cancel handling
   - Automatic button connection
   - Loading states and error handling

---

## 📝 Steps to Complete Integration:

### Step 1: Get Your Stripe Information

1. **Go to Stripe Dashboard**: https://dashboard.stripe.com

2. **Get API Keys**:
   - Navigate to: **Developers → API keys**
   - Copy your **Publishable key** (starts with `pk_test_...`)
   - Copy your **Secret key** (starts with `sk_test_...`)

3. **Get Price IDs** for your products:
   - Navigate to: **Products** (https://dashboard.stripe.com/products)

   **For $1.25 Trial Product:**
   - Click on your trial product
   - In the "Pricing" section, click on the price
   - Copy the **Price ID** (starts with `price_...`)
   - Example: `price_1ABC123xyz...`

   **For $30 Monthly Product:**
   - Click on your monthly subscription product
   - Copy the **Price ID**
   - Example: `price_1XYZ789abc...`

---

### Step 2: Update Configuration Files

#### A. Update `.env` file:

Create or update the `.env` file in your project root:

```env
# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE

# Other existing variables...
PORT=3000
```

#### B. Update `pricing-config.js`:

Open `/public/js/pricing-config.js` and replace the Price IDs:

```javascript
trial: {
    amount: 1.25,
    currency: 'USD',
    symbol: '$',
    duration: '24 hours',
    stripePriceId: 'price_YOUR_TRIAL_PRICE_ID_HERE', // ← Replace this
    name: '24-Hour Trial',
    description: 'Full access for 24 hours'
},
monthly: {
    amount: 30.00,
    currency: 'USD',
    symbol: '$',
    duration: 'per month',
    stripePriceId: 'price_YOUR_MONTHLY_PRICE_ID_HERE', // ← Replace this
    name: 'Monthly Subscription',
    description: 'Unlimited tracking'
}
```

#### C. Update `stripe-integration.js`:

Open `/public/js/stripe-integration.js` and replace the publishable key:

```javascript
const STRIPE_CONFIG = {
    publishableKey: 'pk_test_YOUR_PUBLISHABLE_KEY_HERE', // ← Replace this
    successUrl: window.location.origin + '/dashboard.html?session_id={CHECKOUT_SESSION_ID}',
    cancelUrl: window.location.origin + '/payment.html?cancelled=true'
};
```

---

### Step 3: Add Stripe.js to HTML Files

Add this script tag to the `<head>` section of these HTML files:
- `index.html`
- `payment.html`
- `dashboard.html`

```html
<!-- Add BEFORE the closing </head> tag -->
<script src="https://js.stripe.com/v3/"></script>
<script src="/js/pricing-config.js"></script>
<script src="/js/stripe-integration.js"></script>
```

**Example placement in `index.html`:**
```html
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tracify - Locate Any Phone, Anywhere</title>
    <link rel="stylesheet" href="/styles.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">

    <!-- Stripe Integration -->
    <script src="https://js.stripe.com/v3/"></script>
    <script src="/js/pricing-config.js"></script>
    <script src="/js/stripe-integration.js"></script>

    <style>
        /* Your existing styles... */
    </style>
</head>
```

---

### Step 4: Test the Integration

#### Testing in Development Mode:

1. **Start your server:**
   ```bash
   node server.js
   ```

2. **Open your website:** http://localhost:3000

3. **Click "Start Trial" button** on homepage
   - Should redirect to Stripe Checkout page
   - You'll see your $1.25 trial payment form

4. **Use Stripe Test Cards:**
   - **Successful payment**: `4242 4242 4242 4242`
   - **Declined card**: `4000 0000 0000 0002`
   - **Requires authentication**: `4000 0025 0000 3155`
   - Any future date for expiry, any 3-digit CVC

5. **After successful payment:**
   - Should redirect to `/dashboard.html?session_id=...`
   - Success message should appear

---

### Step 5: Set Up Webhooks (Optional but Recommended)

Webhooks allow Stripe to notify your server about payment events:

1. **Go to**: https://dashboard.stripe.com/webhooks

2. **Click "Add endpoint"**

3. **Endpoint URL**:
   - Development: Use Stripe CLI or ngrok
   - Production: `https://yourdomain.com/api/payment/webhook`

4. **Select events to listen to:**
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.deleted`

5. **Copy the webhook secret** and add to `.env`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

---

## 🎯 How It Works:

### User Flow:

1. **User clicks "Start Trial" button** ($1.25)
   - JavaScript calls `/api/payment/create-checkout-session`
   - Backend creates Stripe Checkout Session
   - User redirects to Stripe's hosted payment page

2. **User enters payment details** on Stripe
   - Stripe securely processes payment
   - No card details touch your server (PCI compliant!)

3. **Payment successful:**
   - Stripe redirects to: `/dashboard?session_id=cs_...`
   - Your app verifies payment
   - User gets access to dashboard

4. **Payment cancelled:**
   - Stripe redirects to: `/payment?cancelled=true`
   - User sees "Payment Cancelled" message
   - Can try again

---

## 🔍 Troubleshooting:

### Problem: "Stripe not initialized"
**Solution**: Make sure Stripe.js script is loaded before `stripe-integration.js`

### Problem: "Payment system not configured"
**Solution**: Check that Price IDs are updated in `pricing-config.js`

### Problem: "Failed to create checkout session"
**Solution**:
- Verify Stripe keys in `.env` file
- Check that Price IDs exist in your Stripe dashboard
- Restart your server after updating `.env`

### Problem: Buttons not working
**Solution**:
- Open browser console (F12) for errors
- Verify scripts are loaded in correct order
- Check that buttons have correct classes or `data-payment` attributes

---

## 📊 Monitoring Payments:

1. **View test payments**: https://dashboard.stripe.com/test/payments

2. **View test customers**: https://dashboard.stripe.com/test/customers

3. **View logs**: https://dashboard.stripe.com/test/logs

---

## 🚀 Going Live (Production):

When ready for real payments:

1. **Switch to live mode** in Stripe Dashboard (toggle in top-right)

2. **Get live API keys**:
   - Publishable key: `pk_live_...`
   - Secret key: `sk_live_...`

3. **Create live products** with same prices

4. **Update `.env` with live keys**

5. **Update `pricing-config.js` with live Price IDs**

6. **Update `stripe-integration.js` with live publishable key**

7. **Set up live webhooks**

---

## ✅ Quick Checklist:

- [ ] Got Stripe API keys from dashboard
- [ ] Got Price IDs for both products
- [ ] Updated `.env` file with keys
- [ ] Updated `pricing-config.js` with Price IDs
- [ ] Updated `stripe-integration.js` with publishable key
- [ ] Added Stripe.js scripts to HTML files
- [ ] Tested payment with test card `4242 4242 4242 4242`
- [ ] Verified success redirect works
- [ ] Verified cancel redirect works
- [ ] Set up webhooks (optional)

---

## 📞 Need Help?

If you encounter issues:
1. Check browser console for errors (F12 → Console tab)
2. Check server logs for backend errors
3. Verify all keys and IDs are correct (no typos)
4. Test with Stripe test cards first

---

**Congratulations! Your Stripe integration is ready! 🎉**
