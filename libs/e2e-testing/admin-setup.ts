/**
 * Admin Test Setup
 *
 * Pre-authenticates admin user once and saves session state for reuse across tests.
 * This dramatically reduces test execution time by avoiding repeated login flows.
 */

import { chromium, type FullConfig } from '@playwright/test';

async function adminSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'vibes_admin_2025';

  const browser = await chromium.launch();
  const context = await browser.newContext({ baseURL });
  const page = await context.newPage();

  try {
    // Navigate to admin login
    await page.goto('/admin/login');
    await page.waitForLoadState('domcontentloaded');

    // Fill password and login
    const passwordInput = page.locator('#admin-password');
    await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
    await passwordInput.fill(ADMIN_PASSWORD);

    const loginButton = page.locator('button[type="submit"]');
    await loginButton.click();

    // Wait for successful redirect
    await page.waitForURL('**/admin/dashboard', { timeout: 10000 });

    // Save authenticated admin state
    await context.storageState({ path: 'adminStorageState.json' });

    console.log('✓ Admin session authenticated and saved');
  } catch (error) {
    console.error('Failed to authenticate admin:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default adminSetup;
