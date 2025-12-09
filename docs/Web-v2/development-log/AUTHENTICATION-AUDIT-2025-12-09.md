# Authentication Architecture Audit & Documentation - Dec 9, 2025

## Context
During E2E testing activation in build workflow, tests failed with redirects to `/login` instead of authenticated pages. Investigation revealed storageState path resolution issues AND prompted a comprehensive review of authentication patterns.

## Issue Identified
1. **Primary:** `storageState.json` paths used relative paths, causing inconsistent resolution in CI
2. **Secondary:** Need to document and verify authentication flow matches intended design

## Authentication Pattern Verified

### ✅ Correct Implementation
The system correctly implements a **layered authentication architecture**:

```
┌─────────────────────────────────────────────────────────┐
│                    Middleware Chain                     │
├─────────────────────────────────────────────────────────┤
│ 1. apiKeyMiddleware    → Server-to-server auth only    │
│ 2. pigeonAuthMiddleware → Browser/user authentication   │
└─────────────────────────────────────────────────────────┘
```

### Public Routes (No Auth Required)
```javascript
// apps/api/src/middleware/excludedRoutes.js
[
  '/api/admin',              // Uses adminAuth instead
  '/api/users/create',       // Signup
  '/api/users/login',        // Login
  '/api/recaptcha',          // CAPTCHA
  '/api/issues/createIssue', // Bug reports
  '/api/health',             // Health checks
]
```

### Authenticated User Routes
**All other routes** require valid `pigeonId`:
- Extracted from `X-Pigeon-Id` header (set by browser cookie)
- Validated against MongoDB User collection
- Sets `req.validatedUserId` for controllers

### Special Auth Mechanisms
1. **Admin:** Separate `adminToken` + `adminAuth` middleware
2. **E2E:** `X-E2E-Bypass` header for test automation
3. **Server-to-Server:** `X-Api-Key` header (internal only)

## Documentation Created

### 1. Comprehensive Authentication Guide
**File:** `docs/AUTHENTICATION-ARCHITECTURE.md`
- Complete authentication flow documentation
- All 5 auth mechanisms explained
- Security best practices
- Troubleshooting guide
- Related files index

### 2. Updated Architecture Doc
**File:** `docs/Web-v2/01-current-architecture.md`
- Added authentication system section
- References comprehensive auth doc
- Security highlights

### 3. Updated Security Fix Doc
**File:** `docs/SECURITY-FIX-API-KEY.md`
- References comprehensive auth doc
- Clarified server-to-server API key usage
- Updated "After" architecture diagram

## Code Fixes Applied

### E2E Test Authentication
**Files:**
- `libs/e2e-testing/playwright.config.ts`
- `libs/e2e-testing/global-setup.local.ts`
- `libs/e2e-testing/global-setup.qa.ts`

**Changes:**
```typescript
// Before (relative paths - CI fails)
storageState: 'storageState-user1.local.json'
await context.storageState({ path: './storageState-user1.local.json' });

// After (absolute paths - CI works)
storageState: path.resolve(__dirname, 'storageState-user1.local.json')
await context.storageState({ 
  path: path.resolve(__dirname, 'storageState-user1.local.json')
});
```

**Why:** In CI, working directory != test directory. Absolute paths ensure storageState is created and loaded from same location.

## Verification Checklist

### Backend Middleware Chain ✅
- [x] `apiKeyMiddleware` runs first (checks excluded routes, then API key)
- [x] `pigeonAuthMiddleware` runs second (checks excluded routes, then pigeonId)
- [x] Public routes bypass both (via excludedRoutes)
- [x] Admin routes use separate `adminAuth` middleware
- [x] Health check exposed before middleware chain

### Frontend API Client ✅
- [x] NO `X-Api-Key` header sent from browser
- [x] `X-Pigeon-Id` header added from cookie
- [x] `X-Admin-Token` added when available (admin routes)
- [x] Request interceptor reads cookies, sets headers

### E2E Testing ✅
- [x] Global setup creates storageState with auth cookies
- [x] Tests inherit auth via storageState config
- [x] Absolute paths prevent CI path resolution issues
- [x] Separate storageState files for local/QA environments

### Documentation ✅
- [x] Comprehensive AUTHENTICATION-ARCHITECTURE.md created
- [x] Architecture doc references auth patterns
- [x] Security fix doc updated with context
- [x] All auth mechanisms documented
- [x] Troubleshooting guide included

## Security Posture

### ✅ Strengths
1. Cookie-based auth (not localStorage) prevents XSS
2. API key never exposed to browser
3. pigeonId validated on every request
4. Separate admin authentication
5. HTTPS in production encrypts transmission

### 🔄 Future Improvements
1. Add rate limiting per pigeonId
2. Implement CSRF protection for state-changing ops
3. Consider JWT for stateless auth
4. Add audit logging for sensitive operations
5. IP-based admin access restrictions

## Testing Status

### E2E Tests - Local Environment ✅
- Absolute paths prevent storageState resolution issues
- Tests authenticate via global-setup.local.ts
- pigeonId cookies loaded before test execution

### E2E Tests - CI Environment 🔄 Pending
- Absolute paths fix applied
- Awaiting build workflow re-run to verify
- Expected: Tests pass authentication, no `/login` redirects

## Related Files

### Implementation
- `apps/api/src/index.js` - Middleware chain setup
- `apps/api/src/middleware/pigeonAuth.js` - User auth validation
- `apps/api/src/middleware/apiKey.js` - Server auth
- `apps/api/src/middleware/excludedRoutes.js` - Public routes config
- `apps/web-v2/src/lib/api.ts` - Frontend API client

### Testing
- `libs/e2e-testing/playwright.config.ts` - Test config with storageState
- `libs/e2e-testing/global-setup.local.ts` - Auth setup (localhost)
- `libs/e2e-testing/global-setup.qa.ts` - Auth setup (QA)

### Documentation
- `docs/AUTHENTICATION-ARCHITECTURE.md` - **NEW** Comprehensive auth guide
- `docs/SECURITY-FIX-API-KEY.md` - Updated with auth context
- `docs/Web-v2/01-current-architecture.md` - Updated with auth section
- `.github/copilot-instructions.md` - Auth patterns for AI context

## Key Takeaways

1. **pigeonId IS the password** - No traditional passwords in VibesApp
2. **Public routes are truly public** - Health, login, signup need no auth
3. **API key is server-only** - Never sent from browser (security fix)
4. **Middleware chain is critical** - Order matters: apiKey → pigeonAuth
5. **E2E needs absolute paths** - CI working directory != test directory

## Next Steps

1. ✅ Documentation complete
2. ✅ Code fixes applied
3. 🔄 Commit changes to branch `activate-e2e-testing-in-build-workflow`
4. 🔄 Push and verify CI build passes
5. 🔄 Merge to main if tests pass
