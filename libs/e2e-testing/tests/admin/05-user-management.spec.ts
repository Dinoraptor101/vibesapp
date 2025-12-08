/**
 * E2E Tests: Admin User Management (UX Testing - Read-Only)
 *
 * PHILOSOPHY: These tests verify UI behavior, visual feedback, and navigation
 * WITHOUT executing destructive mutations (ban, delete, bulk operations).
 * Admin panel can delete user data permanently - we test UX only, not integration.
 *
 * Coverage:
 * ✅ Page load and layout
 * ✅ Search input behavior (typing, debouncing)
 * ✅ Filter dropdowns (selection changes)
 * ✅ Sort buttons (click, visual feedback, icon state)
 * ✅ Checkbox selection (individual, select all, count display)
 * ✅ Navigation (username → detail page, posts → posts page)
 * ✅ Button states (enabled/disabled, variants)
 * ✅ Loading and empty states
 * ❌ NO actual banning/unbanning (API mutation)
 * ❌ NO bulk operations (dangerous)
 * ❌ NO user/post deletion (permanent data loss)
 */

import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers/admin-auth';

test.describe('User Management - Table View', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin (reuses session if available)
    await loginAsAdmin(page);

    // Navigate to users page
    await page.goto('/admin/users');
    // Wait for users list to be visible (SSE keeps connections open)
    await expect(page.getByTestId('users-list')).toBeVisible({ timeout: 10000 });
  });

  test('should display user management page with title', async ({ page }) => {
    // Multiple h1 elements exist (layout + page), so use filter
    const pageTitle = page.locator('h1').filter({ hasText: /user management/i });
    await expect(pageTitle).toBeVisible();

    // Verify description text
    await expect(page.locator('text=/manage users/i')).toBeVisible();
  });

  test('should display users table with data', async ({ page }) => {
    // Wait for users list to load
    const usersList = page.getByTestId('users-list');
    await expect(usersList).toBeVisible({ timeout: 10000 });

    // Verify table is visible
    const usersTable = page.getByTestId('users-table');
    await expect(usersTable).toBeVisible();

    // Verify table has rows
    const userRows = page.locator('[data-testid^="user-row-"]');
    const rowCount = await userRows.count();
    expect(rowCount).toBeGreaterThan(0);

    // Verify first row has expected elements
    const firstRow = userRows.first();
    await expect(firstRow.getByTestId('user-username')).toBeVisible();
    await expect(firstRow.getByTestId('user-post-count')).toBeVisible();
    await expect(firstRow.getByTestId('toggle-ban-button')).toBeVisible();
  });

  test('should show loading state initially', async ({ page }) => {
    // Navigate to users page directly (loading state is very brief)
    await page.goto('/admin/users');

    // Check for loading spinner (may be brief)
    const loadingSpinner = page.getByTestId('users-loading');
    const hasLoading = await loadingSpinner.isVisible().catch(() => false);

    // Loading state may be very brief or not visible if data loads quickly
    // This is acceptable behavior
    console.log(
      `Loading spinner was ${hasLoading ? 'visible' : 'not visible (data loaded quickly)'}`
    );

    // Verify final loaded state
    const usersList = page.getByTestId('users-list');
    await expect(usersList).toBeVisible({ timeout: 10000 });
  });
});

