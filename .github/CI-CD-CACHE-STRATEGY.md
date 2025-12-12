# CI/CD Cache Strategy

## Monorepo Lock File Hashing

This document explains how the CI/CD cache is configured and why. **Update this if you change cache configuration.**

### The Problem

VibesApp is an NX monorepo with multiple lock files:
- `package-lock.json` (root)
- `apps/web-v2/package-lock.json`
- `apps/api/package-lock.json`
- `libs/shared/package-lock.json`
- Plus any future workspace lock files

**Original issue:** Using a glob pattern like `**/package-lock.json` caused:
1. The glob matched ALL lock files
2. The cache key changed every run (order-dependent hashing)
3. Cache always missed, forcing full re-downloads of 1000+ packages
4. npm ci took 6-10 minutes instead of <2 minutes with cache

### The Solution

**Cache key:** All lock files hashed together into single stable key:
```yaml
key: ${{ runner.os }}-node-${{ hashFiles('package-lock.json', 'apps/*/package-lock.json', 'libs/*/package-lock.json') }}
```

**Why this works:**
- Explicitly lists all lock file patterns (no glob surprises)
- Hashes them in deterministic order
- Cache key is stable unless ANY lock file changes (self-healing)
- Cache invalidates correctly when dependencies change

**Restore fallback:**
```yaml
restore-keys:
  - ${{ runner.os }}-node-
```

If exact cache misses, falls back to any `Linux-node-*` cache. This bridges gaps during rapid dependency changes.

### Cache Paths

```yaml
path: |
  ~/.npm          # npm registry metadata cache
  node_modules    # installed packages (fastest restoration)
```

**Why both?**
- `~/.npm`: Faster npm ci if partial cache exists
- `node_modules`: Instant restoration if packages already cached

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

**Updated: 2025-12-12** (After dependency cleanup: removed aws-sdk v2, OpenTelemetry, socket.io, ws)

- **Job timeout:** 30 min (build), 35 min (deploy/code-quality)
- **npm ci timeout:** 15 minutes

**Why 15 minutes?**
- After dependency cleanup: -146 packages removed
- Cache hit ratio: ~58% (42% miss rate still significant)
- Cold install (cache miss): can take 8-12 minutes with 42% miss rate
- Warm install (cache hit): 2-4 minutes
- 15 min timeout handles worst-case scenarios while allowing cache to build
- **Important:** GitHub Actions saves partial cache even if workflow times out

**Previous settings (before 2025-12-12):**
- Job timeout: 20 min (build), 25 min (deploy), 15 min (code-quality)
- npm ci timeout: 5 minutes
- These were too aggressive for 42% cache miss rate

### Future-Proofing

**If you add a new workspace with `package-lock.json`:**

1. Update all three workflow files to include the new pattern
2. Example: If adding `packages/my-workspace/package-lock.json`:
   ```yaml
   key: ${{ runner.os }}-node-${{ hashFiles('package-lock.json', 'apps/*/package-lock.json', 'libs/*/package-lock.json', 'packages/*/package-lock.json') }}
   ```

3. Add a comment noting the new workspace

**Prevention:** This strategy self-heals—if you update any lock file, the cache key changes and builds fresh cache. No manual cache clearing needed.

### Testing the Cache

**First run (cache population / 100% miss):**
- Expect 100+ "cache miss" entries
- npm ci takes 8-12 minutes
- Cache is saved in background

**Optimal run (cache hits / 58% hit rate current):**
- Expect ~60% "cache hit" entries, ~40% misses
- npm ci takes 2-4 minutes
- Partial restoration from cache

**Full cache hit (rarely achieved):**
- 100% cache hit entries
- npm ci takes <2 minutes
- All packages restored from cache

If you see misses on run 2+, something broke. Check:
- Did you change any `package-lock.json`? (expected miss)
- Did you add a new workspace? (need to update hashFiles)
- Did you change the cache key pattern? (verify all patterns included)

### References

- GitHub Actions Cache: https://github.com/actions/cache
- NX Monorepo docs: https://nx.dev/
