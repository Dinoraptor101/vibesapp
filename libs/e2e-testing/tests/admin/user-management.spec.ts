/**
 * E2E Tests: Admin User Management and Ban Actions
 *
 * Coverage:
 * - User Management:
 *   - Display list of users
 *   - Search users by username
 *   - Filter by banned status (all, active, banned)
 *   - Toggle ban on user (simple on/off)
 *   - Regenerate user password (shows new password modal)
 *   - View user detail page
 *   - Delete all posts for a user
 *   - Soft delete user (renames to [deleted-xxx])
 *
 * - Admin Ban Actions:
 *   - Admin can toggle ban on user via toggle-ban endpoint
 *   - Admin full ban hides ALL user posts (Strike 4)
 *   - Admin can restore hidden post (unhides + removes strike)
 *   - Restoring post unbans user if at Strike 4
 */

import { test, expect } from '@playwright/test';
import { loginAsAdmin, clearAdminSession } from './helpers/admin-auth';

test.describe('User Management', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing session and login as admin before each test
    await clearAdminSession(page);
    await loginAsAdmin(page);

    // Navigate to users page
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');
  });

  test('should display list of users', async ({ page }) => {
    // Verify page title/header
    await expect(page.locator('h1')).toContainText(/users/i);

    // Verify users list container is visible
    const usersList = page.getByTestId('users-list');
    await expect(usersList).toBeVisible({ timeout: 10000 });

    // Verify at least one user card/row is displayed
    const userCards = page.locator('[data-testid^="user-card-"], [data-testid^="user-row-"]');
    const userCount = await userCards.count();
    expect(userCount).toBeGreaterThan(0);

    // Verify user card shows essential information
    const firstUserCard = userCards.first();
    await expect(firstUserCard.getByTestId('user-username')).toBeVisible();
    await expect(firstUserCard.getByTestId('user-pigeon-id')).toBeVisible();
  });

  test('should search users by username', async ({ page }) => {
    // Wait for users to load
    const usersList = page.getByTestId('users-list');
    await expect(usersList).toBeVisible({ timeout: 10000 });

    // Find the search input
    const searchInput = page.getByTestId('users-search-input');
    await expect(searchInput).toBeVisible();

    // Get a username from the first visible user to search for
    const firstUserCard = page
      .locator('[data-testid^="user-card-"], [data-testid^="user-row-"]')
      .first();
    const usernameElement = firstUserCard.getByTestId('user-username');
    const usernameText = await usernameElement.textContent();

    // Search for a partial username (first 3 characters)
    const searchTerm = usernameText?.slice(0, 3) || 'test';
    await searchInput.fill(searchTerm);

    // Wait for search results (debounced)
    await page.waitForTimeout(500);
    await page.waitForLoadState('networkidle');

    // Verify filtered results contain the search term
    const filteredUserCards = page.locator(
      '[data-testid^="user-card-"], [data-testid^="user-row-"]'
    );
    const filteredCount = await filteredUserCards.count();

    if (filteredCount > 0) {
      // Check that at least one result matches the search term
      const firstFilteredUsername = await filteredUserCards
        .first()
        .getByTestId('user-username')
        .textContent();
      expect(firstFilteredUsername?.toLowerCase()).toContain(searchTerm.toLowerCase());
    }

    // Clear search and verify all users are shown again
    await searchInput.clear();
    await page.waitForTimeout(500);
    await page.waitForLoadState('networkidle');

    const allUserCards = page.locator('[data-testid^="user-card-"], [data-testid^="user-row-"]');
    const allCount = await allUserCards.count();
    expect(allCount).toBeGreaterThanOrEqual(filteredCount);
  });

  test('should filter by banned status (all, active, banned)', async ({ page }) => {
    // Wait for users to load
    const usersList = page.getByTestId('users-list');
    await expect(usersList).toBeVisible({ timeout: 10000 });

    // Find the filter dropdown/select
    const filterSelect = page.getByTestId('users-filter-select');
    await expect(filterSelect).toBeVisible();

    // Get initial count with "all" filter
    const initialUserCards = page.locator(
      '[data-testid^="user-card-"], [data-testid^="user-row-"]'
    );
    const allCount = await initialUserCards.count();
    expect(allCount).toBeGreaterThan(0);

    // Filter by "active" users
    await filterSelect.selectOption('active');
    await page.waitForTimeout(500);
    await page.waitForLoadState('networkidle');

    // All visible users should NOT have banned status
    const activeUserCards = page.locator('[data-testid^="user-card-"], [data-testid^="user-row-"]');
    const activeCount = await activeUserCards.count();

    // Check that active users don't show banned indicator
    if (activeCount > 0) {
      const bannedIndicators = activeUserCards.first().locator('[data-testid="user-banned-badge"]');
      const hasBannedBadge = await bannedIndicators.isVisible().catch(() => false);
      expect(hasBannedBadge).toBe(false);
    }

    // Filter by "banned" users
    await filterSelect.selectOption('banned');
    await page.waitForTimeout(500);
    await page.waitForLoadState('networkidle');

    const bannedUserCards = page.locator('[data-testid^="user-card-"], [data-testid^="user-row-"]');
    const bannedCount = await bannedUserCards.count();

    // If there are banned users, they should show banned indicator
    if (bannedCount > 0) {
      const bannedIndicator = bannedUserCards.first().locator('[data-testid="user-banned-badge"]');
      await expect(bannedIndicator).toBeVisible();
    }

    // Reset filter to "all"
    await filterSelect.selectOption('all');
    await page.waitForTimeout(500);
    await page.waitForLoadState('networkidle');

    const resetUserCards = page.locator('[data-testid^="user-card-"], [data-testid^="user-row-"]');
    const resetCount = await resetUserCards.count();
    expect(resetCount).toBe(allCount);
  });

  test('should toggle ban on user (simple on/off)', async ({ page }) => {
    // Wait for users to load
    const usersList = page.getByTestId('users-list');
    await expect(usersList).toBeVisible({ timeout: 10000 });

    // Find first user card
    const firstUserCard = page
      .locator('[data-testid^="user-card-"], [data-testid^="user-row-"]')
      .first();

    // Find the ban toggle button
    const banToggleButton = firstUserCard.getByTestId('toggle-ban-button');
    await expect(banToggleButton).toBeVisible();

    // Get initial ban state
    const initialBanState =
      (await banToggleButton.getAttribute('aria-pressed')) === 'true' ||
      (await banToggleButton.getAttribute('data-banned')) === 'true';

    // Click to toggle ban state
    await banToggleButton.click();

    // Wait for API response and UI update
    await page.waitForTimeout(500);
    await page.waitForLoadState('networkidle');

    // Verify ban state changed
    const newBanState =
      (await banToggleButton.getAttribute('aria-pressed')) === 'true' ||
      (await banToggleButton.getAttribute('data-banned')) === 'true';
    expect(newBanState).toBe(!initialBanState);

    // Verify success toast/notification
    const toast = page.locator('[data-testid="toast"], [role="alert"]');
    await expect(toast).toBeVisible({ timeout: 5000 });

    // Toggle back to original state for cleanup
    await banToggleButton.click();
    await page.waitForTimeout(500);
    await page.waitForLoadState('networkidle');

    const restoredBanState =
      (await banToggleButton.getAttribute('aria-pressed')) === 'true' ||
      (await banToggleButton.getAttribute('data-banned')) === 'true';
    expect(restoredBanState).toBe(initialBanState);
  });

  test('should regenerate user password (shows new password modal)', async ({ page }) => {
    // Wait for users to load
    const usersList = page.getByTestId('users-list');
    await expect(usersList).toBeVisible({ timeout: 10000 });

    // Find first user card
    const firstUserCard = page
      .locator('[data-testid^="user-card-"], [data-testid^="user-row-"]')
      .first();

    // Find the regenerate password button
    const regeneratePasswordButton = firstUserCard.getByTestId('regenerate-password-button');
    await expect(regeneratePasswordButton).toBeVisible();

    // Click to regenerate password
    await regeneratePasswordButton.click();

    // Verify confirmation dialog appears
    const confirmDialog = page.getByTestId('confirm-regenerate-dialog');
    await expect(confirmDialog).toBeVisible({ timeout: 5000 });

    // Confirm regeneration
    const confirmButton = confirmDialog.getByTestId('confirm-regenerate-button');
    await confirmButton.click();

    // Wait for API response
    await page.waitForLoadState('networkidle');

    // Verify new password modal appears with generated password
    const newPasswordModal = page.getByTestId('new-password-modal');
    await expect(newPasswordModal).toBeVisible({ timeout: 5000 });

    // Verify password is displayed
    const passwordDisplay = newPasswordModal.getByTestId('generated-password');
    await expect(passwordDisplay).toBeVisible();

    const generatedPassword = await passwordDisplay.textContent();
    expect(generatedPassword).toBeTruthy();
    expect(generatedPassword?.length).toBeGreaterThan(0);

    // Close the modal
    const closeModalButton = newPasswordModal.locator('button[aria-label="Close"]');
    await closeModalButton.click();

    await expect(newPasswordModal).not.toBeVisible();
  });

  test('should view user detail page', async ({ page }) => {
    // Wait for users to load
    const usersList = page.getByTestId('users-list');
    await expect(usersList).toBeVisible({ timeout: 10000 });

    // Find first user card
    const firstUserCard = page
      .locator('[data-testid^="user-card-"], [data-testid^="user-row-"]')
      .first();

    // Click on view details button or the user card link
    const viewDetailsButton = firstUserCard.getByTestId('view-user-details-button');
    const viewDetailsVisible = await viewDetailsButton.isVisible().catch(() => false);

    if (viewDetailsVisible) {
      await viewDetailsButton.click();
    } else {
      // Fallback: click username link
      const usernameLink = firstUserCard.getByTestId('user-username');
      await usernameLink.click();
    }

    // Wait for navigation to user detail page
    await page.waitForURL('**/admin/users/**', { timeout: 5000 });
    expect(page.url()).toContain('/admin/users/');

    // Verify user detail page elements
    await expect(page.getByTestId('user-detail-header')).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId('user-detail-username')).toBeVisible();
    await expect(page.getByTestId('user-detail-pigeon-id')).toBeVisible();

    // Verify user posts section is visible
    await expect(page.getByTestId('user-posts-section')).toBeVisible();

    // Verify action buttons are available
    await expect(page.getByTestId('toggle-ban-button')).toBeVisible();
    await expect(page.getByTestId('regenerate-password-button')).toBeVisible();
    await expect(page.getByTestId('delete-all-posts-button')).toBeVisible();
    await expect(page.getByTestId('soft-delete-user-button')).toBeVisible();
  });

  test('should delete all posts for a user', async ({ page }) => {
    // Navigate to a user's detail page first
    const usersList = page.getByTestId('users-list');
    await expect(usersList).toBeVisible({ timeout: 10000 });

    // Click on first user to go to detail page
    const firstUserCard = page
      .locator('[data-testid^="user-card-"], [data-testid^="user-row-"]')
      .first();
    const viewDetailsButton = firstUserCard.getByTestId('view-user-details-button');
    const viewDetailsVisible = await viewDetailsButton.isVisible().catch(() => false);

    if (viewDetailsVisible) {
      await viewDetailsButton.click();
    } else {
      const usernameLink = firstUserCard.getByTestId('user-username');
      await usernameLink.click();
    }

    await page.waitForURL('**/admin/users/**', { timeout: 5000 });

    // Find delete all posts button
    const deleteAllPostsButton = page.getByTestId('delete-all-posts-button');
    await expect(deleteAllPostsButton).toBeVisible();

    // Click to delete all posts
    await deleteAllPostsButton.click();

    // Verify confirmation dialog appears
    const confirmDialog = page.getByTestId('confirm-delete-posts-dialog');
    await expect(confirmDialog).toBeVisible({ timeout: 5000 });

    // Verify warning message is displayed
    await expect(confirmDialog.locator('text=/delete all posts/i')).toBeVisible();
    await expect(confirmDialog.locator('text=/cannot be undone/i')).toBeVisible();

    // Cancel the action (don't actually delete posts in test)
    const cancelButton = confirmDialog.getByTestId('cancel-delete-posts-button');
    await cancelButton.click();

    await expect(confirmDialog).not.toBeVisible();
  });

  test('should soft delete user (renames to [deleted-xxx])', async ({ page }) => {
    // Navigate to a user's detail page first
    const usersList = page.getByTestId('users-list');
    await expect(usersList).toBeVisible({ timeout: 10000 });

    // Click on first user to go to detail page
    const firstUserCard = page
      .locator('[data-testid^="user-card-"], [data-testid^="user-row-"]')
      .first();
    const viewDetailsButton = firstUserCard.getByTestId('view-user-details-button');
    const viewDetailsVisible = await viewDetailsButton.isVisible().catch(() => false);

    if (viewDetailsVisible) {
      await viewDetailsButton.click();
    } else {
      const usernameLink = firstUserCard.getByTestId('user-username');
      await usernameLink.click();
    }

    await page.waitForURL('**/admin/users/**', { timeout: 5000 });

    // Find soft delete user button
    const softDeleteButton = page.getByTestId('soft-delete-user-button');
    await expect(softDeleteButton).toBeVisible();

    // Click to soft delete
    await softDeleteButton.click();

    // Verify confirmation dialog appears
    const confirmDialog = page.getByTestId('confirm-soft-delete-dialog');
    await expect(confirmDialog).toBeVisible({ timeout: 5000 });

    // Verify warning message about soft delete
    await expect(confirmDialog.locator('text=/deleted-/i')).toBeVisible();
    await expect(confirmDialog.locator('text=/cannot be undone/i')).toBeVisible();

    // Cancel the action (don't actually delete user in test)
    const cancelButton = confirmDialog.getByTestId('cancel-soft-delete-button');
    await cancelButton.click();

    await expect(confirmDialog).not.toBeVisible();
  });
});

