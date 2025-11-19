/**
 * useAutoSync Hook
 * 
 * Automatically syncs queued offline actions when connection is restored.
 * Runs retry logic with exponential backoff.
 */

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { offlineQueue, type QueueItem } from './offlineQueue';

// Import API services for processing queue items
import { toggleLikePost } from '@/features/posts/api/postService';
import { createComment, heartComment, type CreateCommentPayload } from '@/features/posts/api/commentService';
import { sendMessage, type SendMessagePayload } from '@/features/messaging/api/dmService';

const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 5000, 15000]; // 1s, 5s, 15s

export function useAutoSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleOnline = async () => {
      console.log('[AutoSync] Connection restored, syncing queue...');
      const queue = await offlineQueue.getAll();
      
      if (queue.length === 0) {
        console.log('[AutoSync] Queue is empty');
        return;
      }

      console.log(`[AutoSync] Processing ${queue.length} queued items`);

      // Process each item sequentially to avoid overwhelming the server
      for (const item of queue) {
        try {
          await processQueueItem(item);
          await offlineQueue.remove(item.id!);
          console.log(`[AutoSync] Successfully processed: ${item.action}`);
        } catch (error) {
          console.error(`[AutoSync] Failed to process ${item.action}:`, error);
          
          // Increment retry count
          const newRetries = (item.retries || 0) + 1;
          
          if (newRetries >= MAX_RETRIES) {
            // Give up after max retries
            console.error(`[AutoSync] Giving up on ${item.action} after ${MAX_RETRIES} retries`);
            await offlineQueue.remove(item.id!);
          } else {
            // Update retry count and retry later
            await offlineQueue.update(item.id!, { retries: newRetries });
            
            // Schedule retry with backoff
            const delay = RETRY_DELAYS[newRetries - 1] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
            console.log(`[AutoSync] Retrying ${item.action} in ${delay}ms (attempt ${newRetries + 1})`);
            
            setTimeout(async () => {
              try {
                await processQueueItem(item);
                await offlineQueue.remove(item.id!);
                console.log(`[AutoSync] Retry successful: ${item.action}`);
              } catch (retryError) {
                console.error(`[AutoSync] Retry failed: ${item.action}`, retryError);
              }
            }, delay);
          }
        }
      }

      // Invalidate all queries to refresh data
      queryClient.invalidateQueries();
      console.log('[AutoSync] Queue processing complete');
    };

    // Cleanup old queue items on mount
    offlineQueue.cleanup().then((removed) => {
      if (removed > 0) {
        console.log(`[AutoSync] Cleaned up ${removed} old queue items`);
      }
    });

    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [queryClient]);

  // Periodic cleanup (every hour)
  useEffect(() => {
    const interval = setInterval(() => {
      offlineQueue.cleanup();
    }, 60 * 60 * 1000); // 1 hour

    return () => clearInterval(interval);
  }, []);
}

/**
 * Process a single queue item based on its action type
 */
async function processQueueItem(item: QueueItem): Promise<void> {
  const { action, data } = item;

  switch (action) {
    case 'heartPost':
      await toggleLikePost(data.postId);
      break;

    case 'createComment':
      const commentPayload: CreateCommentPayload = {
        postId: data.postId,
        text: data.text,
        location: data.location,
        replyToCommentId: data.replyTo,
      };
      await createComment(commentPayload);
      break;

    case 'heartComment':
      await heartComment(data.commentId, false); // Pass isHearted as false to toggle
      break;

    case 'sendMessage':
      const messagePayload: SendMessagePayload = {
        conversationId: data.conversationId,
        body: data.content,
      };
      await sendMessage(messagePayload);
      break;

    case 'updateProfile':
      // Will be implemented in Phase 3
      console.log('[AutoSync] Profile updates not yet implemented');
      break;

    default:
      console.warn(`[AutoSync] Unknown action type: ${action}`);
  }
}
