# Authentication Fix - December 2024

## Problem
E2E tests were failing with 403 Forbidden errors on `GET /api/users/:userId` requests. Frontend authentication was broken despite valid cookies being present.

## Root Cause
The backend architecture had a fundamental flaw:
- **Single shared exclusion list** (`excludedRoutes.js`) was used by both `apiKeyMiddleware` and `pigeonAuthMiddleware`
- When API key was removed from frontend (security fix), most routes became inaccessible
- `/api/users/:userId` required API key but frontend no longer sent it → 403 Forbidden
- AuthProvider couldn't initialize → All tests redirected to `/login`

## Solution Architecture

### Separated Exclusion Lists
Created two distinct exclusion files with different purposes:

#### 1. `excludedRoutesApiKey.js` (API Key Middleware)
**Purpose**: Exclude all browser-facing routes from API key validation
- API key is for **server-to-server** auth only (internal microservices)
- Browser uses **pigeonId** cookie for authentication

**Routes excluded**:
```javascript
[
  '/api/admin',       // Admin token auth
  '/api/users/',      // pigeonAuth
  '/api/posts',       // pigeonAuth
  '/api/comments',    // pigeonAuth
  '/api/reactions',   // pigeonAuth
  '/api/messages',    // pigeonAuth
  '/api/messaging',   // pigeonAuth
  '/api/dm',          // pigeonAuth
  '/api/dm-requests', // pigeonAuth
  '/api/activities',  // pigeonAuth
  '/api/s3',          // pigeonAuth
  '/api/recaptcha',   // Public
  '/api/issues/createIssue', // Public
  '/api/health',      // Public
  '/api/sse',         // Query param auth
]
```

#### 2. `excludedRoutesPigeonAuth.js` (PigeonAuth Middleware)
**Purpose**: Exclude only truly public routes from user authentication
- Keeps strict validation on authenticated endpoints
- Only bypasses auth for signup/login/public utilities

**Routes excluded**:
```javascript
[
  '/api/admin',           // Admin token auth instead
  '/api/users/create',    // Public signup
  '/api/users/login',     // Public login
  '/api/recaptcha',       // Public reCAPTCHA
  '/api/issues/createIssue', // Public issue reporting
  '/api/health',          // Public health check
]
```

### Test Timing Fix
**Problem**: Test waited for `/users/` response AFTER navigation started, missing the actual request.

**Solution**: Set up `waitForResponse` promise **BEFORE** navigation:
```typescript
// Set up promise BEFORE navigation
const authResponsePromise = page.waitForResponse(
  (response) => response.url().includes('/users/') && response.status() === 200,
  { timeout: 10000 }
);

await page.goto('/');

// Wait for auth to complete before test proceeds
await authResponsePromise;
```

## Files Modified

### Backend
- ✅ Created: `apps/api/src/middleware/excludedRoutesApiKey.js`
- ✅ Created: `apps/api/src/middleware/excludedRoutesPigeonAuth.js`
- ✅ Updated: `apps/api/src/middleware/apiKey.js` (use new exclusion list)
- ✅ Updated: `apps/api/src/middleware/pigeonAuth.js` (use new exclusion list)
- ✅ Removed: `apps/api/src/middleware/excludedRoutes.js` (old shared list)

### Frontend Testing
- ✅ Updated: `libs/e2e-testing/tests/02-unit-tests.spec.ts`
  - Fixed `beforeEach` to wait for auth before proceeding
  - Removed redundant URL assertions
  - Cleaned up debug logging

## Result
- ✅ All 27 tests passing (12 integration tests + 15 config/unit tests)
- ✅ Authentication flow works correctly
- ✅ No API key required from browser (security maintained)
- ✅ Proper separation of concerns (API key vs user auth)

## Architecture Principle
**"Separate concerns in middleware exclusions"**
- API key middleware: Server-to-server trust
- PigeonAuth middleware: User identity validation
- Never conflate the two with a shared exclusion list
