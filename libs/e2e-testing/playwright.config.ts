// playwright.config.ts - ADAPTIVE CONFIGURATION
// Reads ENVIRONMENT from .env and configures for 'local' or 'qa'
// Set ENVIRONMENT=local in .env for localhost testing with dev servers
// Set ENVIRONMENT=qa in .env for QA environment testing
import { defineConfig } from '@playwright/test';
import 'dotenv/config';

const environment = process.env.ENVIRONMENT || 'local';
const isLocal = environment === 'local';

console.log(`🔍 Playwright Config: ${environment.toUpperCase()}`);
console.log(`   baseURL: ${isLocal ? 'http://localhost:5173' : 'https://qa.vibesapp.net'}`);
console.log(`   Dev Servers: ${isLocal ? 'ENABLED' : 'DISABLED'}\n`);

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: 1,
  workers: 2,
  maxFailures: isLocal ? 1 : undefined, // Fail-fast in local, run all in QA
  testIgnore: [
    ...(isLocal ? ['**/offline/**'] : ['**/offline/**']), // Offline tests only work locally (PWA features)
    ...(process.env.SKIP_ADMIN === 'true' ? ['**/admin/**'] : []), // Skip admin tests unless explicitly testing admin changes
  ],
  use: {
    baseURL: isLocal ? 'http://localhost:5173' : 'https://qa.vibesapp.net',
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
    // Makes duplicate testing.
    // {
    //   name: 'chromium',
    //   dependencies: ['prerequisites'],
    //   use: { browserName: 'chromium' },
    // },
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
  globalSetup: isLocal
    ? require.resolve('./global-setup.local')
    : require.resolve('./global-setup.qa'),
  globalTeardown: require.resolve('./global-teardown'),
  ...(isLocal && {
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
