/**
 * E2E Test: Cache Persistence and Reload
 *
 * Tests:
 * 1. Posts cache survives page reload
 * 2. Conversations cache survives reload
 * 3. Queue persists across sessions
 * 4. IndexedDB hydration on app startup
 */

import { test, expect } from '@playwright/test';
import {
  goOffline,
  goOnline,
  getQueuedMutations,
  getCachedPosts,
  clearQueue,
  waitForOfflineBanner,
} from './helpers';

// SKIP: Requires Web V2 offline functionality and localhost:5173
test.describe.skip('Cache Persistence', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await clearQueue(page);

    // Login
    await page.fill('input[type="password"]', 'brave-tiger-8472');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:5173/', { timeout: 10000 });
  });

  test('should persist posts cache across page reload', async ({ page, context }) => {
    // Load posts while online
    await page.waitForSelector('[data-testid="post-card"]', { timeout: 10000 });
    const onlinePostCount = await page.locator('[data-testid="post-card"]').count();
    expect(onlinePostCount).toBeGreaterThan(0);

    // Get cached posts from IndexedDB
    const cachedPosts = await getCachedPosts(page);
    expect(cachedPosts.length).toBeGreaterThan(0);

    // Go offline
    await goOffline(context);
    await waitForOfflineBanner(page);

    // Reload page
    await page.reload();

    // Wait for app to hydrate from cache
    await page.waitForSelector('[data-testid="post-card"]', { timeout: 5000 });

    // Verify same posts visible (from cache)
    const offlinePostCount = await page.locator('[data-testid="post-card"]').count();
    expect(offlinePostCount).toBe(onlinePostCount);

    // Verify cache indicator shows
    const cacheIndicator = page.locator('[data-testid="cache-timestamp"]');
    await expect(cacheIndicator).toBeVisible();
  });

  test('should persist queue across page reload', async ({ page, context }) => {
    await goOffline(context);

    // Heart 3 posts
    const heartButtons = page.locator('[data-testid="heart-button"]');
    await heartButtons.nth(0).click();
    await heartButtons.nth(1).click();
    await heartButtons.nth(2).click();

    // Verify queue has 3 items
    const queue = await getQueuedMutations(page);
    expect(queue.length).toBe(3);

    // Reload page
    await page.reload();

    // Wait for app to load
    await page.waitForSelector('[data-testid="post-card"]', { timeout: 5000 });

    // Verify queue still has 3 items (persisted)
    const queueAfterReload = await getQueuedMutations(page);
    expect(queueAfterReload.length).toBe(3);

    // Verify hearts still show as active
    await expect(heartButtons.nth(0)).toHaveClass(/filled|active/);
    await expect(heartButtons.nth(1)).toHaveClass(/filled|active/);
    await expect(heartButtons.nth(2)).toHaveClass(/filled|active/);
  });

  test('should hydrate cache on startup and show loading skeleton', async ({ page, context }) => {
    // Go offline before reload
    await goOffline(context);

    // Reload page (cold start)
    await page.reload();

    // Verify loading skeleton shows briefly
    const skeleton = page.locator('[data-testid="post-skeleton"]');
    await expect(skeleton.first()).toBeVisible();

    // Wait for cache hydration
    await page.waitForSelector('[data-testid="post-card"]', { timeout: 5000 });

    // Verify posts loaded from cache
    const postCount = await page.locator('[data-testid="post-card"]').count();
    expect(postCount).toBeGreaterThan(0);

    // Verify offline banner visible
    await expect(page.locator('[data-testid="offline-banner"]')).toBeVisible();
  });

  test('should sync queue automatically after reconnect and reload', async ({ page, context }) => {
    await goOffline(context);

    // Heart 2 posts
    await page.locator('[data-testid="heart-button"]').nth(0).click();
    await page.locator('[data-testid="heart-button"]').nth(1).click();

    // Reload while still offline
    await page.reload();
    await page.waitForSelector('[data-testid="post-card"]', { timeout: 5000 });

    // Verify queue persisted
    const queue = await getQueuedMutations(page);
    expect(queue.length).toBe(2);

    // Go online
    await goOnline(context);

    // Wait for automatic sync
    await page.waitForTimeout(5000);

    // Verify queue cleared
    const queueAfterSync = await getQueuedMutations(page);
    expect(queueAfterSync.length).toBe(0);

    // Verify success toast
    const toast = page.locator('[data-testid="toast"]');
    await expect(toast).toContainText(/synced|success/i);
  });

  test('should evict old cache when storage limit reached', async ({ page, context }) => {
    // This test would require filling IndexedDB to near capacity
    // Skipping implementation for now, but structure provided
    // TODO: Implement cache eviction test
    // 1. Fill IndexedDB with mock data (45+ MB)
    // 2. Trigger cache eviction (load new data)
    // 3. Verify oldest posts removed
    // 4. Verify recent posts kept
    // 5. Verify queue never evicted
  });
});
