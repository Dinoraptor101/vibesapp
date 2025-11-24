# reCAPTCHA v3 Implementation Summary

## Overview
Implemented invisible reCAPTCHA v3 bot protection for login and signup flows in VibesApp. The implementation follows Option B (integrated verification in auth endpoints) with a default score threshold of 0.5.

## Files Changed

### Frontend (`apps/web-v2`)

| File | Change |
|------|--------|
| `package.json` | Added `react-google-recaptcha-v3` dependency |
| `src/lib/recaptcha/ReCaptchaProvider.tsx` | New provider component wrapping the app |
| `src/lib/recaptcha/index.ts` | Barrel export for reCAPTCHA utilities |
| `src/lib/index.ts` | Added reCAPTCHA exports |
| `src/app/providers.tsx` | Added `ReCaptchaProvider` to provider stack |
| `src/features/auth/components/LoginForm.tsx` | Integrated `executeRecaptcha('login')` |
| `src/features/auth/components/SignupWizard.tsx` | Integrated `executeRecaptcha('signup')` |
| `src/features/auth/services/authApi.ts` | Updated login to POST, added recaptchaToken param |
| `src/features/auth/context/types.ts` | Updated login type signature |
| `src/features/auth/context/AuthContext.tsx` | Pass recaptchaToken to API |
| `src/features/auth/pages/LoginPage.tsx` | Added disclosure text at bottom |
| `src/styles/globals.css` | Hide reCAPTCHA badge via CSS |

### Backend (`apps/api`)

| File | Change |
|------|--------|
| `src/utils/recaptcha.js` | New shared reCAPTCHA verification utility |
| `src/controllers/user.js` | Added recaptcha verification to login and createUser |
| `src/routes/user.js` | Added POST `/api/users/login` route |
| `.env` | Added `ENABLE_RECAPTCHA=false` |

## Environment Variables

### Frontend (`.env`)
```
VITE_RECAPTCHA_SITE_KEY=<your-site-key>
VITE_ENABLE_RECAPTCHA=false  # Set to 'true' to enable
```

### Backend (`.env`)
```
REACT_APP_RECAPTCHA_SECRET=<your-secret-key>
ENABLE_RECAPTCHA=false  # Set to 'true' to enable
```

## How It Works

1. **Provider Setup**: `ReCaptchaProvider` wraps the app and loads the Google reCAPTCHA script when enabled.

2. **Token Generation**: Before auth API calls, the frontend generates a reCAPTCHA token using `executeRecaptcha('action')`.

3. **Backend Verification**: The token is sent to the backend where `verifyRecaptcha()` validates it with Google's API.

4. **Score Check**: Scores below 0.5 are rejected (likely bot). Scores 0.5+ are allowed.

5. **Graceful Degradation**: When disabled (`ENABLE_RECAPTCHA=false`), verification is bypassed on both ends.

## API Changes

### Login Endpoint
- **Old**: `GET /api/users/login/:pigeonId`
- **New**: `POST /api/users/login` with body `{ pigeonId, recaptchaToken? }`
- Legacy GET still supported for backwards compatibility

### Signup Endpoint
- **Same**: `POST /api/users/create`
- **Added**: Optional `recaptchaToken` field in request body

## Enabling reCAPTCHA

### Environment-Based Configuration

| Environment | `VITE_ENABLE_RECAPTCHA` | `ENABLE_RECAPTCHA` | Status |
|-------------|-------------------------|---------------------|--------|
| **Local Dev** | `false` | `false` | Disabled for easy testing |
| **QA** | `true` | `true` | Enabled for security testing |
| **Production** | `true` | `true` | Enabled for bot protection |

### To enable reCAPTCHA in QA/Production:

1. Set environment variables on your hosting platform (Heroku, etc.):
   ```
   VITE_ENABLE_RECAPTCHA=true    # Frontend
   ENABLE_RECAPTCHA=true          # Backend
   ```

2. Ensure valid keys are configured:
   - `VITE_RECAPTCHA_SITE_KEY` (frontend - public)
   - `REACT_APP_RECAPTCHA_SECRET` (backend - secret, keep secure!)

### Local Development
Both `.env` files default to `ENABLE_RECAPTCHA=false`, allowing:
- Testing login/signup without reCAPTCHA interference
- No need for valid reCAPTCHA keys locally
- Faster development iteration

## UI Changes

- **Login Page**: Small faded disclosure text at bottom center:
  > "Protected by reCAPTCHA. Privacy · Terms"
- **reCAPTCHA Badge**: Hidden via CSS (compliant with Google ToS when disclosure text is shown)

## Security Notes

- reCAPTCHA verification happens server-side only
- Score threshold (0.5) can be adjusted in `apps/api/src/utils/recaptcha.js`
- Failed verification returns 403 Forbidden
- Timeout handling for Google API (5 seconds)
