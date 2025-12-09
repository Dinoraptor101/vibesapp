# Build Version Cache Invalidation

## Problem
After deploying a new build to QA/production, users with cached assets would continue running old JavaScript code, causing compatibility issues with the updated backend API. This required manually asking testers to clear their browser cache.

## Solution
Automatic build version checking that forces cache invalidation when a new deployment is detected, while still maintaining stable caching for performance.

## How It Works

### 1. Build-Time Version Generation (`vite-plugins/buildVersion.ts`)
- A Vite plugin generates a unique build version hash during each build
- The hash is based on `package.json` content + timestamp
- The version is injected as a `<meta>` tag into `index.html`:
  ```html
  <meta name="build-version" content="4b2309d80b21" />
  ```

### 2. Runtime Version Checking (`src/utils/versionCheck.ts`)
- On app startup, stores the current build version in `sessionStorage`
- Periodically checks (every 5 minutes) if a new version is deployed
- Also checks when user returns to the tab (visibility change)
- If mismatch detected:
  1. Clears all service worker caches
  2. Unregisters service workers
  3. Forces a hard reload from server

### 3. Integration (`src/main.tsx`)
- `initializeVersionCheck()` is called before React renders
- Runs silently in the background without affecting user experience

## Benefits

✅ **No Manual Cache Clearing**: New deployments automatically invalidate old code
✅ **Maintains Stable Caching**: PWA and browser caching still work for performance
✅ **Seamless Updates**: Users automatically get latest code without intervention
✅ **Background Checks**: Periodic polling ensures users stay up-to-date
✅ **Clean Reloads**: Service workers properly cleared before reload
✅ **Visible in UI**: Build ID shown in Settings → Support for debugging and QA verification

## User-Facing Display

The build version is displayed in **Settings → Support** tab at the bottom:

```
┌─────────────────────────────────────┐
│ App Version: 2.0.0                  │
│ Build ID: 83e76978a77d              │ ← Technical deployment hash
└─────────────────────────────────────┘
```

**Visual Hierarchy:**
- **App Version** (2.0.0) - Regular text, user-facing semantic version
- **Build ID** (83e76978a77d) - Smaller, monospace font, subtle gray color

**Benefits:**
- **QA Testing**: Testers can verify they're running the correct build
- **Support Debugging**: Users can provide their Build ID when reporting issues
- **Cache Verification**: Confirms the latest deployment was loaded successfully
- **Non-intrusive**: Subtle styling keeps it professional without cluttering the UI

The major version (2.0.0) remains the user-facing version, while the Build ID is the technical deployment hash for debugging purposes.

## Testing

### Verify Build Version Display
1. Build the app: `npm run build:web-v2`
2. Note the console output: `[BuildVersion] Generated build version: XXXXXXXX`
3. Serve the build: `npm run preview`
4. Navigate to **Settings → Support** tab
5. Verify the Build ID matches the generated version

### Simulate a New Deployment
1. Build the app: `npm run build:web-v2`
2. Note the build version in console: `[BuildVersion] Generated build version: XXXXXXXX`
3. Serve the build: `npm run preview`
4. Open DevTools → Application → Session Storage → note the `vibesapp_build_version`
5. Build again (new version will be generated)
6. Replace the deployed `index.html` with the new one
7. Wait up to 5 minutes or switch tabs to trigger version check
8. App should automatically reload with new version

### Check Console Logs
When a new version is detected, you'll see:
```
[VersionCheck] New deployment detected: 4b2309d80b21 → a3f5b9c2d4e1
[VersionCheck] Reloading to get fresh assets...
```

## Configuration

### Change Check Interval
In `src/utils/versionCheck.ts`:
```typescript
const VERSION_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes (default)
```

### Customize Version Hash
In `vite-plugins/buildVersion.ts`, modify the hash generation logic if needed.

## Deployment Workflow

The version checking works automatically with your existing deployment process:

1. **Build**: `npm run build:web-v2` → generates unique version hash
2. **Deploy**: Push to Heroku/hosting → new `index.html` with new version meta tag
3. **User Impact**: 
   - Users with open tabs will detect the change within 5 minutes
   - New users always get the latest version immediately
   - All users reload cleanly with fresh assets

## Compatibility

- ✅ Works with Vite PWA service workers
- ✅ Compatible with all browser caching strategies
- ✅ No breaking changes to existing code
- ✅ Safe to deploy to production immediately

## Notes

- Version checks are **non-blocking** - app renders normally while checking
- Uses `sessionStorage` (clears on browser close, not just tab close)
- Forces **hard reload** (`window.location.reload()`) to bypass all caches
- Console logs help with debugging in QA/production