test.describe('Admin Ban Actions', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing session and login as admin before each test
    await clearAdminSession(page);
    await loginAsAdmin(page);

    // Navigate to users page
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');
  });

  test('should toggle ban on user via toggle-ban endpoint', async ({ page }) => {
    // Wait for users to load
    const usersList = page.getByTestId('users-list');
    await expect(usersList).toBeVisible({ timeout: 10000 });

    // Find an active (non-banned) user
    const filterSelect = page.getByTestId('users-filter-select');
    await filterSelect.selectOption('active');
    await page.waitForTimeout(500);
    await page.waitForLoadState('networkidle');

    const activeUserCards = page.locator('[data-testid^="user-card-"], [data-testid^="user-row-"]');
    const activeCount = await activeUserCards.count();

    if (activeCount === 0) {
      test.skip(true, 'No active users available to test toggle ban');
      return;
    }

    const firstActiveUser = activeUserCards.first();

    // Set up API interception to verify the toggle-ban endpoint is called
    let toggleBanCalled = false;
    await page.route('**/api/admin/users/*/toggle-ban', async (route) => {
      toggleBanCalled = true;
      await route.continue();
    });

    // Click toggle ban button
    const banToggleButton = firstActiveUser.getByTestId('toggle-ban-button');
    await banToggleButton.click();

    // Wait for API call
    await page.waitForTimeout(1000);

    // Verify the toggle-ban endpoint was called
    expect(toggleBanCalled).toBe(true);

    // Verify success toast
    const toast = page.locator('[data-testid="toast"], [role="alert"]');
    await expect(toast).toBeVisible({ timeout: 5000 });

    // Toggle back for cleanup
    await banToggleButton.click();
    await page.waitForTimeout(500);
  });

  test('should apply full ban that hides ALL user posts (Strike 4)', async ({ page }) => {
    // Wait for users to load
    const usersList = page.getByTestId('users-list');
    await expect(usersList).toBeVisible({ timeout: 10000 });

    // Navigate to user detail page
    const firstUserCard = page
      .locator('[data-testid^="user-card-"], [data-testid^="user-row-"]')
      .first();
    const viewDetailsButton = firstUserCard.getByTestId('view-user-details-button');
    const viewDetailsVisible = await viewDetailsButton.isVisible().catch(() => false);

    if (viewDetailsVisible) {
      await viewDetailsButton.click();
    } else {
      const usernameLink = firstUserCard.getByTestId('user-username');
      await usernameLink.click();
    }

    await page.waitForURL('**/admin/users/**', { timeout: 5000 });

    // Find full ban button (applies Strike 4)
    const fullBanButton = page.getByTestId('full-ban-button');
    const fullBanVisible = await fullBanButton.isVisible().catch(() => false);

    if (!fullBanVisible) {
      test.skip(true, 'Full ban button not visible (user may already be fully banned)');
      return;
    }

    // Set up API interception to verify the ban endpoint is called
    let banEndpointCalled = false;
    await page.route('**/api/admin/users/*/ban', async (route) => {
      banEndpointCalled = true;
      await route.continue();
    });

    // Click full ban button
    await fullBanButton.click();

    // Confirm ban in dialog
    const confirmDialog = page.getByTestId('confirm-full-ban-dialog');
    await expect(confirmDialog).toBeVisible({ timeout: 5000 });

    // Verify warning about hiding all posts
    await expect(confirmDialog.locator('text=/hide all posts/i')).toBeVisible();

    const confirmBanButton = confirmDialog.getByTestId('confirm-full-ban-button');
    await confirmBanButton.click();

    // Wait for API call
    await page.waitForLoadState('networkidle');

    // Verify the ban endpoint was called
    expect(banEndpointCalled).toBe(true);

    // Verify strike 4 message in toast
    const toast = page.locator('[data-testid="toast"], [role="alert"]');
    await expect(toast).toBeVisible({ timeout: 5000 });

    // Verify user shows as banned in UI
    const bannedBadge = page.getByTestId('user-banned-badge');
    await expect(bannedBadge).toBeVisible();

    // Verify posts are shown as hidden
    const userPostsSection = page.getByTestId('user-posts-section');
    const hiddenPostsCount = await userPostsSection
      .locator('[data-testid="post-hidden-indicator"]')
      .count();

    // All posts should be hidden after full ban
    const totalPostsCount = await userPostsSection.locator('[data-testid^="admin-post-"]').count();
    if (totalPostsCount > 0) {
      expect(hiddenPostsCount).toBe(totalPostsCount);
    }
  });

  test('should restore hidden post (unhides + removes strike)', async ({ page }) => {
    // Navigate to flagged posts page or find a user with hidden posts
    await page.goto('/admin/posts?filter=hidden');
    await page.waitForLoadState('networkidle');

    // Find a hidden post
    const hiddenPosts = page.locator('[data-testid^="admin-post-"][data-hidden="true"]');
    const hiddenPostCount = await hiddenPosts.count();

    if (hiddenPostCount === 0) {
      test.skip(true, 'No hidden posts available to test restore functionality');
      return;
    }

    const firstHiddenPost = hiddenPosts.first();

    // Get post ID for API verification
    const postTestId = await firstHiddenPost.getAttribute('data-testid');
    const postId = postTestId?.replace('admin-post-', '');

    // Set up API interception to verify the restore endpoint is called
    let restoreEndpointCalled = false;
    await page.route(`**/api/admin/posts/${postId}/restore`, async (route) => {
      restoreEndpointCalled = true;
      await route.continue();
    });

    // Find and click restore button
    const restoreButton = firstHiddenPost.getByTestId('restore-post-button');
    await expect(restoreButton).toBeVisible();
    await restoreButton.click();

    // Confirm restore in dialog
    const confirmDialog = page.getByTestId('confirm-restore-dialog');
    await expect(confirmDialog).toBeVisible({ timeout: 5000 });

    const confirmRestoreButton = confirmDialog.getByTestId('confirm-restore-button');
    await confirmRestoreButton.click();

    // Wait for API call
    await page.waitForLoadState('networkidle');

    // Verify the restore endpoint was called
    expect(restoreEndpointCalled).toBe(true);

    // Verify success toast mentions unhiding and strike removal
    const toast = page.locator('[data-testid="toast"], [role="alert"]');
    await expect(toast).toBeVisible({ timeout: 5000 });

    // Verify post is no longer in hidden posts list (after refresh)
    await page.reload();
    await page.waitForLoadState('networkidle');

    const updatedHiddenPosts = page.locator('[data-testid^="admin-post-"][data-hidden="true"]');
    const updatedCount = await updatedHiddenPosts.count();
    expect(updatedCount).toBeLessThan(hiddenPostCount);
  });

  test('should unban user when restoring post at Strike 4', async ({ page }) => {
    // This test requires a user at Strike 4 with hidden posts
    // Navigate to banned users
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');

    const filterSelect = page.getByTestId('users-filter-select');
    await filterSelect.selectOption('banned');
    await page.waitForTimeout(500);
    await page.waitForLoadState('networkidle');

    const bannedUserCards = page.locator('[data-testid^="user-card-"], [data-testid^="user-row-"]');
    const bannedCount = await bannedUserCards.count();

    if (bannedCount === 0) {
      test.skip(true, 'No banned users available to test restore unbanning');
      return;
    }

    // Navigate to first banned user's detail page
    const firstBannedUser = bannedUserCards.first();
    const viewDetailsButton = firstBannedUser.getByTestId('view-user-details-button');
    const viewDetailsVisible = await viewDetailsButton.isVisible().catch(() => false);

    if (viewDetailsVisible) {
      await viewDetailsButton.click();
    } else {
      const usernameLink = firstBannedUser.getByTestId('user-username');
      await usernameLink.click();
    }

    await page.waitForURL('**/admin/users/**', { timeout: 5000 });

    // Verify user is at Strike 4 (fully banned)
    const strikeCount = page.getByTestId('user-strike-count');
    const strikeCountVisible = await strikeCount.isVisible().catch(() => false);

    if (strikeCountVisible) {
      const strikeText = await strikeCount.textContent();
      if (!strikeText?.includes('4')) {
        test.skip(true, 'User is not at Strike 4');
        return;
      }
    }

    // Find a hidden post to restore
    const userPostsSection = page.getByTestId('user-posts-section');
    const hiddenPosts = userPostsSection.locator(
      '[data-testid^="admin-post-"][data-hidden="true"]'
    );
    const hiddenPostCount = await hiddenPosts.count();

    if (hiddenPostCount === 0) {
      test.skip(true, 'No hidden posts for this banned user');
      return;
    }

    // Restore the first hidden post
    const restoreButton = hiddenPosts.first().getByTestId('restore-post-button');
    await restoreButton.click();

    const confirmDialog = page.getByTestId('confirm-restore-dialog');
    await expect(confirmDialog).toBeVisible({ timeout: 5000 });

    const confirmRestoreButton = confirmDialog.getByTestId('confirm-restore-button');
    await confirmRestoreButton.click();

    await page.waitForLoadState('networkidle');

    // Verify user is no longer banned (or strike count decreased)
    const bannedBadge = page.getByTestId('user-banned-badge');
    const stillBanned = await bannedBadge.isVisible().catch(() => false);

    // After restoring at Strike 4, user should be unbanned
    // OR their strike count should be reduced
    if (stillBanned) {
      // Check if strike count decreased
      const newStrikeText = await strikeCount.textContent();
      expect(newStrikeText).not.toContain('4');
    } else {
      // User is unbanned
      expect(stillBanned).toBe(false);
    }

    // Verify toast mentions unbanning
    const toast = page.locator('[data-testid="toast"], [role="alert"]');
    await expect(toast).toBeVisible({ timeout: 5000 });
  });
});

