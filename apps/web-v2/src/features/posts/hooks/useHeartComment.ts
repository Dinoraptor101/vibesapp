/**
 * useHeartComment Hook
 *
 * Mutation for hearting/unhearting comments with optimistic updates.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { heartComment } from '../api/commentService';

export function useHeartComment(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, isHearted }: { commentId: string; isHearted: boolean }) =>
      heartComment(commentId, isHearted),
    onSuccess: () => {
      // Invalidate comments query to refetch
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
    onError: (error) => {
      console.error('Failed to heart comment:', error);
    },
  });
}
