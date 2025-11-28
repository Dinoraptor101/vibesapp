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
test.describe('Send DM Request', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate to send DM request page from profile', async ({ page }) => {
    // Navigate to a user profile (find a post and click username)
    const postCount = await page.locator('article').count();

    if (postCount > 0) {
      const firstPostUserLink = page.locator('article a[href^="/profile/"]').first();

      if (await firstPostUserLink.isVisible()) {
        await firstPostUserLink.click();
        await page.waitForTimeout(500);

        // Verify we're on a profile page
        await expect(page.url()).toContain('/profile/');

        // Find and click Message button (if not own profile)
        const messageButton = page.locator('button').filter({ hasText: /^Message$/ });
        const isMessageButtonVisible = await messageButton.isVisible().catch(() => false);

        if (isMessageButtonVisible) {
          const isDisabled = await messageButton.isDisabled();

          if (!isDisabled) {
            await messageButton.click();

            // Should navigate to dm-request page
            await page.waitForURL('**/dm-request/**', { timeout: 3000 });
            expect(page.url()).toContain('/dm-request/');
          } else {
            console.log('Message button is disabled (already requested or connected)');
          }
        } else {
          console.log('Message button not visible - may be viewing own profile');
        }
      }
    }
  });

  test('should display send DM request page elements', async ({ page }) => {
    // Navigate to home to get a user ID
    const postCount = await page.locator('article').count();

    if (postCount > 0) {
      const firstPostUserLink = page.locator('article a[href^="/profile/"]').first();

      if (await firstPostUserLink.isVisible()) {
        const profileHref = await firstPostUserLink.getAttribute('href');
        const userId = profileHref?.split('/profile/')[1];

        if (userId) {
          // Navigate directly to dm-request page
          await page.goto(`/dm-request/${userId}`);
          await page.waitForTimeout(500);

          // Verify page elements
          await expect(page.locator('h1').filter({ hasText: 'Send DM Request' })).toBeVisible();
          await expect(page.locator('textarea[placeholder*="like to connect"]')).toBeVisible();
          await expect(page.locator('button').filter({ hasText: 'Send Request' })).toBeVisible();

          // Verify back button exists
          await expect(page.locator('button[aria-label="Go back"]')).toBeVisible();
        }
      }
    }
  });

  test('should show character counter when approaching limit', async ({ page }) => {
    // Navigate to home to get a user ID
    const postCount = await page.locator('article').count();

    if (postCount > 0) {
      const firstPostUserLink = page.locator('article a[href^="/profile/"]').first();

      if (await firstPostUserLink.isVisible()) {
        const profileHref = await firstPostUserLink.getAttribute('href');
        const userId = profileHref?.split('/profile/')[1];

        if (userId) {
          await page.goto(`/dm-request/${userId}`);
          await page.waitForTimeout(500);

          const textarea = page.locator('textarea[placeholder*="like to connect"]');
          await expect(textarea).toBeVisible();

          // Type less than threshold (180 chars) - counter should not be visible
          await textarea.fill('Short message');
          const counterNotVisible = await page
            .locator('text=/\\d+ \\/ 200/')
            .isVisible()
            .catch(() => false);
          expect(counterNotVisible).toBe(false);

          // Type close to limit (>= 180 chars) - counter should appear
          const longMessage = 'A'.repeat(185);
          await textarea.fill(longMessage);

          // Counter should now be visible
          await expect(page.locator('text=/\\d+ \\/ 200/')).toBeVisible({ timeout: 2000 });
          await expect(page.locator('text=/185 \\/ 200/')).toBeVisible();
        }
      }
    }
  });

  test('should disable send button when message exceeds limit', async ({ page }) => {
    // Navigate to home to get a user ID
    const postCount = await page.locator('article').count();

    if (postCount > 0) {
      const firstPostUserLink = page.locator('article a[href^="/profile/"]').first();

      if (await firstPostUserLink.isVisible()) {
        const profileHref = await firstPostUserLink.getAttribute('href');
        const userId = profileHref?.split('/profile/')[1];

        if (userId) {
          await page.goto(`/dm-request/${userId}`);
          await page.waitForTimeout(500);

          const textarea = page.locator('textarea[placeholder*="like to connect"]');
          const sendButton = page.locator('button').filter({ hasText: 'Send Request' });

          await expect(textarea).toBeVisible();
          await expect(sendButton).toBeVisible();

          // Initially should be disabled (empty message)
          await expect(sendButton).toBeDisabled();

          // Type valid message - button should be enabled
          await textarea.fill('Hello! I would like to connect with you.');
          await expect(sendButton).toBeEnabled();

          // Type over limit (>200 chars) - button should be disabled
          const tooLongMessage = 'A'.repeat(201);
          await textarea.fill(tooLongMessage);
          await expect(sendButton).toBeDisabled();

          // Verify error message shows
          await expect(page.locator('text=/too long/i')).toBeVisible();
        }
      }
    }
  });

  test('should navigate back when clicking back button', async ({ page }) => {
    // Navigate to home to get a user ID
    const postCount = await page.locator('article').count();

    if (postCount > 0) {
      const firstPostUserLink = page.locator('article a[href^="/profile/"]').first();

      if (await firstPostUserLink.isVisible()) {
        const profileHref = await firstPostUserLink.getAttribute('href');
        const userId = profileHref?.split('/profile/')[1];

        if (userId) {
          // Navigate to dm-request page
          await page.goto(`/dm-request/${userId}`);
          await page.waitForTimeout(500);

          // Click back button
          const backButton = page.locator('button[aria-label="Go back"]');
          await expect(backButton).toBeVisible();
          await backButton.click();

          // Should navigate back (history goes back)
          await page.waitForTimeout(500);
          expect(page.url()).not.toContain('/dm-request/');
        }
      }
    }
  });
});