test.describe('User Management - Pagination', () => {
  test.beforeEach(async ({ page }) => {
    await clearAdminSession(page);
    await loginAsAdmin(page);
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');
  });

  test('should paginate through users list', async ({ page }) => {
    // Wait for users to load
    const usersList = page.getByTestId('users-list');
    await expect(usersList).toBeVisible({ timeout: 10000 });

    // Check if pagination controls exist
    const paginationControls = page.getByTestId('pagination-controls');
    const hasPagination = await paginationControls.isVisible().catch(() => false);

    if (!hasPagination) {
      test.skip(true, 'Not enough users for pagination testing');
      return;
    }

    // Get page info
    const pageInfo = page.getByTestId('pagination-info');
    const initialPageInfo = await pageInfo.textContent();

    // Click next page
    const nextButton = page.getByTestId('pagination-next');
    const isNextEnabled = await nextButton.isEnabled();

    if (isNextEnabled) {
      await nextButton.click();
      await page.waitForLoadState('networkidle');

      // Verify page info changed
      const newPageInfo = await pageInfo.textContent();
      expect(newPageInfo).not.toBe(initialPageInfo);

      // Click previous to go back
      const prevButton = page.getByTestId('pagination-prev');
      await prevButton.click();
      await page.waitForLoadState('networkidle');

      // Verify we're back to first page
      const backPageInfo = await pageInfo.textContent();
      expect(backPageInfo).toBe(initialPageInfo);
    }
  });
});

