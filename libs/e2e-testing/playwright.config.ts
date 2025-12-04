// playwright.config.ts
import { defineConfig } from '@playwright/test';

// Support both localhost and QA environments (both running Web-V2)
// Use TEST_ENV=qa to run against qa.vibesapp.net, otherwise defaults to localhost
const isQAEnvironment = process.env.TEST_ENV === 'qa';
const baseURL = isQAEnvironment ? 'https://qa.vibesapp.net' : 'http://localhost:5173';

export default defineConfig({
  testDir: './tests',
  testIgnore: [
    '**/offline/**', // Ignore offline tests - require localhost:5173 and PWA features
    ...(process.env.SKIP_ADMIN === 'true' ? ['**/admin/**'] : []),
  ],
  fullyParallel: true, // Enable full parallelization - tests within the same file can run in parallel
  use: {
    baseURL,
    headless: true,
    permissions: ['geolocation'],
    geolocation: { latitude: 37.41, longitude: -77.46 },
    storageState: 'storageState.json', // Add this line to specify the storage state file
    launchOptions: {
      slowMo: 500, // Add slowMo to launch options
    },
  },
  retries: 0, // Retry failed tests once (set to 0 for debugging)
  workers: 2, // Number of parallel worker processes
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
  globalSetup: require.resolve('./global-setup'), // Ensure this line is included to run the global setup script
  globalTeardown: require.resolve('./global-teardown'), // Clean up test data after all tests complete
  // Start dev servers before running tests (only for localhost)
  webServer: isQAEnvironment
    ? undefined
    : [
        {
          command: 'cd ../../apps/api && npm run dev',
          url: 'http://localhost:5001/api/health',
          timeout: 120000,
          reuseExistingServer: !process.env.CI,
        },
        {
          command: 'cd ../../apps/web-v2 && npm run dev',
          url: 'http://localhost:5173',
          timeout: 120000,
          reuseExistingServer: !process.env.CI,
        },
      ],
});
