/**
 * useDeleteComment Hook
 *
 * Mutation for deleting comments with optimistic updates.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteComment } from '../api/commentService';

export function useDeleteComment(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => deleteComment(commentId),
    onSuccess: () => {
      // Invalidate comments query to refetch
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });

      // Invalidate post query to update comment count
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error) => {
      console.error('Failed to delete comment:', error);
    },
  });
}
