/**
 * E2E Test: Conflict Resolution (Create then Delete)
 *
 * Scenario 7: Edge Cases
 *
 * Tests:
 * 1. Create post then delete before sync
 * 2. Heart then unheart (should optimize to no-op)
 * 3. Follow then unfollow (only final state synced)
 * 4. Multiple settings changes (batch)
 */

import { test, expect } from '@playwright/test';
import {
  goOffline,
  goOnline,
  getQueuedMutations,
  clearQueue,
  waitForSync,
  mockS3Upload,
} from './helpers';

test.describe('Conflict Resolution', () => {
  test.beforeEach(async ({ page, context }) => {
    await page.goto('http://localhost:5173');
    await clearQueue(page);

    // Login
    await page.fill('input[type="password"]', 'brave-tiger-8472');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:5173/', { timeout: 10000 });

    await mockS3Upload(page);
  });

  test('should cancel create when post deleted before sync', async ({ page, context }) => {
    await goOffline(context);

    // Create post
    await page.click('[data-testid="create-post-button"]');
    await page.locator('input[type="file"]').setInputFiles({
      name: 'test.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('test'),
    });
    await page.fill('textarea[placeholder*="caption"]', 'Test post');
    await page.click('body');

    // Wait for post to appear
    await page.waitForSelector('[data-testid="post-card"]:has-text("Test post")');

    // Delete post immediately
    const post = page.locator('[data-testid="post-card"]:has-text("Test post")');
    await post.hover();
    await page.click('[data-testid="delete-post-button"]');
    await page.click('[data-testid="confirm-delete"]');

    // Verify post removed from UI
    await expect(post).not.toBeVisible();

    // Verify queue optimized (both operations canceled)
    const queue = await getQueuedMutations(page);
    const creates = queue.filter((m) => m.type === 'create_post');
    const deletes = queue.filter((m) => m.type === 'delete_post');

    // Neither operation should be in queue (conflict resolved)
    expect(creates.length).toBe(0);
    expect(deletes.length).toBe(0);

    // Go online (no sync needed)
    await goOnline(context);
    await page.waitForTimeout(2000);

    // Verify no API calls made
    const finalQueue = await getQueuedMutations(page);
    expect(finalQueue.length).toBe(0);
  });

  test('should optimize heart/unheart to final state', async ({ page, context }) => {
    await goOffline(context);

    const heartButton = page.locator('[data-testid="heart-button"]').first();

    // Heart → Unheart → Heart → Unheart
    await heartButton.click();
    await heartButton.click();
    await heartButton.click();
    await heartButton.click();

    // Final state: unhearted
    await expect(heartButton).not.toHaveClass(/filled|active/);

    // Verify queue has only 1 mutation (final state)
    const queue = await getQueuedMutations(page);
    const hearts = queue.filter((m) => m.type === 'toggle_like_post');

    expect(hearts.length).toBeLessThanOrEqual(1);

    // If queue has 1 item, verify it's "unlike" action
    if (hearts.length === 1) {
      expect(hearts[0].payload.action).toBe('unlike');
    }

    // Sync
    await goOnline(context);
    await waitForSync(page, 10000);

    // Verify final state persisted (unhearted)
    await expect(heartButton).not.toHaveClass(/filled|active/);
  });

  test('should batch settings changes to final values', async ({ page, context }) => {
    await goOffline(context);

    // Navigate to settings
    await page.click('[data-testid="user-menu"]');
    await page.click('text=Settings');
    await page.waitForURL('**/settings', { timeout: 5000 });

    // Change proximity multiple times
    const proximityInput = page.locator('input[name="proximity"]');
    await proximityInput.fill('5');
    await proximityInput.blur();
    await page.waitForTimeout(500);

    await proximityInput.fill('15');
    await proximityInput.blur();
    await page.waitForTimeout(500);

    await proximityInput.fill('25');
    await proximityInput.blur();
    await page.waitForTimeout(500);

    // Verify queue has only 1 settings mutation (batched)
    const queue = await getQueuedMutations(page);
    const settings = queue.filter((m) => m.type === 'update_preferences');

    expect(settings.length).toBe(1);
    expect(settings[0].payload.proximity).toBe(25); // Final value

    // Sync
    await goOnline(context);
    await waitForSync(page, 10000);

    // Verify final value persisted
    await expect(proximityInput).toHaveValue('25');
  });

  test('should handle comment on deleted post gracefully', async ({ page, context }) => {
    await goOffline(context);

    // Open post detail
    await page.click('[data-testid="post-card"]');
    await page.waitForURL('**/post/**', { timeout: 5000 });

    // Write comment
    await page.fill('[data-testid="comment-input"]', 'Great post!');
    await page.click('body');

    // Simulate post deletion by author (mock API response)
    await page.route('**/api/posts/**', async (route) => {
      await route.fulfill({
        status: 404,
        body: JSON.stringify({ error: 'Post not found' }),
      });
    });

    // Go online and sync
    await goOnline(context);
    await page.waitForTimeout(5000);

    // Verify comment mutation removed from queue (silently failed)
    const queue = await getQueuedMutations(page);
    const comments = queue.filter((m) => m.type === 'create_comment');
    expect(comments.length).toBe(0);

    // Verify no error shown to user (silent failure per ZEN philosophy)
    const errorToast = page.locator('[data-testid="toast"]:has-text("error")');
    await expect(errorToast).not.toBeVisible();
  });
});
