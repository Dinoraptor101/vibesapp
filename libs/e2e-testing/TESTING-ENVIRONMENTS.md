# Testing Environments Configuration

## Overview
The e2e test suite supports running tests against both **localhost** and **QA** environments, both running Web-V2. All environment-specific URLs are centralized in the `.env` file for easy configuration and maintenance.

## Environment Configuration

### .env File
All environment URLs are defined in `libs/e2e-testing/.env`:

```bash
# Backend API Key for authenticated test cleanup
BACKEND_API_KEY=DxgVLXfMi4uJCk

# Localhost URLs (default)
LOCAL_FRONTEND_URL=http://localhost:5173
LOCAL_BACKEND_URL=http://localhost:5001/api
LOCAL_BACKEND_BASE=http://localhost:5001
LOCAL_COOKIE_DOMAIN=localhost

# QA Environment URLs
QA_FRONTEND_URL=https://qa.vibesapp.net
QA_BACKEND_URL=https://logosil-backend-a8355253628c.herokuapp.com/api
QA_BACKEND_BASE=https://logosil-backend-a8355253628c.herokuapp.com
QA_COOKIE_DOMAIN=qa.vibesapp.net
```

**⚠️ Never hardcode URLs in test files** - Always read from `process.env` variables defined in `.env`

## Environment Support

### Localhost - Default
- **Frontend**: Read from `LOCAL_FRONTEND_URL`
- **Backend**: Read from `LOCAL_BACKEND_URL`
- **Auto-starts**: Dev servers are automatically started before tests
- **Use case**: Development testing, local debugging, rapid iteration

### QA Environment  
- **Frontend**: Read from `QA_FRONTEND_URL`
- **Backend**: Read from `QA_BACKEND_URL`
- **No servers needed**: Tests run against deployed environment
- **Use case**: Pre-production validation, regression testing

## Running Tests

### Local Development
```bash
# Default - runs against localhost:5173
npm run test

# Explicit localhost testing
npm run test:localhost

# With visible browser (headed mode)
npm run test:localhost:headed
```

### QA Environment
```bash
# Run against qa.vibesapp.net
npm run test:qa

# With visible browser
npm run test:qa:headed
```

### Using Environment Variable Directly
```bash
# Localhost (default)
npx playwright test

# QA environment
TEST_ENV=qa npx playwright test
```

## Configuration Details

### Environment Variable Pattern
All test files follow this pattern to read URLs from `.env`:

```typescript
// Example: Reading API URL based on environment
const isQAEnvironment = process.env.TEST_ENV === 'qa';
const API_BASE_URL = isQAEnvironment
  ? process.env.QA_BACKEND_URL
  : process.env.LOCAL_BACKEND_URL;
```

### Playwright Config (`playwright.config.ts`)
- Automatically detects `TEST_ENV` environment variable
- Sets `baseURL` dynamically from `.env` variables
- Only starts local servers when testing localhost
- Shared configuration: geolocation, storage state, browser settings

### Global Setup (`global-setup.ts`)
- Sets authentication cookies with correct domain (from `.env`)
- Uses secure cookies for HTTPS (QA) vs HTTP (localhost)
- Logs environment setup for debugging

### Test Files
All test files use **relative URLs** (`page.goto('/')`) for navigation and read API URLs from environment variables:
- `tests/unit-tests.spec.ts` - Configuration and integration tests
- `tests/user-features.spec.ts` - User account and settings tests  
- `tests/user-security.spec.ts` - Security and authorization tests
- `tests/component-unit-tests.spec.ts` - Component validation tests
- `tests/api-service-tests.spec.ts` - API layer tests
- `tests/admin/**/*.spec.ts` - Admin panel tests

## Key Implementation Pattern

### ✅ Correct - Read from .env
```typescript
const isQAEnvironment = process.env.TEST_ENV === 'qa';
const baseURL = isQAEnvironment 
  ? process.env.QA_FRONTEND_URL 
  : process.env.LOCAL_FRONTEND_URL;
```

### ❌ Wrong - Hardcoded URLs
```typescript
// DON'T DO THIS
const baseURL = isQAEnvironment ? 'https://qa.vibesapp.net' : 'http://localhost:5173';
```

### 3. Environment-Agnostic Tests
```typescript
// Before: await page.goto('https://qa.vibesapp.net/');
// After:  await page.goto('/');
```

## Test Compatibility

| Test File | Localhost | QA | Notes |
|-----------|-----------|-----|--------|
| unit-tests.spec.ts | ✅ | ✅ | Environment-agnostic |
| user-features.spec.ts | ✅ | ✅ | Fully compatible |
| component-unit-tests.spec.ts | ✅ | ✅ | Pure unit tests |
| api-service-tests.spec.ts | ✅ | ✅ | Environment-aware mocks |
| end-to-end.spec.ts | ⚠️ | ⚠️ | Currently .fixme - needs selector updates |

Legend:
- ✅ Fully compatible
- ⚠️ Needs selector updates

## CI/CD Integration

For GitHub Actions or other CI pipelines:

```yaml
# Test against localhost
- name: Run E2E Tests (Localhost)
  run: cd libs/e2e-testing && npm run test

# Test against QA
- name: Run E2E Tests (QA)
  run: cd libs/e2e-testing && npm run test:qa
  env:
    TEST_ENV: qa
```

## Troubleshooting

## Troubleshooting

### Tests failing on localhost
- Ensure dev servers are running or let Playwright start them automatically
- Check `http://localhost:5173` and `http://localhost:5001/health` are accessible

### Tests failing on QA
- Verify `https://qa.vibesapp.net` is accessible
- Check if QA environment is deployed and running
- Some legacy selectors may need updates

### "baseURL" errors
- Ensure you're using relative URLs in tests: `page.goto('/')`
- Check Playwright config is exporting the config correctly

## Best Practices

1. **Write environment-agnostic tests**: Use relative URLs and avoid hardcoded domains
2. **Use data-testid attributes**: Ensures tests work across UI changes
3. **Test locally first**: Validate changes against localhost before QA
4. **Keep selectors updated**: Document when selectors change between releases
