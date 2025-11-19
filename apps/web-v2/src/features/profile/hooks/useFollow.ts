/**
 * useFollow Hook
 * Handles follow/unfollow mutations with optimistic UI updates
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { ProfileData } from './useProfile';

interface FollowResponse {
  success: boolean;
  isFollowing: boolean;
  followersCount: number;
}

export function useFollow(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('User ID is required');

      const data = await api.post<FollowResponse>(`/api/users/${userId}/follow`);
      return data;
    },
    // Optimistic update - immediately update UI before API responds
    onMutate: async () => {
      if (!userId) return;

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['profile', userId] });

      // Snapshot the previous value
      const previousProfile = queryClient.getQueryData<ProfileData>(['profile', userId]);

      // Optimistically update to the new value
      if (previousProfile) {
        queryClient.setQueryData<ProfileData>(['profile', userId], {
          ...previousProfile,
          isFollowing: !previousProfile.isFollowing,
          followersCount: previousProfile.isFollowing
            ? previousProfile.followersCount - 1
            : previousProfile.followersCount + 1,
        });
      }

      // Return context with the previous value
      return { previousProfile };
    },
    // If mutation fails, rollback to previous value
    onError: (_error, _variables, context) => {
      if (context?.previousProfile && userId) {
        queryClient.setQueryData(['profile', userId], context.previousProfile);
      }
    },
    // Always refetch after error or success to sync with server
    onSettled: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ['profile', userId] });
        // Invalidate posts feed so Following tab shows newly followed user's posts immediately
        queryClient.invalidateQueries({ queryKey: ['posts'] });
      }
    },
  });
}
