# QA Deployment Tracker

> **Last Updated**: November 27, 2025  
> **Current Phase**: Planning  
> **Next Action**: Copilot - Fix API Procfile

---

## Quick Status

| Phase | Status | Owner | Blocker |
|-------|--------|-------|---------|
| 1. Code Changes | 🟢 Complete | Copilot | None |
| 2. Heroku Config | 🔴 Not Started | Human | Heroku CLI setup |
| 3. Environment Vars | 🔴 Not Started | Human | QA credentials |
| 4. Database Migration | 🔴 Not Started | Human | Backend deployed |
| 5. Deployment | 🔴 Not Started | Human | All above complete |
| 6. Verification | 🔴 Not Started | Human | Deployment complete |

---

## Detailed Task Tracker

### Phase 1: Code Changes ⚙️ COPILOT

| Task | Status | Notes |
|------|--------|-------|
| Fix `apps/api/Procfile` path | 🟢 Done | Changed `server/index.js` → `src/index.js` |
| Create `apps/web-v2/static.json` | 🟢 Done | Heroku static buildpack config |
| Create `apps/web-v2/Procfile` | 🟢 Done | `web: npx serve dist -s -l $PORT` |
| Update CORS origins (if needed) | ⚪ N/A | Already has `qa.vibesapp.net` |
| Create Phase 3.4 migration script | 🟢 Done | `migratePhase3_4.js` created |

**Copilot Command**: ~~"Implement the code changes from the QA deployment plan"~~ ✅ COMPLETED

---

### Phase 2: Heroku Dashboard Configuration 👤 HUMAN

| Task | Status | Notes |
|------|--------|-------|
| Verify Heroku CLI installed | 🔴 TODO | `heroku --version` |
| Verify access to `logosil-frontend` | 🔴 TODO | `heroku apps:info -a logosil-frontend` |
| Verify access to `logosil-backend` | 🔴 TODO | `heroku apps:info -a logosil-backend` |
| Connect GitHub to `logosil-frontend` | 🔴 TODO | Deploy tab → Connect |
| Connect GitHub to `logosil-backend` | 🔴 TODO | Deploy tab → Connect |
| Set deploy branch for both | 🔴 TODO | `rebuilding-front-end` |
| Configure buildpacks | 🔴 TODO | See notes below |

**Buildpack Notes**:
- Frontend: May need `heroku-buildpack-static` or `mars/create-react-app`
- Backend: Standard `heroku/nodejs`
- Monorepo consideration: May need `heroku-buildpack-monorepo`

---

### Phase 3: Environment Variables 👤 HUMAN

#### Frontend (`logosil-frontend`)

| Variable | Status | Value Set |
|----------|--------|-----------|
| `VITE_API_URL` | 🔴 TODO | |
| `VITE_CDN_URL` | 🔴 TODO | |
| `VITE_BACKEND_API_KEY` | 🔴 TODO | |
| `VITE_GEOCODING_URL` | 🔴 TODO | |
| `VITE_ENABLE_RECAPTCHA` | 🔴 TODO | |
| `VITE_USE_SSE` | 🔴 TODO | |

#### Backend (`logosil-backend`)

| Variable | Status | Value Set |
|----------|--------|-----------|
| `MONGO_URI` | 🔴 TODO | |
| `NODE_ENV` | 🔴 TODO | |
| `API_KEY` | 🔴 TODO | |
| `ADMIN_TOKEN` | 🔴 TODO | |
| `AWS_ACCESS_KEY_ID` | 🔴 TODO | |
| `AWS_SECRET_ACCESS_KEY` | 🔴 TODO | |
| `S3_BUCKET` | 🔴 TODO | |
| `CLOUDFRONT_URL` | 🔴 TODO | |

---

### Phase 4: Database Migration 👤 HUMAN

| Script | Status | Run Date | Notes |
|--------|--------|----------|-------|
| `upgradeUsers.js` | 🔴 TODO | | |
| `upgradePosts.js` | 🔴 TODO | | |
| `addUserFieldsToPosts.js` | 🔴 TODO | | |
| `migratePhase3_4.js` | 🔴 TODO | | |

**Verification**:
```bash
# Check migration results
heroku run node -e "require('mongoose').connect(process.env.MONGO_URI).then(async () => { const User = require('./src/models/User'); console.log('Users with strikes field:', await User.countDocuments({ strikes: { \$exists: true } })); process.exit(); })" -a logosil-backend
```

---

### Phase 5: Deployment 👤 HUMAN

| Task | Status | Notes |
|------|--------|-------|
| Deploy `logosil-backend` | 🔴 TODO | |
| Verify backend health | 🔴 TODO | Check `/api/health` or logs |
| Deploy `logosil-frontend` | 🔴 TODO | |
| Verify frontend loads | 🔴 TODO | |

---

### Phase 6: Verification 👤 HUMAN

| Test | Status | Notes |
|------|--------|-------|
| Homepage loads | 🔴 TODO | |
| Login works | 🔴 TODO | |
| Feed displays | 🔴 TODO | |
| Create post | 🔴 TODO | |
| Image upload | 🔴 TODO | |
| Like/heart post | 🔴 TODO | |
| Report post | 🔴 TODO | |
| Admin panel | 🔴 TODO | |
| E2E tests pass | 🔴 TODO | `TEST_ENV=qa npm run test:e2e` |

---

## Status Legend

| Icon | Meaning |
|------|---------|
| 🔴 | Not started / TODO |
| 🟡 | In progress |
| 🟢 | Complete |
| ⚪ | Not applicable / Skipped |
| 🔵 | Blocked |

---

## Session Log

### November 27, 2025
- **Created**: QA deployment plan and tracker
- **Research**: Analyzed existing workflows, Procfiles, environment variables
- **Finding**: API Procfile has wrong path (`server/index.js` should be `src/index.js`)
- **Finding**: CORS already configured for `qa.vibesapp.net`
- **Finding**: Database migrations exist but `migratePhase3_4.js` needs creation
- **Implemented**: All Phase 1 code changes completed:
  - ✅ Fixed `apps/api/Procfile` → `web: node src/index.js`
  - ✅ Created `apps/web-v2/static.json` for Heroku static buildpack
  - ✅ Created `apps/web-v2/Procfile` → `web: npx serve dist -s -l $PORT`
  - ✅ Created `apps/api/scripts/migratePhase3_4.js`
- **Next**: Human to verify Heroku CLI setup and proceed with Phase 2

---

## Notes & Decisions

### Decision: Keep `logosil-*` names for now
- Renaming to `vibesapp-qa-*` is cleaner but not critical
- Can rename later when setting up custom domain

### Decision: Use Heroku Dashboard for deployment trigger
- Simpler than GitHub Actions workflow
- Human can trigger manually or enable auto-deploy

### Open Question: Monorepo buildpack needed?
- Heroku may struggle with monorepo structure
- May need `heroku-buildpack-monorepo` to specify app root
- Alternative: Use git subtree push for deployment

---

## Quick Commands Reference

```bash
# Check Heroku CLI
heroku --version

# Login to Heroku
heroku login

# Check app access
heroku apps:info -a logosil-frontend
heroku apps:info -a logosil-backend

# View config vars
heroku config -a logosil-frontend
heroku config -a logosil-backend

# Set config var
heroku config:set VAR_NAME=value -a app-name

# View logs
heroku logs --tail -a logosil-frontend

# Run migration
heroku run node scripts/upgradeUsers.js -a logosil-backend

# Rollback
heroku rollback -a app-name
```
