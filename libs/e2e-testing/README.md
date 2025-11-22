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

- `tests/unit-tests.spec.ts` - Configuration, utility, and integration tests
- `tests/offline/` - PWA offline functionality tests (localhost only)
- `global-setup.ts` - Global test setup and authentication

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
