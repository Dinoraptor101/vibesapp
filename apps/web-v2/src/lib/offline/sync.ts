import { useEffect } from 'react';
import { sendMessage } from '@/features/messaging/api/dmService';
import { createComment } from '@/features/posts/api/commentService';
import { toggleLikePost } from '@/features/posts/api/postService';
import { offlineQueue, type QueueItem } from './queue';

interface SyncResult {
  successful: number;
  failed: number;
  errors: Error[];
}

export async function syncQueue(): Promise<SyncResult> {
  const result: SyncResult = {
    successful: 0,
    failed: 0,
    errors: [],
  };

  const items = await offlineQueue.getPending();

  for (const item of items) {
    if (!item.id) continue;

    try {
      await offlineQueue.update(item.id, { status: 'processing' });
      await processQueueItem(item);
      await offlineQueue.remove(item.id);
      result.successful++;
    } catch (error) {
      result.failed++;
      result.errors.push(error as Error);

      const newRetries = item.retries + 1;

      if (newRetries >= 3) {
        // Give up after 3 retries
        await offlineQueue.remove(item.id);
      } else {
        await offlineQueue.update(item.id, {
          status: 'pending',
          retries: newRetries,
        });
      }
    }
  }

  return result;
}

async function processQueueItem(item: QueueItem): Promise<void> {
  switch (item.action) {
    case 'toggle_like':
      await toggleLikePost((item.data as { postId: string }).postId);
      break;
    case 'create_comment':
      await createComment(item.data as Parameters<typeof createComment>[0]);
      break;
    case 'send_message':
      await sendMessage(item.data as Parameters<typeof sendMessage>[0]);
      break;
    // Note: Account updates and post creation will be added in later sessions
    default:
      console.warn(`Unknown queued action: ${item.action}`);
  }
}

// Hook for auto-sync
export function useAutoSync() {
  useEffect(() => {
    const handleOnline = async () => {
      // Sync when coming back online
      // Polarity pattern: silent sync, no toasts (Zen approach)
      await syncQueue();
    };

    window.addEventListener('online', handleOnline);

    // Periodic sync every 5 minutes while online
    const interval = setInterval(
      () => {
        if (navigator.onLine) {
          syncQueue();
        }
      },
      5 * 60 * 1000
    );

    return () => {
      window.removeEventListener('online', handleOnline);
      clearInterval(interval);
    };
  }, []);

  // Cleanup old queue items on mount
  useEffect(() => {
    offlineQueue.cleanup();

    const cleanupInterval = setInterval(
      () => {
        offlineQueue.cleanup();
      },
      60 * 60 * 1000
    ); // Every hour

    return () => clearInterval(cleanupInterval);
  }, []);
}
