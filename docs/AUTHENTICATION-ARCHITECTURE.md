# Authentication Architecture

## Overview

VibesApp uses a **layered authentication system** with distinct mechanisms for different contexts:
1. **pigeonId** - User authentication (browser ↔ API)
2. **API Key** - Server-to-server authentication (internal only)
3. **Admin Token** - Admin dashboard authentication
4. **E2E Bypass Token** - Test automation authentication

## Core Principle: pigeonId IS the Password

**CRITICAL:** The `pigeonId` (e.g., `lunar-breeze-4302`) is the user's authentication credential. There are no traditional passwords in VibesApp.

- **Storage**: Saved as HTTP cookie (`pigeonId`)
- **Transmission**: Sent as `X-Pigeon-Id` header on every authenticated request
- **Validation**: Backend middleware (`pigeonAuth.js`) validates against User collection
- **Security**: Never exposed in API responses (write-only credential)

## Authentication Layers

### 1. Public Routes (No Auth Required)

Routes accessible without authentication are defined in two separate exclusion lists:

#### API Key Exclusions (`excludedRoutesApiKey.js`)
Routes excluded from API key validation (all browser-facing routes):

```javascript
// apps/api/src/middleware/excludedRoutesApiKey.js
[
  '/api/admin',       // Admin token auth
  '/api/users/',      // pigeonAuth validates
  '/api/posts',       // pigeonAuth validates
  '/api/comments',    // pigeonAuth validates
  '/api/reactions',   // pigeonAuth validates
  '/api/messages',    // pigeonAuth validates
  '/api/messaging',   // pigeonAuth validates
  '/api/dm',          // pigeonAuth validates
  '/api/dm-requests', // pigeonAuth validates
  '/api/activities',  // pigeonAuth validates
  '/api/s3',          // pigeonAuth validates
  '/api/recaptcha',   // Public
  '/api/issues/createIssue', // Public
  '/api/health',      // Public
  '/api/sse',         // Query param auth
]
```

#### PigeonAuth Exclusions (`excludedRoutesPigeonAuth.js`)
Routes excluded from user authentication (truly public or alternative auth):

```javascript
// apps/api/src/middleware/excludedRoutesPigeonAuth.js
[
  '/api/admin',           // Admin token auth instead
  '/api/users/create',    // Public signup
  '/api/users/login',     // Public login
  '/api/recaptcha',       // Public reCAPTCHA
  '/api/issues/createIssue', // Public issue reporting
  '/api/health',          // Public health check
]
```

**Why Two Lists?**
- **API key** = Server-to-server trust (browser never sends it)
- **pigeonAuth** = User identity validation (browser sends pigeonId)
- Never conflate the two - they serve different purposes

**Flow:**
```
Browser → GET /api/health → [apiKey: excluded] → [pigeonAuth: excluded] → ✅ Allow
Browser → POST /api/users/create → [apiKey: excluded] → [pigeonAuth: excluded] → ✅ Allow
Browser → POST /api/users/login → [apiKey: excluded] → [pigeonAuth: excluded] → ✅ Allow
Browser → GET /api/users/:userId → [apiKey: excluded] → [pigeonAuth: validates] → ✅ Allow (if valid pigeonId)
```

### 2. Authenticated Routes (pigeonId Required)

All routes NOT in `excludedRoutes` require valid `pigeonId`.

**Middleware Chain:**
```javascript
// apps/api/src/index.js
app.use(apiKeyMiddleware);     // Step 1: Check API key (or skip if excluded)
app.use(pigeonAuthMiddleware); // Step 2: Validate pigeonId (or skip if excluded)
```

**pigeonAuth Behavior:**
- **Excluded routes**: Skip validation, proceed immediately
- **GET requests without pigeonId**: Allow (for public data)
- **GET requests with pigeonId**: Validate and set `req.validatedUserId`
- **Non-GET requests without pigeonId**: `403 Forbidden`
- **Invalid pigeonId**: `403 Forbidden`

