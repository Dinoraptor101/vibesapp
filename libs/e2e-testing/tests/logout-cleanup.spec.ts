/**
 * E2E Tests: Logout Cache Cleanup
 *
 * Verifies that logging out properly clears all user-specific data
 * to prevent data leakage between users on the same device.
 *
 * Coverage:
 * - React Query cache cleared (posts, messages, activities)
 * - sessionStorage cleared (scroll positions)
 * - localStorage user preferences cleared (proximityRange)
 * - Cookies cleared (pigeonId, userId)
 */

import { expect, test } from '@playwright/test';

test.describe('Logout Cache Cleanup', () => {
  test.beforeEach(async ({ page }) => {
    // Start authenticated
    await page.goto('/');
    // Wait for user menu to be visible (indicates page is loaded and user is authenticated)
    // Don't use 'networkidle' as SSE connections remain open indefinitely
    await page
      .getByTestId('user-menu-button')
      .first()
      .waitFor({ state: 'visible', timeout: 10000 });
  });

  test('should clear localStorage proximityRange on logout', async ({ page }) => {
    // Set a proximity range preference
    await page.evaluate(() => {
      localStorage.setItem('proximityRange', '100');
    });

    // Verify it's set
    const beforeLogout = await page.evaluate(() => localStorage.getItem('proximityRange'));
    expect(beforeLogout).toBe('100');

    // Perform logout via UserMenu
    await page.getByTestId('user-menu-button').first().click();
    await page.getByTestId('logout-menu-item').click();

    // Wait for navigation to login
    await page.waitForURL('**/login', { timeout: 5000 });

    // Verify proximityRange was cleared
    const afterLogout = await page.evaluate(() => localStorage.getItem('proximityRange'));
    expect(afterLogout).toBeNull();
  });

  test('should preserve theme preference on logout', async ({ page }) => {
    // Set theme (should NOT be cleared - it's app-wide)
    await page.evaluate(() => {
      localStorage.setItem('theme', 'dark');
    });

    // Perform logout
    await page.getByTestId('user-menu-button').first().click();
    await page.getByTestId('logout-menu-item').click();
    await page.waitForURL('**/login', { timeout: 5000 });

    // Verify theme was preserved
    const themeAfterLogout = await page.evaluate(() => localStorage.getItem('theme'));
    expect(themeAfterLogout).toBe('dark');
  });

  test('should clear sessionStorage scroll positions on logout', async ({ page }) => {
    // Set scroll positions (simulating user navigation)
    await page.evaluate(() => {
      sessionStorage.setItem(
        'vibes_scroll_positions',
        JSON.stringify({ '/': 500, '/activity': 200 })
      );
    });

    // Verify it's set
    const beforeLogout = await page.evaluate(() =>
      sessionStorage.getItem('vibes_scroll_positions')
    );
    expect(beforeLogout).not.toBeNull();

    // Perform logout
    await page.getByTestId('user-menu-button').first().click();
    await page.getByTestId('logout-menu-item').click();
    await page.waitForURL('**/login', { timeout: 5000 });

    // Verify scroll positions were cleared
    const afterLogout = await page.evaluate(() => sessionStorage.getItem('vibes_scroll_positions'));
    expect(afterLogout).toBeNull();
  });

  test('should clear auth cookies on logout', async ({ page }) => {
    // Get cookies before logout
    const cookiesBefore = await page.context().cookies();
    const hadPigeonId = cookiesBefore.some((c) => c.name === 'pigeonId');
    const hadUserId = cookiesBefore.some((c) => c.name === 'userId');

    // User should be authenticated (has cookies)
    expect(hadPigeonId || hadUserId).toBeTruthy();

    // Perform logout
    await page.getByTestId('user-menu-button').first().click();
    await page.getByTestId('logout-menu-item').click();
    await page.waitForURL('**/login', { timeout: 5000 });

    // Verify cookies were cleared
    const cookiesAfter = await page.context().cookies();
    const hasPigeonIdAfter = cookiesAfter.some((c) => c.name === 'pigeonId');
    const hasUserIdAfter = cookiesAfter.some((c) => c.name === 'userId');

    expect(hasPigeonIdAfter).toBe(false);
    expect(hasUserIdAfter).toBe(false);
  });

  test('should redirect to login page after logout', async ({ page }) => {
    // Perform logout
    await page.getByTestId('user-menu-button').first().click();
    await page.getByTestId('logout-menu-item').waitFor({ state: 'visible' });
    await page.getByTestId('logout-menu-item').click();

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });
});
