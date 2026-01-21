# 🚀 Tracify Deployment Guide - Vercel + Custom Domain

Complete guide to deploy Tracify to **tracify-geo.com** using Vercel.

---

## 📋 Prerequisites

Before deployment, ensure you have:

1. ✅ **Vercel Account** - Sign up at https://vercel.com (free)
2. ✅ **Domain Access** - tracify-geo.com DNS management access
3. ✅ **Stripe Keys** - Your LIVE Stripe API keys (already configured)
4. ✅ **Email Provider** - Gmail, SendGrid, or any SMTP service (for contact form)
5. ✅ **Git Repository** - Code pushed to GitHub/GitLab/Bitbucket

---

## 🎯 Step 1: Prepare Your Code Repository

### 1.1 Initialize Git (if not already done)

```bash
cd "/Users/zaeemaslam853/Projects/claude new project"
git init
```

### 1.2 Create a GitHub Repository

1. Go to https://github.com/new
2. Create a new repository (e.g., "tracify-app")
3. **DO NOT** initialize with README (your project already has files)

### 1.3 Push Your Code

```bash
git add .
git commit -m "Initial commit - Tracify deployment ready"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/tracify-app.git
git push -u origin main
```

**Important:** The `.gitignore` file ensures `.env` (with your Stripe keys) is NOT committed!

---

## 🌐 Step 2: Deploy to Vercel

### 2.1 Install Vercel CLI (Optional but recommended)

```bash
npm install -g vercel
```

### 2.2 Deploy via Vercel Dashboard (Easier)

1. **Go to Vercel Dashboard:**
   - Visit https://vercel.com/new
   - Sign in with GitHub/GitLab/Bitbucket

2. **Import Your Repository:**
   - Click "Import Project"
   - Select your Git provider
   - Find and select your "tracify-app" repository
   - Click "Import"