**Flow:**
```
Browser → POST /api/posts/create
  ↓
[apiKeyMiddleware] → Check if excluded → Yes → Skip
  ↓
[pigeonAuthMiddleware] → Check if excluded → No
  ↓
Extract X-Pigeon-Id header → lunar-breeze-4302
  ↓
Query User.findOne({ pigeonId: "lunar-breeze-4302" })
  ↓
Found → Set req.validatedUserId = user.userId
  ↓
Controller receives req.validatedUserId → ✅ Create post
```

### 3. API Key (Server-to-Server Only)

**Purpose:** Internal microservice authentication (NOT for browser requests)

**CRITICAL SECURITY:**
- ❌ **NEVER send from browser** - Would expose key in DevTools
- ✅ **Server-only** - For internal API-to-API communication

**Middleware:**
```javascript
// apps/api/src/middleware/apiKey.js
module.exports = (req, res, next) => {
  // Check if excluded (most routes are excluded)
  if (excludedRoutes.some(route => req.path.startsWith(route))) {
    return next();
  }

  const apiKey = req.headers['x-api-key'];
  if (apiKey && apiKey === process.env.API_KEY) {
    return next();
  }

  res.status(403).json({ error: 'Forbidden: Invalid API Key' });
};
```

**Why Browser Doesn't Need API Key:**
- Most routes are in `excludedRoutes` (bypasses apiKey check)
- Remaining routes use `pigeonAuth` instead
- Browser auth is session-based (cookies), not static keys

### 4. Admin Authentication

**Separate token system** for admin dashboard:

```javascript
// apps/api/src/middleware/adminAuth.js
const adminToken = req.headers['x-admin-token'] || req.cookies.adminToken;
if (adminToken === process.env.ADMIN_TOKEN) {
  return next();
}
res.status(403).json({ error: 'Forbidden: Invalid Admin Token' });
```

**Flow:**
```
Admin Browser → /api/admin/users
  ↓
[excludedRoutes] → /api/admin is excluded → Skip pigeonAuth
  ↓
[adminAuth] → Validate X-Admin-Token header
  ↓
Match → ✅ Allow admin action
```

### 5. E2E Test Authentication

**Special bypass for test automation:**

```javascript
// apps/api/src/middleware/e2eBypassAuth.js
const e2eToken = req.headers['x-e2e-bypass'];
if (e2eToken === process.env.E2E_BYPASS_TOKEN) {
  return next();
}
res.status(403).json({ error: 'Forbidden: Invalid E2E Token' });
```

**Used by:**
- E2E cleanup endpoint: `/api/admin/cleanup-test-data`
- Playwright global setup/teardown
- CI/CD test automation

## Frontend Authentication Flow

### Login Process

1. **User enters pigeonId** on `/login` page
2. **Frontend sends request:**
   ```typescript
   POST /api/users/login
   Body: { pigeonId: "lunar-breeze-4302", recaptchaToken?: "..." }
   ```
3. **Backend validates:**
   - Check if user exists: `User.findOne({ pigeonId })`
   - Verify reCAPTCHA (if enabled)
   - Return user data if valid
4. **Frontend stores cookie:**
   ```typescript
   setCookie('pigeonId', pigeonId, 3650); // 10 years
   setCookie('userId', userId, 3650);
   ```
5. **Navigate to home:** `navigate('/')`

### Authenticated Requests

**Every API request includes pigeonId:**

```typescript
// apps/web-v2/src/lib/api.ts
this.client.interceptors.request.use((config) => {
  const pigeonId = getCookie('pigeonId');
  if (pigeonId) {
    config.headers['X-Pigeon-Id'] = pigeonId;
  }
  return config;
});
```

### Protected Routes

**React Router guards:**

```typescript
// apps/web-v2/src/app/Router.tsx
const ProtectedRoute = ({ children }) => {
  const pigeonId = getCookie('pigeonId');
  if (!pigeonId) {
    return <Navigate to="/login" replace />;
  }
  return children;
};
```

## E2E Testing Authentication

### Global Setup (Playwright)

Creates `storageState.json` with auth cookies:

```typescript
// libs/e2e-testing/global-setup.local.ts
const cookies = [
  {
    name: 'pigeonId',
    value: process.env.QA_TEST_PIGEON_ID, // e.g., lunar-breeze-4302
    domain: 'localhost',
    path: '/',
  },
  {
    name: 'userId',
    value: userId, // Fetched from API
    domain: 'localhost',
    path: '/',
  }
];
await context.addCookies(cookies);
await context.storageState({ 
  path: path.resolve(__dirname, 'storageState-user1.local.json')
});
```

### Test Configuration

Load auth state before tests:

```typescript
// libs/e2e-testing/playwright.config.ts
export default defineConfig({
  use: {
    storageState: path.resolve(__dirname, 'storageState-user1.local.json'),
  },
});
```

**Result:** All tests run as authenticated user without manual login.

## Security Best Practices

### ✅ Do's

1. **Use pigeonId for browser auth** - Cookie-based, secure
2. **Keep API_KEY server-only** - Never expose to browser
3. **Rotate credentials regularly** - Especially after exposure
4. **Use HTTPS in production** - Encrypt cookie transmission
5. **Set secure cookie flags** - `Secure`, `HttpOnly`, `SameSite`
6. **Validate on every request** - Never trust client state

### ❌ Don'ts

1. **DON'T send API_KEY from browser** - Visible in DevTools
2. **DON'T store pigeonId in localStorage** - XSS vulnerability
3. **DON'T log pigeonId in console** - Security leak
4. **DON'T expose pigeonId in API responses** - Write-only credential
5. **DON'T skip auth validation** - Always verify server-side
6. **DON'T use GET for auth operations** - Use POST/PUT/DELETE

## Troubleshooting

### "403 Forbidden: Missing Pigeon ID"

**Cause:** Request requires auth but no `pigeonId` cookie
**Fix:** Redirect to `/login` or check cookie expiry

### "403 Forbidden: Invalid Pigeon ID"

**Cause:** `pigeonId` doesn't match any user in database
**Fix:** User deleted or pigeonId typo - require re-login

### E2E Tests Redirect to Login

**Cause:** `storageState.json` not loaded or wrong path
**Fix:** Use absolute paths in `playwright.config.ts`:
```typescript
storageState: path.resolve(__dirname, 'storageState-user1.local.json')
```

### API Returns 403 on Valid Request

**Cause 1:** Route not in `excludedRoutes` but needs to be
**Fix:** Add to `apps/api/src/middleware/excludedRoutes.js`

**Cause 2:** Missing `pigeonId` header on non-GET request
**Fix:** Check `apiClient` interceptor adds `X-Pigeon-Id` header

## Related Files

### Backend
- `apps/api/src/middleware/pigeonAuth.js` - User auth validation
- `apps/api/src/middleware/apiKey.js` - Server-to-server auth
- `apps/api/src/middleware/adminAuth.js` - Admin auth
- `apps/api/src/middleware/e2eBypassAuth.js` - Test auth
- `apps/api/src/middleware/excludedRoutes.js` - Public routes config
- `apps/api/src/index.js` - Middleware chain setup

### Frontend
- `apps/web-v2/src/lib/api.ts` - API client with auth headers
- `apps/web-v2/src/features/auth/api/authService.ts` - Login/signup
- `apps/web-v2/src/app/Router.tsx` - Protected route guards
- `apps/web-v2/src/app/providers.tsx` - Auth context

### Testing
- `libs/e2e-testing/global-setup.local.ts` - Test auth setup (localhost)
- `libs/e2e-testing/global-setup.qa.ts` - Test auth setup (QA)
- `libs/e2e-testing/playwright.config.ts` - Test config with storageState
- `libs/e2e-testing/setup-utils.ts` - Auth cookie creation helpers

### Documentation
- `docs/SECURITY-FIX-API-KEY.md` - API key removal rationale
- `.github/copilot-instructions.md` - Auth flow overview
- `docs/Web-v2/01-current-architecture.md` - Architecture patterns