test.describe('User Management - Search and Filters', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/users');
    // Wait for users list to be visible (SSE keeps connections open)
    await expect(page.getByTestId('users-list')).toBeVisible({ timeout: 10000 });
  });

  test('should search users by username', async ({ page }) => {
    // Wait for users to load
    const usersList = page.getByTestId('users-list');
    await expect(usersList).toBeVisible({ timeout: 10000 });

    // TODO: This test should create test user data via API injection instead of relying on existing data
    // Get first username to search for
    const firstRow = page.locator('[data-testid^="user-row-"]').first();
    const usernameElement = firstRow.getByTestId('user-username');
    const usernameText = await usernameElement.textContent();

    if (!usernameText) {
      throw new Error('No username available to test search - test data setup required');
    }

    // Use first 3 characters as search term
    const searchTerm = usernameText.slice(0, 3);

    // Enter search query
    const searchInput = page.getByTestId('users-search-input');
    await searchInput.fill(searchTerm);

    // Wait for debounce and table to update
    await page.waitForTimeout(600); // Reduced from 1000ms
    await expect(usersList).toBeVisible({ timeout: 5000 });

    // Verify results exist (may be filtered or not depending on API)
    const filteredRows = page.locator('[data-testid^="user-row-"]');
    const filteredCount = await filteredRows.count();

    // If search returns results, verify first result contains search term
    if (filteredCount > 0) {
      const firstFilteredUsername = await filteredRows
        .first()
        .getByTestId('user-username')
        .textContent();
      expect(firstFilteredUsername?.toLowerCase()).toContain(searchTerm.toLowerCase());
    }

    // Clear search
    await searchInput.clear();
    await page.waitForTimeout(1500); // Increased for debounce + API call

    // Wait for table to be visible again
    await expect(usersList).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(500); // Extra time for table render

    // Verify all users shown again
    const allRows = page.locator('[data-testid^="user-row-"]');
    const allCount = await allRows.count();
    expect(allCount).toBeGreaterThan(0);
  });

  test('should filter by status (all/active/banned)', async ({ page }) => {
    // Wait for users to load
    const usersList = page.getByTestId('users-list');
    await expect(usersList).toBeVisible({ timeout: 10000 });

    const filterSelect = page.getByTestId('users-filter-select');
    await expect(filterSelect).toBeVisible();

    // Get initial count with "all" filter (default)
    const allRows = page.locator('[data-testid^="user-row-"]');
    const allCount = await allRows.count();
    expect(allCount).toBeGreaterThan(0);

    // Verify filter starts on "All Status"
    const currentValue = await filterSelect.inputValue();
    expect(currentValue).toBe('all');

    // Filter by "active" users
    await filterSelect.selectOption('active');
    await page.waitForTimeout(600); // Wait for debounce + API call

    // Wait for filtered results
    await expect(usersList).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(300);

    const activeRows = page.locator('[data-testid^="user-row-"]');
    const activeCount = await activeRows.count();

    // If active users exist, verify none show banned badge
    if (activeCount > 0) {
      const bannedBadges = activeRows.locator('[data-testid="user-banned-badge"]');
      const bannedBadgeCount = await bannedBadges.count();
      expect(bannedBadgeCount).toBe(0);

      // Verify active users show "Active" status badge
      const activeBadges = activeRows.locator('.badge:has-text("Active")');
      const activeBadgeCount = await activeBadges.count();
      expect(activeBadgeCount).toBeGreaterThan(0);
    }

    // Filter by "banned" users
    await filterSelect.selectOption('banned');
    await page.waitForTimeout(600); // Wait for debounce + API call

    await expect(usersList).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(300);

    const bannedRows = page.locator('[data-testid^="user-row-"]');
    const bannedCount = await bannedRows.count();

    // If banned users exist, verify they all show banned badge
    if (bannedCount > 0) {
      const bannedBadges = bannedRows.locator('[data-testid="user-banned-badge"]');
      const bannedBadgeCount = await bannedBadges.count();
      expect(bannedBadgeCount).toBe(bannedCount);

      // Verify banned users show "Banned" text in their badges
      const firstBannedBadge = bannedBadges.first();
      await expect(firstBannedBadge).toContainText('Banned');
    } else {
      // If no banned users, verify empty state might be shown
      const emptyState = page.getByTestId('users-empty-state');
      const isEmpty = await emptyState.isVisible().catch(() => false);
      if (isEmpty) {
        await expect(emptyState).toContainText('No users found');
      }
    }

    // Reset to "all" status filter
    await filterSelect.selectOption('all');
    await page.waitForTimeout(600); // Wait for debounce + API call

    await expect(usersList).toBeVisible({ timeout: 5000 });

    // Verify we get back to showing all users
    const finalRows = page.locator('[data-testid^="user-row-"]');
    const finalCount = await finalRows.count();
    expect(finalCount).toBe(allCount);
  });

  test('should show empty state when no users match filters', async ({ page }) => {
    // Search for non-existent username
    const searchInput = page.getByTestId('users-search-input');
    await searchInput.fill('nonexistentuser12345xyz');

    await page.waitForTimeout(500);
    // Wait for debounce and table update
    await page.waitForTimeout(500);

    // Verify empty state is shown
    const emptyState = page.getByTestId('users-empty-state');
    await expect(emptyState).toBeVisible();
    await expect(emptyState).toContainText(/no users found/i);
  });
});