3. **Configure Project Settings:**
   - **Project Name:** `tracify` (or any name you prefer)
   - **Framework Preset:** Other (Vercel will auto-detect Express.js)
   - **Root Directory:** `./` (leave as default)
   - **Build Command:** Leave empty (Node.js doesn't need build)
   - **Output Directory:** Leave empty
   - **Install Command:** `npm install`

4. **Click "Deploy"** - Your first deployment will start!

### 2.3 Alternative: Deploy via CLI

```bash
cd "/Users/zaeemaslam853/Projects/claude new project"
vercel
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N**
- What's your project's name? **tracify**
- In which directory is your code? **.**
- Want to override settings? **N**

---

## 🔐 Step 3: Configure Environment Variables

**Critical:** Your environment variables (Stripe keys, JWT secret) are NOT in Git. You must add them to Vercel manually.

### 3.1 Via Vercel Dashboard

1. **Go to your project:** https://vercel.com/dashboard
2. **Click your project** (tracify)
3. **Go to Settings** → **Environment Variables**
4. **Add each variable:**

#### Required Environment Variables:

| Variable Name | Value | Notes |
|--------------|-------|-------|
| `APP_URL` | `https://tracify-geo.com` | Your production domain |
| `JWT_SECRET` | Generate a long random string | For authentication tokens |
| `STRIPE_SECRET_KEY` | `sk_live_51P2OqF...` | Your Stripe secret key (from .env) |
| `STRIPE_PUBLISHABLE_KEY` | `pk_live_51P2OqF...` | Your Stripe publishable key (from .env) |
| `SMTP_HOST` | `smtp.gmail.com` | Your email provider's SMTP host |
| `SMTP_PORT` | `587` | SMTP port (usually 587) |
| `SMTP_SECURE` | `false` | Use `true` for port 465 |
| `SMTP_USER` | `your-email@gmail.com` | Your email address |
| `SMTP_PASS` | Your app password | For Gmail: App-specific password |
| `SMTP_FROM` | `"Tracify" <noreply@tracify-geo.com>` | From address for emails |

**How to add each variable:**
1. Click "Add New" → "Environment Variable"
2. Enter **Key** (e.g., `APP_URL`)
3. Enter **Value** (e.g., `https://tracify-geo.com`)
4. Select environments: **Production**, **Preview**, **Development** (all 3)
5. Click "Save"

**Repeat for all variables above!**

### 3.2 Generate a Strong JWT Secret

```bash
# Run this command to generate a random secret:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output and use it as your `JWT_SECRET` value.

### 3.3 Gmail SMTP Setup (Recommended for contact form)

If using Gmail for the contact form emails:

1. **Enable 2-Step Verification:**
   - Go to https://myaccount.google.com/security
   - Enable "2-Step Verification"

2. **Generate App Password:**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it "Tracify"
   - Copy the 16-character password
   - Use this as `SMTP_PASS` in Vercel

3. **Configure Vercel variables:**
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-char-app-password
   SMTP_FROM="Tracify" <noreply@tracify-geo.com>
   ```

**Alternative Email Providers:**
- **SendGrid:** https://sendgrid.com (free tier: 100 emails/day)
- **Mailgun:** https://mailgun.com (free tier: 5,000 emails/month)
- **AWS SES:** https://aws.amazon.com/ses/ (cheap, requires setup)

---

## 🔄 Step 4: Redeploy with Environment Variables

After adding all environment variables:

1. **Go to Deployments** tab
2. Click **"Redeploy"** on the latest deployment
3. Check "Use existing Build Cache" → **Uncheck it**
4. Click **"Redeploy"**

Your app will redeploy with all environment variables configured!

---

## 🌍 Step 5: Connect Custom Domain (tracify-geo.com)

### 5.1 Add Domain in Vercel

1. **Go to your project** → **Settings** → **Domains**
2. **Click "Add"**
3. **Enter your domain:** `tracify-geo.com`
4. **Click "Add"**
5. **Also add:** `www.tracify-geo.com` (recommended)

### 5.2 Configure DNS Records

Vercel will show you DNS records to add. You need to add these to your domain registrar (e.g., GoDaddy, Namecheap, Cloudflare).

#### For Apex Domain (tracify-geo.com):

**Option A: A Records (Recommended)**

Add these A records:

```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600
```

**Option B: CNAME with ANAME/ALIAS (if supported)**

```
Type: ANAME or ALIAS
Name: @
Value: cname.vercel-dns.com
TTL: 3600
```

#### For www Subdomain (www.tracify-geo.com):

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

### 5.3 Add DNS Records to Your Domain Registrar

**Example for Common Registrars:**

**GoDaddy:**
1. Go to https://dcc.godaddy.com/domains
2. Click your domain → **DNS** → **Manage Zones**
3. Click **"Add"** → Select record type (A or CNAME)
4. Enter Name, Value, TTL
5. **Save**

**Namecheap:**
1. Go to Domain List → **Manage**
2. **Advanced DNS** tab
3. Click **"Add New Record"**
4. Select Type, enter Host, Value, TTL
5. **Save**

**Cloudflare:**
1. Go to your domain → **DNS** → **Records**
2. Click **"Add record"**
3. Select Type, Name, IPv4 address/Target
4. **Save**

### 5.4 Wait for DNS Propagation

- DNS changes take **5 minutes to 48 hours** to propagate globally
- Usually takes **15-30 minutes** for most providers
- Check status at: https://www.whatsmydns.net/#A/tracify-geo.com

### 5.5 Verify Domain Connection

Once DNS propagates:

1. **Go back to Vercel** → **Domains**
2. You should see **"Valid Configuration"** ✅ next to your domain
3. Vercel will **automatically provision SSL certificate** (HTTPS)

---

## 📧 Step 6: Configure Zendesk Email Integration

### 6.1 Set Up Email Forwarding (Optional but Recommended)

To ensure support@tracify-geo.com emails reach Zendesk:

**Option A: Zendesk Email Forwarding**

1. **Go to your email provider** (Gmail, Google Workspace, etc.)
2. **Set up forwarding** from `support@tracify-geo.com` to your Zendesk support email
3. Zendesk will automatically create tickets from forwarded emails

**Option B: Zendesk Email Channel**

1. **Log in to Zendesk:** https://www.zendesk.com
2. **Go to Admin** → **Channels** → **Email**
3. **Add support address:** `support@tracify-geo.com`
4. **Follow Zendesk's DNS configuration** to verify ownership
5. Add the required MX records to your domain's DNS

**MX Records for Zendesk (example):**

```
Type: MX
Name: @
Value: mx1.zendesk.com
Priority: 10

Type: MX
Name: @
Value: mx2.zendesk.com
Priority: 20
```

*(Actual values will be provided by Zendesk)*

### 6.2 Test Email Integration

1. **Go to your deployed site:** https://tracify-geo.com/contact
2. **Submit a test message** using the contact form
3. **Check:**
   - Your configured SMTP email inbox (e.g., your Gmail)
   - Zendesk should create a ticket automatically

---

## ✅ Step 7: Post-Deployment Checklist

After deployment, test everything:

### 7.1 Basic Functionality

- [ ] **Homepage loads:** https://tracify-geo.com
- [ ] **Language selector works** (all 45 languages)
- [ ] **Pricing displays correctly** ($1.25 trial, $30 monthly)

### 7.2 Payment Flow (CRITICAL!)

- [ ] **Click "Start Trial"** → Redirects to Stripe Checkout
- [ ] **Complete test payment** (use real card, you're in LIVE mode!)
- [ ] **Check redirect to dashboard** after payment
- [ ] **Verify payment in Stripe Dashboard:** https://dashboard.stripe.com/payments

**⚠️ Important:** You're using LIVE Stripe keys = REAL money transactions!

### 7.3 Contact Form

- [ ] **Go to contact page:** https://tracify-geo.com/contact
- [ ] **Submit a test message**
- [ ] **Check email received at** your configured SMTP inbox
- [ ] **Verify Zendesk ticket created** (if configured)

### 7.4 Other Pages

- [ ] **Dashboard:** https://tracify-geo.com/dashboard
- [ ] **Payment page:** https://tracify-geo.com/payment
- [ ] **Account page:** https://tracify-geo.com/account
- [ ] **Cancel page:** https://tracify-geo.com/cancel

### 7.5 SSL Certificate

- [ ] **Check HTTPS works** (should auto-redirect from HTTP)
- [ ] **Verify SSL certificate** (click padlock icon in browser)
- [ ] **No mixed content warnings**

---

## 🔧 Troubleshooting

### Issue 1: 404 Error on Custom Domain

**Solution:**
- Wait for DNS propagation (up to 48 hours)
- Check DNS records are correct in your registrar
- Verify domain shows "Valid Configuration" in Vercel

### Issue 2: Stripe Payments Not Working

**Solution:**
- Check environment variables are set correctly in Vercel
- Verify `APP_URL` is set to `https://tracify-geo.com` (not localhost!)
- Check Stripe dashboard for error logs
- Verify webhook URLs if using webhooks

### Issue 3: Contact Form Emails Not Sending

**Solution:**
- Check SMTP credentials in Vercel environment variables
- Test SMTP connection: Use nodemailer test in development
- Check spam folder
- For Gmail: Verify app-specific password is correct
- Check Vercel function logs for errors

### Issue 4: Build Fails on Vercel

**Solution:**
- Check build logs in Vercel dashboard
- Verify `package.json` has all dependencies
- Ensure Node.js version compatibility
- Check for syntax errors in code

### Issue 5: Environment Variables Not Working

**Solution:**
- Make sure variables are set for all environments (Production, Preview, Development)
- Redeploy after adding variables
- Check variable names match exactly (case-sensitive!)
- No quotes around values in Vercel dashboard

---

## 📊 Monitoring & Maintenance

### Vercel Analytics

- **Go to:** https://vercel.com/analytics
- Monitor page views, performance, and errors

### Stripe Dashboard

- **Payments:** https://dashboard.stripe.com/payments
- **Customers:** https://dashboard.stripe.com/customers
- **Logs:** https://dashboard.stripe.com/logs

### Function Logs (Debugging)

- **Go to:** Vercel Dashboard → Your Project → **Functions**
- **View real-time logs** of your API routes
- **Filter by:**
  - API route (e.g., `/api/contact/send`)
  - Status code (200, 500, etc.)
  - Time range

### Vercel CLI Real-Time Logs

```bash
vercel logs tracify --follow
```

---

## 🔄 Updating Your Live Site

### Push Changes via Git

```bash
# Make your changes
git add .
git commit -m "Update description"
git push origin main
```

**Vercel auto-deploys** every push to main branch!

### Manual Deploy via CLI

```bash
vercel --prod
```

---

## 🎉 Deployment Complete!

Your Tracify app is now LIVE at:

🌐 **Production URL:** https://tracify-geo.com
📧 **Support Email:** support@tracify-geo.com
💳 **Stripe Dashboard:** https://dashboard.stripe.com
🎫 **Zendesk (if configured):** Your Zendesk URL

---

## 📞 Support & Resources

- **Vercel Documentation:** https://vercel.com/docs
- **Vercel Support:** https://vercel.com/support
- **Stripe Documentation:** https://stripe.com/docs
- **Zendesk Documentation:** https://support.zendesk.com

---

**Need help?** Check the Vercel dashboard logs or contact Vercel support!

**Your app is production-ready! 🚀**
