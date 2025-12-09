# QA reCAPTCHA Manual Testing Guide

> **Environment:** https://qa.vibesapp.net  
> **Backend:** https://api-qa.vibesapp.net  
> **Last Updated:** November 28, 2025

## Overview

This document provides comprehensive manual testing scenarios for reCAPTCHA v3 integration on the QA environment. Since reCAPTCHA is specifically designed to block automated bots, these tests must be performed manually.

## Prerequisites

### 1. Environment Configuration Checklist

Before testing, ensure the following environment variables are configured:

**Heroku (Backend - logosil-backend):**
```bash
# View current config
heroku config -a logosil-backend | grep RECAPTCHA

# Enable reCAPTCHA for QA
heroku config:set ENABLE_RECAPTCHA=true -a logosil-backend
heroku config:set RECAPTCHA_SECRET=<your-secret-key> -a logosil-backend

# Verify the change
heroku config:get ENABLE_RECAPTCHA -a logosil-backend
```

**Vercel (Frontend - qa.vibesapp.net):**
- `VITE_ENABLE_RECAPTCHA=true`
- `VITE_RECAPTCHA_SITE_KEY=<your-site-key>`

### 2. Google reCAPTCHA Console Setup

1. Visit [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Register new site with:
   - **Label:** VibesApp QA
   - **reCAPTCHA type:** v3
   - **Domains:** `qa.vibesapp.net`, `api-qa.vibesapp.net`
3. Copy Site Key → Frontend `VITE_RECAPTCHA_SITE_KEY`
4. Copy Secret Key → Backend `RECAPTCHA_SECRET`

### 3. Testing Tools Required

- Modern browser (Chrome/Firefox/Safari)
- Browser DevTools (Network tab, Console)
- Access to Google reCAPTCHA Admin Console

---

## Test Scenarios

### Scenario 1: User Signup - Happy Path ✅

**Objective:** Verify new user registration works with reCAPTCHA enabled

**Steps:**
1. Navigate to `https://qa.vibesapp.net/signup`
2. Complete Step 1: Welcome screen, click "Get Started"
3. Complete Step 2: Accept Terms of Service
4. Complete Step 3: Enter unique username
5. Complete Step 4: Enter birth date (must be 13+)
6. Complete Step 5: Select MBTI type
7. Complete Step 6: Select Polarity preference
8. Complete Step 7: Enable/skip location
9. Complete Step 8: Optional profile picture
10. Complete Step 9: Optional bio, click "Complete Signup"

**Verification:**
- [ ] Open DevTools → Network tab before Step 9
- [ ] Filter for `signup` request
- [ ] Verify POST `/api/auth/signup` payload contains `recaptchaToken`
- [ ] Response is 200/201 with user data
- [ ] User redirected to home feed
- [ ] No error messages displayed

**Expected Result:** Account created successfully

---

### Scenario 2: User Login - Happy Path ✅

**Objective:** Verify existing user login works with reCAPTCHA enabled

**Steps:**
1. Navigate to `https://qa.vibesapp.net/login`
2. Enter valid Pigeon ID (from Scenario 1 or existing test account)
3. Click "Login" button

**Verification:**
- [ ] Open DevTools → Network tab before clicking Login
- [ ] Filter for `login` request
- [ ] Verify POST `/api/auth/login` payload contains `recaptchaToken`
- [ ] Response is 200 with user data and session token
- [ ] User redirected to home feed
- [ ] Session cookie set in browser

**Expected Result:** Login successful, user authenticated

---

### Scenario 3: Admin Login - Happy Path ✅

**Objective:** Verify admin dashboard login works with reCAPTCHA enabled

**Steps:**
1. Navigate to `https://qa.vibesapp.net/admin/login`
2. Enter valid admin password
3. Click "Login" button

**Verification:**
- [ ] Open DevTools → Network tab before clicking Login
- [ ] Filter for `admin/login` request
- [ ] Verify POST `/api/admin/login` payload contains `recaptchaToken`
- [ ] Response is 200 with admin session
- [ ] Redirected to `/admin/dashboard`
- [ ] Admin-only features accessible

**Expected Result:** Admin login successful

---

### Scenario 4: Bot Simulation - Missing Token 🤖

**Objective:** Verify backend rejects requests without reCAPTCHA token

**Steps:**
1. Navigate to `https://qa.vibesapp.net/login`
2. Open DevTools → Console
3. Execute the following to bypass reCAPTCHA:
   ```javascript
   // Store original function
   const originalExecute = window.grecaptcha?.execute;
   
   // Override to return null (simulating bot with no token)
   if (window.grecaptcha) {
     window.grecaptcha.execute = () => Promise.resolve(null);
   }
   ```
4. Enter any Pigeon ID and click Login

**Verification:**
- [ ] Network tab shows POST `/api/auth/login` with `recaptchaToken: null` or missing
- [ ] Response is 403 Forbidden
- [ ] Response body contains: `"reCAPTCHA verification failed"` or similar
- [ ] User NOT logged in
- [ ] Error message displayed to user

**Expected Result:** Request blocked, 403 response

---

### Scenario 5: Bot Simulation - Invalid Token 🤖

**Objective:** Verify backend validates token authenticity with Google

**Steps:**
1. Navigate to `https://qa.vibesapp.net/login`
2. Open DevTools → Network tab
3. Enter valid Pigeon ID
4. Before clicking Login, set up request interception:
   - Right-click Network tab → "Block request URL" won't work here
   - Instead, use Console to intercept:
   ```javascript
   // Override grecaptcha to return fake token
   if (window.grecaptcha) {
     window.grecaptcha.execute = () => Promise.resolve('FAKE_INVALID_TOKEN_12345');
   }
   ```
5. Click Login

**Verification:**
- [ ] Network shows POST with `recaptchaToken: "FAKE_INVALID_TOKEN_12345"`
- [ ] Backend sends token to Google API for validation
- [ ] Google returns invalid/failed response
- [ ] Backend returns 403 Forbidden
- [ ] User sees error message

**Expected Result:** Invalid token rejected by Google verification

---

### Scenario 6: Bot Simulation - Replay Attack 🤖

**Objective:** Verify reCAPTCHA tokens are single-use and time-limited

**Steps:**
1. Navigate to `https://qa.vibesapp.net/login`
2. Open DevTools → Network tab
3. Enter valid Pigeon ID and click Login (successful login)
4. Copy the `recaptchaToken` value from the request payload
5. Log out of the application
6. Wait 2+ minutes (tokens typically expire in 2 minutes)
7. Use Console or API tool to send manual request:
   ```javascript
   fetch('https://api-qa.vibesapp.net/api/auth/login', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       pigeon_id: 'your-pigeon-id',
       recaptchaToken: '<paste-copied-token>'
     })
   }).then(r => r.json()).then(console.log);
   ```

**Verification:**
- [ ] Response is 403 Forbidden
- [ ] Error indicates token expired or already used
- [ ] Cannot reuse tokens from previous requests

**Expected Result:** Replay attack blocked

---

### Scenario 7: Bot Simulation - Direct API Call (No Frontend) 🤖

**Objective:** Verify API cannot be accessed without going through reCAPTCHA-enabled frontend

**Steps:**
1. Open terminal or API client (Postman, curl)
2. Send direct signup request without token:
   ```bash
   curl -X POST https://api-qa.vibesapp.net/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{
       "username": "botuser123",
       "pigeonId": "BOT-1234-5678",
       "birthDate": "1990-01-01",
       "mbtiType": "INTJ",
       "polarity": "positive"
     }'
   ```

**Verification:**
- [ ] Response is 403 Forbidden
- [ ] Response body: `{"success": false, "message": "reCAPTCHA verification failed"}`
- [ ] No user created in database

**Expected Result:** API protected from direct access

---

### Scenario 8: Low Score Simulation 🤖

**Objective:** Test threshold-based blocking (score < 0.5)

> **Note:** This is difficult to simulate without actual bot behavior. Google's algorithm determines scores based on user behavior patterns.

**Steps:**
1. Use browser automation tools in "obvious" mode:
   - Very fast form filling
   - No mouse movement
   - Instant page navigation
2. Attempt signup/login

**Verification:**
- [ ] Check Google reCAPTCHA Admin Console for score
- [ ] If score < 0.5, request should be blocked
- [ ] Backend logs show `"score": 0.X` in verification response

**Alternative Test Method:**
- Temporarily lower threshold in backend for testing:
  ```javascript
  // apps/api/src/utils/recaptcha.js
  const SCORE_THRESHOLD = 0.9; // Temporarily set high
  ```
- Normal user behavior should still pass (scores typically 0.9)
- Reset to 0.5 after testing

**Expected Result:** Low-confidence requests blocked

---

### Scenario 9: UX Compliance Check 👁️

**Objective:** Verify reCAPTCHA v3 branding requirements are met

**Google Requirements:**
- v3 badge can be hidden IF disclosure text is shown
- Must link to Google Privacy Policy and Terms of Service

**Steps:**
1. Navigate to `https://qa.vibesapp.net/login`
2. Inspect page for reCAPTCHA elements

**Verification:**
- [ ] reCAPTCHA badge is NOT visible (hidden via CSS)
- [ ] Disclosure text present near form or in footer:
  > "This site is protected by reCAPTCHA and the Google [Privacy Policy](https://policies.google.com/privacy) and [Terms of Service](https://policies.google.com/terms) apply."
- [ ] Links are clickable and correct
- [ ] Text is readable (not hidden/tiny)

**Check CSS:**
```css
/* Should be present in styles */
.grecaptcha-badge {
  visibility: hidden !important;
}
```

**Expected Result:** Compliant with Google branding guidelines

---

### Scenario 10: Performance Check ⚡

**Objective:** Verify reCAPTCHA doesn't degrade user experience

**Steps:**
1. Open DevTools → Network tab
2. Navigate to login page
3. Note time for reCAPTCHA script to load
4. Perform login action
5. Note total time from click to redirect

**Verification:**
- [ ] reCAPTCHA script loads in <500ms
- [ ] Token generation is instant (invisible to user)
- [ ] Total login flow completes in <3 seconds
- [ ] No visible loading spinners for reCAPTCHA
- [ ] Form remains responsive during verification

**Expected Result:** No noticeable performance impact

---

### Scenario 11: Error Message UX 📝

**Objective:** Verify error messages are user-friendly

**Steps:**
1. Trigger reCAPTCHA failure (use Scenario 4 or 5)
2. Observe error message displayed to user

**Verification:**
- [ ] Error message is NOT technical (no "403", "reCAPTCHA token invalid")
- [ ] Message is user-friendly, e.g.:
  - "Unable to verify you're human. Please try again."
  - "Security verification failed. Please refresh and try again."
- [ ] Clear action for user to retry
- [ ] No sensitive information exposed

**Expected Result:** Friendly error messaging

---

### Scenario 12: Network Failure Graceful Degradation 🌐

**Objective:** Test behavior when Google reCAPTCHA service is unreachable

**Steps:**
1. Open DevTools → Network tab
2. Block requests to `google.com/recaptcha`:
   - Network tab → Right-click → Block request URL
   - Add pattern: `*recaptcha*`
3. Refresh login page
4. Attempt to login

**Verification:**
- [ ] Application handles missing reCAPTCHA gracefully
- [ ] Either: Falls back to allowing request (if configured)
- [ ] Or: Shows appropriate error message
- [ ] No JavaScript errors in console
- [ ] Application doesn't crash

**Expected Result:** Graceful error handling

---

## Google reCAPTCHA Console Verification

After completing all test scenarios, verify analytics in Google Console:

### Steps:
1. Visit [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Select "VibesApp QA" site
3. Review analytics dashboard

### Expected Analytics:
| Metric | Expected Value |
|--------|----------------|
| Total Requests | Matches test count (~15-20) |
| Score Distribution | Mostly 0.7-1.0 for legitimate tests |
| Suspicious Requests | Some 0.0-0.3 from bot simulations |
| Failed Verifications | Matches invalid token tests |
| Top Actions | `signup`, `login`, `admin_login` |

### Verify Actions Tracked:
- [ ] `signup` action appears in console
- [ ] `login` action appears in console  
- [ ] `admin_login` action appears in console
- [ ] Scores correlate with test behavior

---

## Test Results Template

Copy this template to document test results:

```markdown
## reCAPTCHA QA Test Results

**Date:** YYYY-MM-DD
**Tester:** [Name]
**Environment:** qa.vibesapp.net
**Browser:** Chrome XX / Firefox XX / Safari XX

### Results Summary

| Scenario | Status | Notes |
|----------|--------|-------|
| 1. User Signup | ✅/❌ | |
| 2. User Login | ✅/❌ | |
| 3. Admin Login | ✅/❌ | |
| 4. Missing Token | ✅/❌ | |
| 5. Invalid Token | ✅/❌ | |
| 6. Replay Attack | ✅/❌ | |
| 7. Direct API | ✅/❌ | |
| 8. Low Score | ✅/❌/⏭️ | |
| 9. UX Compliance | ✅/❌ | |
| 10. Performance | ✅/❌ | |
| 11. Error Messages | ✅/❌ | |
| 12. Network Failure | ✅/❌ | |

### Issues Found

1. [Issue description]
   - **Severity:** High/Medium/Low
   - **Steps to reproduce:** ...
   - **Expected:** ...
   - **Actual:** ...

### Google Console Analytics

- Total Requests: X
- Average Score: X.X
- Failed Verifications: X

### Sign-off

- [ ] All critical scenarios passed
- [ ] No blocking issues
- [ ] Ready for production deployment
```

---

## Troubleshooting

### Common Issues

**1. "reCAPTCHA not loaded" errors**
- Check `VITE_ENABLE_RECAPTCHA=true` in Vercel
- Verify site key is correct for domain
- Check browser console for script loading errors

**2. All requests return 403**
- Verify `RECAPTCHA_SECRET` in Heroku matches Google Console:
  ```bash
  heroku config:get RECAPTCHA_SECRET -a logosil-backend-a8355253628c
  ```
- Check backend logs for verification errors:
  ```bash
  heroku logs --tail -a logosil-backend-a8355253628c | grep -i recaptcha
  ```
- Ensure `ENABLE_RECAPTCHA=true` (not `"true"` string)

**3. Requests succeed without token**
- Verify `ENABLE_RECAPTCHA=true` on backend
- Check if bypassed mode is active
- Review `apps/api/src/utils/recaptcha.js` logic

**4. Google Console shows no data**
- Allow 24-48 hours for analytics to populate
- Verify correct site key is being used
- Check that requests are reaching Google API

---

## Related Documentation

- [Google reCAPTCHA v3 Docs](https://developers.google.com/recaptcha/docs/v3)
- [reCAPTCHA Branding FAQ](https://developers.google.com/recaptcha/docs/faq)
- [VibesApp Auth Flow](../docs/Web-V2/02-implemented-features.md)
- [E2E Testing Guide](./README.md)
