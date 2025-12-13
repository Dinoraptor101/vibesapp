# CI/CD Cache Strategy

## Single Root Lock File (npm Workspaces)

This document explains how the CI/CD cache is configured. **Update this if you change cache configuration.**

### Architecture

VibesApp is an NX monorepo using **npm workspaces** with a single `package-lock.json` at root:

```json
// package.json
{
  "workspaces": ["apps/*", "libs/*"]
}
```

All dependencies are hoisted to root `node_modules/`. Individual `apps/*/package.json` files declare dependencies, but npm resolves everything into the single root lock file.

### Cache Key (Simple)

```yaml
key: ${{ runner.os }}-node-${{ hashFiles('package-lock.json') }}
```

**Why this works:**
- Single lock file = single hash = single cache
- All jobs share the same cache key
- Cache invalidates when any dependency changes

**Restore fallback:**
```yaml
restore-keys:
  - ${{ runner.os }}-node-
```

If exact cache misses, falls back to any `Linux-node-*` cache.

### Cache Paths

```yaml
path: ~/.npm
```

**Why just `~/.npm`?**
- Registry metadata cache enables fast `npm ci`
- `node_modules` not cached (symlinks + platform issues in containers)
- `npm ci` rebuilds from cached registry quickly

### Workflow Configuration

**All three workflows use identical cache configuration:**
- `build.yml`
- `deploy.yml`
- `code-quality.yml`

**Concurrency:**
```yaml
concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true
```

All workflows queue sequentially to prevent resource contention during cache population.

### Timeout Strategy

**Updated: 2025-12-12** (After simplification + dependency cleanup)

- **Job timeout:** 30 min (build), 35 min (deploy/code-quality)
- **npm ci timeout:** 15 minutes

With single lock file and unified cache key, expect near 100% hit rate after first run.

### Testing the Cache

**First run (cache population):**
- Cache miss (expected)
- npm ci downloads from registry
- Cache saved on completion

**Subsequent runs (cache hit):**
- Single cache key across all jobs
- npm ci uses cached registry metadata
- Should complete in 2-4 minutes

If you see repeated misses:
- Did `package-lock.json` change? (expected miss, then hit)
- Check GitHub Actions cache list for stale entries

### Historical Note

**2025-12-12 Fix:** Previously used complex multi-pattern hash that was inconsistent across jobs (glob `**/` vs explicit paths). This caused 50/50 hit/miss ratio due to duplicate cache entries. Simplified to single `hashFiles('package-lock.json')` since npm workspaces uses one lock file.

### References

- GitHub Actions Cache: https://github.com/actions/cache
- npm Workspaces: https://docs.npmjs.com/cli/v10/using-npm/workspaces
