/**
 * E2E Test: Offline Message Sending with Optimistic UI
 *
 * Scenario 1: Commuter on Subway
 *
 * Tests:
 * 1. Send messages while offline
 * 2. Optimistic UI (messages appear sent immediately)
 * 3. Queue verification
 * 4. Reconnect and sync
 * 5. Read cached conversations offline
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

test.describe('Offline Messaging', () => {
  test.beforeEach(async ({ page, context }) => {
    await page.goto('http://localhost:5173');
    await clearQueue(page);

    // Login
    await page.fill('input[type="password"]', 'brave-tiger-8472');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:5173/', { timeout: 10000 });

    // Navigate to messages and open a conversation
    await page.click('[data-testid="nav-messages"]');
    await page.waitForURL('**/messages', { timeout: 5000 });

    // Wait for conversations to load
    await page.waitForSelector('[data-testid="conversation-item"]', { timeout: 5000 });

    // Click first conversation
    await page.click('[data-testid="conversation-item"]');
    await page.waitForURL('**/messages/**', { timeout: 5000 });
  });

  test('should send messages offline with optimistic UI', async ({ page, context }) => {
    // Go offline
    await goOffline(context);
    await waitForOfflineBanner(page);

    // Type message
    const messageInput = page.locator('[data-testid="message-input"]');
    await messageInput.fill('Running late, be there in 10');

    // Send (blur or press Enter)
    await messageInput.press('Enter');

    // Verify message appears immediately in UI
    const lastMessage = page.locator('[data-testid="message-bubble"]').last();
    await expect(lastMessage).toContainText('Running late');

    // Verify pending indicator (clock icon or "sending..." text)
    const pendingIndicator = page.locator('[data-testid="message-pending"]').last();
    await expect(pendingIndicator).toBeVisible();

    // Verify mutation in queue
    const hasSendMessage = await expectQueuedMutation(page, 'send_message', (m) => {
      return m.payload?.text?.includes('Running late');
    });
    expect(hasSendMessage).toBe(true);

    // Go online
    await goOnline(context);

    // Wait for sync
    await waitForSync(page, 10000);

    // Verify pending indicator disappears
    await expect(pendingIndicator).not.toBeVisible();

    // Verify sent indicator (checkmark)
    const sentIndicator = page.locator('[data-testid="message-sent"]').last();
    await expect(sentIndicator).toBeVisible();
  });

  test('should read cached conversations offline', async ({ page, context }) => {
    // Load conversation while online (to populate cache)
    await page.waitForSelector('[data-testid="message-bubble"]', { timeout: 5000 });
    const messageCount = await page.locator('[data-testid="message-bubble"]').count();
    expect(messageCount).toBeGreaterThan(0);

    // Go offline
    await goOffline(context);
    await waitForOfflineBanner(page);

    // Navigate away and back
    await page.click('[data-testid="nav-home"]');
    await page.click('[data-testid="nav-messages"]');
    await page.click('[data-testid="conversation-item"]');

    // Verify messages still visible (from cache)
    const cachedMessageCount = await page.locator('[data-testid="message-bubble"]').count();
    expect(cachedMessageCount).toBe(messageCount);

    // Verify "Last updated X ago" indicator
    const cacheIndicator = page.locator('[data-testid="cache-timestamp"]');
    await expect(cacheIndicator).toBeVisible();
  });

  test('should queue multiple messages in correct order', async ({ page, context }) => {
    await goOffline(context);

    // Send 3 messages
    const messages = ['First message', 'Second message', 'Third message'];

    for (const text of messages) {
      await page.fill('[data-testid="message-input"]', text);
      await page.press('[data-testid="message-input"]', 'Enter');
      await page.waitForTimeout(500);
    }

    // Verify all 3 appear in UI
    for (const text of messages) {
      const message = page.locator(`[data-testid="message-bubble"]:has-text("${text}")`);
      await expect(message).toBeVisible();
    }

    // Verify queue has 3 items
    const queue = await getQueuedMutations(page);
    const messageQueue = queue.filter((m) => m.type === 'send_message');
    expect(messageQueue.length).toBe(3);

    // Verify order preserved (by timestamp)
    expect(messageQueue[0].timestamp).toBeLessThan(messageQueue[1].timestamp);
    expect(messageQueue[1].timestamp).toBeLessThan(messageQueue[2].timestamp);

    // Go online and sync
    await goOnline(context);
    await waitForSync(page, 10000);

    // Verify all sent successfully
    const sentIndicators = page.locator('[data-testid="message-sent"]');
    expect(await sentIndicators.count()).toBeGreaterThanOrEqual(3);
  });
});
