// playwright.config.ts - BASE CONFIGURATION
// Base configuration with common settings
// Use specific configs: playwright.config.local.ts (localhost) or playwright.config.qa.ts (QA)
import { defineConfig } from '@playwright/test';
import 'dotenv/config';

// Default to local environment if not specified
if (!process.env.ENVIRONMENT) {
  process.env.ENVIRONMENT = 'local';
}

console.log('🔍 Playwright Config: BASE (please use specific config)');
console.log(`   Environment: ${process.env.ENVIRONMENT}`);
console.log(`   Use: --config=playwright.config.local.ts or --config=playwright.config.qa.ts\n`);

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  use: {
    baseURL: process.env.ENVIRONMENT === 'qa' ? 'https://qa.vibesapp.net' : 'http://localhost:5173',
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
  maxFailures: 3,
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
  globalSetup:
    process.env.ENVIRONMENT === 'qa'
      ? require.resolve('./global-setup')
      : require.resolve('./global-setup.local'),
  globalTeardown: require.resolve('./global-teardown'),
  ...(process.env.ENVIRONMENT === 'local' && {
    webServer: [
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
  }),
});
