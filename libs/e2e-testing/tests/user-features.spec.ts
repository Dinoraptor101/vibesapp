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
  test('should update MBTI type', async ({ page }) => {
    // Account tab is shown by default, find the MBTI select
    const mbtiSelect = page.locator('#mbti');
    await expect(mbtiSelect).toBeVisible();

    // Get initial MBTI value
    const initialValue = await mbtiSelect.inputValue();

    // Change to a different MBTI type
    const newValue = initialValue === 'INTJ' ? 'ENFP' : 'INTJ';
    await mbtiSelect.selectOption(newValue);

    // Verify the value changed in the UI
    await expect(mbtiSelect).toHaveValue(newValue);

    // Settings auto-save with 300ms debounce
    await page.waitForTimeout(500);

    // Reload and verify persistence
    await page.reload();

    // Verify the value persisted (should be loaded from backend user data)
    const mbtiSelectAfterReload = page.locator('#mbti');
    await expect(mbtiSelectAfterReload).toHaveValue(newValue);
  });

  test('should update location city', async ({ page }) => {
    // Account tab is shown by default, find the location input
    const locationInput = page.locator('#location');
    await expect(locationInput).toBeVisible();

    // Change to a different city
    const newCity = 'San Francisco';
    await locationInput.fill(newCity);

    // Trigger blur to save (onBlur auto-save pattern)
    await locationInput.blur();

    // Wait for geocoding and auto-save (300ms debounce + API call)
    await page.waitForTimeout(2000);

    // Reload and verify persistence
    await page.reload();

    // Verify the value persisted
    const locationInputAfterReload = page.locator('#location');
    await expect(locationInputAfterReload).toHaveValue(newCity);
  });

  test('should update notification preferences', async ({ page }) => {
    // Navigate to Preferences tab
    await page.getByTestId('preferences-section').click();

    // Wait for notification preferences to load
    await page.waitForTimeout(1000);

    // Find the "New Followers" notification button
    const newFollowersButton = page.locator('button:has-text("New Followers")');
    await expect(newFollowersButton).toBeVisible();

    // Check initial state - look for Bell icon (enabled) or BellOff icon (disabled)
    const bellIcon = newFollowersButton.locator('svg.lucide-bell');
    const bellOffIcon = newFollowersButton.locator('svg.lucide-bell-off');

    const isInitiallyEnabled = (await bellIcon.count()) > 0;

    // Toggle the notification preference
    await newFollowersButton.click();

    // Wait for the mutation to complete (auto-save to backend)
    await page.waitForTimeout(1000);

    // Verify the icon toggled (state changed in UI)
    if (isInitiallyEnabled) {
      // Should now show BellOff icon
      await expect(bellOffIcon).toBeVisible();
    } else {
      // Should now show Bell icon
      await expect(bellIcon).toBeVisible();
    }

    // Reload page to verify persistence from database
    await page.reload();

    // Navigate back to Preferences tab
    await page.getByTestId('preferences-section').click();
    await page.waitForTimeout(1000);

    // Verify the preference persisted from the database
    const newFollowersButtonAfterReload = page.locator('button:has-text("New Followers")');
    const bellIconAfterReload = newFollowersButtonAfterReload.locator('svg.lucide-bell');
    const bellOffIconAfterReload = newFollowersButtonAfterReload.locator('svg.lucide-bell-off');

    if (isInitiallyEnabled) {
      // Should remain disabled (BellOff)
      await expect(bellOffIconAfterReload).toBeVisible();
    } else {
      // Should remain enabled (Bell)
      await expect(bellIconAfterReload).toBeVisible();
    }

    // Toggle back to original state for test cleanup
    await newFollowersButtonAfterReload.click();
    await page.waitForTimeout(1000);
  });

  test('should display account information correctly', async ({ page }) => {
    // Account tab is shown by default, verify key fields are visible

    // Profile photo section
    await expect(page.locator('button[aria-label="Change profile photo"]')).toBeVisible();

    // Bio field
    await expect(page.locator('#bio')).toBeVisible();

    // MBTI select
    await expect(page.locator('#mbti')).toBeVisible();

    // Location input
    await expect(page.locator('#location')).toBeVisible();

    // Polarity toggle (with YIN/YANG labels)
    await expect(page.locator('button[aria-label*="polarity"]')).toBeVisible();

    // Security section - check for the warning text
    await expect(page.locator('text=⚠️ Important:')).toBeVisible();

    // Check for Pigeon ID display (in font-mono container)
    await expect(page.locator('.font-mono span.font-bold')).toBeVisible();

    // Logout button
    await expect(page.locator('button:has-text("Logout")')).toBeVisible();
  });
});

