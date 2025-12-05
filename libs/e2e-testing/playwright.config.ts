// playwright.config.ts - QA ENVIRONMENT (DEFAULT)
// This is the default config used by VS Code Playwright Extension
// For localhost testing with dev servers, use: playwright.config.local.ts
import { defineConfig } from '@playwright/test';
import 'dotenv/config';

// Set environment marker for global teardown
process.env.PLAYWRIGHT_CONFIG_QA = 'true';

console.log('🔍 Playwright Config: QA ENVIRONMENT (default)');
console.log(`   baseURL: https://qa.vibesapp.net`);
console.log(`   Servers: DISABLED`);
console.log(`   Admin tests: SKIPPED\n`);

export default defineConfig({
  testDir: './tests',
  testIgnore: [
    '**/offline/**', // Offline tests require localhost PWA features
    '**/admin/**', // Admin panel not deployed to QA
  ],
  fullyParallel: true,
  use: {
    baseURL: 'https://qa.vibesapp.net',
    headless: true,
    permissions: ['geolocation'],
    geolocation: { latitude: 37.41, longitude: -77.46 },
    storageState: 'storageState.json',
    launchOptions: {
      slowMo: 500,
    },
  },
  retries: 0,
  workers: 2,
  maxFailures: 3, // Fail-fast: stop after 5 failures to avoid wasting time on broken core
  projects: [
    // Setup project: Core API tests must pass before other tests run
    // This enforces test dependencies and prevents wasting time on UX tests if API is broken
    {
      name: 'prerequisites',
      testMatch: '**/01-api-service-tests.spec.ts',
      use: { browserName: 'chromium' },
    },
    // Main test execution - depends on core API working
    {
      name: 'chromium',
      dependencies: ['prerequisites'],
      use: { browserName: 'chromium' },
    },
  ],
  globalSetup: require.resolve('./global-setup'),
  globalTeardown: require.resolve('./global-teardown'),
  // No webServer for QA - tests run against deployed environment
});
