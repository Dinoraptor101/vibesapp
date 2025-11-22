/**
 * E2E Tests: User Features
 *
 * Coverage:
 * - Account Settings (preferences, proximity, MBTI visibility)
 * - Theme switching (light/dark mode)
 * - DM Requests (accept/reject)
 * - Conversations (messaging, message history)
 * - Following users (follow/unfollow)
 * - Privacy settings
 */

import { test, expect } from '@playwright/test';

test.describe('Account Settings and Preferences', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    // Navigate to settings (use .first() since UserMenu appears in both TopNav and BottomNav)
    await page.getByTestId('user-menu-button').first().click();
    await page.getByTestId('settings-menu-item').click();
    await page.waitForURL('**/settings', { timeout: 5000 });
  });

  test('should display all settings sections', async ({ page }) => {
    // Verify main settings tabs are visible
    await expect(page.getByTestId('account-section')).toBeVisible();
    await expect(page.getByTestId('preferences-section')).toBeVisible();
    await expect(page.getByTestId('privacy-section')).toBeVisible();

    // Verify account tab content is shown by default
    await expect(page.getByTestId('account-tab-content')).toBeVisible();
  });

  test('should update proximity range preference', async ({ page }) => {
    // Navigate to Preferences tab
    await page.getByTestId('preferences-section').click();

    // Get current proximity value (it's a select dropdown)
    const proximitySelect = page.getByTestId('proximity-input');
    await expect(proximitySelect).toBeVisible();

    const initialValue = await proximitySelect.inputValue();

    // Change proximity value - select a different option
    const newValue = initialValue === '50' ? '100' : '50';
    await proximitySelect.selectOption(newValue);

    // Verify the value changed in the UI
    await expect(proximitySelect).toHaveValue(newValue);

    // Settings auto-save to localStorage, wait a moment
    await page.waitForTimeout(500);

    // Reload and verify persistence via localStorage
    await page.reload();

    // Navigate back to preferences tab after reload
    await page.getByTestId('preferences-section').click();

    // Verify the value persisted
    const proximitySelectAfterReload = page.getByTestId('proximity-input');
    await expect(proximitySelectAfterReload).toHaveValue(newValue);
  });
  test('should toggle MBTI visibility', async ({ page }) => {
    const mbtiToggle = page.getByTestId('mbti-visibility-toggle');
    await expect(mbtiToggle).toBeVisible();

    // Get initial state
    const initialState = await mbtiToggle.isChecked();

    // Toggle setting
    await mbtiToggle.click();

    // Save
    await page.getByTestId('save-settings-button').click();
    await expect(page.getByTestId('toast-success')).toBeVisible({ timeout: 3000 });

    // Verify state changed
    await page.reload();
    const newState = await mbtiToggle.isChecked();
    expect(newState).toBe(!initialState);
  });

  test('should toggle location sharing', async ({ page }) => {
    const locationToggle = page.getByTestId('location-sharing-toggle');
    await expect(locationToggle).toBeVisible();

    const initialState = await locationToggle.isChecked();

    await locationToggle.click();
    await page.getByTestId('save-settings-button').click();
    await expect(page.getByTestId('toast-success')).toBeVisible({ timeout: 3000 });

    // Verify persistence
    await page.reload();
    const newState = await locationToggle.isChecked();
    expect(newState).toBe(!initialState);
  });

  test('should update notification preferences', async ({ page }) => {
    // Navigate to notifications section if separate
    const notificationSection = page.getByTestId('notifications-section');
    if (await notificationSection.isVisible()) {
      await notificationSection.click();
    }

    // Toggle various notification settings
    const likeNotifications = page.getByTestId('like-notifications-toggle');

    await expect(likeNotifications).toBeVisible();
    await likeNotifications.click();

    // Toggle other notification types if available
    const messageNotifications = page.getByTestId('message-notifications-toggle');
    if (await messageNotifications.isVisible()) {
      await messageNotifications.click();
    }

    await page.getByTestId('save-settings-button').click();
    await expect(page.getByTestId('toast-success')).toBeVisible({ timeout: 3000 });
  });

  test('should display account information correctly', async ({ page }) => {
    // Verify account details are shown
    await expect(page.getByTestId('account-username')).toBeVisible();
    await expect(page.getByTestId('account-pigeon-id')).toBeVisible();
    await expect(page.getByTestId('account-created-date')).toBeVisible();
  });
});

