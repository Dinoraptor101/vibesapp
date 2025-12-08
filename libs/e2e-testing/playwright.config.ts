// playwright.config.ts - SHARED BASE CONFIGURATION
// Defines common settings inherited by playwright.config.local.ts and playwright.config.qa.ts
// Do not run tests with this config directly - use specific environment configs
import { defineConfig } from '@playwright/test';
import 'dotenv/config';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: 1,
  workers: 2,
  use: {
    headless: true,
    permissions: ['geolocation'],
    geolocation: { latitude: 37.41, longitude: -77.46 },
    storageState: 'storageState.json',
    launchOptions: {
      slowMo: 500,
    },
  },
  projects: [
    {
      name: 'prerequisites',
      testMatch: '**/01-api-service-tests.spec.ts',
      use: { browserName: 'chromium' },
    },
  ],
  globalTeardown: require.resolve('./global-teardown'),
});
