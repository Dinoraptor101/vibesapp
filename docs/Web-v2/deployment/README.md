# QA Deployment Documentation

> **Status**: ✅ DEPLOYED (November 27, 2025)

## Live Environment

| Component | Platform | URL |
|-----------|----------|-----|
| **Frontend** | Vercel | https://qa.vibesapp.net |
| **Backend** | Heroku | https://logosil-backend-a8355253628c.herokuapp.com |
| **Database** | MongoDB Atlas | QA cluster |

## Architecture

```
┌─────────────────────┐         ┌─────────────────────┐
│       Vercel        │   API   │       Heroku        │
│   (Static Files)    │ ──────► │    (Node.js API)    │
│  qa.vibesapp.net    │   SSE   │  logosil-backend    │
└─────────────────────┘         └─────────────────────┘
                                          │
                                          ▼
                                ┌─────────────────────┐
                                │   MongoDB Atlas     │
                                │    (QA Cluster)     │
                                └─────────────────────┘
```

## Deployment Process

### Quick Deployment (Recommended)

Use the npm scripts from the repository root:

```bash
# Deploy both frontend and backend to QA
npm run deploy:qa

# Deploy only backend
npm run deploy:qa:api

# Deploy only frontend (builds automatically)
npm run deploy:qa:web

# Build frontend without deploying
npm run build:qa:web
```

### Manual Frontend Deployment (Vercel)

The frontend is pre-built locally and deployed as static files to Vercel.

```bash
# 1. Build with production environment variables
cd apps/web-v2
VITE_API_URL=https://logosil-backend-a8355253628c.herokuapp.com/api \
VITE_CDN_URL=https://d1pegm4swremw5.cloudfront.net \
VITE_BACKEND_API_KEY=<your-api-key> \
VITE_S3_BUCKET=logosil-image-host \
VITE_S3_REGION=us-east-2 \
VITE_ENABLE_RECAPTCHA=false \
VITE_USE_SSE=true \
npm run build

# 2. Deploy to Vercel
cd dist && vercel --prod
```

**Why Vercel?**
- Monorepo-friendly (no buildpack complexity)
- Free tier for static sites
- Automatic SSL
- Fast global CDN

### Manual Backend Deployment (Heroku)

The backend deploys from the `rebuilding-front-end` branch using the monorepo buildpack.

```bash
# Deploy backend
git push https://git.heroku.com/logosil-backend.git rebuilding-front-end:main --force
```

**Buildpacks:**
1. `https://github.com/lstoll/heroku-buildpack-monorepo` (copies `apps/api` to root)
2. `heroku/nodejs`

**Config Vars:**
- `APP_BASE=apps/api`
- `NODE_ENV=production`
- `MONGO_URI`, `AWS_*`, `API_KEY`, etc.

## Environment Variables

### Frontend (Build-time)

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://logosil-backend-a8355253628c.herokuapp.com/api` |
| `VITE_CDN_URL` | `https://d1pegm4swremw5.cloudfront.net` |
| `VITE_BACKEND_API_KEY` | (set at build time) |
| `VITE_S3_BUCKET` | `logosil-image-host` |
| `VITE_S3_REGION` | `us-east-2` |
| `VITE_ENABLE_RECAPTCHA` | `false` |
| `VITE_USE_SSE` | `true` |

### Backend (Heroku Config Vars)

| Variable | Description |
|----------|-------------|
| `APP_BASE` | `apps/api` |
| `NODE_ENV` | `production` |
| `MONGO_URI` | MongoDB Atlas connection string |
| `AWS_ACCESS_KEY_ID` | S3 access key |
| `AWS_SECRET_ACCESS_KEY` | S3 secret key |
| `AWS_REGION` | `us-east-2` |
| `AWS_S3_BUCKET` | `logosil-image-host` |
| `API_KEY` | Backend API key |
| `ADMIN_PASSWORD` | Admin panel password |
| `FRONTEND_URL` | `https://qa.vibesapp.net` |

## DNS Configuration

| Domain | Type | Value | Provider |
|--------|------|-------|----------|
| `qa.vibesapp.net` | A | `76.76.21.21` | GoDaddy → Vercel |

## CORS Configuration

The backend (`apps/api/src/index.js`) allows these origins:
- `https://vibesapp.net` (production)
- `https://qa.vibesapp.net` (QA)
- `https://dist-gamma-cyan.vercel.app` (Vercel default)

## Legacy Files

The following files in this directory were created for the original Heroku-based deployment plan and are now outdated:

| File | Status |
|------|--------|
| `QA-DEPLOYMENT-PLAN.md` | Outdated (was for dual-Heroku setup) |
| `QA-DEPLOYMENT-TRACKER.md` | Outdated |
| `QA-DEPLOYMENT-PROMPT.md` | Outdated |

## Related Documentation

- [Production Deployment Guide](../../Web-V1/13-production-deployment.md)
- [SSE Implementation](../../../apps/api/SSE-IMPLEMENTATION-SUMMARY.md)
