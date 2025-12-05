// playwright.config.local.ts - LOCALHOST CONFIGURATION
// Use this config for local development with auto-started servers
// Command: npx playwright test --config=playwright.config.local.ts
import { defineConfig } from '@playwright/test';
import 'dotenv/config';

console.log('🔍 Playwright Config: LOCALHOST (with dev servers)');
console.log(`   baseURL: http://localhost:5173`);
console.log(`   Servers: ENABLED\n`);

export default defineConfig({
  testDir: './tests',
  testIgnore: [
    '**/offline/**', // Ignore offline tests - require localhost:5173 and PWA features
    ...(process.env.SKIP_ADMIN === 'true' ? ['**/admin/**'] : []),
  ],
  fullyParallel: true,
  use: {
    baseURL: 'http://localhost:5173',
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
    // Selective execution projects - run specific test tiers:
    // npx playwright test --config=playwright.config.local.ts --project=core
    // npx playwright test --config=playwright.config.local.ts --project=integration
    // npx playwright test --config=playwright.config.local.ts --project=ux
    // npx playwright test --config=playwright.config.local.ts --project=admin
    {
      name: 'core',
      testMatch: ['**/01-*.spec.ts', '**/02-*.spec.ts'],
      use: { browserName: 'chromium' },
    },
    {
      name: 'integration',
      testMatch: ['**/03-*.spec.ts', '**/04-*.spec.ts', '**/05-*.spec.ts'],
      dependencies: ['core'],
      use: { browserName: 'chromium' },
    },
    {
      name: 'ux',
      testMatch: ['**/06-*.spec.ts', '**/07-*.spec.ts', '**/08-*.spec.ts'],
      dependencies: ['core', 'integration'],
      use: { browserName: 'chromium' },
    },
    {
      name: 'admin',
      testMatch: ['**/admin/**/*.spec.ts'],
      dependencies: ['core'],
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