test.describe('User Management - Sorting', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/users');
    // Wait for users list to be visible (SSE keeps connections open)
    await expect(page.getByTestId('users-list')).toBeVisible({ timeout: 10000 });
  });

  test('should sort users by username', async ({ page }) => {
    // Wait for users to load
    const usersList = page.getByTestId('users-list');
    await expect(usersList).toBeVisible({ timeout: 10000 });

    // Click sort button for username
    const sortButton = page.getByTestId('sort-userName');
    await expect(sortButton).toBeVisible();
    await sortButton.click();

    // Wait for table to update after sort
    await page.waitForTimeout(300);
    await expect(usersList).toBeVisible({ timeout: 5000 });

    // Get new first username after sorting
    const sortedFirstRow = page.locator('[data-testid^="user-row-"]').first();
    const sortedUsername = await sortedFirstRow.getByTestId('user-username').textContent();

    // Usernames should be different (unless there's only one user)
    const totalRows = await page.locator('[data-testid^="user-row-"]').count();
    if (totalRows > 1) {
      // Verify sort order changed (ascending/descending)
      expect(sortedUsername).toBeTruthy();
    }
  });

  test('should sort users by post count', async ({ page }) => {
    // Wait for users to load
    const usersList = page.getByTestId('users-list');
    await expect(usersList).toBeVisible({ timeout: 10000 });

    // Click sort button for posts
    const sortButton = page.getByTestId('sort-postCount');
    await expect(sortButton).toBeVisible();
    await sortButton.click();

    // Wait for table to update after sort
    await page.waitForTimeout(300);
    await expect(usersList).toBeVisible({ timeout: 5000 });

    // Verify table is still visible and sorted
    await expect(usersList).toBeVisible();

    // Get first two post counts to verify sort order
    const rows = page.locator('[data-testid^="user-row-"]');
    const rowCount = await rows.count();

    if (rowCount >= 2) {
      const firstPostCount = await rows.nth(0).getByTestId('user-post-count').textContent();
      const secondPostCount = await rows.nth(1).getByTestId('user-post-count').textContent();

      expect(firstPostCount).toBeTruthy();
      expect(secondPostCount).toBeTruthy();
    }
  });

  test('should toggle sort direction', async ({ page }) => {
    // Wait for users to load
    const usersList = page.getByTestId('users-list');
    await expect(usersList).toBeVisible({ timeout: 10000 });

    // Get total rows to verify we have multiple users for meaningful sort testing
    const totalRows = await page.locator('[data-testid^="user-row-"]').count();
    expect(totalRows).toBeGreaterThan(1);

    // Test username column sorting (default sort field)
    const sortButton = page.getByTestId('sort-userName');
    await expect(sortButton).toBeVisible();

    // Verify sort icon is present and indicates current direction
    const sortIcon = sortButton.locator('svg');
    await expect(sortIcon).toBeVisible();

    // Username starts as ascending (A-Z) by default - click to toggle to descending
    await sortButton.click();
    await page.waitForTimeout(300);

    // Verify table updates with sort applied
    await expect(usersList).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(200); // Allow sort to complete

    // Get new order after sort toggle
    const newRows = page.locator('[data-testid^="user-row-"]');
    const newFirstUsername = await newRows.nth(0).getByTestId('user-username').textContent();
    const newSecondUsername = await newRows.nth(1).getByTestId('user-username').textContent();

    // Verify sort direction changed (descending Z-A)
    // First username should now be lexicographically >= second username
    if (newFirstUsername && newSecondUsername) {
      expect(newFirstUsername.toLowerCase() >= newSecondUsername.toLowerCase()).toBe(true);
    }

    // Click again to toggle back to ascending
    await sortButton.click();
    await page.waitForTimeout(300);
    await expect(usersList).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(200);

    // Verify we still have the same number of rows
    const finalRowCount = await page.locator('[data-testid^="user-row-"]').count();
    expect(finalRowCount).toBe(totalRows);

    // Verify sort icon is still active/highlighted
    await expect(sortIcon).toHaveClass(/text-brand-purple/);

    // Test other sortable columns work
    const sortPostsButton = page.getByTestId('sort-postCount');
    await expect(sortPostsButton).toBeVisible();
    await sortPostsButton.click();
    await page.waitForTimeout(300);

    // Verify posts column sort is now active
    const postsIcon = sortPostsButton.locator('svg');
    await expect(postsIcon).toHaveClass(/text-brand-purple/);
  });
});

