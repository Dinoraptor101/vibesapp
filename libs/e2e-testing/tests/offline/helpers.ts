/**
 * Playwright Helpers for Offline PWA Testing
 *
 * Utilities for simulating offline mode, mocking IndexedDB,
 * and verifying queue state during E2E tests.
 */

import type { Page, BrowserContext } from '@playwright/test';

/**
 * Set the browser to offline mode (no network)
 */
export async function goOffline(context: BrowserContext): Promise<void> {
  await context.setOffline(true);
}

/**
 * Set the browser to online mode (restore network)
 */
export async function goOnline(context: BrowserContext): Promise<void> {
  await context.setOffline(false);
}

/**
 * Get all items from IndexedDB queue
 * @returns Array of queued mutations
 */
export async function getQueuedMutations(page: Page): Promise<any[]> {
  return await page.evaluate(async () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('vibesapp-offline', 1);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['mutation-queue'], 'readonly');
        const store = transaction.objectStore('mutation-queue');
        const getAllRequest = store.getAll();

        getAllRequest.onsuccess = () => resolve(getAllRequest.result);
        getAllRequest.onerror = () => reject(getAllRequest.error);
      };
    });
  });
}

/**
 * Clear all items from IndexedDB queue
 */
export async function clearQueue(page: Page): Promise<void> {
  await page.evaluate(async () => {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('vibesapp-offline', 1);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['mutation-queue'], 'readwrite');
        const store = transaction.objectStore('mutation-queue');
        const clearRequest = store.clear();

        clearRequest.onsuccess = () => resolve();
        clearRequest.onerror = () => reject(clearRequest.error);
      };
    });
  });
}

/**
 * Get cached posts from React Query persistence
 */
export async function getCachedPosts(page: Page): Promise<any[]> {
  return await page.evaluate(async () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('vibesapp-offline', 1);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['react-query-cache'], 'readonly');
        const store = transaction.objectStore('react-query-cache');
        const getRequest = store.get('posts-feed');

        getRequest.onsuccess = () => {
          const data = getRequest.result;
          resolve(data?.state?.data?.pages?.flatMap((p: any) => p.posts) || []);
        };
        getRequest.onerror = () => reject(getRequest.error);
      };
    });
  });
}

/**
 * Wait for sync to complete (queue empty)
 */
export async function waitForSync(page: Page, timeoutMs = 10000): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    const queue = await getQueuedMutations(page);
    if (queue.length === 0) {
      return;
    }
    await page.waitForTimeout(500);
  }

  throw new Error(`Sync timeout: Queue still has items after ${timeoutMs}ms`);
}

/**
 * Mock a successful S3 upload
 */
export async function mockS3Upload(page: Page): Promise<void> {
  await page.route('https://**.s3.amazonaws.com/**', async (route) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify({ success: true }),
    });
  });
}

/**
 * Mock the /api/health endpoint
 */
export async function mockHealthCheck(page: Page, healthy = true): Promise<void> {
  await page.route('**/api/health', async (route) => {
    if (healthy) {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ status: 'ok' }),
      });
    } else {
      await route.abort('connectionfailed');
    }
  });
}

/**
 * Verify a queued mutation exists with specific properties
 */
export async function expectQueuedMutation(
  page: Page,
  mutationType: string,
  predicate?: (mutation: any) => boolean
): Promise<boolean> {
  const queue = await getQueuedMutations(page);
  const found = queue.find((m) => {
    if (m.type !== mutationType) return false;
    if (predicate) return predicate(m);
    return true;
  });
  return !!found;
}

/**
 * Get network state from the app (online/offline)
 */
export async function getNetworkState(page: Page): Promise<'online' | 'offline'> {
  return await page.evaluate(() => {
    return navigator.onLine ? 'online' : 'offline';
  });
}

/**
 * Wait for offline banner to appear
 */
export async function waitForOfflineBanner(page: Page): Promise<void> {
  await page.waitForSelector('[data-testid="offline-banner"]', { timeout: 5000 });
}

/**
 * Wait for offline banner to disappear
 */
export async function waitForOnlineBanner(page: Page): Promise<void> {
  await page.waitForSelector('[data-testid="offline-banner"]', { state: 'hidden', timeout: 5000 });
}

/**
 * Create a test image blob for upload testing
 */
export async function createTestImageBlob(page: Page): Promise<string> {
  return await page.evaluate(() => {
    // Create a 100x100 red canvas
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, 100, 100);

    // Convert to blob URL
    return canvas.toDataURL('image/jpeg', 0.85);
  });
}