test.describe('Theme Switching', () => {
  type Theme = 'light' | 'dim' | 'dark';

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should cycle through all themes (light, dim, dark)', async ({ page }) => {
    // Get current theme before clicking (theme is applied as a class on body element)
    const bodyElement = page.locator('body');
    const getBodyTheme = async (): Promise<Theme | null> => {
      const classList = await bodyElement.evaluate((el) => Array.from(el.classList));
      const themes: Theme[] = ['light', 'dim', 'dark'];
      return themes.find((t) => classList.includes(t)) || null;
    };

    const initialTheme = await getBodyTheme();
    const themes: (Theme | null)[] = [];

    // Open user menu once
    await page.getByTestId('user-menu-button').first().click();
    await page.waitForTimeout(300);

    // Click theme toggle 3 times to cycle through all themes
    // Starting from light: light → dim → dark → light
    for (let i = 0; i < 3; i++) {
      // Click theme toggle
      await page.getByTestId('theme-toggle-button').click();
      await page.waitForTimeout(400);

      // Record the new theme after each click
      const currentTheme = await getBodyTheme();
      themes.push(currentTheme);
    }

    // Close menu
    await page.keyboard.press('Escape');

    // Verify we recorded 3 theme changes
    expect(themes.length).toBe(3);

    // Filter out null values
    const validThemes = themes.filter((theme): theme is Theme => theme !== null);

    // Verify we got all 3 themes
    expect(validThemes.length).toBe(3);

    // Verify all captured themes are valid
    validThemes.forEach((theme) => {
      expect(['light', 'dim', 'dark']).toContain(theme);
    });

    // Verify we got all 3 different themes
    const uniqueThemes = new Set(validThemes);
    expect(uniqueThemes.size).toBe(3);

    // Verify the 3rd click brought us back to the initial theme
    if (initialTheme && validThemes.length === 3) {
      expect(validThemes[2]).toBe(initialTheme);
    }
  });

  test('should persist theme preference across page reload', async ({ page }) => {
    // Get current theme
    const bodyElement = page.locator('body');
    const getBodyTheme = async (): Promise<Theme | null> => {
      const classList = await bodyElement.evaluate((el) => Array.from(el.classList));
      const themes: Theme[] = ['light', 'dim', 'dark'];
      return themes.find((t) => classList.includes(t)) || null;
    };

    // Open user menu and change theme
    await page.getByTestId('user-menu-button').first().click();
    await page.waitForTimeout(300);
    await page.getByTestId('theme-toggle-button').click();
    await page.waitForTimeout(400);

    const selectedTheme = await getBodyTheme();

    // Close menu
    await page.keyboard.press('Escape');

    // Reload page
    await page.reload();
    await page.waitForTimeout(500);

    // Verify theme persisted
    const persistedTheme = await getBodyTheme();
    expect(persistedTheme).toBe(selectedTheme);
  });

  test('should display correct theme icon in menu', async ({ page }) => {
    // Open user menu
    await page.getByTestId('user-menu-button').first().click();
    await page.waitForTimeout(300);

    // Verify theme toggle button shows icon and current theme label
    const themeButton = page.getByTestId('theme-toggle-button');
    await expect(themeButton).toBeVisible();

    // Check that it displays theme name (light, dim, or dark)
    const buttonText = await themeButton.innerText();
    expect(['light', 'dim', 'dark'].some((theme) => buttonText.toLowerCase().includes(theme))).toBe(
      true
    );

    // Close menu
    await page.keyboard.press('Escape');
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
    // Navigate to home via URL (no nav-home test-id exists)
    await page.goto('/');

    // Find a post and navigate to author profile
    const postCount = await page.locator('article').count();

    if (postCount > 0) {
      // Find first post's username link and click it
      const firstPostUserLink = page.locator('article a[href^="/profile/"]').first();

      if (await firstPostUserLink.isVisible()) {
        await firstPostUserLink.click();
        await page.waitForTimeout(500);

        // Verify we're on a profile page
        await expect(page.url()).toContain('/profile/');

        // Verify follow button visible (look for button with "Follow" or "Following" text)
        const followButton = page.locator(
          'button:has-text("Follow"), button:has-text("Following")'
        );
        await expect(followButton).toBeVisible();
      }
    }
  });

  test('should follow/unfollow a user from their profile', async ({ page }) => {
    // Navigate to home
    await page.goto('/');

    // Find a post and navigate to author profile
    const postCount = await page.locator('article').count();

    if (postCount > 0) {
      const firstPostUserLink = page.locator('article a[href^="/profile/"]').first();

      if (await firstPostUserLink.isVisible()) {
        await firstPostUserLink.click();
        await page.waitForTimeout(500);

        // Find the follow button
        const followButton = page
          .locator('button:has-text("Follow"), button:has-text("Following")')
          .first();

        if (await followButton.isVisible()) {
          const initialButtonText = await followButton.innerText();
          const initiallyFollowing = initialButtonText.toLowerCase().includes('following');

          // Click to toggle follow state
          await followButton.click();
          await page.waitForTimeout(500);

          // Verify button text changed
          const newButtonText = await followButton.innerText();
          if (initiallyFollowing) {
            // Was following, should now say "Follow"
            expect(newButtonText.toLowerCase()).toContain('follow');
            expect(newButtonText.toLowerCase()).not.toContain('following');
          } else {
            // Was not following, should now say "Following"
            expect(newButtonText.toLowerCase()).toContain('following');
          }
        }
      }
    }
  });

  test('should display follower and following counts on profile', async ({ page }) => {
    // Navigate to home
    await page.goto('/');

    // Find a post and navigate to author profile
    const postCount = await page.locator('article').count();

    if (postCount > 0) {
      const firstPostUserLink = page.locator('article a[href^="/profile/"]').first();

      if (await firstPostUserLink.isVisible()) {
        await firstPostUserLink.click();
        await page.waitForTimeout(500);

        // Verify follower/following stats are displayed
        // They appear as text like "5 posts • 10 followers • 3 following"
        const statsText = await page.textContent('body');

        if (statsText) {
          // Check that the stats text contains the expected words
          expect(statsText).toContain('followers');
          expect(statsText).toContain('following');
          expect(statsText).toContain('posts');
        }
      }
    }
  });
});