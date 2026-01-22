# ⚡ Quick Deploy Commands

Copy and paste these commands to deploy your site!

---

## Step 1: Create GitHub Repository

**Go to:** https://github.com/new

- Repository name: `tracify-app`
- Make it Private
- **DO NOT** initialize with README
- Click "Create repository"

---

## Step 2: Push Code to GitHub

**Replace `YOUR_USERNAME` with your actual GitHub username!**

```bash
cd "/Users/zaeemaslam853/Projects/claude new project"

git remote add origin https://github.com/YOUR_USERNAME/tracify-app.git

git branch -M main

git push -u origin main
```

**Enter your GitHub credentials when prompted.**

---

## Step 3: Deploy to Vercel

**Go to:** https://vercel.com/new

1. Sign up with GitHub (if needed)
2. Import your `tracify-app` repository
3. Click "Deploy"
4. Wait 2 minutes

---

## Step 4: Generate JWT Secret

Run this command and copy the output:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Step 5: Get Your Environment Variables

Your Stripe keys are in your `.env` file:

```bash
cd "/Users/zaeemaslam853/Projects/claude new project"
cat .env | grep STRIPE
```

This will show:
```
STRIPE_SECRET_KEY=sk_live_51P2OqF...
STRIPE_PUBLISHABLE_KEY=pk_live_51P2OqF...
```

**Copy these values!**

---

## Step 6: Add Environment Variables in Vercel

**Go to:** Vercel Dashboard → Settings → Environment Variables

**Add these variables:**

```
APP_URL = https://tracify-geo.com
JWT_SECRET = [paste the output from Step 4]
STRIPE_SECRET_KEY = sk_live_51P2OqF... [from .env]
STRIPE_PUBLISHABLE_KEY = pk_live_51P2OqF... [from .env]
SMTP_HOST = smtp.gmail.com
SMTP_PORT = 587
SMTP_SECURE = false
SMTP_USER = [your Gmail address]
SMTP_PASS = [Gmail App Password - see DEPLOY_NOW.md]
SMTP_FROM = "Tracify" <noreply@tracify-geo.com>
```

**Select all 3 environments for each:** Production, Preview, Development

---

## Step 7: Redeploy

**Go to:** Deployments tab → Click "Redeploy" (uncheck cache)

---

## Step 8: Add Domain

**In Vercel:** Settings → Domains → Add:
- `tracify-geo.com`
- `www.tracify-geo.com`

---

## Step 9: Update DNS

**At your domain registrar, add:**

**A Record:**
```
Type: A
Name: @
Value: 76.76.21.21
```

**CNAME Record:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

---

## Step 10: Wait & Test

**Wait 15-30 minutes for DNS propagation**

**Check:** https://www.whatsmydns.net/#A/tracify-geo.com

**Test your site:** https://tracify-geo.com

---

## 🎉 Done!

Your site is live!

**For detailed instructions, see: DEPLOY_NOW.md**
