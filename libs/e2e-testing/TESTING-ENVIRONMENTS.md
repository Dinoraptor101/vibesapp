# Testing Environments Configuration

## Overview
The e2e test suite supports running tests against both **localhost** and **QA** environments, both running Web-V2.

## Environment Support

### Localhost - Default
- **Frontend**: `http://localhost:5173`
- **Backend**: `http://localhost:5001`
- **Auto-starts**: Dev servers are automatically started before tests
- **Use case**: Development testing, local debugging, rapid iteration

### QA Environment
- **URL**: `https://qa.vibesapp.net`
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

### Playwright Config (`playwright.config.ts`)
- Automatically detects `TEST_ENV` environment variable
- Sets `baseURL` dynamically based on environment
- Only starts local servers when testing localhost
- Shared configuration: geolocation, storage state, browser settings

### Test Files
All test files use **relative URLs** (`page.goto('/')`) instead of hardcoded URLs:
- `tests/unit-tests.spec.ts` - Configuration and integration tests
- `tests/user-features.spec.ts` - User account and settings tests
- `tests/component-unit-tests.spec.ts` - Component validation tests
- `tests/api-service-tests.spec.ts` - API layer tests (environment-aware)
- `tests/end-to-end.spec.ts` - Full user journey (currently .fixme for web-v1 selectors)

## Key Changes Made

### 1. Dynamic Base URL
```typescript
const isQAEnvironment = process.env.TEST_ENV === 'qa';
const baseURL = isQAEnvironment ? 'https://qa.vibesapp.net' : 'http://localhost:5173';
```

### 2. Conditional Server Startup
```typescript
webServer: isQAEnvironment ? undefined : [
  // Local dev servers config
]
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
