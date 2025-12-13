# Production Deployment Issues Log

**Last Updated**: December 11, 2025  
**Purpose**: Document deployment issues and solutions to prevent recurrence

---

## Issue #5: GitHub Pages SPA Routing - 404 Errors on Direct Route Access

**Date**: December 11, 2025  
**Severity**: 🔴 Critical - Users unable to access deep routes after page refresh or direct navigation  
**Reported By**: User reports of landing on 404 after minimizing app for 10+ minutes

### Root Cause
- VibesApp is a Single Page Application (SPA) using client-side routing
- GitHub Pages serves static files only - no server-side routing support
- Direct navigation to routes like `/settings` returns GitHub's 404 page
- GitHub Pages ignores `vercel.json` rewrites configuration
- `static.json` is only for Heroku static buildpack, not GitHub Pages
- After device sleep or app minimize, browser may attempt to reload current route

### Symptoms
```
GET https://vibesapp.net/settings 404 (Not Found)
GET https://vibesapp.net/activity 404 (Not Found)
GET https://vibesapp.net/messages 404 (Not Found)
```

Additional error in console:
```
Loading the font 'https://r2cdn.perplexity.ai/fonts/FKGroteskNeue.woff2' violates CSP directive
```
This is unrelated - likely a browser extension injecting code. GitHub Pages applies strict CSP.

### Solution: 404.html SPA Redirect Workaround
GitHub Pages has a documented workaround for SPAs: create a `404.html` that captures the path and redirects to `index.html`, where React Router handles the actual routing.

**Implementation**:

1. **Created `apps/web-v2/public/404.html`**:
   - Captures attempted path from URL
   - Stores path in `sessionStorage` 
   - Redirects to root (`/`)
   - Provides ZEN-aligned UI during redirect (spiritual presence, not mechanical "loading")

2. **Updated Router** (`apps/web-v2/src/app/Router.tsx`):
   - Added `GitHubPagesRedirectHandler` component
   - Checks `sessionStorage` on app mount
   - Restores original path using React Router `navigate()`
   - Clears storage to prevent redirect loops

**ZEN Philosophy Alignment**:
The 404.html follows VibesApp's spiritual design principles:
- Brand gradient background (presence)
- Gentle breathing animation (mindfulness)
- Reassuring message: "You're right where you need to be"
- ✨ sparkle emoji (hope, not error)
- System font for instant render (no font loading)

### Code Changes

**apps/web-v2/public/404.html** (new file):
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <title>VibesApp - Reconnecting...</title>
    <style>
      /* Brand gradient, breathing animation, mobile-first */
      body {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        /* ... ZEN-aligned styling ... */
      }
    </style>
    <script>
      const path = window.location.pathname.slice(1);
      if (path) {
        sessionStorage.setItem('redirectPath', path + window.location.search);
      }
      window.location.replace('/');
    </script>
  </head>
  <body>
    <div class="container">
      <h1>✨</h1>
      <p class="breathe">Reconnecting you...</p>
      <p>You're right where you need to be.</p>
    </div>
  </body>
</html>
```

**apps/web-v2/src/app/Router.tsx**:
```typescript
function GitHubPagesRedirectHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/') {
      const redirectPath = sessionStorage.getItem('redirectPath');
      if (redirectPath) {
        sessionStorage.removeItem('redirectPath');
        navigate('/' + redirectPath, { replace: true });
      }
    }
  }, [navigate, location.pathname]);

  return null;
}

export function Router() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <GitHubPagesRedirectHandler />
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  );
}
```

### Testing
```bash
# After deployment, test these routes directly:
https://vibesapp.net/settings      # Should redirect to settings page
https://vibesapp.net/activity      # Should redirect to activity page  
https://vibesapp.net/messages      # Should redirect to messages page
https://vibesapp.net/post/12345    # Should redirect to specific post
```

All routes should show the branded "Reconnecting..." screen briefly, then load the correct page.

### References
- [GitHub Pages SPA workaround documentation](https://github.com/rafgraph/spa-github-pages)
- VibesApp Content Design Standards: ZEN Philosophy

---

## Issue #1: userName vs username Field Name Mismatch

**Date**: December 9, 2025  
**Severity**: 🔴 Critical - Users couldn't see their posts  
**Discovered By**: Kitsune (production user)

### Root Cause
- Database stores `userName` (camelCase) in embedded `post.user` objects
- User model has `toJSON`/`toObject` transforms that convert `userName` → `username` for standalone user responses
- Posts contain embedded raw user data that bypass the User model serializer
- Frontend expects `username` (lowercase) per type definitions
- Result: Posts displayed without usernames, appearing broken

### Technical Details
```javascript
// Database has:
{ user: { userName: "Kitsune", userId: "..." } }

