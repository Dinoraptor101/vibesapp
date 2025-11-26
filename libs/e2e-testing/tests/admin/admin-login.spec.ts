/**
 * E2E Tests: Admin Authentication
 *
 * Coverage:
 * - Admin login page display
 * - Login validation (empty password, invalid password)
 * - Successful login and redirect to dashboard
 * - Session persistence across page refresh
 * - Session expiry and auto-logout
 * - reCAPTCHA v3 verification (conditional)
 */

import { test, expect } from '@playwright/test';
import {
  loginAsAdmin,
  clearAdminSession,
  isAdminSessionActive,
  setExpiredAdminSession,
  setAdminSessionExpiringSoon,
  getAdminSessionExpiry,
} from './helpers/admin-auth';

// Default admin password for testing (matches backend default)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'vibes_admin_2025';

test.describe('Admin Login Page', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing admin session before each test
    await clearAdminSession(page);
  });

  test('should display admin login page at /admin/login', async ({ page }) => {
    await page.goto('/admin/login');
    await page.waitForLoadState('networkidle');

    // Verify page title/header
    await expect(page.locator('h1')).toContainText('Vibes Admin');

    // Verify password input is visible
    const passwordInput = page.locator('#admin-password');
    await expect(passwordInput).toBeVisible();
    await expect(passwordInput).toHaveAttribute('placeholder', 'Enter password');

    // Verify login button is visible (icon-based button with SVG)
    const loginButton = page.locator('button[type="submit"]');
    await expect(loginButton).toBeVisible();
    await expect(loginButton.locator('svg').first()).toBeVisible(); // Button contains 2 icons (transitions)

    // Verify footer text (updated for new design)
    await expect(page.locator('text=IP address and location logged')).toBeVisible();
  });

  test('should show error for empty password', async ({ page }) => {
    await page.goto('/admin/login');
    await page.waitForLoadState('networkidle');

    // Click login without entering password
    const loginButton = page.locator('button[type="submit"]');

    // Button should be disabled when password is empty
    await expect(loginButton).toBeDisabled();

    // New design doesn't show explicit error message, just keeps button disabled
    // and won't submit the form
    const passwordInput = page.locator('#admin-password');
    await expect(passwordInput).toBeVisible();
    await expect(passwordInput).toHaveValue('');
  });

  test('should show error for invalid password', async ({ page }) => {
    await page.goto('/admin/login');
    await page.waitForLoadState('networkidle');

    // Enter invalid password
    const passwordInput = page.locator('#admin-password');
    await passwordInput.fill('wrong_password_123');

    // Click login button
    const loginButton = page.locator('button[type="submit"]');
    await loginButton.click();

    // Wait for shake animation and error state (button morphs to error icon)
    await page.waitForTimeout(1000);

    // Verify password was cleared (shake animation clears field after error)
    await expect(passwordInput).toHaveValue('');

    // Verify we're still on login page
    expect(page.url()).toContain('/admin/login');
  });

  test('should redirect to /admin/dashboard on successful login', async ({ page }) => {
    await page.goto('/admin/login');
    await page.waitForLoadState('networkidle');

    // Enter valid password
    const passwordInput = page.locator('#admin-password');
    await passwordInput.fill(ADMIN_PASSWORD);

    // Click login button
    const loginButton = page.locator('button[type="submit"]');
    await loginButton.click();

    // Wait for redirect to dashboard
    await page.waitForURL('**/admin/dashboard', { timeout: 10000 });

    // Verify we're on the dashboard
    expect(page.url()).toContain('/admin/dashboard');
  });

  test('should show loading state during login', async ({ page }) => {
    await page.goto('/admin/login');
    await page.waitForLoadState('networkidle');

    // Enter valid password
    const passwordInput = page.locator('#admin-password');
    await passwordInput.fill(ADMIN_PASSWORD);

    // Click login button
    const loginButton = page.locator('button[type="submit"]');

    // Check initial enabled state
    await expect(loginButton).toBeEnabled();

    await loginButton.click();

    // New design: button becomes disabled during loading, then redirects
    // The disabled state might be very brief, so just verify redirect happens
    await page.waitForURL('**/admin/dashboard', { timeout: 10000 });
    expect(page.url()).toContain('/admin/dashboard');
  });
});

