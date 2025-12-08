// playwright.config.qa.ts - QA ENVIRONMENT CONFIGURATION
// Use this config for testing against the QA environment
// Command: npx playwright test --config=playwright.config.qa.ts
import { defineConfig } from '@playwright/test';
import baseConfig from './playwright.config';
import 'dotenv/config';

// Set environment to QA
process.env.ENVIRONMENT = 'qa';

console.log('🔍 Playwright Config: QA ENVIRONMENT');
console.log('   baseURL: https://qa.vibesapp.net');
console.log('   Servers: DISABLED');
console.log('   Admin tests: SKIPPED\n');

export default defineConfig({
  ...baseConfig,
  testIgnore: [
    '**/offline/**', // Offline tests require localhost PWA features
    '**/admin/**', // Admin panel not deployed to QA
  ],
  use: {
    ...baseConfig.use,
    baseURL: 'https://qa.vibesapp.net',
  },
  projects: [
    // Inherit prerequisites project from base config
    ...(baseConfig.projects || []),
    // Main test execution - depends on core API working
    {
      name: 'chromium',
      dependencies: ['prerequisites'],
      use: { browserName: 'chromium' },
    },
  ],
  globalSetup: require.resolve('./global-setup'),
  // No webServer for QA - tests run against deployed environment
});
