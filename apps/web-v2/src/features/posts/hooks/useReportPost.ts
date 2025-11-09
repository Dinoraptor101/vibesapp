/**
 * useReportPost Hook
 *
 * React Query mutation for reporting posts with community moderation.
 * Part of Phase 3.4 - Community Moderation System.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth';
import api from '@/lib/api';
import type { Post } from '../types';

type ReportReason = 'pornographic' | 'spam' | 'hate_speech';

interface ReportPostParams {
  postId: string;
  reason: ReportReason;
}

interface ReportPostResponse {
  success: boolean;
  reportCount: number;
  isHidden: boolean;
  message: string;
}

/**
 * Report a post for violating community guidelines
 */
export function useReportPost() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ postId, reason }: ReportPostParams) => {
      if (!user) throw new Error('User not authenticated');

      // Map user location format to backend format
      const location = user.location
        ? { lat: user.location.latitude, lon: user.location.longitude }
        : { lat: 0, lon: 0 };

      // Backend expects: { userId, reason, location: { lat, lon } }
      const response = await api.post<ReportPostResponse>(`/api/posts/${postId}/report`, {
        userId: user._id,
        reason,
        location,
      });
      return response;
    },
    onMutate: async ({ postId }) => {
      // Cancel any outgoing refetches to prevent optimistic update from being overwritten
      await queryClient.cancelQueries({ queryKey: ['posts'] });

      // Snapshot the previous value
      const previousPosts = queryClient.getQueryData(['posts']);

      // Optimistically hide post from reporter's feed
      queryClient.setQueryData(['posts'], (oldData: unknown) => {
        if (!oldData) return oldData;

        const typedData = oldData as {
          pages: Array<{ posts: Post[] }>;
          pageParams: unknown[];
        };

        return {
          ...typedData,
          pages: typedData.pages.map((page) => ({
            ...page,
            posts: page.posts.filter((post: Post) => post._id !== postId),
          })),
        };
      });

      // Return context with snapshot
      return { previousPosts };
    },
    onError: (error: unknown, _variables, context) => {
      // Rollback to previous value on error
      if (context?.previousPosts) {
        queryClient.setQueryData(['posts'], context.previousPosts);
      }

      // Show error message (log to console for now)
      const errorMessage =
        (error as { response?: { data?: { message?: string } } }).response?.data?.message ||
        'Failed to report post. Please try again.';
      console.error('Report error:', errorMessage);
    },
    onSuccess: (data) => {
      // Show success message (log to console for now)
      console.log('Report success:', data.message || 'Post reported successfully');

      // Invalidate and refetch posts to get updated data
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}
