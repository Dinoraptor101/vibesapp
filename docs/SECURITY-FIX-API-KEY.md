# Security Fix: Remove API Key from Frontend

## Issue
The `VITE_BACKEND_API_KEY` was bundled into the frontend JavaScript and sent with every browser request via the `X-Api-Key` header. This created a critical security vulnerability:

1. **Exposed Secret**: API key was visible in browser DevTools Network tab
2. **Bypass Vulnerability**: Attackers could extract the key and call protected endpoints like `/api/admin/cleanup-test-data`
3. **No Rate Limiting**: Single exposed key could be used from any IP/location

## Root Cause
The `API_KEY` was shared between:
- **Server-to-server auth** (intended use)
- **Browser-to-server auth** (incorrect use)

This violated the principle of separation of concerns - browser auth should use session-based mechanisms (like `pigeonAuth`), not static API keys.

## Fix Implementation

### 1. Remove API Key from Frontend
**File**: `apps/web-v2/src/lib/api.ts`
- Removed `private apiKey` field
- Commented out `X-Api-Key` header injection
- Added security comment explaining why

### 2. Protect Cleanup Endpoint with E2E Token
**File**: `apps/api/src/routes/admin.js`
- Replaced `apiKeyAuth` middleware with `e2eBypassAuth`
- Now requires `X-E2E-Bypass` header with `E2E_BYPASS_TOKEN`
- Only E2E tests can call `/api/admin/cleanup-test-data`

### 3. Update CI/CD
**File**: `.github/workflows/build.yml`
- Removed `VITE_BACKEND_API_KEY` from build environment
- Removed from E2E test frontend variables
- Backend still uses `API_KEY` for server-only operations

### 4. Update Deployment Scripts
**File**: `scripts/update-secrets.sh`
- Commented out `VITE_BACKEND_API_KEY` GitHub secret
- Removed from Vercel environment variables
- Added security comments

## Authentication Architecture

### Before (Vulnerable)
```
Browser → [X-Api-Key: exposed_key] → API
           ↓
    Visible in DevTools ❌
```

### After (Secure)
```
Browser → [Cookie: pigeonId] → pigeonAuth → API ✅
E2E Tests → [X-E2E-Bypass: secret_token] → e2eBypassAuth → Cleanup endpoint ✅
```

## Migration Checklist

### Immediate Actions Required
- [ ] Delete `VITE_BACKEND_API_KEY` from GitHub Secrets (repo settings)
- [ ] Delete `VITE_BACKEND_API_KEY` from GitHub Pages environment variables
- [ ] Delete `VITE_BACKEND_API_KEY` from Vercel production environment
- [ ] Rotate `API_KEY` in `apps/api/.env` (since it was exposed)
- [ ] Rotate `E2E_BYPASS_TOKEN` if previously shared

### Verification Steps
1. Build frontend and inspect bundle - should NOT contain API key
2. Check browser DevTools Network tab - no `X-Api-Key` header
3. Try calling `/api/admin/cleanup-test-data` without E2E token - should return 403
4. Run E2E tests - cleanup should work with `X-E2E-Bypass` header

### Long-Term Security Improvements
- [ ] Add rate limiting to all API endpoints
- [ ] Implement IP whitelisting for admin routes
- [ ] Add audit logging for sensitive operations
- [ ] Consider moving to JWT-based auth for better session management
- [ ] Add CSRF protection for state-changing operations

## Testing

### Manual Test: Verify API Key Removed
```bash
# Build frontend
cd apps/web-v2
npm run build

# Search for API key in bundle (should return nothing)
grep -r "VITE_BACKEND_API_KEY" dist/
grep -r "X-Api-Key" dist/
```

### Manual Test: Verify E2E Auth Works
```bash
# Should fail (no token)
curl -X DELETE http://localhost:5001/api/admin/cleanup-test-data

# Should succeed (with token)
curl -X DELETE http://localhost:5001/api/admin/cleanup-test-data \
  -H "X-E2E-Bypass: your_e2e_bypass_token"
```

## Impact Assessment
- **Breaking Change**: No - frontend never needed API key (most routes excluded)
- **E2E Tests**: Still work via `X-E2E-Bypass` header
- **Production Users**: No impact - auth via `pigeonId` cookie unchanged
- **Security**: Critical improvement - eliminates key exposure vulnerability

## Related Files
- `apps/web-v2/src/lib/api.ts` - Frontend API client
- `apps/api/src/routes/admin.js` - Admin routes with new auth
- `apps/api/src/middleware/apiKey.js` - Server-side API key middleware (unchanged)
- `apps/api/src/middleware/excludedRoutes.js` - Routes that skip API key check
- `.github/workflows/build.yml` - CI/CD build pipeline
- `scripts/update-secrets.sh` - Deployment secret management