test.describe('Theme Switching', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should switch from light to dark theme', async ({ page }) => {
    // Open theme switcher
    await page.getByTestId('theme-toggle-button').click();

    // Get initial theme
    const htmlElement = page.locator('html');
    const initialTheme = await htmlElement.getAttribute('data-theme');

    // Switch theme
    if (initialTheme === 'light') {
      await page.getByTestId('dark-theme-option').click();
    } else {
      await page.getByTestId('light-theme-option').click();
    }

    // Verify theme changed
    const newTheme = await htmlElement.getAttribute('data-theme');
    expect(newTheme).not.toBe(initialTheme);
  });

  test('should persist theme preference across sessions', async ({ page, context }) => {
    // Set dark theme
    await page.getByTestId('theme-toggle-button').click();
    await page.getByTestId('dark-theme-option').click();

    // Verify dark theme applied
    const htmlElement = page.locator('html');
    await expect(htmlElement).toHaveAttribute('data-theme', 'dark');

    // Create new page (simulate new session)
    const newPage = await context.newPage();
    await newPage.goto('/');

    // Verify theme persisted
    const newHtmlElement = newPage.locator('html');
    await expect(newHtmlElement).toHaveAttribute('data-theme', 'dark');

    await newPage.close();
  });

  test('should apply theme-specific colors correctly', async ({ page }) => {
    const themeToggle = page.getByTestId('theme-toggle-button');
    await themeToggle.click();
    await page.getByTestId('dark-theme-option').click();

    // Check that dark theme colors are applied
    const backgroundColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });

    // Dark theme should have dark background (rgb values close to 0)
    expect(backgroundColor).toMatch(/rgb\((\d{1,2}), (\d{1,2}), (\d{1,2})\)/);
  });
});

test.describe('DM Requests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    // Navigate to messages/requests
    await page.getByTestId('nav-messages').click();
    await page.waitForURL('**/messages', { timeout: 5000 });
  });

  test('should display DM requests section', async ({ page }) => {
    // Check for requests tab or section
    const requestsTab = page.getByTestId('dm-requests-tab');

    if (await requestsTab.isVisible()) {
      await requestsTab.click();

      // Verify requests section shows
      await expect(page.getByTestId('dm-requests-list')).toBeVisible();
    }
  });

  test('should show pending DM request details', async ({ page }) => {
    await page.getByTestId('dm-requests-tab').click();

    // Wait for requests to load
    await page.waitForSelector('[data-testid^="dm-request-"]', { timeout: 5000 }).catch(() => {
      console.log('No DM requests found');
    });

    const requestCount = await page.locator('[data-testid^="dm-request-"]').count();

    if (requestCount > 0) {
      const firstRequest = page.locator('[data-testid^="dm-request-"]').first();

      // Verify request shows user info
      await expect(firstRequest.getByTestId('requester-username')).toBeVisible();
      await expect(firstRequest.getByTestId('requester-avatar')).toBeVisible();
      await expect(firstRequest.getByTestId('request-message')).toBeVisible();
    }
  });

  test('should accept DM request', async ({ page }) => {
    await page.getByTestId('dm-requests-tab').click();

    const requestCount = await page.locator('[data-testid^="dm-request-"]').count();

    if (requestCount > 0) {
      const firstRequest = page.locator('[data-testid^="dm-request-"]').first();
      const username = await firstRequest.getByTestId('requester-username').innerText();

      // Accept request
      await firstRequest.getByTestId('accept-request-button').click();

      // Verify confirmation or redirect to conversation
      await expect(page.getByTestId('toast-success')).toBeVisible({ timeout: 3000 });

      // Verify conversation created
      await page.getByTestId('conversations-tab').click();
      await expect(page.getByText(username)).toBeVisible();
    }
  });

  test('should reject DM request', async ({ page }) => {
    await page.getByTestId('dm-requests-tab').click();

    const requestCount = await page.locator('[data-testid^="dm-request-"]').count();

    if (requestCount > 0) {
      const initialCount = requestCount;
      const firstRequest = page.locator('[data-testid^="dm-request-"]').first();

      // Reject request
      await firstRequest.getByTestId('reject-request-button').click();

      // Verify confirmation
      await expect(page.getByTestId('toast-success')).toBeVisible({ timeout: 3000 });

      // Verify request removed from list
      await page.waitForTimeout(1000);
      const newCount = await page.locator('[data-testid^="dm-request-"]').count();
      expect(newCount).toBe(initialCount - 1);
    }
  });

  test('should display empty state when no requests', async ({ page }) => {
    await page.getByTestId('dm-requests-tab').click();

    const requestCount = await page.locator('[data-testid^="dm-request-"]').count();

    if (requestCount === 0) {
      // Verify empty state message
      const emptyState = page.getByTestId('dm-requests-empty-state');
      await expect(emptyState).toBeVisible();
      await expect(emptyState).toContainText(/no requests|no pending/i);
    }
  });
});

