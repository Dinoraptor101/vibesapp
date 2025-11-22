// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testIgnore: '**/offline/**', // Ignore offline tests - require localhost:5173 and PWA features
  fullyParallel: true, // Enable full parallelization - tests within the same file can run in parallel
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
    permissions: ['geolocation'],
    geolocation: { latitude: 37.41, longitude: -77.46 },
    storageState: 'storageState.json', // Add this line to specify the storage state file
    launchOptions: {
      slowMo: 500, // Add slowMo to launch options
    },
  },
  retries: 0, // Disable retries in debug mode
  workers: 3, // Number of parallel worker processes
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
  globalSetup: require.resolve('./global-setup'), // Ensure this line is included to run the global setup script
  // Start dev servers before running tests
  webServer: [
    {
      command: 'cd ../../apps/api && npm run dev',
      url: 'http://localhost:5001/health',
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
