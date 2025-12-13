# Completed Tasks - December 2025

## UI/UX Polish
- ✅ **Enhanced UserMenu animations** - Improved `apps/web-v2/src/components/layout/UserMenu.tsx` with custom CSS transitions beyond Radix defaults
- ✅ **Reduced mobile padding on Profile page** - Adjusted horizontal padding in `apps/web-v2/src/pages/ProfilePage.tsx` for mobile viewports
- ✅ **Added age/sex honesty advisory** - Inserted reminder message during signup in `apps/web-v2/src/components/signup/SignupWizard.tsx` encouraging honest demographic information

## Infrastructure & Testing
- ✅ **E2E Authentication Fix** - Separated API key exclusions from pigeonAuth exclusions, created `excludedRoutesApiKey.js` and `excludedRoutesPigeonAuth.js`
- ✅ **Fixed E2E Test Flakiness** - Made parallel-safe assertions in post counts and interactions tests using `toBeGreaterThanOrEqual()`
- ✅ **QA Backend Deployment** - Fixed MongoDB connection string on logosil-backend dyno
- ✅ **Production Backend Deployment** - Force-deployed auth fix to vibesapp production (v97)
- ✅ **SSE Auto-Reconnection System** - Built version check mechanism to force SSE reconnection for stale browser sessions without logout

## Security
- ✅ **API Key Security Fix** - Removed API key from browser bundle (commented out lines 73-79 in api.ts), enforced server-to-server only pattern
- ✅ **Authentication Architecture Refactor** - Separated API key middleware (internal services) from pigeonAuth middleware (user auth)