// User model transforms standalone user objects:
UserSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.username = ret.userName;
    delete ret.userName;
  }
});

// But posts with embedded user data bypass this transform
// Frontend expects: user.username
// API was returning: user.userName
```

### Solution
Added field normalization in `postTransformer.js`:
```javascript
// apps/api/src/utils/postTransformer.js
const user = postObj.user ? {
  ...postObj.user,
  username: postObj.user.username || postObj.user.userName,
} : postObj.user;

if (user && user.userName) {
  delete user.userName;
}
```

### Prevention
1. **Always normalize embedded user data** - Any embedded user objects must go through field name transformation
2. **Add migration verification** - When running migrations, verify both database fields AND API response format
3. **Test with actual production data** - Use production pigeonIds in QA to catch schema mismatches
4. **Document field transformations** - Clearly note which fields get renamed in serialization

### Related Files
- `apps/api/src/utils/postTransformer.js` (fix applied)
- `apps/api/src/models/User.js` (has toJSON/toObject transforms)
- `apps/web-v2/src/types/index.ts` (frontend type definitions)

---

## Issue #2: Heroku Running Dev Script Instead of Production Start

**Date**: December 9, 2025  
**Severity**: 🔴 Critical - App crashed on deployment  
**Error**: `nodemon: not found`, `@vitejs/plugin-react: not found`

### Root Cause
- Root `package.json` has `"start": "npm run dev"` which runs development mode
- Development dependencies (nodemon, vite plugins) are not installed in production (Heroku prunes devDependencies)
- Heroku prioritizes `npm start` over Procfile when a start script exists
- The `dev` script uses `concurrently` to run both frontend (vite) and backend (nodemon) - not appropriate for production

### Technical Details
```json
// package.json (root)
{
  "scripts": {
    "dev": "concurrently \"npm run start:api\" \"npm run start:web-v2\"",
    "start": "npm run dev",  // ❌ Points to dev mode!
    "start:api": "cd apps/api && npm run dev",  // ❌ Uses nodemon
    "start:web-v2": "cd apps/web-v2 && npm run dev"  // ❌ Uses vite dev server
  }
}

// apps/api/Procfile (correct but ignored)
web: node src/index.js  // ✅ Correct production command
```

### Solution
**Option A**: Remove `start` script from root package.json (let Procfile handle it)
**Option B**: Change root start script to production mode:
```json
{
  "scripts": {
    "start": "cd apps/api && node src/index.js"
  }
}
```

### Prevention
1. **Separate dev and prod scripts clearly**
   ```json
   {
     "dev": "development command",
     "start": "production command",  // Never point to dev!
     "start:prod": "explicit production command"
   }
   ```

2. **Test deployment locally** before pushing to Heroku:
   ```bash
   # Simulate Heroku environment
   NODE_ENV=production npm prune
   npm start
   ```

3. **Procfile should be single source of truth**
   - Either use Procfile OR package.json start script, not both
   - Document which one is used

4. **Check Heroku logs immediately** after deployment:
   ```bash
   heroku logs --tail --app vibesapp
   heroku ps --app vibesapp  # Check dyno status
   ```

### Related Files
- `package.json` (root - needs fix)
- `apps/api/Procfile` (correct)
- `apps/api/package.json` (has correct start script)

---

## Issue #3: NX Build Command Breaking Heroku Deployment

**Date**: December 9, 2025  
**Severity**: 🔴 Critical - Build failed  
**Error**: `Cannot find project 'api'`

### Root Cause
- Root `package.json` had `"build": "nx build api"`
- Heroku runs `npm run build` during deployment
- NX couldn't find the 'api' project (likely due to monorepo configuration or missing nx.json setup)
- Backend doesn't need a build step (it's plain Node.js, not TypeScript)

### Solution
Changed root package.json:
```json
{
  "scripts": {
    "build": "echo 'No build step required for Node.js backend'"
  }
}
```

### Prevention
1. **Backend build script should be no-op** for plain Node.js projects
2. **Test build command locally** before deployment
3. **Document which apps need builds**:
   - Frontend (web-v2): Needs Vite build → static files
   - Backend (api): No build needed → runs directly with Node
4. **Consider separate Heroku apps** for frontend vs backend if monorepo causes issues

### Related Files
- `package.json` (root - fixed)
- `nx.json` (NX configuration)

---

## Deployment Checklist

### Pre-Deployment
- [x] Run migrations on production database first
- [x] Backup production database
- [x] Test build command locally: `npm run build`
- [x] Test start command locally: `NODE_ENV=production npm start`
- [x] Verify environment variables match between GitHub Secrets and Heroku Config Vars
- [x] Check that Procfile exists and is correct
- [x] Ensure package.json `start` script doesn't point to `dev`

### During Deployment
- [x] Monitor Heroku logs: `heroku logs --tail --app vibesapp`
- [x] Check build output for errors
- [x] Verify dyno starts: `heroku ps --app vibesapp`
- [x] Test API health endpoint: `curl https://api.vibesapp.net/api/health`

