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
    mutationFn: (text: string) => {
      if (!user?.location) {
        throw new Error('User location is required');
      }

      const payload: CreateCommentPayload = {
        text,
        replyTo: postId,
        location: {
          lat: user.location.latitude,
          lon: user.location.longitude,
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
