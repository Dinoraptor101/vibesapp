# QA Deployment Plan: Web V2 to logosil Dynos

> **Target Environment**: QA (qa.vibesapp.net)  
> **Heroku Apps**: `logosil-frontend`, `logosil-backend`  
> **Source Branch**: `rebuilding-front-end`  
> **Created**: November 27, 2025

---

## Overview

This plan deploys the Web V2 frontend (Vite + React) and updated backend (Node.js + Express) to the QA Heroku environment. The production environment remains unchanged (GitHub Pages + Heroku API).

### Architecture Comparison

| Component | Production | QA |
|-----------|-----------|-----|
| **Frontend** | GitHub Pages (`vibesapp.net`) | Heroku (`logosil-frontend`) |
| **Backend** | Heroku (`vibesapp-api`) | Heroku (`logosil-backend`) |
| **Database** | MongoDB Atlas (production) | MongoDB Atlas (QA/test) |
| **CDN** | CloudFront (shared) | CloudFront (shared) |

---

## Pre-Deployment Checklist

### Prerequisites
- [ ] Heroku CLI installed and authenticated (`heroku login`)
- [ ] Access to `logosil-frontend` and `logosil-backend` Heroku apps
- [ ] Access to QA MongoDB Atlas cluster
- [ ] Environment variables documented (see [Environment Variables](#environment-variables))

---

## Deployment Steps

### Step 1: Fix API Procfile ⚙️ COPILOT

**Status**: 🔴 Not Started  
**Owner**: Copilot (automated)

The current API Procfile has an incorrect path:
```
# Current (WRONG)
web: node server/index.js

# Correct
web: node src/index.js
```

**Action**: Update `apps/api/Procfile`

---

### Step 2: Create Frontend Static Hosting Config ⚙️ COPILOT

**Status**: 🔴 Not Started  
**Owner**: Copilot (automated)

Create Heroku static buildpack configuration for SPA routing.

**Files to Create**:
- `apps/web-v2/static.json` - Heroku static buildpack config
- `apps/web-v2/Procfile` - Optional, for serve-based hosting

**static.json content**:
```json
{
  "root": "dist",
  "clean_urls": true,
  "routes": {
    "/**": "index.html"
  },
  "headers": {
    "/**": {
      "Cache-Control": "public, max-age=0, must-revalidate"
    },
    "/assets/**": {
      "Cache-Control": "public, max-age=31536000, immutable"
    }
  }
}
```

---

### Step 3: Update CORS Origins ⚙️ COPILOT

**Status**: 🔴 Not Started  
**Owner**: Copilot (automated)

Add Heroku app URL to CORS whitelist if using default Heroku domain.

**File**: `apps/api/src/index.js`

**Current CORS origins** (already includes `qa.vibesapp.net`):
```javascript
corsOptions.origin = [
  'https://vibesapp.net',
  'https://api.vibesapp.net',
  'https://qa.vibesapp.net',      // ✅ Already present
  'https://api-qa.vibesapp.net',  // ✅ Already present
  'https://dinoraptor101.github.io',
];
```

**If using default Heroku URLs**, add:
```javascript
'https://logosil-frontend-xxxx.herokuapp.com',
```

---

### Step 4: Configure Heroku Dashboard Deployment 👤 HUMAN

**Status**: 🔴 Not Started  
**Owner**: Human (manual)

Connect GitHub repo to Heroku apps for automatic deployment.

#### For `logosil-frontend`:
1. Go to Heroku Dashboard → `logosil-frontend`
2. Navigate to **Deploy** tab
3. Connect to GitHub repo: `Dinoraptor101/vibesapp`
4. Set deploy branch: `rebuilding-front-end` (or `main` after merge)
5. Enable **Automatic Deploys** (optional)
6. Set buildpack: `heroku/nodejs` (for build) + consider `heroku-buildpack-static` for serving

#### For `logosil-backend`:
1. Go to Heroku Dashboard → `logosil-backend`
2. Navigate to **Deploy** tab
3. Connect to GitHub repo: `Dinoraptor101/vibesapp`
4. Set deploy branch: `rebuilding-front-end`
5. Set **App root**: `apps/api` (if supported) or use monorepo buildpack
6. Enable **Automatic Deploys** (optional)

---

### Step 5: Upload Environment Variables 👤 HUMAN

**Status**: 🔴 Not Started  
**Owner**: Human (manual)

Configure environment variables via Heroku Dashboard or CLI.

#### Option A: Heroku Dashboard
1. Go to **Settings** → **Config Vars** → **Reveal Config Vars**
2. Add each variable manually

#### Option B: Heroku CLI (Recommended)
```bash
# Frontend (logosil-frontend)
heroku config:set VITE_API_URL=https://api-qa.vibesapp.net -a logosil-frontend
heroku config:set VITE_CDN_URL=https://your-cloudfront-url.cloudfront.net -a logosil-frontend
heroku config:set VITE_BACKEND_API_KEY=your-qa-api-key -a logosil-frontend
heroku config:set VITE_GEOCODING_URL=https://api.bigdatacloud.net/data/reverse-geocode-client -a logosil-frontend
heroku config:set VITE_ENABLE_RECAPTCHA=false -a logosil-frontend
heroku config:set VITE_USE_SSE=false -a logosil-frontend

# Backend (logosil-backend)
heroku config:set MONGO_URI=mongodb+srv://...qa-cluster... -a logosil-backend
heroku config:set NODE_ENV=production -a logosil-backend
heroku config:set API_KEY=your-qa-api-key -a logosil-backend
heroku config:set ADMIN_TOKEN=your-admin-token -a logosil-backend
# Add other backend vars as needed
```

See [Environment Variables](#environment-variables) section for complete list.

---

### Step 6: Run Database Migrations 👤 HUMAN (with Copilot scripts)

**Status**: 🔴 Not Started  
**Owner**: Human (executes Copilot-created scripts)

Run migration scripts against QA MongoDB.

#### Option A: Local Execution
```bash
# Set QA MongoDB URI
export MONGO_URI="mongodb+srv://...qa-cluster..."

# Run migrations in order
cd apps/api
node scripts/upgradeUsers.js
node scripts/upgradePosts.js
node scripts/addUserFieldsToPosts.js
```

#### Option B: Heroku CLI
```bash
# Run on Heroku dyno
heroku run node scripts/upgradeUsers.js -a logosil-backend
heroku run node scripts/upgradePosts.js -a logosil-backend
heroku run node scripts/addUserFieldsToPosts.js -a logosil-backend
```

#### Phase 3.4 Migration (if not already run)
```bash
# Create and run Phase 3.4 migration
heroku run node scripts/migratePhase3_4.js -a logosil-backend
```

---

### Step 7: Deploy and Verify 👤 HUMAN

**Status**: 🔴 Not Started  
**Owner**: Human (manual)

1. **Trigger Deploy**:
   - Push to `rebuilding-front-end` branch, OR
   - Click "Deploy Branch" in Heroku Dashboard

2. **Monitor Build Logs**:
   ```bash
   heroku logs --tail -a logosil-frontend
   heroku logs --tail -a logosil-backend
   ```

3. **Verify Deployment**:
   - [ ] Frontend loads at Heroku URL
   - [ ] Login flow works
   - [ ] API calls succeed (check Network tab)
   - [ ] Images load from CDN
   - [ ] Create/view posts works

---

## Environment Variables

### Frontend (`logosil-frontend`)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_API_URL` | ✅ Yes | Backend API endpoint | `https://api-qa.vibesapp.net` |
| `VITE_CDN_URL` | ✅ Yes | CloudFront CDN URL | `https://xxx.cloudfront.net` |
| `VITE_BACKEND_API_KEY` | ✅ Yes | API authentication key | `qa-api-key-xxx` |
| `VITE_GEOCODING_URL` | ✅ Yes | Reverse geocoding API | `https://api.bigdatacloud.net/...` |
| `VITE_ENABLE_RECAPTCHA` | Optional | Enable ReCAPTCHA v3 | `true` or `false` |
| `VITE_RECAPTCHA_SITE_KEY` | Optional | ReCAPTCHA site key | `6Lexxxxx` |
| `VITE_USE_SSE` | Optional | Enable Server-Sent Events | `true` or `false` |

### Backend (`logosil-backend`)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `MONGO_URI` | ✅ Yes | MongoDB connection string | `mongodb+srv://...` |
| `NODE_ENV` | ✅ Yes | Environment mode | `production` |
| `PORT` | Auto | Heroku sets this | `5001` |
| `API_KEY` | ✅ Yes | API authentication key | `qa-api-key-xxx` |
| `ADMIN_TOKEN` | ✅ Yes | Admin authentication | `admin-token-xxx` |
| `AWS_ACCESS_KEY_ID` | ✅ Yes | S3 access key | `AKIA...` |
| `AWS_SECRET_ACCESS_KEY` | ✅ Yes | S3 secret key | `xxx` |
| `S3_BUCKET` | ✅ Yes | S3 bucket name | `vibesapp-uploads` |
| `CLOUDFRONT_URL` | ✅ Yes | CDN base URL | `https://xxx.cloudfront.net` |

---

## Database Migration Scripts

| Script | Purpose | Idempotent | Notes |
|--------|---------|------------|-------|
| `upgradeUsers.js` | Convert `age` → `birthYear`, add `polarity`, `mbtiPersonality` | ✅ Yes | Only updates users missing fields |
| `upgradePosts.js` | Same field updates for embedded user in posts | ✅ Yes | Only updates posts missing fields |
| `addUserFieldsToPosts.js` | Add `profilePictureUrl`, `mbtiPersonality` to posts | ✅ Yes | Looks up current user data |
| `migratePhase3_4.js` | Add `reports[]`, `strikes[]` arrays | ✅ Yes | Safe to run multiple times |

**Important**: All scripts are idempotent (safe to run multiple times). They only update documents missing the new fields.

---

## Rollback Plan

### Frontend Rollback
```bash
# Rollback to previous release
heroku rollback -a logosil-frontend
```

### Backend Rollback
```bash
# Rollback to previous release
heroku rollback -a logosil-backend
```

### Database Rollback
Database migrations are additive and don't remove existing fields. No rollback needed unless schema changes cause issues.

---

## Post-Deployment Verification

### Smoke Tests
- [ ] Homepage loads
- [ ] User can log in
- [ ] User can view feed
- [ ] User can create post with image
- [ ] User can like/heart posts
- [ ] User can report posts
- [ ] Admin can access admin panel
- [ ] Real-time updates work (if SSE enabled)

### E2E Tests
```bash
# Run Playwright against QA
TEST_ENV=qa npm run test:e2e
```

---

## Future Considerations

### App Renaming
Current names (`logosil-*`) could be renamed to `vibesapp-qa-*` for clarity:
```bash
heroku apps:rename vibesapp-qa-frontend --app logosil-frontend
heroku apps:rename vibesapp-qa-backend --app logosil-backend
```

**Note**: This changes Heroku URLs. Update DNS/CORS if using custom domains.

### Custom Domain Setup
To use `qa.vibesapp.net`:
```bash
heroku domains:add qa.vibesapp.net -a logosil-frontend
heroku domains:add api-qa.vibesapp.net -a logosil-backend
```

Then configure DNS CNAME records pointing to Heroku DNS targets.

---

## Related Documents

- [Deployment Tracker](./QA-DEPLOYMENT-TRACKER.md) - Status tracking
- [Copilot Prompt](./QA-DEPLOYMENT-PROMPT.md) - Machine-readable instructions
- [Phase 3.4 Implementation Log](../development-log/PHASE-3.4-IMPLEMENTATION-LOG.md) - Backend changes
- [Production Deployment Guide](../../Web-V1/13-production-deployment.md) - Legacy reference
