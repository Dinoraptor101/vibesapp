/**
 * Activity SSE Hook
 *
 * Listens to real-time activity events via SSE:
 * - activity-update: New activity notification
 * - unread-count-update: Unread count changed
 *
 * Updates React Query cache to keep UI in sync
 */

import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useSSE } from '@/hooks/useSSE';
import type { Activity, ActivityCounts } from '../types';

interface ActivityUpdateEvent {
  activity: Activity;
}

interface UnreadCountUpdateEvent {
  counts: ActivityCounts;
}

/**
 * Hook to listen for real-time activity events
 * Automatically updates React Query cache when events arrive
 */
export function useActivitySSE(userId: string | undefined) {
  const queryClient = useQueryClient();
  const { isConnected, addEventListener, removeEventListener } = useSSE({
    enabled: !!userId,
  });

  useEffect(() => {
    if (!userId) return;

    /**
     * Handle activity-update event
     * Adds new activity to the activities list
     */
    const handleActivityUpdate = (rawData: unknown) => {
      try {
        const { activity } = rawData as ActivityUpdateEvent;

        console.log('[useActivitySSE] New activity received:', activity.type);

        // Categorize activity for category-specific queries
        const categorizeActivity = (act: Activity): 'messages' | 'social' | 'me' => {
          if (act.type === 'dm_request' || act.type === 'dm_message') {
            return 'messages';
          }
          if (
            act.type === 'new_follower' ||
            act.type === 'following_post' ||
            act.type === 'nearby_post'
          ) {
            return 'social';
          }
          return 'me';
        };

        const category = categorizeActivity(activity);

        // Update 'all' activities cache
        queryClient.setQueryData(
          ['activities', userId, 'all'],
          (oldData: Activity[] | undefined) => {
            if (!oldData) return [activity];

            // Add to beginning of list (most recent first)
            // Check for duplicates
            const exists = oldData.some((a) => a._id === activity._id);
            if (exists) return oldData;

            return [activity, ...oldData];
          }
        );

        // Update category-specific cache
        queryClient.setQueryData(
          ['activities', userId, category],
          (oldData: Activity[] | undefined) => {
            if (!oldData) return [activity];

            // Check for duplicates
            const exists = oldData.some((a) => a._id === activity._id);
            if (exists) return oldData;

            return [activity, ...oldData];
          }
        );

        // Update activities cache without category (default query)
        queryClient.setQueryData(
          ['activities', userId, undefined],
          (oldData: Activity[] | undefined) => {
            if (!oldData) return [activity];

            const exists = oldData.some((a) => a._id === activity._id);
            if (exists) return oldData;

            return [activity, ...oldData];
          }
        );

        // Invalidate unread counts to refetch
        queryClient.invalidateQueries({ queryKey: ['activity-counts', userId] });
        queryClient.invalidateQueries({ queryKey: ['has-unread', userId] });
      } catch (error) {
        console.error('[useActivitySSE] Error handling activity-update:', error);
      }
    };

    /**
     * Handle unread-count-update event
     * Updates the cached unread counts
     */
    const handleUnreadCountUpdate = (rawData: unknown) => {
      try {
        const { counts } = rawData as UnreadCountUpdateEvent;

        console.log('[useActivitySSE] Unread counts updated:', counts);

        // Update counts cache directly
        queryClient.setQueryData(['activity-counts', userId], counts);

        // Update has-unread based on counts
        queryClient.setQueryData(['has-unread', userId], counts.all > 0);
      } catch (error) {
        console.error('[useActivitySSE] Error handling unread-count-update:', error);
      }
    };

    // Register event handlers
    addEventListener('activity-update', handleActivityUpdate);
    addEventListener('unread-count-update', handleUnreadCountUpdate);

    // Cleanup
    return () => {
      removeEventListener('activity-update', handleActivityUpdate);
      removeEventListener('unread-count-update', handleUnreadCountUpdate);
    };
  }, [userId, addEventListener, removeEventListener, queryClient]);

  return {
    isConnected,
  };
}