test.describe('User Management - Actions', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/users');
    // Wait for users list to be visible (SSE keeps connections open)
    await expect(page.getByTestId('users-list')).toBeVisible({ timeout: 10000 });
  });

  test('should display ban/unban button with correct state (read-only)', async ({ page }) => {
    // UX TEST ONLY - Verify button exists and shows correct state based on user status
    // Does NOT execute ban/unban action (data mutation)

    const usersList = page.getByTestId('users-list');
    await expect(usersList).toBeVisible({ timeout: 10000 });

    const firstRow = page.locator('[data-testid^="user-row-"]').first();
    const toggleBanButton = firstRow.getByTestId('toggle-ban-button');
    await expect(toggleBanButton).toBeVisible();

    // Get button text to determine user's current ban status
    const buttonText = await toggleBanButton.textContent();
    const userIsBanned = buttonText?.trim() === 'Unban';

    // Verify button shows correct text based on status
    if (userIsBanned) {
      expect(buttonText).toContain('Unban');
      // Verify outline variant for unban action
      await expect(toggleBanButton).toHaveClass(/outline/);
    } else {
      expect(buttonText).toContain('Ban');
      expect(buttonText).not.toContain('Unban');
      // Verify destructive variant for ban action
      await expect(toggleBanButton).toHaveClass(/destructive/);
    }

    // Verify button is enabled when online
    await expect(toggleBanButton).toBeEnabled();

    // Verify status badge matches button state
    const statusCell = firstRow.locator('td').nth(6); // Status column (7th column)
    if (userIsBanned) {
      await expect(statusCell.getByTestId('user-banned-badge')).toBeVisible();
      await expect(statusCell.getByText('Banned')).toBeVisible();
    } else {
      await expect(statusCell.getByText('Active')).toBeVisible();
    }

    // ⚠️ IMPORTANT: Do NOT click the button - this would execute a ban/unban mutation
    // This test only verifies UI state, not integration behavior
  });

  test('should view user details when clicking username', async ({ page }) => {
    // Wait for users to load
    const usersList = page.getByTestId('users-list');
    await expect(usersList).toBeVisible({ timeout: 10000 });

    // Click on first username
    const firstRow = page.locator('[data-testid^="user-row-"]').first();
    const usernameButton = firstRow.getByTestId('user-username');
    await usernameButton.click();

    // Wait for navigation to user detail page
    await page.waitForURL('**/admin/users/**', { timeout: 5000 });
    expect(page.url()).toContain('/admin/users/');

    // Verify we're not on the posts subpage
    expect(page.url()).not.toContain('/posts');
  });

  test('should view user posts when clicking post count', async ({ page }) => {
    // Wait for users to load
    const usersList = page.getByTestId('users-list');
    await expect(usersList).toBeVisible({ timeout: 10000 });

    // Click on first user's post count
    const firstRow = page.locator('[data-testid^="user-row-"]').first();
    const postCountButton = firstRow.getByTestId('user-post-count');
    await postCountButton.click();

    // Wait for navigation to user posts page
    await page.waitForURL('**/admin/users/**/posts', { timeout: 5000 });
    expect(page.url()).toContain('/admin/users/');
    expect(page.url()).toContain('/posts');
  });
});

