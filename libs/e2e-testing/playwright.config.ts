// playwright.config.ts - ADAPTIVE CONFIGURATION
// Configure environment here directly (VS Code extension doesn't reliably read .env)
// Change this value to switch between environments:
// Keep this in sync with libs/e2e-testing/.env file
// Keep this as 'local' in SourceCode for build pipelines test automation
const ENVIRONMENT: 'local' | 'qa' = 'local';

import { defineConfig } from '@playwright/test';
import 'dotenv/config';
import * as path from 'path';

// Allow .env override if set, but default to the value above
const environment = process.env.ENVIRONMENT || ENVIRONMENT;
const isLocal = environment === 'local';

// Use separate storage state files per environment to avoid cookie domain mismatch
// user1 = primary test user (DontDeleteMeTester), user2 = secondary test user (VIXEN)
// Storage state files are created in libs/e2e-testing by global setup
// Use absolute paths to ensure consistent resolution in CI
const storageStateFile = path.resolve(
  __dirname,
  isLocal ? 'storageState-user1.local.json' : 'storageState-user1.qa.json'
);

// Only print config summary in main process (not in workers) and not in CI
if (process.env.PLAYWRIGHT_WORKER_INDEX === undefined && !process.env.CI) {
  console.log(`🔍 Playwright Config: ${environment.toUpperCase()}`);
  console.log(`   baseURL: ${isLocal ? 'http://localhost:5173' : 'https://qa.vibesapp.net'}`);
  console.log(`   Dev Servers: ${isLocal ? 'ENABLED' : 'DISABLED'}\n`);
}

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: 1,
  workers: 2,
  // maxFailures: isLocal ? 1 : undefined, // Fail-fast in local, run all in QA
  testIgnore: [
    ...(isLocal ? ['**/offline/**'] : ['**/offline/**']), // Offline tests only work locally (PWA features)
    '**/admin/**', // Admin tests use dedicated playwright-admin.config.ts instead
  ],
  use: {
    baseURL: isLocal ? 'http://localhost:5173' : 'https://qa.vibesapp.net',
    headless: true,
    permissions: ['geolocation'],
    geolocation: { latitude: 37.41, longitude: -77.46 },
    storageState: storageStateFile,
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
        env: Object.fromEntries(
          Object.entries(process.env).filter(([_, v]) => v !== undefined)
        ) as Record<string, string>,
      },
      {
        command: 'cd ../../apps/web-v2 && npm run dev',
        url: 'http://localhost:5173',
        timeout: 120000,
        reuseExistingServer: !process.env.CI,
        env: Object.fromEntries(
          Object.entries(process.env).filter(([_, v]) => v !== undefined)
        ) as Record<string, string>,
      },
    ],
  }),
});
