# QA Deployment Documentation

This directory contains the deployment plan, tracker, and machine-readable instructions for deploying Web V2 to the QA environment.

## Files

| File | Purpose | Audience |
|------|---------|----------|
| [QA-DEPLOYMENT-PLAN.md](./QA-DEPLOYMENT-PLAN.md) | Complete deployment plan with step-by-step instructions | Human |
| [QA-DEPLOYMENT-TRACKER.md](./QA-DEPLOYMENT-TRACKER.md) | Status tracker for all tasks | Human |
| [QA-DEPLOYMENT-PROMPT.md](./QA-DEPLOYMENT-PROMPT.md) | Machine-readable instructions for Copilot | Copilot |

## Quick Start

### For Humans

1. Read [QA-DEPLOYMENT-PLAN.md](./QA-DEPLOYMENT-PLAN.md) for the full plan
2. Use [QA-DEPLOYMENT-TRACKER.md](./QA-DEPLOYMENT-TRACKER.md) to track progress
3. Complete tasks marked 👤 HUMAN manually

### For Copilot

Use this prompt to execute code changes:

> "Implement the QA deployment code changes from docs/Web-V2/deployment/QA-DEPLOYMENT-PROMPT.md"

## Task Distribution

### Copilot Can Do ⚙️

- Fix `apps/api/Procfile` path
- Create `apps/web-v2/static.json`
- Create `apps/web-v2/Procfile` (optional)
- Create `apps/api/scripts/migratePhase3_4.js`
- Update CORS origins if needed

### Human Must Do 👤

- Verify Heroku CLI installed and authenticated
- Configure Heroku Dashboard (connect GitHub, set branch)
- Upload environment variables to Heroku config vars
- Execute database migration scripts
- Trigger deployment
- Verify deployment success
- Run smoke tests / E2E tests

## Target Environment

| Component | Value |
|-----------|-------|
| Frontend Heroku App | `logosil-frontend` |
| Backend Heroku App | `logosil-backend` |
| Source Branch | `rebuilding-front-end` |
| Frontend URL | `https://qa.vibesapp.net` (or Heroku default) |
| Backend URL | `https://api-qa.vibesapp.net` (or Heroku default) |
| Database | MongoDB Atlas (QA cluster) |

## Related Documentation

- [Phase 3.4 Implementation Log](../development-log/PHASE-3.4-IMPLEMENTATION-LOG.md)
- [Production Deployment Guide](../../Web-V1/13-production-deployment.md)
- [SSE Implementation](../../../apps/api/SSE-IMPLEMENTATION-SUMMARY.md)
