/**
 * Activity Hooks
 *
 * React Query hooks for Activity Feed (Phase 4.5)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth';
import { activityService } from '../api/activityService';
import type { Activity, ActivityCategory } from '../types';

/**
 * Helper function to categorize activities
 */
function categorizeActivity(activity: Activity): ActivityCategory {
  if (activity.type === 'dm_request' || activity.type === 'dm_message') {
    return 'messages';
  }
  if (
    activity.type === 'new_follower' ||
    activity.type === 'following_post' ||
    activity.type === 'nearby_post'
  ) {
    return 'social';
  }
  return 'me';
}

/**
 * Hook to fetch all activities for the current user
 * Polls every 30 seconds for updates
 */
export function useActivities(category?: ActivityCategory) {
  const { user } = useAuth();

  return useQuery<Activity[], Error>({
    queryKey: ['activities', user?._id, category],
    queryFn: async () => {
      if (!user?._id) {
        console.warn('useActivities: user._id is undefined');
        return [];
      }

      const activities = await activityService.getActivities(user._id);

      // Filter by category if specified
      if (category && category !== 'all') {
        return activities.filter((a) => categorizeActivity(a) === category);
      }

      return activities;
    },
    enabled: !!user?._id,
    refetchInterval: 30000, // Poll every 30 seconds
    refetchIntervalInBackground: false, // Stop polling when tab hidden
    staleTime: 20000, // Consider data stale after 20 seconds
    retry: 1, // Only retry once on failure
    retryDelay: 5000, // Wait 5s before retry
  });
}

/**
 * Hook to fetch unread activity counts
 * Polls every 30 seconds for updates
 */
export function useUnreadCounts() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['activity-counts', user?._id],
    queryFn: async () => {
      if (!user?._id) {
        console.warn('useUnreadCounts: user._id is undefined');
        return { all: 0, messages: 0, social: 0, me: 0 };
      }
      return activityService.getUnreadCounts(user._id);
    },
    enabled: !!user?._id,
    refetchInterval: 30000, // Poll every 30 seconds
    refetchIntervalInBackground: false, // Stop polling when tab hidden
    staleTime: 20000,
    retry: 1,
    retryDelay: 5000,
  });
}

/**
 * Hook to check if user has any unread activities
 * Used for badge display
 */
export function useHasUnread() {
  const { user } = useAuth();

  return useQuery<boolean, Error>({
    queryKey: ['has-unread', user?._id],
    queryFn: async () => {
      if (!user?._id) return false;
      return activityService.hasUnreadActivities(user._id);
    },
    enabled: !!user?._id,
    refetchInterval: 30000,
    refetchIntervalInBackground: false, // Stop polling when tab hidden
    staleTime: 20000,
    retry: 1,
    retryDelay: 5000,
  });
}

/**
 * Hook to mark a single activity as read
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: activityService.markAsRead,
    onMutate: async (activityId: string) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['activities'] });

      // Snapshot the previous value
      const previousActivities = queryClient.getQueryData<Activity[]>(['activities', user?._id]);

      // Optimistically update to the new value
      if (previousActivities) {
        queryClient.setQueryData<Activity[]>(
          ['activities', user?._id],
          previousActivities.map((activity) =>
            activity._id === activityId
              ? { ...activity, isRead: true, readAt: new Date() }
              : activity
          )
        );
      }

      // Return context with previous value
      return { previousActivities };
    },
    onError: (_err, _activityId, context) => {
      // Rollback on error
      if (context?.previousActivities) {
        queryClient.setQueryData(['activities', user?._id], context.previousActivities);
      }
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: ['activities', user?._id] });
      queryClient.invalidateQueries({ queryKey: ['activity-counts', user?._id] });
      queryClient.invalidateQueries({ queryKey: ['has-unread', user?._id] });
    },
  });
}

/**
 * Hook to mark all activities as read
 */
export function useMarkAllAsRead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!user?._id) throw new Error('User not authenticated');
      return activityService.markAllAsRead(user._id);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['activities'] });

      const previousActivities = queryClient.getQueryData<Activity[]>(['activities', user?._id]);

      // Mark all as read optimistically
      if (previousActivities) {
        queryClient.setQueryData<Activity[]>(
          ['activities', user?._id],
          previousActivities.map((activity) => ({
            ...activity,
            isRead: true,
            readAt: new Date(),
          }))
        );
      }

      return { previousActivities };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousActivities) {
        queryClient.setQueryData(['activities', user?._id], context.previousActivities);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['activities', user?._id] });
      queryClient.invalidateQueries({ queryKey: ['activity-counts', user?._id] });
      queryClient.invalidateQueries({ queryKey: ['has-unread', user?._id] });
    },
  });
}

/**
 * Hook to delete an activity (optional feature)
 */
export function useDeleteActivity() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: activityService.deleteActivity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities', user?._id] });
      queryClient.invalidateQueries({ queryKey: ['activity-counts', user?._id] });
    },
  });
}
