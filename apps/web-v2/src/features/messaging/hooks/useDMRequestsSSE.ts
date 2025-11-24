/**
 * DM Requests SSE Hook
 *
 * Listens to real-time DM request events via SSE:
 * - dm-request-update: New DM request or status change
 *
 * Updates React Query cache to keep UI in sync
 */

import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useSSE } from '@/hooks/useSSE';
import type { DMRequest } from '../api/dmService';

interface DMRequestUpdateEvent {
  request: DMRequest;
  action: 'created' | 'accepted' | 'declined';
}

/**
 * Hook to listen for real-time DM request events
 * Automatically updates React Query cache when events arrive
 */
export function useDMRequestsSSE(userId: string | undefined) {
  const queryClient = useQueryClient();
  const { isConnected, addEventListener, removeEventListener } = useSSE({
    enabled: !!userId,
  });

  useEffect(() => {
    if (!userId || !isConnected) return;

    /**
     * Handle dm-request-update event
     * Updates DM requests list based on action type
     */
    const handleDMRequestUpdate = (event: MessageEvent) => {
      try {
        const data: DMRequestUpdateEvent = JSON.parse(event.data);
        const { request, action } = data;

        console.log('[useDMRequestsSSE] DM request update:', action, request._id);

        // Update DM requests cache
        queryClient.setQueryData(['dm-requests'], (oldData: DMRequest[] | undefined) => {
          if (!oldData) {
            // If no cache, just add the new request if it's created
            return action === 'created' ? [request] : [];
          }

          if (action === 'created') {
            // Add new request to beginning of list
            const exists = oldData.some((r) => r._id === request._id);
            if (exists) return oldData;

            return [request, ...oldData];
          }

          if (action === 'accepted' || action === 'declined') {
            // Remove request from list (it's been processed)
            return oldData.filter((r) => r._id !== request._id);
          }

          return oldData;
        });

        // If request was accepted, invalidate conversations to show new conversation
        if (action === 'accepted') {
          queryClient.invalidateQueries({ queryKey: ['conversations', userId] });
        }

        // Invalidate DM request status caches that might be affected
        if (request.recipient === userId || request.sender._id === userId) {
          // Invalidate status checks for both sender and recipient
          queryClient.invalidateQueries({
            queryKey: ['dm-request-status', request.sender._id],
          });
          queryClient.invalidateQueries({
            queryKey: ['dm-request-status', request.recipient],
          });
        }
      } catch (error) {
        console.error('[useDMRequestsSSE] Error handling dm-request-update:', error);
      }
    };

    // Register event handler
    addEventListener('dm-request-update', handleDMRequestUpdate);

    // Cleanup
    return () => {
      removeEventListener('dm-request-update', handleDMRequestUpdate);
    };
  }, [userId, isConnected, addEventListener, removeEventListener, queryClient]);

  return {
    isConnected,
  };
}
