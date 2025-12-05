# Test Execution Guide

## Overview

Tests are now organized with numeric prefixes to enforce execution priority, ensuring you test methodically from **core (fast) to UX (slow)** tests. This prevents wasting time on dependent tests when core functionality breaks.

## Test Execution Order

### Main Tests (`tests/`)

| Priority | File | Type | Speed | What It Tests |
|----------|------|------|-------|---------------|
| 1 | `01-api-service-tests.spec.ts` | Core | ⚡ Fastest | API service layer, HTTP methods, error handling |
| 2 | `02-unit-tests.spec.ts` | Core | ⚡ Fast | Utilities, validation, date/location/MBTI functions |
| 3 | `03-component-unit-tests.spec.ts` | Integration | 🔄 Medium | Playwright config, form validation, integration tests |
| 4 | `04-user-security.spec.ts` | Integration | 🔄 Medium | Authentication, authorization, profile updates |
| 5 | `05-logout-cleanup.spec.ts` | Integration | 🔄 Medium | Session cleanup, storage clearing, data isolation |
| 6 | `06-post-counts.spec.ts` | UX | 🐢 Slower | Like/comment counts, backend transformers |
| 7 | `07-post-interactions.spec.ts` | UX | 🐢 Slower | Like/unlike, report, comment navigation |
| 8 | `08-user-features.spec.ts` | UX | 🐢 Slowest | Settings, messaging, conversations, following |

### Admin Tests (`tests/admin/`)

| Priority | File | Type | Speed | What It Tests |
|----------|------|------|-------|---------------|
| 1 | `01-admin-security.spec.ts` | Core | ⚡ Fast | API auth, token validation, CSRF/XSS protection |
| 2 | `02-admin-login.spec.ts` | Core | ⚡ Fast | Login flow, session persistence, reCAPTCHA |
| 3 | `03-admin-dashboard.spec.ts` | Integration | 🔄 Medium | Dashboard display, metrics, navigation |
| 4 | `04-admin-settings.spec.ts` | Integration | 🔄 Medium | Password changes, moderation settings |
| 5 | `05-user-management.spec.ts` | UX | 🐢 Slower | User search, filtering, ban/unban |
| 6 | `06-flagged-posts.spec.ts` | UX | 🐢 Slower | Post moderation, bulk actions |
| 7 | `07-strike-system.spec.ts` | UX | 🐢 Slower | Strike system (currently skipped) |

## Running Tests

### 1. Run All Tests (Default - Recommended)

Tests run alphabetically, ensuring core tests execute first:

```bash
# Localhost
npm run test

# QA Environment
npm run test:qa
```

**Fail-Fast Behavior**: Suite stops after 5 failures to avoid wasting time on broken dependencies.

### 2. Run Specific Test Tiers (Selective Execution)

Run only the tests you need:

```bash
# Core tests only (01-02: API + Unit - ~10 seconds)
npx playwright test --project=core

# Integration tests only (03-05: Components, Security, Cleanup - ~30 seconds)
npx playwright test --project=integration

# UX tests only (06-08: Interactions, Features - ~60 seconds)
npx playwright test --project=ux

# Admin tests only (localhost only)
npx playwright test --config=playwright.config.local.ts --project=admin
```

### 3. Run Individual Test Files

```bash
# Run specific file
npx playwright test 01-api-service-tests.spec.ts

# Run multiple files
npx playwright test 01-api-service-tests.spec.ts 02-unit-tests.spec.ts

# Run with UI mode for debugging
npx playwright test --ui
```

### 4. Run Tests by Pattern

```bash
# Run all core tests (01-02)
npx playwright test "0[12]-*.spec.ts"

# Run all integration tests (03-05)
npx playwright test "0[345]-*.spec.ts"

# Run all UX tests (06-08)
npx playwright test "0[678]-*.spec.ts"

# Run all admin tests
npx playwright test admin/
```

## Methodical Testing Workflow

### Development Workflow (Recommended)

1. **Start with Core** (`--project=core`):
   - If these fail, your API or utilities are broken
   - Fix immediately before proceeding

2. **Then Integration** (`--project=integration`):
   - Tests authentication, security, cleanup
   - Validates critical user flows work

3. **Finally UX** (`--project=ux`):
   - Full feature testing
   - Only run if core + integration pass

### Quick Smoke Test

```bash
# Run just core tests (~10 seconds)
npx playwright test --project=core
```

### Full Test Suite

```bash
# Run everything in priority order
npx playwright test
```

### CI/CD Pipeline

```bash
# Fail-fast approach - stops after 5 failures
npx playwright test --max-failures=5
```

## Why This Organization?

### Before (Alphabetical Chaos)
- Tests ran in random order: `api-service`, `component-unit`, `logout`, `post-counts`, etc.
- If API broke, you'd still run all UX tests and waste time
- No clear indication of test importance or speed

### After (Priority-Based)
- **01-02: Core Tests** run first (API, utilities) - fastest, most critical
- **03-05: Integration Tests** next (security, cleanup) - medium speed
- **06-08: UX Tests** last (interactions, features) - slowest, depends on core
- **Fail-fast** stops testing if core breaks
- **Selective execution** lets you run just what you need

## Test Projects Configuration

Configured in `playwright.config.ts` and `playwright.config.local.ts`:

```typescript
projects: [
  { name: 'chromium' }, // Default: runs all tests
  { name: 'core', testMatch: ['**/01-*.spec.ts', '**/02-*.spec.ts'] },
  { name: 'integration', testMatch: ['**/03-*.spec.ts', '**/04-*.spec.ts', '**/05-*.spec.ts'] },
  { name: 'ux', testMatch: ['**/06-*.spec.ts', '**/07-*.spec.ts', '**/08-*.spec.ts'] },
  { name: 'admin', testMatch: ['**/admin/**/*.spec.ts'] }, // localhost only
]
```

## Additional Features

### Fail-Fast (maxFailures: 5)
- Suite stops after 5 test failures
- Prevents wasting time when core functionality is broken
- Configurable in `playwright.config.ts`

### Automatic Cleanup
- All test data automatically deleted after test runs
- Works in both localhost and QA environments
- See `TEST-DATA-CLEANUP.md` for details

### Environment Support
- **Localhost**: Auto-starts dev servers
- **QA**: Tests against deployed environment
- See `TESTING-ENVIRONMENTS.md` for configuration

## Tips

1. **During Development**: Run `--project=core` frequently for fast feedback
2. **Before PR**: Run full suite with `npm run test`
3. **Debugging**: Use `--ui` mode to step through tests visually
4. **CI/CD**: Use `--max-failures=5` to fail fast
5. **Admin Testing**: Must use `playwright.config.local.ts` (admin not deployed to QA)

## VS Code Playwright Extension

The extension sorts tests alphabetically, so your tests will now run in the correct order:
1. 01-api-service-tests.spec.ts
2. 02-unit-tests.spec.ts
3. 03-component-unit-tests.spec.ts
4. ... and so on

Simply click "Run All Tests" in the extension, and they'll execute in priority order automatically!
