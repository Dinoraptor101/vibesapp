// playwright.config.qa.ts - QA ENVIRONMENT CONFIGURATION
// Use this config for testing against the QA environment
// Command: npx playwright test --config=playwright.config.qa.ts
import { defineConfig } from '@playwright/test';
import 'dotenv/config';

// Set environment to QA
process.env.ENVIRONMENT = 'qa';

console.log('🔍 Playwright Config: QA ENVIRONMENT');
console.log('   baseURL: https://qa.vibesapp.net');
console.log('   Servers: DISABLED');
console.log('   Admin tests: SKIPPED\n');

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
  // maxFailures: 3, // Removed to see all test failures
  projects: [
    // Setup project: Core API tests must pass before other tests run
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