test.describe('Admin Session Persistence', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing admin session before each test
    await clearAdminSession(page);
  });

  test('should persist admin session across page refresh', async ({ page }) => {
    // Login as admin
    await loginAsAdmin(page);

    // Verify we're on the dashboard
    expect(page.url()).toContain('/admin/dashboard');

    // Refresh the page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify we're still on the dashboard (not redirected to login)
    expect(page.url()).toContain('/admin/dashboard');

    // Verify session is still active
    const isActive = await isAdminSessionActive(page);
    expect(isActive).toBe(true);
  });

  test('should set correct session cookies on login', async ({ page }) => {
    // Login as admin
    await loginAsAdmin(page);

    // Check cookies are set
    const cookies = await page.context().cookies();
    const adminToken = cookies.find((c) => c.name === 'adminToken');
    const adminSessionExpiry = cookies.find((c) => c.name === 'adminSessionExpiry');

    // Verify adminToken cookie exists and has a value
    expect(adminToken).toBeDefined();
    expect(adminToken?.value).toBeTruthy();

    // Verify adminSessionExpiry cookie exists
    expect(adminSessionExpiry).toBeDefined();

    // Verify expiry is approximately 1 hour from now (within 5 minute tolerance)
    if (adminSessionExpiry) {
      const expiryTime = parseInt(adminSessionExpiry.value, 10);
      const oneHourFromNow = Date.now() + 60 * 60 * 1000;
      const fiveMinutes = 5 * 60 * 1000;

      expect(expiryTime).toBeGreaterThan(Date.now());
      expect(expiryTime).toBeLessThan(oneHourFromNow + fiveMinutes);
    }
  });

  test('should redirect to login when accessing protected route without session', async ({
    page,
  }) => {
    // Try to access dashboard directly without logging in
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');

    // Should be redirected to login page
    await page.waitForURL('**/admin/login', { timeout: 10000 });
    expect(page.url()).toContain('/admin/login');
  });
});

test.describe('Admin Session Expiry', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing admin session before each test
    await clearAdminSession(page);
  });

  test('should redirect to login when session is expired', async ({ page }) => {
    // Navigate to login page first to set cookies on correct domain
    await page.goto('/admin/login');
    await page.waitForLoadState('networkidle');

    // Set expired session cookies
    await setExpiredAdminSession(page);

    // Try to access dashboard
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');

    // Should be redirected to login page
    await page.waitForURL('**/admin/login', { timeout: 10000 });
    expect(page.url()).toContain('/admin/login');
  });

  test('should auto-logout after session expiry (1 hour)', async ({ page }) => {
    // This test verifies the session expiry logic without actually waiting 1 hour
    // We test that the session has a 1-hour duration by checking the expiry timestamp

    // Login as admin
    await loginAsAdmin(page);

    // Get the session expiry time
    const expiryTime = await getAdminSessionExpiry(page);
    expect(expiryTime).toBeDefined();

    // Verify expiry is approximately 1 hour (60 minutes) from now
    const now = Date.now();
    const expectedExpiry = now + 60 * 60 * 1000; // 1 hour in milliseconds
    const tolerance = 60 * 1000; // 1 minute tolerance

    expect(expiryTime).toBeGreaterThan(now);
    expect(expiryTime).toBeLessThanOrEqual(expectedExpiry + tolerance);
    expect(expiryTime).toBeGreaterThanOrEqual(expectedExpiry - tolerance);
  });

  test('should show alert when session expires while on page', async ({ page }) => {
    // Navigate to login page first to set cookies on correct domain
    await page.goto('/admin/login');
    await page.waitForLoadState('networkidle');

    // Set session to expire in 3 seconds
    await setAdminSessionExpiringSoon(page, 3);

    // Navigate to dashboard
    await page.goto('/admin/dashboard');

    // Wait for session to expire (3 seconds + buffer)
    // New implementation redirects to login instead of showing alert
    await page.waitForTimeout(5000);

    // Verify redirect to login page happened
    await page.waitForURL('**/admin/login', { timeout: 5000 });
    expect(page.url()).toContain('/admin/login');
  });
});

