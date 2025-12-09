// global-setup.ts - QA ENVIRONMENT SETUP (DEFAULT)
import { chromium } from '@playwright/test';
import {
  loadEnvVariables,
  fetchUserIdByPigeonId,
  createAuthCookies,
  logRecaptchaBypass,
} from './setup-utils';

// Load environment variables from .env file
loadEnvVariables();

async function globalSetup() {
  console.log(`🔧 Setting up test environment: QA`);
  console.log(`   Cookie domain: qa.vibesapp.net`);
  console.log(`   Secure cookies: true\n`);

  // Fetch userIds dynamically from API
  const apiBase = process.env.QA_BACKEND_BASE as string;
  const userId1 = await fetchUserIdByPigeonId(process.env.QA_TEST_PIGEON_ID as string, apiBase);
  const userId2 = await fetchUserIdByPigeonId(process.env.QA_TEST_2_PIGEON_ID as string, apiBase);

  const browser = await chromium.launch();
  const context = await browser.newContext();

  // Add authentication cookies for user 1
  const cookies1 = createAuthCookies({
    domain: 'qa.vibesapp.net',
    secure: true,
    userId: userId1,
    pigeonId: process.env.QA_TEST_PIGEON_ID as string,
  });
  await context.addCookies(cookies1);

  logRecaptchaBypass('qa.vibesapp.net');

  await context.storageState({ path: './storageState-user1.qa.json' });

  // Create second user storage state (VIXEN)
  const context2 = await browser.newContext();
  const cookies2 = createAuthCookies({
    domain: 'qa.vibesapp.net',
    secure: true,
    userId: userId2,
    pigeonId: process.env.QA_TEST_2_PIGEON_ID as string,
  });
  await context2.addCookies(cookies2);

  await context2.storageState({ path: './storageState-user2.qa.json' });
  await context2.close();

  await browser.close();

  console.log('✅ QA environment setup complete (2 users)\n');
}

export default globalSetup;
