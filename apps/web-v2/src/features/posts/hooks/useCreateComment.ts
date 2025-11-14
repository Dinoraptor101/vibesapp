/**
 * useCreateComment Hook
 *
 * Mutation for creating comments with optimistic updates.
 * Auto-invalidates post comment count and adds to cache.
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
      // Invalidate comments query to refetch
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });

      // Invalidate post query to update comment count
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error) => {
      console.error('Failed to create comment:', error);
    },
  });
}
