# Plan: GEO-AUTODETECT

**Code Name:** `GEO-AUTODETECT`
**Created:** January 2025
**Status:** PENDING TEAM APPROVAL

---

## Summary

Remove geo data caching so that VPN/location changes are automatically detected on page refresh without requiring manual cache clearing.

---

## Problem Statement

### Current Behavior (Broken)
1. User visits site with Turkey VPN → Site shows Turkish language + Turkish country code
2. User switches to Australia VPN
3. User refreshes page
4. Site STILL shows Turkish (because geo data is cached for 1 hour)
5. User must manually run `TracifyGeo.clearCache()` then `TracifyGeo.reload()`

### Desired Behavior
1. User visits site with Turkey VPN → Site shows Turkish
2. User switches to Australia VPN
3. User refreshes page
4. Site automatically shows English + Australian country code (no manual steps)

---

## Root Cause

The `geo-detect.js` caches geo API response in localStorage for 1 hour (`tracify_geo_cache`). This prevents detecting location changes.

---

## Proposed Solution

**Remove geo data caching. Only save user's manual preferences.**

### Storage Keys - Before vs After

| Storage Key | Current Purpose | Action |
|-------------|-----------------|--------|
| `tracify_geo_cache` | Caches full API response for 1 hour | **DELETE** - Remove caching |
| `tracify_lang` | User's manual language choice | **KEEP** - Respect user preference |
| `tracify_country_code` | User's manual country code choice | **KEEP** - Respect user preference |

### New Detection Flow

```
User visits page
    │
    ├─► Check: Does `tracify_lang` exist? (user manually selected)
    │       YES → Use saved language
    │       NO  → Call /api/geo/detect → Get fresh language from IP
    │
    └─► Check: Does `tracify_country_code` exist? (user manually selected)
            YES → Use saved country code
            NO  → Call /api/geo/detect → Get fresh country code from IP
```

### User Scenarios

| Scenario | Behavior |
|----------|----------|
| First visit | API called → detect from IP |
| Change VPN + refresh | API called → detect new location automatically |
| User manually selects language | Saved to `tracify_lang` → always used |
| User wants to reset preference | `TracifyGeo.clearCache()` removes preferences |

---

## Files to Modify

### 1. `public/js/geo-detect.js`

**Remove:**
- `CACHE_KEY` constant
- `CACHE_DURATION` constant
- `getCachedData()` function
- `setCachedData()` function
- Cache checking logic in `detect()` function

**Keep:**
- `tracify_lang` preference checking in `getDetectedLanguage()`
- `tracify_country_code` preference checking in `getDetectedPhoneCode()`
- `clearCache()` function (for clearing user preferences)

**Simplify:**
- `detect()` → Always call API, no caching
- Remove `forceDetect()` (no longer needed, `detect()` is always fresh)

### 2. `public/js/i18n.js`

**No changes needed** - Already checks saved preference first, then uses geo detection.

### 3. `routes/geo.js` (Server-side)

**No changes needed** - Already returns fresh data from freeipapi.

---

## Trade-offs

| Aspect | Before (Cached) | After (No Cache) |
|--------|-----------------|------------------|
| API calls per page | 1 per hour | 1 per page load |
| VPN/location change detection | Manual cache clear required | Automatic |
| User preferences | Respected | Still respected |
| Page load speed | Faster (cached) | Slightly slower (~100-200ms) |
| API costs | Lower | Higher (but unlimited on paid plan) |

---

## Implementation Estimate

- **Files to modify:** 1 (geo-detect.js)
- **Lines of code:** ~50 lines removed, ~10 lines simplified
- **Risk:** Low (simplifying, not adding complexity)
- **Testing:** VPN switching test

---

## Context: What Was Already Done

1. Created `/api/geo/detect` server-side proxy endpoint (fixes CORS)
2. Server properly forwards client IP to freeipapi.com
3. Uses Bearer token authentication with paid API key
4. Country code detection is working
5. Language detection works but cache prevents VPN change detection

---

## API Details (For Reference)

- **Endpoint:** `/api/geo/detect` (our server)
- **Proxies to:** `https://us.freeipapi.com/api/json/{IP}`
- **Auth:** Bearer token (API key in server environment)
- **Response fields used:** `countryCode`, `phoneCodes`, mapped to `language`

---

## How to Resume

When approved, tell Claude:
> "Proceed with plan GEO-AUTODETECT - remove geo caching so VPN changes are auto-detected on refresh"

Claude will:
1. Read this plan file
2. Implement the changes to `geo-detect.js`
3. Test and deploy

---

## Approval

- [ ] Team discussion completed
- [ ] Plan approved
- [ ] Ready to implement

**Approved by:** _________________
**Date:** _________________
