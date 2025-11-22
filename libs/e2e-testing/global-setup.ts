import { chromium } from '@playwright/test';

async function globalSetup() {
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
      value: 'aa521293-9cfe-4033-8166-c20f13474988', // Existing user ID
      domain: 'localhost',
      path: '/',
      expires: -1,
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
    },
    {
      name: 'pigeonId',
      value: '0d536b38-33ce-48c5-958d-5b76015ce228', // Same value as userId
      domain: 'localhost',
      path: '/',
      expires: -1,
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
    },
  ]);
  await context.storageState({ path: 'storageState.json' });
  await browser.close();
}

export default globalSetup;
