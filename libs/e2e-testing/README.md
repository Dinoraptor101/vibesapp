# E2E Testing for VibesApp

This directory contains end-to-end tests for VibesApp using Playwright. The tests work with **Web-V2** in both localhost and QA environments.

## Test Environments

### Localhost (Development)
- **URL**: `http://localhost:5173`
- **Backend**: `http://localhost:5001`
- Tests automatically start the dev servers
- Default environment for development

### QA Environment (Pre-Production)
- **URL**: `https://qa.vibesapp.net`
- Tests run against the deployed QA environment
- No local servers needed

## Running Tests

### Against Localhost
```bash
# Default - runs against localhost
npm run test

# Or explicitly
npm run test:localhost

# With browser visible (headed mode)
npm run test:localhost:headed
```

### Against QA Environment
```bash
# Run against QA
npm run test:qa

# With browser visible (headed mode)
npm run test:qa:headed
```

### Using Environment Variable
```bash
# Localhost (default)
npx playwright test

# QA environment
TEST_ENV=qa npx playwright test
```

## Test Structure

Tests are organized by execution priority using numeric prefixes to ensure core tests run first:

### Main Tests (tests/)
- `01-api-service-tests.spec.ts` - **Core**: API layer functionality (fastest)
- `02-unit-tests.spec.ts` - **Core**: Utilities, validation, configuration
- `03-component-unit-tests.spec.ts` - **Integration**: Component integration tests
- `04-user-security.spec.ts` - **Integration**: Authentication and authorization
- `05-logout-cleanup.spec.ts` - **Integration**: Session cleanup and data isolation
- `06-post-counts.spec.ts` - **UX**: Data integrity and count validation
- `07-post-interactions.spec.ts` - **UX**: Like/unlike, report, comment features
- `08-user-features.spec.ts` - **UX**: Full user workflows (slowest)

### Admin Tests (tests/admin/)
- `01-admin-security.spec.ts` - **Core**: Security gates and authorization
- `02-admin-login.spec.ts` - **Core**: Admin authentication
- `03-admin-dashboard.spec.ts` - **Integration**: Dashboard overview
- `04-admin-settings.spec.ts` - **Integration**: Admin configuration
- `05-user-management.spec.ts` - **UX**: User operations
- `06-flagged-posts.spec.ts` - **UX**: Content moderation
- `07-strike-system.spec.ts` - **UX**: User strike system (currently skipped)

### Offline Tests (tests/offline/)
- PWA offline functionality tests (localhost only)

### Supporting Files
- `global-setup.ts` - Global test setup and authentication
- `global-teardown.ts` - Automatic test data cleanup after tests complete

## Selective Test Execution

Run specific test tiers based on your needs:

```bash
# Run only core tests (API + Unit - fastest)
npx playwright test --project=core

# Run integration tests (Security + Cleanup)
npx playwright test --project=integration

# Run UX tests (Post interactions + User features - slowest)
npx playwright test --project=ux

# Run admin tests only (localhost only)
npx playwright test --config=playwright.config.local.ts --project=admin

# Run all tests in order (default behavior)
npx playwright test
```

Tests run alphabetically by default, ensuring core tests execute first. If core tests fail (e.g., API or authentication issues), the suite stops after 5 failures (fail-fast) to avoid wasting time on dependent tests.

## Test Data Cleanup

All test data is automatically cleaned up after test runs complete. See [TEST-DATA-CLEANUP.md](./TEST-DATA-CLEANUP.md) for details on:
- How automatic cleanup works
- Writing tests that follow cleanup conventions
- Manual cleanup procedures
- Troubleshooting cleanup issues

**Important**: When creating test users, always use approved `pigeonId` prefixes:
- `test-*`, `pigeon-author-*`, `pigeon-reporter-*`, `test-author-*`, `test-reporter-*`

## Configuration

The Playwright configuration (`playwright.config.ts`) automatically:
- Uses `http://localhost:5173` for local development (default)
- Uses `https://qa.vibesapp.net` for QA testing (when `TEST_ENV=qa`)
- Starts local dev servers only when testing localhost
- Configures geolocation permissions for location-based features
- Sets up storage state for authenticated sessions

## Test Coverage

The test suite includes:
- ✅ User registration and authentication
- ✅ User profile viewing
- ✅ Activity feed functionality
- ✅ Configuration validation
- ✅ Form validation
- ✅ Location functions
- ✅ Utility functions

## Notes

- Tests are environment-agnostic and use relative URLs
- Offline tests are ignored by default (require localhost and PWA features)
- Tests run in parallel for faster execution
- SlowMo is enabled for better debugging visibility
