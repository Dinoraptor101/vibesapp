// global-setup.local.ts - LOCALHOST ENVIRONMENT SETUP
import { chromium } from '@playwright/test';
import {
  loadEnvVariables,
  fetchUserIdByPigeonId,
  createAuthCookies,
  logRecaptchaBypass,
} from './setup-utils';

// Load environment variables from .env file and inject into process.env
loadEnvVariables();

async function globalSetup() {
  console.log('🔧 Setting up test environment: Localhost (with dev servers)');
  console.log('   Cookie domain: localhost');
  console.log('   Secure cookies: false');
  console.log('   Note: Uses same MongoDB Atlas as QA (shared test users)\n');

  // Fetch userIds dynamically from API (uses same pigeonIds as QA)
  const apiBase = process.env.LOCAL_BACKEND_BASE as string;
  const userId1 = await fetchUserIdByPigeonId(process.env.QA_TEST_PIGEON_ID as string, apiBase);
  const userId2 = await fetchUserIdByPigeonId(process.env.QA_TEST_2_PIGEON_ID as string, apiBase);

  const browser = await chromium.launch();
  const context = await browser.newContext();

  // Add authentication cookies for user 1
  const cookies1 = createAuthCookies({
    domain: 'localhost',
    secure: false,
    userId: userId1,
    pigeonId: process.env.QA_TEST_PIGEON_ID as string,
  });
  await context.addCookies(cookies1);

  logRecaptchaBypass('localhost');

  await context.storageState({ path: 'storageState.json' });

  // Create second user storage state (for multi-user tests)
  const context2 = await browser.newContext();
  const cookies2 = createAuthCookies({
    domain: 'localhost',
    secure: false,
    userId: userId2,
    pigeonId: process.env.QA_TEST_2_PIGEON_ID as string,
  });
  await context2.addCookies(cookies2);

  await context2.storageState({ path: 'storageState2.json' });
  await context2.close();

  await browser.close();

  console.log('✅ Localhost environment setup complete (2 users)\n');
}
export default globalSetup;
