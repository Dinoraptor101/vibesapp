// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true, // Enable full parallelization - tests within the same file can run in parallel
  use: {
    baseURL: 'https://qa.vibesapp.net',
    headless: true,
    permissions: ['geolocation'],
    geolocation: { latitude: 37.41, longitude: -77.46 },
    storageState: 'storageState.json', // Add this line to specify the storage state file
    launchOptions: {
      slowMo: 500, // Add slowMo to launch options
    },
  },
  retries: 1, // Retries failed tests once
  workers: 3, // Number of parallel worker processes
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
  globalSetup: require.resolve('./global-setup'), // Ensure this line is included to run the global setup script
});
