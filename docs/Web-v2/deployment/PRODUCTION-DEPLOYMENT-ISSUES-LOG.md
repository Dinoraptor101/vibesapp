# Production Deployment Issues Log

**Last Updated**: December 9, 2025  
**Purpose**: Document deployment issues and solutions to prevent recurrence

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
- [ ] Run migrations on production database first
- [ ] Backup production database
- [ ] Test build command locally: `npm run build`
- [ ] Test start command locally: `NODE_ENV=production npm start`
- [ ] Verify environment variables match between GitHub Secrets and Heroku Config Vars
- [ ] Check that Procfile exists and is correct
- [ ] Ensure package.json `start` script doesn't point to `dev`

### During Deployment
- [ ] Monitor Heroku logs: `heroku logs --tail --app vibesapp`
- [ ] Check build output for errors
- [ ] Verify dyno starts: `heroku ps --app vibesapp`
- [ ] Test API health endpoint: `curl https://api.vibesapp.net/api/health`

### Post-Deployment
- [ ] Test with real production user credentials
- [ ] Verify posts display with usernames
- [ ] Check that images load (CDN)
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

---

## Future Improvements

1. **Add database schema validation tests** to CI/CD
2. **Create staging environment** that mirrors production exactly
3. **Automate field name validation** (detect camelCase vs lowercase mismatches)
4. **Add pre-deployment smoke tests** that run against production-like data
5. **Document all field transformations** in a central location
6. **Consider separate Heroku apps** for API and frontend to simplify monorepo issues
