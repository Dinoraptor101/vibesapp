/**
 * E2E Test: Offline Interactions (Hearts, Comments) with Queue
 *
 * Tests:
 * 1. Heart posts while offline
 * 2. Comment on posts while offline
 * 3. Batch queue accumulation
 * 4. Reconnect and batch sync
 * 5. Optimistic UI for all interactions
 */

import { test, expect } from '@playwright/test';
import {
  goOffline,
  goOnline,
  getQueuedMutations,
  clearQueue,
  waitForSync,
  expectQueuedMutation,
  waitForOfflineBanner,
} from './helpers';

// SKIP: Requires Web V2 offline functionality and localhost:5173
test.describe.skip('Offline Interactions', () => {
  test.beforeEach(async ({ page, context }) => {
    await page.goto('http://localhost:5173');
    await clearQueue(page);

    // Login
    await page.fill('input[type="password"]', 'brave-tiger-8472');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:5173/', { timeout: 10000 });

    // Wait for posts to load
    await page.waitForSelector('[data-testid="post-card"]', { timeout: 10000 });
  });

  test('should heart multiple posts offline and sync', async ({ page, context }) => {
    // Go offline
    await goOffline(context);
    await waitForOfflineBanner(page);

    // Heart first 3 posts
    const heartButtons = page.locator('[data-testid="heart-button"]');
    const heartCount = Math.min(3, await heartButtons.count());

    for (let i = 0; i < heartCount; i++) {
      await heartButtons.nth(i).click();

      // Verify optimistic UI - button fills immediately
      const button = heartButtons.nth(i);
      await expect(button).toHaveClass(/filled|active/);
    }

    // Verify queue has 3 heart mutations
    const queue = await getQueuedMutations(page);
    const hearts = queue.filter((m) => m.type === 'toggle_like_post');
    expect(hearts.length).toBe(heartCount);

    // Go online
    await goOnline(context);
    await waitForSync(page, 10000);

    // Verify hearts persisted (buttons still filled)
    for (let i = 0; i < heartCount; i++) {
      const button = heartButtons.nth(i);
      await expect(button).toHaveClass(/filled|active/);
    }

    // Verify queue empty
    const finalQueue = await getQueuedMutations(page);
    expect(finalQueue.length).toBe(0);
  });

  test('should comment on posts offline with optimistic UI', async ({ page, context }) => {
    // Go offline
    await goOffline(context);

    // Click first post to open detail
    await page.click('[data-testid="post-card"]');
    await page.waitForURL('**/post/**', { timeout: 5000 });

    // Write comment
    const commentInput = page.locator('[data-testid="comment-input"]');
    await commentInput.fill('Amazing shot! 📸');

    // Submit (blur)
    await page.click('body');

    // Verify comment appears immediately
    const comment = page.locator('[data-testid="comment-card"]').last();
    await expect(comment).toContainText('Amazing shot');

    // Verify pending badge
    const pendingBadge = page.locator('[data-testid="comment-pending"]').last();
    await expect(pendingBadge).toBeVisible();

    // Verify queue
    const hasComment = await expectQueuedMutation(page, 'create_comment');
    expect(hasComment).toBe(true);

    // Go online
    await goOnline(context);
    await waitForSync(page, 10000);

    // Verify pending badge disappears
    await expect(pendingBadge).not.toBeVisible();
  });

  test('should batch sync multiple interaction types', async ({ page, context }) => {
    await goOffline(context);

    // Heart 2 posts
    const heartButtons = page.locator('[data-testid="heart-button"]');
    await heartButtons.nth(0).click();
    await heartButtons.nth(1).click();

    // Comment on first post
    await page.click('[data-testid="post-card"]');
    await page.fill('[data-testid="comment-input"]', 'Great post!');
    await page.click('body');

    // Navigate back and heart another post
    await page.goBack();
    await heartButtons.nth(2).click();

    // Verify queue has mixed types
    const queue = await getQueuedMutations(page);
    expect(queue.length).toBe(4); // 3 hearts + 1 comment

    const hearts = queue.filter((m) => m.type === 'toggle_like_post');
    const comments = queue.filter((m) => m.type === 'create_comment');
    expect(hearts.length).toBe(3);
    expect(comments.length).toBe(1);

    // Go online and sync
    await goOnline(context);
    await waitForSync(page, 15000);

    // Verify all synced (queue empty)
    const finalQueue = await getQueuedMutations(page);
    expect(finalQueue.length).toBe(0);

    // Verify success toast
    const toast = page.locator('[data-testid="toast"]');
    await expect(toast).toContainText(/synced|success/i);
  });

  test('should handle heart/unheart toggle while offline', async ({ page, context }) => {
    await goOffline(context);

    const heartButton = page.locator('[data-testid="heart-button"]').first();

    // Heart
    await heartButton.click();
    await expect(heartButton).toHaveClass(/filled|active/);

    // Unheart
    await heartButton.click();
    await expect(heartButton).not.toHaveClass(/filled|active/);

    // Heart again
    await heartButton.click();
    await expect(heartButton).toHaveClass(/filled|active/);

    // Verify queue optimized (only final state)
    const queue = await getQueuedMutations(page);
    const hearts = queue.filter((m) => m.type === 'toggle_like_post');

    // Should have only 1 mutation (final state: liked)
    expect(hearts.length).toBe(1);
    expect(hearts[0].payload.action).toBe('like');

    // Sync
    await goOnline(context);
    await waitForSync(page, 10000);

    // Verify final state persisted
    await expect(heartButton).toHaveClass(/filled|active/);
  });
});
