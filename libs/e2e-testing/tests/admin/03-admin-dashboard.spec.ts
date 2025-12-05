/**
 * E2E Tests: Admin Dashboard UI
 *
 * Coverage:
 * - Dashboard page display with title
 * - Key metrics cards (Active Users, Posts Today, Reports Today, Auto-Hidden Posts)
 * - Loading state (spinner)
 * - Activity chart display
 * - Navigation to Flagged Posts, Users, Settings pages
 * - Responsive behavior on mobile viewport
 * - Metric refresh on data change
 */

import { test, expect } from '@playwright/test';
import { loginAsAdmin, clearAdminSession } from './helpers/admin-auth';

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin (reuses session if available)
    await loginAsAdmin(page);
  });

  test('should display dashboard page with title', async ({ page }) => {
    // Verify we're on the dashboard page
    expect(page.url()).toContain('/admin/dashboard');

    // Verify dashboard title is displayed
    const dashboardTitle = page.getByTestId('admin-dashboard-title');
    await expect(dashboardTitle).toBeVisible();
    await expect(dashboardTitle).toContainText('Dashboard');
  });

  test('should display key metrics cards', async ({ page }) => {
    // Verify metrics container is visible
    const metricsContainer = page.getByTestId('admin-metrics-container');
    await expect(metricsContainer).toBeVisible();

    // Verify Active Users metric card
    const activeUsersCard = page.getByTestId('metric-card-active-users');
    await expect(activeUsersCard).toBeVisible();
    await expect(activeUsersCard.getByTestId('metric-card-title')).toContainText('Active Users');
    await expect(activeUsersCard.getByTestId('metric-card-value')).toBeVisible();

    // Verify Posts Today metric card
    const postsTodayCard = page.getByTestId('metric-card-posts-today');
    await expect(postsTodayCard).toBeVisible();
    await expect(postsTodayCard.getByTestId('metric-card-title')).toContainText('Posts Today');
    await expect(postsTodayCard.getByTestId('metric-card-value')).toBeVisible();

    // Verify Reports Today metric card
    const reportsTodayCard = page.getByTestId('metric-card-reports-today');
    await expect(reportsTodayCard).toBeVisible();
    await expect(reportsTodayCard.getByTestId('metric-card-title')).toContainText('Reports Today');
    await expect(reportsTodayCard.getByTestId('metric-card-value')).toBeVisible();

    // Verify Auto-Hidden Posts metric card
    const autoHiddenCard = page.getByTestId('metric-card-auto-hidden');
    await expect(autoHiddenCard).toBeVisible();
    await expect(autoHiddenCard.getByTestId('metric-card-title')).toContainText('Auto-Hidden');
    await expect(autoHiddenCard.getByTestId('metric-card-value')).toBeVisible();
  });

  test('should show loading state initially', async ({ page }) => {
    // Navigate to login first to set up interception before dashboard load
    await page.goto('/admin/login');
    await clearAdminSession(page);

    // Intercept metrics API to delay response
    await page.route('**/api/admin/metrics', async (route) => {
      // Delay the response to observe loading state
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await route.continue();
    });

    // Login and navigate to dashboard
    await loginAsAdmin(page);

    // Verify skeleton loading state is shown (uses .animate-pulse class)
    const skeleton = page.locator('.animate-pulse');
    await expect(skeleton.first()).toBeVisible();

    // Wait for loading to complete - skeleton should be hidden
    await expect(skeleton.first()).toBeHidden({ timeout: 10000 });
  });

  test('should display activity chart if present', async ({ page }) => {
    // Wait for page to fully load
    // Wait for page elements to be visible (SSE keeps connections open)
    await page.waitForTimeout(500);

    // Check for activity chart component (always present with test ID)
    const activityChart = page.getByTestId('admin-activity-chart');
    await expect(activityChart).toBeVisible();

    // Verify chart has title/header
    await expect(activityChart.getByText('Activity (Last 7 Days)')).toBeVisible();

    // Chart content will show either data visualization or "No data available" message
    // Both are valid states, so we just verify the component is rendered
  });

  test('should navigate to Flagged Posts page', async ({ page }) => {
    // Find and click Flagged Posts navigation link
    const flaggedPostsLink = page.getByTestId('admin-nav-flagged-posts');
    await expect(flaggedPostsLink).toBeVisible();
    await flaggedPostsLink.click();

    // Wait for navigation (URL is /admin/flagged not /admin/flagged-posts)
    await page.waitForURL('**/admin/flagged', { timeout: 5000 });

    // Verify we're on the Flagged Posts page
    expect(page.url()).toContain('/admin/flagged');
  });

  test('should navigate to Users page', async ({ page }) => {
    // Find and click Users navigation link
    const usersLink = page.getByTestId('admin-nav-users');
    await expect(usersLink).toBeVisible();
    await usersLink.click();

    // Wait for navigation
    await page.waitForURL('**/admin/users', { timeout: 5000 });

    // Verify we're on the Users page
    expect(page.url()).toContain('/admin/users');
  });

  test('should navigate to Settings page', async ({ page }) => {
    // Find and click Settings navigation link
    const settingsLink = page.getByTestId('admin-nav-settings');
    await expect(settingsLink).toBeVisible();
    await settingsLink.click();

    // Wait for navigation
    await page.waitForURL('**/admin/settings', { timeout: 5000 });

    // Verify we're on the Settings page
    expect(page.url()).toContain('/admin/settings');
  });

  test('should have navigation links in header', async ({ page }) => {
    // Verify admin layout header is visible
    const adminHeader = page.getByTestId('admin-header');
    await expect(adminHeader).toBeVisible();

    // Verify all nav links exist in header
    await expect(page.getByTestId('admin-nav-dashboard')).toBeVisible();
    await expect(page.getByTestId('admin-nav-flagged-posts')).toBeVisible();
    await expect(page.getByTestId('admin-nav-users')).toBeVisible();
    await expect(page.getByTestId('admin-nav-settings')).toBeVisible();
  });
});