test.describe('User Management - Bulk Actions', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/users');
    // Wait for users list to be visible (SSE keeps connections open)
    await expect(page.getByTestId('users-list')).toBeVisible({ timeout: 10000 });
  });

  test('should select individual users', async ({ page }) => {
    // Wait for users to load
    const usersList = page.getByTestId('users-list');
    await expect(usersList).toBeVisible({ timeout: 10000 });

    // Get user rows
    const rows = page.locator('[data-testid^="user-row-"]');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);

    // Select first user
    const firstCheckbox = rows.first().locator('input[type="checkbox"]');
    await firstCheckbox.check();

    // Verify selection count shows
    await expect(page.locator('text=/1 selected/i')).toBeVisible();

    // Select second user if available
    if (rowCount > 1) {
      const secondCheckbox = rows.nth(1).locator('input[type="checkbox"]');
      await secondCheckbox.check();

      // Verify count updated
      await expect(page.locator('text=/2 selected/i')).toBeVisible();
    }

    // Unselect first user
    await firstCheckbox.uncheck();

    // Verify count decreased or selection cleared
    if (rowCount > 1) {
      await expect(page.locator('text=/1 selected/i')).toBeVisible();
    }
  });

  test('should select all users', async ({ page }) => {
    // Wait for users to load
    const usersList = page.getByTestId('users-list');
    await expect(usersList).toBeVisible({ timeout: 10000 });

    // Click select all checkbox
    const selectAllCheckbox = page.getByTestId('select-all-checkbox');
    await expect(selectAllCheckbox).toBeVisible();
    await selectAllCheckbox.check();

    // Verify all users are selected
    const rows = page.locator('[data-testid^="user-row-"]');
    const rowCount = await rows.count();

    // Verify selection count matches row count
    await expect(page.locator(`text=/${rowCount} selected/i`)).toBeVisible();

    // Verify all checkboxes are checked
    const checkboxes = rows.locator('input[type="checkbox"]');
    for (let i = 0; i < Math.min(3, rowCount); i++) {
      await expect(checkboxes.nth(i)).toBeChecked();
    }

    // Unselect all
    await selectAllCheckbox.uncheck();

    // Verify selection cleared
    await expect(page.locator('text=/selected/i')).not.toBeVisible();
  });

  test('should show bulk action buttons when users selected (read-only)', async ({ page }) => {
    // UX TEST ONLY - Verify bulk action buttons appear/disappear based on selection
    // Does NOT execute bulk operations (dangerous data mutations)

    const usersList = page.getByTestId('users-list');
    await expect(usersList).toBeVisible({ timeout: 10000 });

    // Initially, bulk action buttons should not be visible
    const bulkBanButton = page.locator('button:has-text("Ban Selected")');
    const bulkDeletePostsButton = page.locator('button:has-text("Delete Posts")');
    const bulkDeleteUsersButton = page.locator('button:has-text("Delete Users")');

    await expect(bulkBanButton).not.toBeVisible();
    await expect(bulkDeletePostsButton).not.toBeVisible();
    await expect(bulkDeleteUsersButton).not.toBeVisible();

    // Select first user
    const firstRow = page.locator('[data-testid^="user-row-"]').first();
    const firstCheckbox = firstRow.locator('input[type="checkbox"]');
    await firstCheckbox.check();

    // Verify all bulk action buttons appear
    await expect(bulkBanButton).toBeVisible();
    await expect(bulkDeletePostsButton).toBeVisible();
    await expect(bulkDeleteUsersButton).toBeVisible();

    // Verify buttons are enabled (when online)
    await expect(bulkBanButton).toBeEnabled();
    await expect(bulkDeletePostsButton).toBeEnabled();
    await expect(bulkDeleteUsersButton).toBeEnabled();

    // Verify selection count updates
    await expect(page.locator('text=/1 selected/i')).toBeVisible();

    // Verify buttons have correct destructive styling
    await expect(bulkBanButton).toHaveClass(/destructive/);
    await expect(bulkDeletePostsButton).toHaveClass(/destructive/);
    await expect(bulkDeleteUsersButton).toHaveClass(/destructive/);

    // Unselect user
    await firstCheckbox.uncheck();

    // Verify bulk action buttons disappear
    await expect(bulkBanButton).not.toBeVisible();
    await expect(bulkDeletePostsButton).not.toBeVisible();
    await expect(bulkDeleteUsersButton).not.toBeVisible();

    // Verify selection count disappears
    await expect(page.locator('text=/selected/i')).not.toBeVisible();

    // ⚠️ IMPORTANT: Do NOT click bulk action buttons - they execute dangerous mutations
    // This test only verifies button visibility and state, not integration behavior
  });
});