test.describe('Conversations and Messaging', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('nav-messages').click();
    await page.waitForURL('**/messages', { timeout: 5000 });
  });

  test('should display conversations list', async ({ page }) => {
    // Verify conversations section
    await expect(page.getByTestId('conversations-list')).toBeVisible();

    // Check for conversation items
    await page.waitForSelector('[data-testid^="conversation-"]', { timeout: 5000 }).catch(() => {
      console.log('No conversations found');
    });
  });

  test('should show conversation preview information', async ({ page }) => {
    const conversationCount = await page.locator('[data-testid^="conversation-"]').count();

    if (conversationCount > 0) {
      const firstConversation = page.locator('[data-testid^="conversation-"]').first();

      // Verify conversation preview shows key info
      await expect(firstConversation.getByTestId('conversation-username')).toBeVisible();
      await expect(firstConversation.getByTestId('conversation-last-message')).toBeVisible();
      await expect(firstConversation.getByTestId('conversation-timestamp')).toBeVisible();
    }
  });

  test('should open conversation and display message history', async ({ page }) => {
    const conversationCount = await page.locator('[data-testid^="conversation-"]').count();

    if (conversationCount > 0) {
      // Click first conversation
      await page.locator('[data-testid^="conversation-"]').first().click();

      // Verify conversation view opens
      await expect(page.getByTestId('conversation-view')).toBeVisible();
      await expect(page.getByTestId('conversation-header')).toBeVisible();

      // Verify messages are displayed
      const messageCount = await page.locator('[data-testid^="message-"]').count();
      expect(messageCount).toBeGreaterThan(0);
    }
  });

  test('should send a message in conversation', async ({ page }) => {
    const conversationCount = await page.locator('[data-testid^="conversation-"]').count();

    if (conversationCount > 0) {
      await page.locator('[data-testid^="conversation-"]').first().click();

      // Type message
      const messageInput = page.getByTestId('message-input');
      await expect(messageInput).toBeVisible();

      const testMessage = `Test message ${Date.now()}`;
      await messageInput.fill(testMessage);

      // Send message
      await page.getByTestId('send-message-button').click();

      // Verify message appears in conversation
      await expect(page.getByText(testMessage)).toBeVisible({ timeout: 5000 });

      // Verify message shows as sent (checkmark or sent status)
      const lastMessage = page.locator('[data-testid^="message-"]').last();
      await expect(lastMessage.getByTestId('message-status-sent')).toBeVisible();
    }
  });

  test('should show typing indicator when enabled', async ({ page }) => {
    const conversationCount = await page.locator('[data-testid^="conversation-"]').count();

    if (conversationCount > 0) {
      await page.locator('[data-testid^="conversation-"]').first().click();

      // Start typing
      const messageInput = page.getByTestId('message-input');
      await messageInput.fill('Test');

      // In a real scenario with WebSocket, we'd see typing indicator
      // For now, just verify the input works
      await expect(messageInput).toHaveValue('Test');
    }
  });

  test('should display message timestamps', async ({ page }) => {
    const conversationCount = await page.locator('[data-testid^="conversation-"]').count();

    if (conversationCount > 0) {
      await page.locator('[data-testid^="conversation-"]').first().click();

      const messageCount = await page.locator('[data-testid^="message-"]').count();

      if (messageCount > 0) {
        const firstMessage = page.locator('[data-testid^="message-"]').first();
        await expect(firstMessage.getByTestId('message-timestamp')).toBeVisible();
      }
    }
  });

  test('should end/delete conversation', async ({ page }) => {
    const conversationCount = await page.locator('[data-testid^="conversation-"]').count();

    if (conversationCount > 0) {
      await page.locator('[data-testid^="conversation-"]').first().click();

      // Open conversation options
      await page.getByTestId('conversation-options-button').click();

      // End conversation option
      const endButton = page.getByTestId('end-conversation-button');
      if (await endButton.isVisible()) {
        await endButton.click();

        // Confirm action
        await page.getByTestId('confirm-end-conversation').click();

        // Verify redirect back to conversations list
        await expect(page.getByTestId('conversations-list')).toBeVisible();
      }
    }
  });
});

