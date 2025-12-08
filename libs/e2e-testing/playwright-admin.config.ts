// playwright-admin.config.ts - ADMIN TESTS ONLY (LOCALHOST)
// Dedicated configuration for admin panel tests
// Command: npx playwright test --config=playwright-admin.config.ts
import { defineConfig } from '@playwright/test';
import 'dotenv/config';

// Set environment to local for admin tests
process.env.ENVIRONMENT = 'local';

console.log('🔍 Playwright Config: ADMIN TESTS ONLY (localhost)');
console.log('   baseURL: http://localhost:5173');
console.log('   Servers: ENABLED');
console.log('   Tests: admin/** only\n');

export default defineConfig({
  testDir: './tests/admin',
  fullyParallel: true,
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
    permissions: ['geolocation'],
    geolocation: { latitude: 37.41, longitude: -77.46 },
    storageState: 'storageState-user1.local.json',
    launchOptions: {
      slowMo: 500,
    },
  },
  retries: 1,
  workers: 2,
  // maxFailures: 3, // Fail-fast
  projects: [
    // Setup project: Admin security tests must pass before other admin tests run
    {
      name: 'admin-prerequisites',
      testMatch: '**/01-admin-security.spec.ts',
      use: { browserName: 'chromium' },
    },
    // Main admin test execution - depends on security tests passing
    {
      name: 'chromium',
      dependencies: ['admin-prerequisites'],
      use: { browserName: 'chromium' },
    },
    // Admin test tiers - run specific admin test groups:
    // npx playwright test --config=playwright-admin.config.ts --project=admin-core
    {
      name: 'admin-core',
      testMatch: ['**/01-*.spec.ts', '**/02-*.spec.ts'],
      use: { browserName: 'chromium' },
    },
    {
      name: 'admin-features',
      testMatch: ['**/03-*.spec.ts', '**/04-*.spec.ts', '**/05-*.spec.ts'],
      dependencies: ['admin-core'],
      use: { browserName: 'chromium' },
    },
    {
      name: 'admin-management',
      testMatch: ['**/06-*.spec.ts', '**/07-*.spec.ts'],
      dependencies: ['admin-core', 'admin-features'],
      use: { browserName: 'chromium' },
    },
  ],
  globalSetup: require.resolve('./global-setup.local'),
  globalTeardown: require.resolve('./global-teardown'),
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
});