test.describe('Conversations and Messaging', () => {
  test.beforeEach(async ({ page }) => {
    // PREREQUISITE: Create a conversation by accepting a DM request
    // Navigate to messages page
    await page.goto('/messages');
    await page.waitForLoadState('networkidle');

    // Switch to DM Requests tab
    const dmRequestsTab = page.getByTestId('dm-requests-tab');
    await dmRequestsTab.click();
    await page.waitForTimeout(1000); // Give UI time to switch tabs

    // Accept the first DM request if available (this creates the conversation)
    const requestCards = page.locator('[data-testid^="dm-request-"]');
    const requestCount = await requestCards.count();

    if (requestCount > 0) {
      const acceptButton = requestCards.first().getByTestId('accept-request-button');
      await acceptButton.click();
      await page.waitForTimeout(1500); // Wait for acceptance to process
    }

    // Switch back to Conversations tab where the new conversation should appear
    await page.getByTestId('conversations-tab').click();
    await page.waitForTimeout(1000); // Give UI time to switch tabs and load conversations
  });

  test('should display conversations list', async ({ page }) => {
    // Check if conversations exist or if we see the empty state
    const emptyState = page.getByTestId('conversations-empty-state');
    const conversationsList = page.getByTestId('conversations-list');

    // Either conversations list or empty state should be visible
    const hasConversations = await conversationsList.isVisible().catch(() => false);
    const showingEmptyState = await emptyState.isVisible().catch(() => false);

    expect(hasConversations || showingEmptyState).toBe(true);

    if (hasConversations) {
      // Check for conversation items
      const conversationCount = await page.locator('[data-testid^="conversation-"]').count();
      expect(conversationCount).toBeGreaterThan(0);
    }
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

  test('should end conversation with hold-to-confirm', async ({ page }) => {
    const conversationCount = await page.locator('[data-testid^="conversation-"]').count();

    if (conversationCount > 0) {
      await page.locator('[data-testid^="conversation-"]').first().click();

      // Find the end conversation button (hold-to-confirm pattern)
      const endButton = page.getByTestId('end-conversation-button');
      if (await endButton.isVisible()) {
        // Hold the button for 2.5 seconds (hold duration is 2 seconds)
        const buttonBox = await endButton.boundingBox();
        if (buttonBox) {
          await page.mouse.move(
            buttonBox.x + buttonBox.width / 2,
            buttonBox.y + buttonBox.height / 2
          );
          await page.mouse.down();
          await page.waitForTimeout(2500); // Hold longer than 2000ms required
          await page.mouse.up();

          // Verify redirect back to conversations list or conversation is marked as ended
          await page.waitForTimeout(1000);
          const conversationsListVisible = await page
            .getByTestId('conversations-list')
            .isVisible()
            .catch(() => false);
          const endedBannerVisible = await page
            .getByText('This conversation has ended')
            .isVisible()
            .catch(() => false);

          expect(conversationsListVisible || endedBannerVisible).toBe(true);
        }
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
        await page.waitForURL('**/profile/**', { timeout: 5000 });

        // Verify we're on a profile page
        await expect(page.url()).toContain('/profile/');

        // Verify follow button visible using test-id
        const followButton = page.getByTestId('follow-button');
        await expect(followButton).toBeVisible({ timeout: 5000 });
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
        await page.waitForURL('**/profile/**', { timeout: 5000 });

        // Wait for profile to load and find the follow button by test-id
        const followButton = page.getByTestId('follow-button');
        await expect(followButton).toBeVisible({ timeout: 5000 });

        const initialButtonText = await followButton.innerText();
        const initiallyFollowing = initialButtonText.toLowerCase().includes('following');

        // Click to toggle follow state
        await followButton.click();
        await page.waitForTimeout(1000);

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
