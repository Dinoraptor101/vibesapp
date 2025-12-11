/**
 * useCreateComment Hook
 *
 * Mutation for creating comments.
 * Follows ZEN fetch-first pattern: no optimistic updates, wait for server response.
 * Auto-invalidates comment cache to trigger refetch with real data.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth';
import { createComment, type CreateCommentPayload } from '../api/commentService';

export function useCreateComment(postId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ text, replyToCommentId }: { text: string; replyToCommentId?: string }) => {
      const payload: CreateCommentPayload = {
        text,
        postId: postId,
        replyToCommentId,
        location: user?.location
          ? {
              lat: user.location.latitude,
              lon: user.location.longitude,
            }
          : {
              lat: 0,
              lon: 0,
            },
      };

      return createComment(payload);
    },
    onSuccess: () => {
      // Invalidate comment cache to refetch with real server data
      // No optimistic updates - fetch-first pattern prevents flash
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      
      // Update post comment count
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error) => {
      console.error('Failed to create comment:', error);
      // ZEN: Silent error - user sees comment didn't appear, can retry
    },
  });
}
