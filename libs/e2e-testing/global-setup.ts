// global-setup.ts - QA ENVIRONMENT SETUP (DEFAULT)
import { chromium } from '@playwright/test';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

// Load environment variables from .env file
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  Object.keys(envConfig).forEach((key) => {
    process.env[key] = envConfig[key];
  });
}

async function globalSetup() {
  console.log(`🔧 Setting up test environment: QA`);
  console.log(`   Cookie domain: qa.vibesapp.net`);
  console.log(`   Secure cookies: true\n`);

  const browser = await chromium.launch();
  const context = await browser.newContext();

  await context.addCookies([
    {
      name: 'range',
      value: '275',
      domain: 'qa.vibesapp.net',
      path: '/',
      expires: -1,
      httpOnly: false,
      secure: true,
      sameSite: 'Lax',
    },
    {
      name: 'user_location',
      value: '%7B%22lat%22%3A37.42%2C%22lon%22%3A-77.46%7D',
      domain: 'qa.vibesapp.net',
      path: '/',
      expires: -1,
      httpOnly: false,
      secure: true,
      sameSite: 'Lax',
    },
    {
      name: 'userId',
      value: process.env.QA_TEST_USER_ID,
      domain: 'qa.vibesapp.net',
      path: '/',
      expires: -1,
      httpOnly: false,
      secure: true,
      sameSite: 'Lax',
    },
    {
      name: 'pigeonId',
      value: process.env.QA_TEST_PIGEON_ID,
      domain: 'qa.vibesapp.net',
      path: '/',
      expires: -1,
      httpOnly: false,
      secure: true,
      sameSite: 'Lax',
    },
    {
      name: 'e2eBypass',
      value: 'e2e-test-bypass-secret-token-2024',
      domain: 'qa.vibesapp.net',
      path: '/',
      expires: -1,
      httpOnly: false,
      secure: true,
      sameSite: 'Lax',
    },
  ]);

  console.log('🔓 reCAPTCHA bypass cookie added:');
  console.log('   - Cookie name: e2eBypass');
  console.log('   - Token: e2e-test-bypass-secret-token-2024');
  console.log('   - Domain: qa.vibesapp.net');
  console.log('   - Purpose: Bypass Google reCAPTCHA verification for E2E tests\n');

  await context.storageState({ path: 'storageState.json' });

  // Create second user storage state (VIXEN)
  const context2 = await browser.newContext();
  await context2.addCookies([
    {
      name: 'range',
      value: '275',
      domain: 'qa.vibesapp.net',
      path: '/',
      expires: -1,
      httpOnly: false,
      secure: true,
      sameSite: 'Lax',
    },
    {
      name: 'user_location',
      value: '%7B%22lat%22%3A37.42%2C%22lon%22%3A-77.46%7D',
      domain: 'qa.vibesapp.net',
      path: '/',
      expires: -1,
      httpOnly: false,
      secure: true,
      sameSite: 'Lax',
    },
    {
      name: 'userId',
      value: process.env.QA_TEST_USER_2_ID as string,
      domain: 'qa.vibesapp.net',
      path: '/',
      expires: -1,
      httpOnly: false,
      secure: true,
      sameSite: 'Lax',
    },
    {
      name: 'pigeonId',
      value: process.env.QA_TEST_PIGEON_2_ID as string,
      domain: 'qa.vibesapp.net',
      path: '/',
      expires: -1,
      httpOnly: false,
      secure: true,
      sameSite: 'Lax',
    },
    {
      name: 'e2eBypass',
      value: 'e2e-test-bypass-secret-token-2024',
      domain: 'qa.vibesapp.net',
      path: '/',
      expires: -1,
      httpOnly: false,
      secure: true,
      sameSite: 'Lax',
    },
  ]);

  await context2.storageState({ path: 'storageState2.json' });
  await context2.close();

  await browser.close();

  console.log('✅ QA environment setup complete (2 users)\n');
}

export default globalSetup;
