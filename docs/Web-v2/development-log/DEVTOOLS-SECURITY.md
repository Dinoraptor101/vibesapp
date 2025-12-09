# DevTools Security Policy

> **Created:** December 2024  
> **Status:** Active  
> **Priority:** High Security

## Overview

Development tools (DevTools) such as TanStack Query DevTools, React DevTools extensions, and similar debugging utilities **MUST NEVER** appear in production-like environments (QA, staging, production). These tools expose internal application state, API responses, cache contents, and other sensitive data that could be exploited by malicious actors.

## Incident Background

A QA tester reported seeing TanStack Query DevTools in the QA environment. This constitutes a **data leak** as:

- DevTools expose all cached API responses
- Query keys reveal internal data structures
- Mutation history shows user actions
- Network state exposes authentication flows

## Implementation Requirements

### 1. Static Imports Are Prohibited

❌ **NEVER do this:**

```tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// This bundles devtools in ALL builds, even if conditionally rendered
{import.meta.env.DEV && <ReactQueryDevtools />}
```

The static import includes the entire devtools bundle in production builds, even when the component is conditionally rendered. Tree-shaking cannot remove it because the import is at the module level.

### 2. Use Lazy Loading with Conditional Import

✅ **Correct implementation:**

```tsx
import { lazy, Suspense } from 'react';

// DevTools are lazy-loaded ONLY in development mode
const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(() =>
      import('@tanstack/react-query-devtools').then((mod) => ({
        default: mod.ReactQueryDevtools,
      }))
    )
  : () => null;

// In render:
{import.meta.env.DEV && (
  <Suspense fallback={null}>
    <ReactQueryDevtools initialIsOpen={false} />
  </Suspense>
)}
```

This approach ensures:
- The dynamic import is **never executed** in production builds
- The devtools code is **excluded from the bundle** entirely
- Double-gating provides defense-in-depth

### 3. Environment Variable Reference

| Variable | Value in Dev | Value in Production Build |
|----------|--------------|---------------------------|
| `import.meta.env.DEV` | `true` | `false` |
| `import.meta.env.PROD` | `false` | `true` |
| `import.meta.env.MODE` | `"development"` | `"production"` |

**Important:** QA and staging use production builds (`npm run build`), so `import.meta.env.DEV` is `false` in these environments.

## Verification Checklist

Before deploying to QA or production, verify:

- [ ] No static imports of devtools packages exist
- [ ] All devtools use lazy loading pattern
- [ ] Build output doesn't contain devtools chunks
- [ ] Manual QA testing confirms no devtools UI appears

### How to Verify Build Output

```bash
# Build the application
npm run build:web-v2

# Check for devtools in the bundle
grep -r "devtools" apps/web-v2/dist/assets/*.js

# Should return NO results if properly excluded
```

## Affected Packages

The following devtools packages must follow this security policy:

| Package | Location | Status |
|---------|----------|--------|
| `@tanstack/react-query-devtools` | `apps/web-v2` | ✅ Fixed |
| `@tanstack/router-devtools` | N/A | Not in use |
| `zustand/devtools` | `apps/web-v2` | Review needed |

## Adding New DevTools

When adding any new development tool:

1. **Add to devDependencies only** (never dependencies)
2. **Use lazy loading pattern** as shown above
3. **Gate with `import.meta.env.DEV`** check
4. **Update this document** with the new package
5. **Verify in QA** before production deployment

## Code Review Requirements

Pull requests that add or modify devtools imports must:

1. Be tagged with `security-review` label
2. Include verification that devtools don't appear in production build
3. Follow the lazy loading pattern documented above
4. Update this security document if adding new devtools

## Related Files

- `apps/web-v2/src/app/providers.tsx` - Main devtools integration
- `apps/web-v2/package.json` - DevTools dependencies (devDependencies section)
- `apps/web-v2/vite.config.ts` - Build configuration

## Contact

For questions about this policy, contact the security team or the frontend tech lead.
