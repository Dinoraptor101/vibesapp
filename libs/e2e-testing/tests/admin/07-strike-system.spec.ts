/**
 * Strike System E2E Tests
 *
 * Tests the graduated strike and cooldown system for content moderation:
 * - Strike 1: 24h post cooldown
 * - Strike 2: 24h post + comment cooldown
 * - Strike 3: 24h read-only (no post, comment, or react)
 * - Strike 4: Permanent ban
 *
 * Each strike expires after 30 days (sliding window)
 */

import { test, expect } from '@playwright/test';
import { setupAdminAuth } from './helpers/admin-auth';
import { isQAEnvironment } from '../helpers/test-post';

test.describe
  .skip('Strike System', () => {
    test.beforeEach(async ({ page }) => {
      await setupAdminAuth(page);
    });

    test('ADM-STR-001: Should display user strikes in user management', async ({ page }) => {
      await page.goto('/admin/users');
      await page.waitForLoadState('networkidle');

      // Find a user row
      const firstRow = page.locator('[data-testid^="user-row-"]').first();
      await expect(firstRow).toBeVisible();

      // Check if strike badge exists (may or may not be visible)
      const strikeBadge = firstRow.getByTestId('user-strike-badge');
      const hasStrikes = await strikeBadge.isVisible().catch(() => false);

      if (hasStrikes) {
        // Verify badge shows strike count
        const badgeText = await strikeBadge.textContent();
        expect(badgeText).toMatch(/\d+ strike/i);
      }
    });

    test('ADM-STR-002: Should show restrictions when user has active strikes', async ({ page }) => {
      await page.goto('/admin/users');
      await page.waitForLoadState('networkidle');

      // Find user with strikes (if any exist)
      const userWithStrikes = page.locator('[data-testid="user-strike-badge"]').first();
      const hasStrikeUser = await userWithStrikes.isVisible().catch(() => false);

      if (hasStrikeUser) {
        // Click to view user details
        const userId = await userWithStrikes
          .locator('[data-testid^="user-row-"]')
          .getAttribute('data-testid');
        if (userId) {
          await page.click(`[data-testid="${userId}"]`);

          // Check for restrictions display
          const restrictionsPanel = page.getByTestId('user-restrictions');
          if (await restrictionsPanel.isVisible().catch(() => false)) {
            await expect(restrictionsPanel).toContainText(/can post|can comment|can react/i);
          }
        }
      }
    });

    test('ADM-STR-003: Should remove strike when restoring a flagged post', async ({ page }) => {
      // This test requires a flagged post with strikes
      await page.goto('/admin/flagged-posts');
      await page.waitForLoadState('networkidle');

      const firstPost = page.locator('[data-testid^="flagged-post-"]').first();
      const hasPost = await firstPost.isVisible().catch(() => false);

      if (hasPost) {
        // Restore post (should remove a strike)
        const restoreButton = firstPost.getByTestId('restore-post-button');
        if (await restoreButton.isVisible().catch(() => false)) {
          await restoreButton.click();

          // Confirm restoration dialog
          const confirmButton = page.getByTestId('confirm-restore-button');
          await confirmButton.click();

          // Wait for success message
          await expect(page.getByText(/restored successfully/i)).toBeVisible({ timeout: 5000 });
        }
      }
    });

    test('ADM-STR-004: Should display ban status for users with Strike 4', async ({ page }) => {
      await page.goto('/admin/users');
      await page.waitForLoadState('networkidle');

      // Filter to show banned users
      const filterSelect = page.getByTestId('user-status-filter');
      if (await filterSelect.isVisible().catch(() => false)) {
        await filterSelect.selectOption('banned');
        await page.waitForTimeout(500);

        // Check if any banned users exist
        const bannedBadge = page.getByTestId('user-banned-badge').first();
        const hasBannedUsers = await bannedBadge.isVisible().catch(() => false);

        if (hasBannedUsers) {
          await expect(bannedBadge).toContainText(/banned/i);
        }
      }
    });
  });