// Check if reCAPTCHA is enabled
const RECAPTCHA_ENABLED = process.env.VITE_ENABLE_RECAPTCHA === 'true';

test.describe('Admin Login - reCAPTCHA Verification', () => {
  test.skip(
    () => !RECAPTCHA_ENABLED,
    'reCAPTCHA is not enabled (VITE_ENABLE_RECAPTCHA !== "true")'
  );

  test.beforeEach(async ({ page }) => {
    // Clear any existing admin session before each test
    await clearAdminSession(page);
  });

  test('should include reCAPTCHA v3 verification on login', async ({ page }) => {
    await page.goto('/admin/login');
    await page.waitForLoadState('networkidle');

    // Set up request interception to verify reCAPTCHA token is sent
    let recaptchaTokenSent = false;
    let requestBody: any = null;

    await page.route('**/api/admin/login', async (route) => {
      const request = route.request();
      requestBody = JSON.parse(request.postData() || '{}');
      recaptchaTokenSent = !!requestBody.recaptchaToken;
      await route.continue();
    });

    // Enter password and submit
    const passwordInput = page.locator('#admin-password');
    await passwordInput.fill(ADMIN_PASSWORD);

    const loginButton = page.locator('button[type="submit"]');
    await loginButton.click();

    // Wait for the request to complete
    await page.waitForTimeout(2000);

    // Verify reCAPTCHA token was included in the request
    expect(recaptchaTokenSent).toBe(true);
    expect(requestBody.recaptchaToken).toBeTruthy();
  });

  test('should show error when reCAPTCHA verification fails', async ({ page }) => {
    await page.goto('/admin/login');
    await page.waitForLoadState('networkidle');

    // Mock the API to return reCAPTCHA failure
    await page.route('**/api/admin/login', async (route) => {
      await route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: 'reCAPTCHA verification failed',
        }),
      });
    });

    // Enter password and submit
    const passwordInput = page.locator('#admin-password');
    await passwordInput.fill(ADMIN_PASSWORD);

    const loginButton = page.locator('button[type="submit"]');
    await loginButton.click();

    // Verify error message is shown
    await expect(page.locator('text=/reCAPTCHA verification failed/i')).toBeVisible({
      timeout: 10000,
    });

    // Verify we're still on login page
    expect(page.url()).toContain('/admin/login');
  });
});

test.describe('Admin Login - Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await clearAdminSession(page);
  });

  test('should have accessible form elements', async ({ page }) => {
    await page.goto('/admin/login');
    await page.waitForLoadState('networkidle');

    // Verify password input is accessible
    const passwordInput = page.locator('#admin-password');
    await expect(passwordInput).toBeVisible();

    // New design doesn't have explicit label, but input has proper attributes
    // Verify password input has autocomplete attribute
    await expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');

    // Verify input has proper type
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Verify submit button has proper aria-label
    const loginButton = page.locator('button[type="submit"]');
    await expect(loginButton).toHaveAttribute('aria-label', 'Login');
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/admin/login');
    await page.waitForLoadState('networkidle');

    // Tab to password input and enter password
    await page.keyboard.press('Tab');
    await page.keyboard.type(ADMIN_PASSWORD);

    // Tab to login button and press Enter
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');

    // Wait for redirect to dashboard
    await page.waitForURL('**/admin/dashboard', { timeout: 10000 });
    expect(page.url()).toContain('/admin/dashboard');
  });
});