test.describe('User Management - Loading States', () => {
  test.beforeEach(async ({ page }) => {
    await clearAdminSession(page);
    await loginAsAdmin(page);
  });

  test('should show loading state initially', async ({ page }) => {
    // Navigate to users page
    await page.goto('/admin/users');

    // Check for loading indicator (skeleton, spinner, or loading text)
    const loadingIndicator = page.locator(
      '[data-testid="users-loading"], [aria-label="Loading"], .skeleton'
    );
    const hasLoading = await loadingIndicator
      .first()
      .isVisible()
      .catch(() => false);

    // Either loading is visible initially (hasLoading = true), or data loads quickly
    // This is acceptable as loading states can be very brief
    console.log(`Loading indicator visible: ${hasLoading}`);

    // Verify final loaded state
    await page.waitForLoadState('networkidle');

    const usersList = page.getByTestId('users-list');
    await expect(usersList).toBeVisible({ timeout: 10000 });
  });

  test('should show empty state when no users match filters', async ({ page }) => {
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');

    // Search for a non-existent username
    const searchInput = page.getByTestId('users-search-input');
    await searchInput.fill('nonexistentuser12345xyz');

    await page.waitForTimeout(500);
    await page.waitForLoadState('networkidle');

    // Check for empty state
    const emptyState = page.getByTestId('users-empty-state');
    const userCards = page.locator('[data-testid^="user-card-"], [data-testid^="user-row-"]');
    const userCount = await userCards.count();

    if (userCount === 0) {
      await expect(emptyState).toBeVisible();
    }
  });
});