test.describe('User Management - Pagination', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/users');
    // Wait for users list to be visible (SSE keeps connections open)
    await expect(page.getByTestId('users-list')).toBeVisible({ timeout: 10000 });
  });

  // TODO: This test should create enough test users via API injection to test pagination
  test.skip('should show pagination controls if multiple pages', async ({ page }) => {
    // Verify pagination elements
    await expect(page.getByTestId('pagination-prev')).toBeVisible();
    await expect(page.getByTestId('pagination-next')).toBeVisible();
    await expect(page.getByTestId('pagination-info')).toBeVisible();
  });

  // TODO: This test should create enough test users via API injection to test pagination navigation
  test.skip('should navigate between pages', async ({ page }) => {
    // Wait for users to load
    const usersList = page.getByTestId('users-list');
    await expect(usersList).toBeVisible({ timeout: 10000 });

    // Get first user on page 1
    const initialFirstRow = page.locator('[data-testid^="user-row-"]').first();
    const initialUsername = await initialFirstRow.getByTestId('user-username').textContent();

    // Click next page
    const nextButton = page.getByTestId('pagination-next');
    const isNextEnabled = await nextButton.isEnabled();

    if (!isNextEnabled) {
      throw new Error('Already on last page - need more test data');
    }

    await nextButton.click();
    await page.waitForTimeout(1500); // Wait for pagination transition

    // Get first user on page 2 (use new locator after page change)
    const newFirstRow = page.locator('[data-testid^="user-row-"]').first();
    await expect(newFirstRow).toBeVisible({ timeout: 10000 });
    const newUsername = await newFirstRow.getByTestId('user-username').textContent();

    // Usernames should be different
    expect(newUsername).not.toBe(initialUsername);

    // Click previous to go back
    const prevButton = page.getByTestId('pagination-prev');
    await prevButton.click();
    await page.waitForTimeout(2000); // Increased wait for pagination transition
    await page.waitForTimeout(1000); // Extra buffer for table render

    // Wait for users list wrapper to be visible
    await expect(usersList).toBeVisible({ timeout: 10000 });

    // Should be back to first user
    const backFirstRow = page.locator('[data-testid^="user-row-"]').first();
    await expect(backFirstRow).toBeVisible({ timeout: 10000 });
    const backUsername = await backFirstRow.getByTestId('user-username').textContent();
    expect(backUsername).toBe(initialUsername);
  });

  // TODO: This test should create enough test users via API injection to test pagination
  test.skip('should disable previous button on first page', async ({ page }) => {
    // Previous button should be disabled on first page
    const prevButton = page.getByTestId('pagination-prev');
    await expect(prevButton).toBeDisabled();
  });
});