### Post-Deployment
- [x] Test with real production user credentials
- [x] Verify posts display with usernames
- [x] Check that images load (CDN) (user badge did not load, ? appears on feed.)
- [ ] Test messaging works
- [ ] Verify SSE connections establish
- [ ] Check admin panel functions
- [ ] Monitor error rates in logs

### Rollback Plan
If deployment fails:
```bash
# Rollback Heroku release
heroku rollback --app vibesapp

# Or rollback to specific version
heroku releases --app vibesapp
heroku rollback v88 --app vibesapp

# Restore database if needed
mongorestore --uri="<prod-uri>" --drop backup-YYYYMMDD/
```

---

## Production Environment Validation

### Database Schema Validation
After migrations, always verify:
```javascript
// Check Users have required V2 fields
db.users.findOne({}, {
  userName: 1,
  birthYear: 1,
  mbtiPersonality: 1,
  polarity: 1,
  strikes: 1
})

// Check Posts have embedded user fields with correct names
db.posts.findOne({}, {
  'user.userName': 1,
  'user.profilePictureUrl': 1,
  'user.mbtiPersonality': 1,
  reports: 1
})
```

### API Response Validation
```bash
# Test that API returns username (not userName)
curl -s "https://api.vibesapp.net/api/posts?limit=1" \
  -H "x-api-key: $API_KEY" \
  -H "x-pigeon-id: $TEST_PIGEON_ID" | \
  jq '.posts[0].user | has("username")'  # Should return: true

# Verify user profile returns username
curl -s "https://api.vibesapp.net/api/users/$USER_ID" \
  -H "x-api-key: $API_KEY" | \
  jq 'has("username")'  # Should return: true
```

---

## Known Gotchas

1. **Field Name Inconsistencies**
   - Database uses camelCase: `userName`, `profilePictureUrl`
   - Frontend expects lowercase: `username`, `profilePictureUrl`
   - User model transforms standalone responses
   - Embedded data in Posts/Activities needs manual transformation

2. **Heroku npm Start Priority**
   - Heroku prefers `npm start` over Procfile if start script exists
   - Start script must never point to development mode
   - Either use Procfile OR start script, document which

3. **Monorepo Build Complexity**
   - Root package.json affects Heroku build
   - NX commands may not work in Heroku environment
   - Keep builds simple: no NX, just direct commands

4. **Environment Variable Naming**
   - Frontend: `VITE_*` prefix (embedded at build time)
   - Backend: No prefix (runtime access via `process.env`)
   - Must match exactly between GitHub Secrets and Heroku Config

5. **Migration Completeness**
   - Running migration script ≠ verifying it worked
   - Always query database after migration to confirm
   - Check API responses, not just database fields

6. **GitHub Pages Custom Domain Gets Cleared**
   - `gh-pages` deploys wipe the custom domain setting unless `CNAME` file exists
   - Solution: Add `CNAME` file containing `vibesapp.net` to `apps/web-v2/public/`
   - This gets copied to `dist/` during build and preserves custom domain

7. **GitHub Pages Deployment Cannot Use GitHub CLI**
   - GitHub CLI (`gh`) cannot push to `gh-pages` branch directly
   - Must use `npx gh-pages -d apps/web-v2/dist` (the npm package, not GitHub CLI)
   - The `gh-pages` npm package handles orphan branch creation and force-push

8. **Vite Base Path for GitHub Pages**
   - With custom domain (`vibesapp.net`): use default base `/`
   - Without custom domain (using `username.github.io/repo`): use `--base=/repo/`
   - Build command: `npm run build` (default) or `npx vite build --base=/vibesapp/`

9. **GitHub Pages SPA Routing Requires 404.html Workaround**
   - GitHub Pages serves static files - no server-side routing
   - Direct access to routes like `/settings` returns actual 404
   - Solution: `404.html` that redirects to root with path stored in sessionStorage
   - React Router restores path on app mount
   - File must be in `public/` folder to be copied to `dist/` during build

---

## Future Improvements

1. **Add database schema validation tests** to CI/CD
2. **Create staging environment** that mirrors production exactly
3. **Automate field name validation** (detect camelCase vs lowercase mismatches)
4. **Add pre-deployment smoke tests** that run against production-like data
5. **Document all field transformations** in a central location
6. **Consider separate Heroku apps** for API and frontend to simplify monorepo issues