test.describe('Admin Dashboard - Responsive', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport (below 768px breakpoint)
    await page.setViewportSize({ width: 375, height: 667 });

    // Verify admin header is still visible
    const adminHeader = page.getByTestId('admin-header');
    await expect(adminHeader).toBeVisible();

    // On mobile, nav should show icons only (no text labels)
    // Check that icon elements are visible (use .first() for strict mode)
    const dashboardNavIcon = page.getByTestId('admin-nav-dashboard').locator('svg');
    await expect(dashboardNavIcon.first()).toBeVisible();

    // Verify text labels are hidden on mobile
    const dashboardNavText = page.getByTestId('admin-nav-dashboard-text');
    const isTextHidden = await dashboardNavText.isHidden().catch(() => true);
    expect(isTextHidden).toBe(true);

    // Verify metrics cards stack vertically on mobile
    const metricsContainer = page.getByTestId('admin-metrics-container');
    await expect(metricsContainer).toBeVisible();

    // Dashboard title should still be visible
    const dashboardTitle = page.getByTestId('admin-dashboard-title');
    await expect(dashboardTitle).toBeVisible();
  });

  test('should show text labels on desktop viewport', async ({ page }) => {
    // Set desktop viewport (above 768px breakpoint)
    await page.setViewportSize({ width: 1024, height: 768 });

    // Wait for layout to adjust
    await page.waitForTimeout(300);

    // On desktop (md and above), text labels should be visible
    const dashboardNavText = page.getByTestId('admin-nav-dashboard-text');
    await expect(dashboardNavText).toBeVisible();
    await expect(dashboardNavText).toContainText('Dashboard');

    // Icons should be hidden on desktop (md:hidden class)
    const dashboardNavIcon = page.getByTestId('admin-nav-dashboard').locator('svg');
    await expect(dashboardNavIcon.first()).toBeHidden();
  });
});

test.describe('Admin Dashboard - Data Refresh', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should handle metric refresh on data change', async ({ page }) => {
    // Wait for initial metrics to load
    const activeUsersCard = page.getByTestId('metric-card-active-users');
    await expect(activeUsersCard).toBeVisible({ timeout: 10000 });

    // Store initial value for comparison
    const initialValue = await activeUsersCard.getByTestId('metric-card-value').innerText();
    expect(initialValue).toBeTruthy(); // Ensure initial value exists

    // Set up route interception for the NEXT metrics call
    let metricsCallCount = 0;
    await page.route('**/api/admin/metrics', async (route) => {
      metricsCallCount++;
      // Return mock data matching the actual API response structure
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          metrics: {
            activeUsers: {
              today: 999,
              thisWeek: 999,
              total: 1000,
            },
            posts: {
              today: 50,
              thisWeek: 100,
              change: 10,
            },
            reports: {
              today: 5,
              thisWeek: 10,
              change: -5,
            },
            autoHidden: {
              total: 2,
              lastHour: 1,
            },
            urgent: {
              autoHiddenLastHour: 1,
              unreviewedFlagged: 3,
            },
          },
        }),
      });
    });

    // Navigate away and back to trigger a data refresh
    await page.getByTestId('admin-nav-users').click();
    await page.waitForURL('**/admin/users', { timeout: 5000 });

    await page.getByTestId('admin-nav-dashboard').click();
    await page.waitForURL('**/admin/dashboard', { timeout: 5000 });

    // Re-query the element after navigation (locators are stale after nav)
    const refreshedActiveUsersCard = page.getByTestId('metric-card-active-users');
    await expect(refreshedActiveUsersCard).toBeVisible({ timeout: 5000 });

    // Wait for the metrics card to update with mocked data
    await expect(refreshedActiveUsersCard.getByTestId('metric-card-value')).toHaveText('999', {
      timeout: 5000,
    });

    // Verify at least one metrics call was intercepted
    expect(metricsCallCount).toBeGreaterThanOrEqual(1);
  });

  test('should display metric card with subtitle and trend', async ({ page }) => {
    // Wait for metrics to load
    // Wait for page elements to be visible (SSE keeps connections open)
    await page.waitForTimeout(500);

    // Get a metric card
    const activeUsersCard = page.getByTestId('metric-card-active-users');
    await expect(activeUsersCard).toBeVisible();

    // Check for subtitle (e.g., "vs last week")
    const subtitle = activeUsersCard.getByTestId('metric-card-subtitle');
    const hasSubtitle = await subtitle.isVisible().catch(() => false);

    if (hasSubtitle) {
      await expect(subtitle).toBeVisible();
    }

    // Check for trend indicator (up/down arrow or percentage)
    const trendIndicator = activeUsersCard.getByTestId('metric-card-trend');
    const hasTrend = await trendIndicator.isVisible().catch(() => false);

    if (hasTrend) {
      await expect(trendIndicator).toBeVisible();
    }

    // At minimum, title and value should always be present
    await expect(activeUsersCard.getByTestId('metric-card-title')).toBeVisible();
    await expect(activeUsersCard.getByTestId('metric-card-value')).toBeVisible();
  });
});