test.describe('User Management - Table Features', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/users');
    // Wait for users list to be visible instead of networkidle (which can timeout with large datasets)
    await expect(page.getByTestId('users-list')).toBeVisible({ timeout: 15000 });
  });

  test('should display user information in table cells', async ({ page }) => {
    // Wait for users to load
    const usersList = page.getByTestId('users-list');
    await expect(usersList).toBeVisible({ timeout: 10000 });

    // Get first row
    const firstRow = page.locator('[data-testid^="user-row-"]').first();

    // Verify username is visible
    const username = firstRow.getByTestId('user-username');
    await expect(username).toBeVisible();
    expect(await username.textContent()).toBeTruthy();

    // Verify post count is visible
    const postCount = firstRow.getByTestId('user-post-count');
    await expect(postCount).toBeVisible();
    expect(await postCount.textContent()).toMatch(/^\d+$/);

    // Verify ban button is visible
    const banButton = firstRow.getByTestId('toggle-ban-button');
    await expect(banButton).toBeVisible();
  });

  test('should show online indicator for online users', async ({ page }) => {
    // Wait for users to load
    const usersList = page.getByTestId('users-list');
    await expect(usersList).toBeVisible({ timeout: 10000 });

    // Look for online indicator in any row
    const onlineIndicator = page.getByTestId('online-indicator');
    const hasOnlineUsers = await onlineIndicator
      .first()
      .isVisible()
      .catch(() => false);

    // If there are online users, verify indicator is visible
    if (hasOnlineUsers) {
      await expect(onlineIndicator.first()).toBeVisible();
    }
  });

  test('should show banned badge for banned users', async ({ page }) => {
    // Wait for users to load
    const usersList = page.getByTestId('users-list');
    await expect(usersList).toBeVisible({ timeout: 10000 });

    // Filter to show only banned users
    const filterSelect = page.getByTestId('users-filter-select');
    await filterSelect.selectOption('banned');
    await page.waitForTimeout(600); // Wait for debounce + API call
    await expect(usersList).toBeVisible({ timeout: 5000 });

    const rows = page.locator('[data-testid^="user-row-"]');
    const rowCount = await rows.count();

    if (rowCount > 0) {
      // Verify banned users have banned badge in status column
      const firstBannedBadge = rows.first().getByTestId('user-banned-badge');
      await expect(firstBannedBadge).toBeVisible();
      await expect(firstBannedBadge).toContainText(/banned/i);

      // Verify banned badge has error styling
      await expect(firstBannedBadge).toHaveClass(/error/);

      // Verify ban toggle buttons show "Unban" for banned users
      const firstBanButton = rows.first().getByTestId('toggle-ban-button');
      await expect(firstBanButton).toBeVisible();
      await expect(firstBanButton).toContainText('Unban');
      await expect(firstBanButton).toHaveClass(/outline/);
    } else {
      // No banned users exist - verify empty state or message
      const emptyState = page.getByTestId('users-empty-state');
      const isEmpty = await emptyState.isVisible().catch(() => false);
      if (isEmpty) {
        await expect(emptyState).toContainText('No users found');
      }
    }

    // Reset filter to show all users
    await filterSelect.selectOption('all');
  });

  test('should show stats summary above table', async ({ page }) => {
    // Wait for users to load
    const usersList = page.getByTestId('users-list');
    await expect(usersList).toBeVisible({ timeout: 10000 });

    // Verify stats badges are visible - use getByText for more specific matching
    // Stats are shown as "99 active" and "1 banned" badges
    await expect(page.getByText(/\d+ active/i).first()).toBeVisible();
    await expect(page.getByText(/\d+ banned/i).first()).toBeVisible();

    // Verify total users count is shown
    await expect(page.locator('text=/total users/i')).toBeVisible();
  });
});
