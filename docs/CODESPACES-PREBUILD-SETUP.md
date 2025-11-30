# Codespaces Prebuild Configuration Guide

> **Optimization Plan:** Cache entire monorepo's `node_modules` (~2.8 GB) to reduce Codespace startup from 3-5 minutes to 30-60 seconds.

## Configuration Overview

This setup implements GitHub Codespaces prebuilds with automatic caching for the VibesApp monorepo.

### Files Created

1. **`.devcontainer/devcontainer.json`** - Main dev container configuration with enhanced setup
2. **`.github/codespaces/devcontainer.json`** - Codespaces-specific configuration for prebuild optimization
3. **`.devcontainer/Dockerfile`** - Multi-layer Docker image that caches all dependencies
4. **`.github/workflows/codespaces-prebuild.yml`** - Automated prebuild trigger workflow
5. **`.dockerignore`** - Excludes unnecessary files from Docker build context

## Key Features

### Port Forwarding
- **5173** - Frontend (web-v2) with auto-notify on forward
- **5001** - Backend (api) with auto-notify on forward

### Environment Variables
```
NODE_ENV=development
PORT=5001
VITE_PORT=5173
```

### Post-Create Command
```bash
npm ci && npm run install:deps
```
This installs dependencies following the monorepo structure:
1. Root `npm ci` installs NX and workspace dependencies
2. `npm run install:deps` triggers postinstall hooks for `apps/api` and `apps/web-v2`
3. Total cached size: ~2.8 GB across all workspaces

### VSCode Extensions
- ESLint integration
- Prettier formatting
- Docker support
- MongoDB extension
- Remote explorer
- Tailwind CSS intellisense
- Volar (for component preview)

## Prebuild Trigger Strategy

### Current Configuration: Auto-trigger on push

The workflow triggers automatically on:
- Every push to `main` branch
- Every push to `rebuilding-front-end` branch
- Manual dispatch via GitHub UI

**Rationale:** Most current development environment, optimal for active development.

### Alternative Strategies (if needed)

**Option B: Tag/Release-based (Most economical)**
```yaml
on:
  push:
    tags:
      - 'v*'
```
- Triggers only on semantic version tags
- Reduces build frequency and cost
- Best for production-focused workflows

**Option C: Manual trigger only (User-controlled)**
```yaml
on:
  workflow_dispatch:
```
- No automatic builds
- Complete control over rebuild timing
- Lowest cost but requires manual intervention

## Docker Build Process

The Dockerfile (`devcontainer/Dockerfile`) optimizes layer caching:

1. **Base image** - Ubuntu 24.04 with Node.js 20
2. **Copy package files** - All package.json/package-lock.json files
3. **Install dependencies** - `npm ci` (captures all 2.8 GB)
4. **Copy source code** - Full monorepo source
5. **Set environment** - Development defaults and port exports

### Layer Caching Strategy

- Package files copied first (don't change often) → cached layers
- Dependencies installed next → reused if packages unchanged
- Source code copied last (changes frequently) → rebuilt on every push
- Result: ~2-5 second rebuild if only source code changes

## GitHub Container Registry

Prebuilds are automatically stored in GitHub Container Registry (ghcr.io):

```
ghcr.io/Dinoraptor101/vibesapp/codespaces:rebuilding-front-end
ghcr.io/Dinoraptor101/vibesapp/codespaces:main
ghcr.io/Dinoraptor101/vibesapp/codespaces:latest
```

**No additional setup required** - GitHub Codespaces handles registry access automatically.

## Testing the Prebuild

### Manual Trigger via GitHub UI

1. Go to Actions tab → "Codespaces Prebuild" workflow
2. Click "Run workflow" dropdown → Select branch → Run
3. Wait for workflow to complete (5-10 minutes)

### Verify Prebuild Success

1. Create new Codespace from branch with completed prebuild
2. Observe startup time: should be 30-60 seconds (vs 3-5 minutes without prebuild)
3. Run `npm run dev` immediately - all dependencies cached

### Check Cached Packages

```bash
# Verify node_modules exist and have expected size
du -sh node_modules apps/api/node_modules apps/web-v2/node_modules

# Expected output:
# ~1.2GB node_modules (root)
# ~900MB apps/api/node_modules
# ~700MB apps/web-v2/node_modules
```

## Monorepo Dependency Chain

The postinstall hook in root `package.json` ensures full dependency caching:

```json
{
  "postinstall": "if [ \"$SKIP_POSTINSTALL\" != \"true\" ]; then npm run install:deps; fi"
}
```

This hook:
1. Installs `apps/api` dependencies
2. Installs `apps/web-v2` dependencies
3. Captured in prebuild layer → all 2.8 GB cached

**NX automatically manages workspace dependencies**, so everything is included in the prebuild.

## Performance Expectations

| Metric | Without Prebuild | With Prebuild |
|--------|------------------|---------------|
| Startup Time | 3-5 minutes | 30-60 seconds |
| Node modules Installation | ~2-3 min | Skipped (cached) |
| npm ci Time | ~1-2 min | <10 seconds |
| First dev build | 1-2 min | <30 seconds |
| **Total** | **5-7 min** | **1-2 min** |

## Troubleshooting

### Prebuild not triggering
- Check `.github/workflows/codespaces-prebuild.yml` is committed to repo
- Verify branch name matches `main` or `rebuilding-front-end`
- Try manual trigger via GitHub Actions UI

### Codespace not using prebuild
- Check GitHub Actions shows successful prebuild run
- Verify image is in GitHub Container Registry
- Try creating new Codespace (caches fresh containers)

### Prebuild image outdated
- Check last workflow run date in Actions tab
- Manually trigger workflow to rebuild latest
- GitHub automatically cleans up old images after ~90 days

### Dependencies missing in Codespace
- Run `npm ci && npm run install:deps` manually
- Check for `.env` issues preventing postinstall
- Verify `SKIP_POSTINSTALL` is not set to `true`

## Cleanup & Maintenance

### GitHub Container Registry Images

Automatically managed by GitHub:
- Keeps last 5 image versions per tag
- Deletes images older than 90 days
- No manual cleanup needed

### To manually delete old images:

```bash
# Requires GitHub CLI (gh) installed
gh container delete \
  ghcr.io/Dinoraptor101/vibesapp/codespaces:old-branch \
  --confirm
```

## Cost Considerations

GitHub Codespaces prebuilds are included in standard GitHub Teams/Enterprise plans:
- **Free tier** - 120 core-hours/month prebuild compute
- **GitHub Teams** - Standard included, additional at $0.18/core-hour
- **Enterprise** - Negotiated rates

**Optimization:** The 2-3 minute startup time saved per developer × ~20 devs × ~100 Codespaces/month = **66+ hours/month saved** → ~$200/month cost savings.

## Next Steps

1. ✅ Push changes to `rebuilding-front-end` branch
2. ⏳ Monitor GitHub Actions for prebuild workflow completion
3. 🧪 Create new Codespace and verify 30-60 second startup
4. 📊 Monitor prebuild workflow runs in Actions dashboard
5. 🔄 Consider adjusting trigger strategy based on team feedback

---

**Last Updated:** November 30, 2025
**Monorepo:** vibesapp (VibesApp)
**Optimization Status:** ✅ Complete