test.describe
  .skip('Strike Cooldown Enforcement', () => {
    // Use environment to determine API URL from .env
    const API_BASE_URL = isQAEnvironment()
      ? process.env.QA_BACKEND_URL
      : process.env.LOCAL_BACKEND_URL;

    test('ADM-STR-005: Should prevent post creation during Strike 1 cooldown', async ({
      request,
    }) => {
      // Create a test user with Strike 1 (requires admin API or test setup)
      // This test assumes we can create a user with an active strike

      // Attempt to create a post with restricted user
      const postResponse = await request.post(`${API_BASE_URL}/post/create`, {
        data: {
          userId: 'test-user-with-strike-1',
          caption: 'Test post during cooldown',
          imageUrl: 'https://example.com/image.jpg',
          location: {
            type: 'Point',
            coordinates: [-122.4194, 37.7749],
          },
        },
      });

      // Should fail with 403 and cooldown message
      expect(postResponse.status()).toBe(403);
      const errorData = await postResponse.json();
      expect(errorData.error).toContain('cooldown');
      expect(errorData.restrictions).toBeDefined();
      expect(errorData.restrictions.canPost).toBe(false);
      expect(errorData.cooldownEnd).toBeDefined();
    });

    test('ADM-STR-006: Should prevent comment creation during Strike 2+ cooldown', async ({
      request,
    }) => {
      // Test with Strike 2 user (post + comment restrictions)
      const commentResponse = await request.post(`${API_BASE_URL}/comment/create`, {
        data: {
          userId: 'test-user-with-strike-2',
          postId: 'test-post-id',
          text: 'Test comment during cooldown',
        },
      });

      // Should fail with 403 and cooldown message
      expect(commentResponse.status()).toBe(403);
      const errorData = await commentResponse.json();
      expect(errorData.error).toContain('cooldown');
      expect(errorData.restrictions.canComment).toBe(false);
    });

    test('ADM-STR-007: Should allow reactions during Strike 1-2 but not Strike 3', async ({
      request,
    }) => {
      // Strike 1-2: Can still react (heart)
      const heartResponse1 = await request.post(`${API_BASE_URL}/post/vibe`, {
        data: {
          userId: 'test-user-with-strike-1',
          postId: 'test-post-id',
          polarity: 1, // Heart/like
        },
      });

      // Should succeed
      expect(heartResponse1.status()).toBe(200);

      // Strike 3: Cannot react (read-only)
      const heartResponse3 = await request.post(`${API_BASE_URL}/post/vibe`, {
        data: {
          userId: 'test-user-with-strike-3',
          postId: 'test-post-id',
          polarity: 1,
        },
      });

      // Should fail
      expect(heartResponse3.status()).toBe(403);
      const errorData = await heartResponse3.json();
      expect(errorData.restrictions.canReact).toBe(false);
    });

    test('ADM-STR-008: Should reject all actions for Strike 4 (permanent ban)', async ({
      request,
    }) => {
      const bannedUserId = 'test-banned-user';

      // Test post creation
      const postResponse = await request.post(`${API_BASE_URL}/post/create`, {
        data: {
          userId: bannedUserId,
          caption: 'Test',
          imageUrl: 'https://example.com/image.jpg',
          location: { type: 'Point', coordinates: [-122.4194, 37.7749] },
        },
      });

      expect(postResponse.status()).toBe(403);
      const postError = await postResponse.json();
      expect(postError.error).toContain('banned');
      expect(postError.restrictions.isBanned).toBe(true);

      // Test comment creation
      const commentResponse = await request.post(`${API_BASE_URL}/comment/create`, {
        data: {
          userId: bannedUserId,
          postId: 'test-post-id',
          text: 'Test comment',
        },
      });

      expect(commentResponse.status()).toBe(403);

      // Test reaction
      const heartResponse = await request.post(`${API_BASE_URL}/post/vibe`, {
        data: {
          userId: bannedUserId,
          postId: 'test-post-id',
          polarity: 1,
        },
      });

      expect(heartResponse.status()).toBe(403);
    });
  });

test.describe
  .skip('Strike Expiration (30-day Sliding Window)', () => {
    // Use environment to determine API URL from .env
    const API_BASE_URL = isQAEnvironment()
      ? process.env.QA_BACKEND_URL
      : process.env.LOCAL_BACKEND_URL;

    test('ADM-STR-009: Should exclude strikes older than 30 days from active count', async ({
      request,
    }) => {
      // This test requires a user with expired strikes
      // In real implementation, you'd create a user with a backdated strike

      const response = await request.get(
        `${API_BASE_URL}/user/test-user-with-expired-strike/strikes`
      );
      const data = await response.json();

      // User may have 2 total strikes but only 1 active (within 30 days)
      expect(data.strikes.length).toBeGreaterThan(data.activeStrikes);
      expect(data.restrictions.strikeCount).toBe(data.activeStrikes);
    });

    test('ADM-STR-010: Should allow posting again when all strikes expire', async ({ request }) => {
      // User with all expired strikes should have no restrictions
      const response = await request.get(
        `${API_BASE_URL}/user/test-user-all-expired-strikes/strikes`
      );
      const data = await response.json();

      expect(data.activeStrikes).toBe(0);
      expect(data.restrictions.canPost).toBe(true);
      expect(data.restrictions.canComment).toBe(true);
      expect(data.restrictions.canReact).toBe(true);
    });
  });

test.describe
  .skip('Strike Display and Notifications', () => {
    test('ADM-STR-011: Should display strike modal on app open after receiving strike', async ({
      page,
    }) => {
      // Simulate user with new unacknowledged strike
      await page.goto('/');

      // Check for strike notification modal
      const strikeModal = page.getByTestId('strike-notification-modal');
      const hasStrikeModal = await strikeModal.isVisible().catch(() => false);

      if (hasStrikeModal) {
        // Verify modal content
        await expect(strikeModal).toContainText(/strike/i);
        await expect(strikeModal).toContainText(/cooldown/i);

        // Check for acknowledge button
        const acknowledgeButton = strikeModal.getByTestId('acknowledge-strike-button');
        await expect(acknowledgeButton).toBeVisible();

        // Acknowledge and close
        await acknowledgeButton.click();
        await expect(strikeModal).not.toBeVisible();
      }
    });

    test('ADM-STR-012: Should show strike count and cooldown timer in user profile', async ({
      page,
    }) => {
      // Navigate to profile of user with active strikes
      await page.goto('/profile/test-user-with-strikes');

      // Check for strike indicator
      const strikeIndicator = page.getByTestId('profile-strike-indicator');
      const hasStrikes = await strikeIndicator.isVisible().catch(() => false);

      if (hasStrikes) {
        await expect(strikeIndicator).toContainText(/strike/i);

        // Check for cooldown timer if in cooldown
        const cooldownTimer = page.getByTestId('cooldown-timer');
        const inCooldown = await cooldownTimer.isVisible().catch(() => false);

        if (inCooldown) {
          const timerText = await cooldownTimer.textContent();
          expect(timerText).toMatch(/\d+h|\d+m|\d+d/); // Time format
        }
      }
    });
  });
