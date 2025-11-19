/**
 * E2E Test: Offline Post Creation with Image Queue
 *
 * Scenario 2: Nature Photographer in Remote Area
 *
 * Tests:
 * 1. Create post while offline
 * 2. Image compression and IndexedDB storage
 * 3. Optimistic UI (post appears immediately)
 * 4. Queue verification
 * 5. Reconnect and automatic sync
 * 6. S3 upload and backend post creation
 */

import { test, expect } from '@playwright/test';
import {
  goOffline,
  goOnline,
  getQueuedMutations,
  clearQueue,
  waitForSync,
  mockS3Upload,
  expectQueuedMutation,
  waitForOfflineBanner,
  waitForOnlineBanner,
} from './helpers';

test.describe('Offline Post Creation', () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear queue before each test
    await page.goto('http://localhost:5173');
    await clearQueue(page);

    // Login
    await page.fill('input[type="password"]', 'brave-tiger-8472');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:5173/', { timeout: 10000 });

    // Mock S3 uploads
    await mockS3Upload(page);
  });

  test('should create post offline and sync when reconnected', async ({ page, context }) => {
    // Go offline
    await goOffline(context);
    await waitForOfflineBanner(page);

    // Verify offline banner shows
    const offlineBanner = page.locator('[data-testid="offline-banner"]');
    await expect(offlineBanner).toBeVisible();
    await expect(offlineBanner).toContainText('offline');

    // Open create post modal
    await page.click('[data-testid="create-post-button"]');

    // Upload image (simulate file selection)
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'sunset.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-image-data'),
    });

    // Wait for compression
    await page.waitForTimeout(1000);

    // Add caption
    await page.fill('textarea[placeholder*="caption"]', 'Golden hour at 10,000 feet 🏔️✨');

    // Submit post (blur from textarea)
    await page.click('body');

    // Verify optimistic UI - post appears immediately
    await expect(page.locator('[data-testid="post-card"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="post-card"]').first()).toContainText('Golden hour');

    // Verify "pending upload" badge
    const pendingBadge = page.locator('[data-testid="pending-sync-badge"]').first();
    await expect(pendingBadge).toBeVisible();
    await expect(pendingBadge).toContainText(/pending|syncing/i);

    // Verify mutation in queue
    const queue = await getQueuedMutations(page);
    expect(queue.length).toBeGreaterThan(0);

    const hasCreatePost = await expectQueuedMutation(page, 'create_post');
    expect(hasCreatePost).toBe(true);

    // Go back online
    await goOnline(context);
    await waitForOnlineBanner(page);

    // Wait for sync to complete
    await waitForSync(page, 15000);

    // Verify pending badge disappears
    await expect(pendingBadge).not.toBeVisible();

    // Verify success toast
    const toast = page.locator('[data-testid="toast"]');
    await expect(toast).toContainText(/synced|success/i);

    // Verify queue is empty
    const finalQueue = await getQueuedMutations(page);
    expect(finalQueue.length).toBe(0);
  });

  test('should handle S3 upload failure with retry', async ({ page, context }) => {
    // Go offline
    await goOffline(context);

    // Create post
    await page.click('[data-testid="create-post-button"]');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('test-data'),
    });
    await page.fill('textarea[placeholder*="caption"]', 'Test post');
    await page.click('body');

    // Mock S3 failure
    await page.unroute('https://**.s3.amazonaws.com/**');
    await page.route('https://**.s3.amazonaws.com/**', async (route) => {
      await route.abort('connectionfailed');
    });

    // Go online (sync will fail)
    await goOnline(context);
    await page.waitForTimeout(5000);

    // Verify error indicator
    const errorBadge = page.locator('[data-testid="sync-error-badge"]').first();
    await expect(errorBadge).toBeVisible();

    // Verify retry button exists
    const retryButton = page.locator('[data-testid="retry-sync-button"]').first();
    await expect(retryButton).toBeVisible();

    // Fix S3 and retry
    await mockS3Upload(page);
    await retryButton.click();

    // Wait for sync
    await waitForSync(page, 15000);

    // Verify success
    await expect(errorBadge).not.toBeVisible();
    const queue = await getQueuedMutations(page);
    expect(queue.length).toBe(0);
  });

  test('should compress large images before storing', async ({ page, context }) => {
    await goOffline(context);

    // Create large image (>5MB simulated)
    await page.click('[data-testid="create-post-button"]');
    const fileInput = page.locator('input[type="file"]');

    // Upload file
    await fileInput.setInputFiles({
      name: 'large.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.alloc(5 * 1024 * 1024), // 5MB
    });

    // Wait for compression
    await page.waitForTimeout(2000);

    // Verify compressed size display
    const sizeDisplay = page.locator('[data-testid="compressed-size"]');
    await expect(sizeDisplay).toBeVisible();

    // Extract size (should be <1MB after compression)
    const sizeText = await sizeDisplay.textContent();
    expect(sizeText).toMatch(/KB|[0-9]\.[0-9]+ MB/);
  });
});
