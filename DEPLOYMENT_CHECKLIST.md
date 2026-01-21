# ✅ Tracify Deployment Checklist

Quick checklist for deploying to **tracify-geo.com**

---

## Before You Start

- [ ] Read `DEPLOYMENT_GUIDE.md` for detailed instructions
- [ ] Have access to your domain registrar (for DNS changes)
- [ ] Have your Stripe keys ready (already in `.env`)
- [ ] Set up email provider (Gmail app password or SendGrid)

---

## 1️⃣ Git & GitHub (5 minutes)

```bash
cd "/Users/zaeemaslam853/Projects/claude new project"
git init
git add .
git commit -m "Initial commit - Ready for deployment"
```

- [ ] Create GitHub repo: https://github.com/new
- [ ] Push code to GitHub (commands in DEPLOYMENT_GUIDE.md)
- [ ] Verify `.env` is NOT committed (check `.gitignore`)

---

## 2️⃣ Deploy to Vercel (10 minutes)

- [ ] Go to: https://vercel.com/new
- [ ] Import your GitHub repository
- [ ] Click "Deploy" (first deployment)
- [ ] Wait for deployment to complete
- [ ] Get your temporary URL (e.g., `tracify.vercel.app`)

---

## 3️⃣ Environment Variables (15 minutes)

Go to: **Vercel Dashboard → Project → Settings → Environment Variables**

**Required Variables (copy from your `.env` file):**

- [ ] `APP_URL` = `https://tracify-geo.com`
- [ ] `JWT_SECRET` = Generate random string (see guide)
- [ ] `STRIPE_SECRET_KEY` = `sk_live_51P2OqF...` (from .env)
- [ ] `STRIPE_PUBLISHABLE_KEY` = `pk_live_51P2OqF...` (from .env)

**Email Configuration (for contact form):**

- [ ] `SMTP_HOST` = `smtp.gmail.com`
- [ ] `SMTP_PORT` = `587`
- [ ] `SMTP_SECURE` = `false`
- [ ] `SMTP_USER` = Your Gmail address
- [ ] `SMTP_PASS` = Gmail app password (see guide)
- [ ] `SMTP_FROM` = `"Tracify" <noreply@tracify-geo.com>`

**After adding variables:**

- [ ] Go to Deployments tab
- [ ] Click "Redeploy" on latest deployment

---

## 4️⃣ Custom Domain Setup (30 minutes + DNS propagation)

**In Vercel:**

- [ ] Go to: **Settings → Domains**
- [ ] Add `tracify-geo.com`
- [ ] Add `www.tracify-geo.com`

**In Your Domain Registrar (GoDaddy, Namecheap, etc.):**

Add these DNS records:

**A Record (for tracify-geo.com):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**CNAME Record (for www.tracify-geo.com):**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

- [ ] DNS records added
- [ ] Wait 15-30 minutes for propagation
- [ ] Check status: https://www.whatsmydns.net
- [ ] Verify "Valid Configuration" in Vercel

---

## 5️⃣ Zendesk Email Setup (Optional - 20 minutes)

**Option A: Email Forwarding**
- [ ] Forward `support@tracify-geo.com` to your Zendesk email

**Option B: Zendesk Email Channel**
- [ ] Add support email in Zendesk: **Admin → Channels → Email**
- [ ] Add MX records to your domain DNS (provided by Zendesk)

---

## 6️⃣ Test Everything (15 minutes)

**Basic Tests:**
- [ ] Visit: https://tracify-geo.com (loads correctly)
- [ ] Check HTTPS works (SSL certificate active)
- [ ] Test language selector (switches languages)
- [ ] Verify pricing shows $1.25 and $30

**Payment Test:**
- [ ] Click "Start Trial" button
- [ ] Redirects to Stripe Checkout
- [ ] Complete payment (⚠️ LIVE mode = real charge!)
- [ ] Redirects to dashboard after payment
- [ ] Check Stripe dashboard: https://dashboard.stripe.com/payments

**Contact Form Test:**
- [ ] Go to: https://tracify-geo.com/contact
- [ ] Submit test message
- [ ] Check email received in your SMTP inbox
- [ ] Check Zendesk ticket created (if configured)

**Other Pages:**
- [ ] Dashboard: https://tracify-geo.com/dashboard
- [ ] Payment: https://tracify-geo.com/payment
- [ ] Account: https://tracify-geo.com/account
- [ ] Cancel: https://tracify-geo.com/cancel

---

## 🎉 Deployment Complete!

Your app is live at: **https://tracify-geo.com**

### Monitor Your App:

- **Vercel Logs:** Dashboard → Your Project → Functions
- **Stripe Payments:** https://dashboard.stripe.com/payments
- **Analytics:** https://vercel.com/analytics

### Future Updates:

```bash
git add .
git commit -m "Your update message"
git push origin main
```

Vercel auto-deploys on every push!

---

## ⚠️ Important Notes:

1. **Stripe LIVE Mode:** You're using real payment processing
2. **Environment Variables:** Never commit `.env` to Git
3. **DNS Propagation:** Can take up to 48 hours (usually 15-30 mins)
4. **SSL Certificate:** Auto-provisioned by Vercel (free)
5. **Email Limits:** Gmail = 500/day, SendGrid free = 100/day

---

## Need Help?

- **Detailed Guide:** Read `DEPLOYMENT_GUIDE.md`
- **Vercel Support:** https://vercel.com/support
- **Vercel Docs:** https://vercel.com/docs

**Your site is ready to go live! 🚀**