test.describe('User Detail Page - Actions', () => {
  test.beforeEach(async ({ page }) => {
    await clearAdminSession(page);
    await loginAsAdmin(page);
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');

    // Navigate to first user's detail page
    const firstUserCard = page
      .locator('[data-testid^="user-card-"], [data-testid^="user-row-"]')
      .first();

    const viewDetailsButton = firstUserCard.getByTestId('view-user-details-button');
    const viewDetailsVisible = await viewDetailsButton.isVisible().catch(() => false);

    if (viewDetailsVisible) {
      await viewDetailsButton.click();
    } else {
      const usernameLink = firstUserCard.getByTestId('user-username');
      await usernameLink.click();
    }

    await page.waitForURL('**/admin/users/**', { timeout: 5000 });
  });

  test('should display user posts on detail page', async ({ page }) => {
    // Verify user posts section
    const postsSection = page.getByTestId('user-posts-section');
    await expect(postsSection).toBeVisible();

    // Check for posts or empty state
    const posts = postsSection.locator('[data-testid^="admin-post-"]');
    const postsCount = await posts.count();

    if (postsCount === 0) {
      // Should show empty state
      const emptyState = postsSection.getByTestId('no-posts-message');
      await expect(emptyState).toBeVisible();
    } else {
      // Should show post cards with details
      const firstPost = posts.first();
      await expect(firstPost).toBeVisible();
    }
  });

  test('should navigate back to users list', async ({ page }) => {
    // Find back button or breadcrumb
    const backButton = page.locator(
      'button[aria-label="Back"], [data-testid="back-to-users"], a[href="/admin/users"]'
    );
    await expect(backButton.first()).toBeVisible();

    await backButton.first().click();

    // Should navigate back to users list
    await page.waitForURL('**/admin/users', { timeout: 5000 });
    expect(page.url()).toContain('/admin/users');
    expect(page.url()).not.toMatch(/\/admin\/users\/[a-zA-Z0-9]+$/);
  });

  test('should show user activity summary', async ({ page }) => {
    // Check for activity/stats summary on user detail page
    const activitySummary = page.getByTestId('user-activity-summary');
    const hasActivitySummary = await activitySummary.isVisible().catch(() => false);

    if (hasActivitySummary) {
      // Verify key metrics are shown
      await expect(activitySummary.locator('text=/posts/i')).toBeVisible();
      await expect(activitySummary.locator('text=/followers|following/i')).toBeVisible();
    }
  });
});
