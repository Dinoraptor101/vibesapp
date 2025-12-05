// global-setup.local.ts - LOCALHOST ENVIRONMENT SETUP
import { chromium } from '@playwright/test';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

// Load environment variables from .env file and inject into process.env
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  // Inject all env vars into process.env so they're available to all tests
  Object.keys(envConfig).forEach((key) => {
    process.env[key] = envConfig[key];
  });
}

async function globalSetup() {
  console.log('🔧 Setting up test environment: Localhost (with dev servers)');
  console.log(`   Cookie domain: localhost`);
  console.log(`   Secure cookies: false\n`);

  const browser = await chromium.launch();
  const context = await browser.newContext();
  await context.addCookies([
    {
      name: 'range',
      value: '275',
      domain: 'localhost',
      path: '/',
      expires: -1,
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
    },
    {
      name: 'user_location',
      value: '%7B%22lat%22%3A37.42%2C%22lon%22%3A-77.46%7D',
      domain: 'localhost',
      path: '/',
      expires: -1,
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
    },
    {
      name: 'userId',
      value: 'aa521293-9cfe-4033-8166-c20f13474988',
      domain: 'localhost',
      path: '/',
      expires: -1,
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
    },
    {
      name: 'pigeonId',
      value: '0d536b38-33ce-48c5-958d-5b76015ce228',
      domain: 'localhost',
      path: '/',
      expires: -1,
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
    },
    {
      name: 'e2eBypass',
      value: 'e2e-test-bypass-secret-token-2024',
      domain: 'localhost',
      path: '/',
      expires: -1,
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
    },
  ]);

  console.log('🔓 reCAPTCHA bypass cookie added:');
  console.log('   - Cookie name: e2eBypass');
  console.log('   - Token: e2e-test-bypass-secret-token-2024');
  console.log('   - Domain: localhost');
  console.log('   - Purpose: Bypass Google reCAPTCHA verification for E2E tests\n');

  await context.storageState({ path: 'storageState.json' });
  await browser.close();

  console.log('✅ Localhost environment setup complete\n');
}
export default globalSetup;
