# Plan: LANGUAGE-CONSISTENCY

**Code Name:** `LANGUAGE-CONSISTENCY`
**Created:** January 2025
**Status:** PENDING TEAM APPROVAL

---

## Summary

Ensure all popups, modals, and pages follow the selected language consistently throughout the user journey.

---

## Problem Statement

### Current Behavior (Broken)

1. User visits site with Turkish language selected (`/tr`)
2. User enters phone number, clicks "Locate"
3. **Email popup appears in ENGLISH** (hardcoded text)
4. User signs up, gets redirected to `/payment` (not `/tr/payment`)
5. **Payment page might show English** (loses language context)
6. User logs in, redirected to `/dashboard` (not `/tr/dashboard`)
7. **Dashboard might show English** (loses language context)

### Desired Behavior

1. User visits site with Turkish language (`/tr`)
2. User enters phone number, clicks "Locate"
3. **Email popup appears in TURKISH** (translated)
4. User signs up, redirected to `/tr/payment`
5. **Payment page shows Turkish** (language preserved)
6. User logs in, redirected to `/tr/dashboard`
7. **Dashboard shows Turkish** (language preserved)

---

## Root Causes

### Issue 1: Modals Created with Hardcoded English Text

**File:** `public/script.js`

**Email Modal (lines 74-111)** - All text hardcoded:
```javascript
modal.innerHTML = `
    <h2>Enter Your Email</h2>
    <p>We'll send your account password to this email address.</p>
    <input placeholder="your@email.com">
    <label>I agree to receive promotional emails...</label>
    <button>Continue</button>
    ...
`;
```

**Login Modal (lines 324-353)** - All text hardcoded:
```javascript
modal.innerHTML = `
    <h2>Welcome Back</h2>
    <p>Log in to your Tracify account</p>
    <input placeholder="your@email.com">
    <input placeholder="Password">
    <button>Log In</button>
    ...
`;
```

### Issue 2: Redirects Don't Preserve Language

**File:** `public/script.js`

After signup (line 309):
```javascript
window.location.href = data.redirectTo || '/payment';  // Should be /${lang}/payment
```

After login (line 383):
```javascript
window.location.href = data.redirectTo || '/dashboard';  // Should be /${lang}/dashboard
```

### Issue 3: Server Returns Non-Localized Redirect URLs

**File:** `routes/auth.js`

The server returns `redirectTo: '/payment'` or `redirectTo: '/dashboard'` without language prefix.

---

## Proposed Solution

### Part 1: Add Translation Keys for Modals

**File to modify:** Translation files in `/translations/*.json`

Add new keys for modal text:

```json
{
  "modal": {
    "signup": {
      "title": "Enter Your Email",
      "subtitle": "We'll send your account password to this email address.",
      "emailPlaceholder": "your@email.com",
      "agreeText": "I agree to receive promotional emails and updates from Tracify",
      "continueBtn": "Continue",
      "termsText": "By continuing, you agree to our",
      "termsLink": "Terms of Service",
      "privacyLink": "Privacy Policy",
      "or": "or",
      "hasAccount": "Already have an account?",
      "loginLink": "Log in",
      "creatingAccount": "Creating account...",
      "accountCreated": "Account created!",
      "yourPassword": "Your password:",
      "savePassword": "Save this password! Redirecting to payment..."
    },
    "login": {
      "title": "Welcome Back",
      "subtitle": "Log in to your Tracify account",
      "emailPlaceholder": "your@email.com",
      "passwordPlaceholder": "Password",
      "loginBtn": "Log In",
      "loggingIn": "Logging in...",
      "loginSuccess": "Login successful! Redirecting...",
      "or": "or",
      "noAccount": "Don't have an account?",
      "signupLink": "Sign up"
    }
  }
}
```

### Part 2: Update Modal Creation to Use Translations

**File to modify:** `public/script.js`

**Before:**
```javascript
function createEmailModal() {
    modal.innerHTML = `
        <h2>Enter Your Email</h2>
        ...
    `;
}
```

**After:**
```javascript
function createEmailModal() {
    // Get translations from i18n
    const t = window.TracifyI18n ? window.TracifyI18n.t : (key) => key;

    modal.innerHTML = `
        <h2 data-i18n="modal.signup.title">${t('modal.signup.title')}</h2>
        <p data-i18n="modal.signup.subtitle">${t('modal.signup.subtitle')}</p>
        <input data-i18n-placeholder="modal.signup.emailPlaceholder" placeholder="${t('modal.signup.emailPlaceholder')}">
        ...
    `;
}
```

### Part 3: Fix Redirects to Preserve Language

**File to modify:** `public/script.js`

**Before (line 309):**
```javascript
window.location.href = data.redirectTo || '/payment';
```

**After:**
```javascript
// Get current language from URL or i18n
const currentLang = window.TracifyI18n?.getCurrentLanguage() ||
                    window.location.pathname.match(/^\/([a-z]{2,3}(?:_[A-Z]{2})?)/)?.[1] ||
                    'en';
window.location.href = `/${currentLang}/payment`;
```

