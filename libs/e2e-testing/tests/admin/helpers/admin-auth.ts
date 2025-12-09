/**
 * Admin Authentication Helper
 *
 * Reusable functions for admin authentication in E2E tests.
 * Handles login flow, session management, and cleanup.
 */

import type { Page } from '@playwright/test';

// Default admin password for testing (matches backend default)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'vibes_admin_2025';

/**
 * Login as admin user
 * Navigates to /admin/login, fills password, and waits for redirect to dashboard
 *
 * Note: For better performance, tests should reuse admin session when possible
 * instead of clearing and logging in for each test.
 */
export async function loginAsAdmin(page: Page): Promise<void> {
  // Check if already logged in
  if (await isAdminSessionActive(page)) {
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('domcontentloaded');
    return;
  }

  // Navigate to admin login page
  await page.goto('/admin/login');
  await page.waitForLoadState('domcontentloaded');

  // Fill password input - wait for it to be visible
  const passwordInput = page.locator('#admin-password');
  await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
  await passwordInput.fill(ADMIN_PASSWORD);

  // Click login button
  const loginButton = page.locator('button[type="submit"]');
  await loginButton.click();

  // Wait for redirect to admin dashboard
  await page.waitForURL('**/admin/dashboard', { timeout: 10000 });
}

/**
 * Check if admin session is active
 * Returns true if adminToken cookie exists and is not expired
 */
export async function isAdminSessionActive(page: Page): Promise<boolean> {
  const cookies = await page.context().cookies();
  const adminToken = cookies.find((c) => c.name === 'adminToken');
  const adminSessionExpiry = cookies.find((c) => c.name === 'adminSessionExpiry');

  if (!adminToken || !adminSessionExpiry) {
    return false;
  }

  const expiryTime = parseInt(adminSessionExpiry.value, 10);
  return Date.now() < expiryTime;
}

/**
 * Clear admin session cookies
 * Useful for testing logout or session expiry scenarios
 */
export async function clearAdminSession(page: Page): Promise<void> {
  const context = page.context();
  const cookies = await context.cookies();

  // Filter out admin cookies
  const adminCookies = cookies.filter(
    (c) => c.name === 'adminToken' || c.name === 'adminSessionExpiry'
  );

  for (const cookie of adminCookies) {
    await context.clearCookies({ name: cookie.name });
  }
}

/**
 * Set expired admin session cookies
 * Useful for testing session expiry scenarios
 */
export async function setExpiredAdminSession(page: Page): Promise<void> {
  const context = page.context();
  const baseURL = page.url().split('/').slice(0, 3).join('/');
  const domain = new URL(baseURL).hostname;
  const isSecure = baseURL.startsWith('https');

  // Set expired session (1 hour in the past)
  const expiredTime = Date.now() - 60 * 60 * 1000;

  await context.addCookies([
    {
      name: 'adminToken',
      value: 'expired-test-token',
      domain,
      path: '/',
      expires: -1,
      httpOnly: false,
      secure: isSecure,
      sameSite: 'Lax',
    },
    {
      name: 'adminSessionExpiry',
      value: expiredTime.toString(),
      domain,
      path: '/',
      expires: -1,
      httpOnly: false,
      secure: isSecure,
      sameSite: 'Lax',
    },
  ]);
}

/**
 * Set admin session to expire soon (for testing auto-logout)
 * @param secondsUntilExpiry - Number of seconds until session expires
 */
export async function setAdminSessionExpiringSoon(
  page: Page,
  secondsUntilExpiry: number
): Promise<void> {
  const context = page.context();
  const baseURL = page.url().split('/').slice(0, 3).join('/');
  const domain = new URL(baseURL).hostname;
  const isSecure = baseURL.startsWith('https');

  const expiryTime = Date.now() + secondsUntilExpiry * 1000;

  await context.addCookies([
    {
      name: 'adminToken',
      value: 'test-token-expiring-soon',
      domain,
      path: '/',
      expires: -1,
      httpOnly: false,
      secure: isSecure,
      sameSite: 'Lax',
    },
    {
      name: 'adminSessionExpiry',
      value: expiryTime.toString(),
      domain,
      path: '/',
      expires: -1,
      httpOnly: false,
      secure: isSecure,
      sameSite: 'Lax',
    },
  ]);
}

/**
 * Get admin session expiry time
 * Returns the expiry timestamp or null if no session exists
 */
export async function getAdminSessionExpiry(page: Page): Promise<number | null> {
  const cookies = await page.context().cookies();
  const adminSessionExpiry = cookies.find((c) => c.name === 'adminSessionExpiry');

  if (!adminSessionExpiry) {
    return null;
  }

  return parseInt(adminSessionExpiry.value, 10);
}