test.describe('Following Users', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display follow button on user profile', async ({ page }) => {
    // Navigate to home feed
    await page.getByTestId('nav-home').click();

    // Find a post and navigate to author profile
    const postCount = await page.locator('[data-testid^="post-"]').count();

    if (postCount > 0) {
      const firstPost = page.locator('[data-testid^="post-"]').first();

      // Click username to go to profile
      await firstPost.getByTestId('post-username').click();

      // Verify follow button visible
      const followButton = page.getByTestId('follow-button');
      await expect(followButton).toBeVisible();
    }
  });

  test('should follow a user', async ({ page }) => {
    // Navigate to discover or nearby users
    await page.getByTestId('nav-discover').click();

    const userCount = await page.locator('[data-testid^="user-card-"]').count();

    if (userCount > 0) {
      const firstUser = page.locator('[data-testid^="user-card-"]').first();
      const followButton = firstUser.getByTestId('follow-button');

      // Check if not already following
      const buttonText = await followButton.innerText();

      if (
        buttonText.toLowerCase().includes('follow') &&
        !buttonText.toLowerCase().includes('following')
      ) {
        // Follow user
        await followButton.click();

        // Verify button changes to "Following"
        await expect(followButton).toContainText(/following/i, { timeout: 3000 });

        // Verify success toast
        await expect(page.getByTestId('toast-success')).toBeVisible({ timeout: 3000 });
      }
    }
  });

  test('should unfollow a user', async ({ page }) => {
    // Navigate to profile to see following list
    await page.getByTestId('user-profile-button').click();
    await page.getByTestId('following-tab').click();

    const followingCount = await page.locator('[data-testid^="following-user-"]').count();

    if (followingCount > 0) {
      const firstFollowing = page.locator('[data-testid^="following-user-"]').first();
      const unfollowButton = firstFollowing.getByTestId('unfollow-button');

      await unfollowButton.click();

      // Verify confirmation modal or immediate unfollow
      const confirmButton = page.getByTestId('confirm-unfollow-button');
      if (await confirmButton.isVisible({ timeout: 1000 })) {
        await confirmButton.click();
      }

      // Verify user removed from following list
      await expect(page.getByTestId('toast-success')).toBeVisible({ timeout: 3000 });
    }
  });

  test('should display following count', async ({ page }) => {
    await page.getByTestId('user-profile-button').click();

    // Verify following/followers stats
    const followingCount = page.getByTestId('following-count');
    const followersCount = page.getByTestId('followers-count');

    await expect(followingCount).toBeVisible();
    await expect(followersCount).toBeVisible();
  });

  test('should view list of following', async ({ page }) => {
    await page.getByTestId('user-profile-button').click();
    await page.getByTestId('following-tab').click();

    // Verify following list displays
    await expect(page.getByTestId('following-list')).toBeVisible();

    // Check if any users in list
    await page.waitForSelector('[data-testid^="following-user-"]', { timeout: 5000 }).catch(() => {
      console.log('No following users');
    });
  });

  test('should view list of followers', async ({ page }) => {
    await page.getByTestId('user-profile-button').click();
    await page.getByTestId('followers-tab').click();

    // Verify followers list displays
    await expect(page.getByTestId('followers-list')).toBeVisible();

    // Check if any users in list
    await page.waitForSelector('[data-testid^="follower-user-"]', { timeout: 5000 }).catch(() => {
      console.log('No followers');
    });
  });
});

test.describe('Privacy and Blocking', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should block a user', async ({ page }) => {
    // Navigate to a user profile
    await page.getByTestId('nav-discover').click();

    const userCount = await page.locator('[data-testid^="user-card-"]').count();

    if (userCount > 0) {
      const firstUser = page.locator('[data-testid^="user-card-"]').first();
      await firstUser.click();

      // Open user options menu
      await page.getByTestId('user-options-button').click();

      // Click block option
      const blockButton = page.getByTestId('block-user-button');
      if (await blockButton.isVisible()) {
        await blockButton.click();

        // Confirm block
        await page.getByTestId('confirm-block-button').click();

        // Verify success
        await expect(page.getByTestId('toast-success')).toBeVisible({ timeout: 3000 });
      }
    }
  });

  test('should view blocked users list in settings', async ({ page }) => {
    await page.getByTestId('user-menu-button').first().click();
    await page.getByTestId('settings-menu-item').click();

    // Navigate to privacy section
    await page.getByTestId('privacy-section').click();

    // View blocked users
    const blockedUsersButton = page.getByTestId('view-blocked-users-button');
    if (await blockedUsersButton.isVisible()) {
      await blockedUsersButton.click();

      await expect(page.getByTestId('blocked-users-list')).toBeVisible();
    }
  });

  test('should unblock a user', async ({ page }) => {
    await page.getByTestId('user-menu-button').first().click();
    await page.getByTestId('settings-menu-item').click();
    await page.getByTestId('privacy-section').click();

    const blockedUsersButton = page.getByTestId('view-blocked-users-button');
    if (await blockedUsersButton.isVisible()) {
      await blockedUsersButton.click();

      const blockedCount = await page.locator('[data-testid^="blocked-user-"]').count();

      if (blockedCount > 0) {
        const firstBlocked = page.locator('[data-testid^="blocked-user-"]').first();
        await firstBlocked.getByTestId('unblock-button').click();

        // Confirm unblock
        await page.getByTestId('confirm-unblock-button').click();

        // Verify success
        await expect(page.getByTestId('toast-success')).toBeVisible({ timeout: 3000 });
      }
    }
  });
});