**Same fix for login redirect (line 383):**
```javascript
const currentLang = window.TracifyI18n?.getCurrentLanguage() ||
                    window.location.pathname.match(/^\/([a-z]{2,3}(?:_[A-Z]{2})?)/)?.[1] ||
                    'en';
window.location.href = `/${currentLang}/dashboard`;
```

### Part 4: Expose getCurrentLanguage() in i18n.js

**File to modify:** `public/js/i18n.js`

Add to public API:
```javascript
window.TracifyI18n = {
    init,
    t,
    changeLanguage,
    getCurrentLanguage: () => currentLang,  // ADD THIS
    // ... other methods
};
```

### Part 5: Ensure Modal Re-translates on Language Change

**File to modify:** `public/script.js`

After i18n loads, ensure modals are translated:
```javascript
// Wait for i18n to be ready, then update modal content
document.addEventListener('i18nReady', function() {
    updateModalTranslations();
});

function updateModalTranslations() {
    if (!window.TracifyI18n) return;
    const t = window.TracifyI18n.t;

    // Update signup modal
    const signupModal = document.getElementById('emailModal');
    if (signupModal) {
        signupModal.querySelector('h2').textContent = t('modal.signup.title');
        signupModal.querySelector('p').textContent = t('modal.signup.subtitle');
        // ... etc
    }

    // Update login modal
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        loginModal.querySelector('h2').textContent = t('modal.login.title');
        // ... etc
    }
}
```

---

## Files to Modify

| File | Changes | Complexity |
|------|---------|------------|
| `translations/en.json` | Add modal translation keys | Low |
| `translations/*.json` (45 files) | Add modal translations for all languages | High (translation work) |
| `public/script.js` | Use i18n for modal text, fix redirects | Medium |
| `public/js/i18n.js` | Expose getCurrentLanguage(), emit i18nReady event | Low |

---

## Implementation Order

1. **Phase 1: Fix Redirects (Quick Win)**
   - Update script.js redirects to preserve language
   - Add getCurrentLanguage() to i18n.js
   - **Result:** Pages will show correct language after login/signup

2. **Phase 2: Add English Modal Translations**
   - Add modal keys to en.json
   - Update script.js to use translations
   - **Result:** Infrastructure ready for translations

3. **Phase 3: Add All Language Translations**
   - Add modal translations to all 45 language files
   - **Result:** Full language consistency

---

## Testing Checklist

| Scenario | Expected Result |
|----------|-----------------|
| User on `/tr` clicks Locate → Email popup | Popup shows Turkish text |
| User signs up from `/tr` page | Redirects to `/tr/payment` |
| User on `/tr/payment` completes payment | Stays in Turkish |
| User logs in from `/tr` page | Redirects to `/tr/dashboard` |
| User on `/tr/dashboard` | All dashboard text in Turkish |
| User changes language on dashboard | Dashboard updates to new language |
| User refreshes page | Language persists |

---

## Translation Keys Needed (Per Language)

```
modal.signup.title
modal.signup.subtitle
modal.signup.emailPlaceholder
modal.signup.agreeText
modal.signup.continueBtn
modal.signup.termsText
modal.signup.termsLink
modal.signup.privacyLink
modal.signup.or
modal.signup.hasAccount
modal.signup.loginLink
modal.signup.creatingAccount
modal.signup.accountCreated
modal.signup.yourPassword
modal.signup.savePassword
modal.login.title
modal.login.subtitle
modal.login.emailPlaceholder
modal.login.passwordPlaceholder
modal.login.loginBtn
modal.login.loggingIn
modal.login.loginSuccess
modal.login.or
modal.login.noAccount
modal.login.signupLink
```

**Total new keys per language:** 25 keys
**Total languages:** 45
**Total translations needed:** 1,125 key-value pairs

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Translation quality | Use professional translation service or AI translation with review |
| Missing translations | Fallback to English if key missing |
| Modal timing issues | Create modals after i18n loads |
| Breaking existing functionality | Test thoroughly before deploy |

---

## Dependencies

- Plan `GEO-AUTODETECT` (optional, can be done independently)
- Translation files must exist for all 45 languages

---

## Estimated Effort

| Phase | Effort |
|-------|--------|
| Phase 1 (Redirects) | 30 mins |
| Phase 2 (English modals) | 1 hour |
| Phase 3 (All translations) | 2-4 hours (with AI translation) |
| Testing | 1 hour |

**Total:** 4-6 hours

---

## How to Resume

When approved, tell Claude:
> "Proceed with plan LANGUAGE-CONSISTENCY - make popups and redirects follow selected language"

Claude will:
1. Read this plan file
2. Implement Phase 1 (redirects) first
3. Implement Phase 2 (modal i18n infrastructure)
4. Implement Phase 3 (add translations)
5. Test and deploy

---

## Approval

- [ ] Team discussion completed
- [ ] Plan approved
- [ ] Translation strategy decided (AI vs Professional)
- [ ] Ready to implement

**Approved by:** _________________
**Date:** _________________
