/**
 * useHeartComment Hook
 *
 * Mutation for hearting/unhearting comments with offline support.
 * Uses optimistic updates and queues actions when offline.
 */

import { useQueryClient } from '@tanstack/react-query';
import { useOfflineMutation } from '@/lib/useOfflineMutation';
import { heartComment } from '../api/commentService';

interface HeartCommentVariables {
  commentId: string;
  isHearted: boolean;
}

export function useHeartComment(postId: string) {
  const queryClient = useQueryClient();

  return useOfflineMutation<unknown, HeartCommentVariables>({
    actionName: 'heartComment',
    
    mutationFn: async ({ commentId, isHearted }) => {
      return heartComment(commentId, isHearted);
    },

    optimisticUpdate: ({ commentId, isHearted }) => {
      // Optimistically update the comment in the cache
      queryClient.setQueryData(['comments', postId], (old: any) => {
        if (!old || !old.pages) return old;
        
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            comments: page.comments.map((comment: any) =>
              comment._id === commentId
                ? {
                    ...comment,
                    hearts: isHearted ? comment.hearts - 1 : comment.hearts + 1,
                    userHasHearted: !isHearted,
                  }
                : comment
            ),
          })),
        };
      });
    },

    queryKeysToInvalidate: [['comments', postId]],

    onError: (error) => {
      console.error('Failed to heart comment:', error);
    },
  });
}

