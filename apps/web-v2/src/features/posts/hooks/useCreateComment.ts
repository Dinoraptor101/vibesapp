/**
 * useCreateComment Hook
 *
 * Mutation for creating comments with offline support.
 * Uses optimistic updates and queues when offline.
 */

import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth';
import { useOfflineMutation } from '@/lib/useOfflineMutation';
import { createComment, type CreateCommentPayload } from '../api/commentService';

interface CreateCommentVariables {
  text: string;
  replyToCommentId?: string;
}

export function useCreateComment(postId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useOfflineMutation<unknown, CreateCommentVariables>({
    actionName: 'createComment',

    mutationFn: async ({ text, replyToCommentId }) => {
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

    optimisticUpdate: ({ text, replyToCommentId }) => {
      if (!user) return;

      // Create optimistic comment
      const optimisticComment = {
        _id: `temp-${Date.now()}`,
        text,
        user: {
          userId: user._id,
          userName: user.username,
          mbtiPersonality: user.mbtiPersonality,
          profilePictureUrl: user.profilePictureUrl,
        },
        postId,
        replyToCommentId,
        hearts: 0,
        userHasHearted: false,
        createdAt: new Date().toISOString(),
        status: 'pending' as const,
      };

      // Add to comments cache
      queryClient.setQueryData(['comments', postId], (old: any) => {
        if (!old || !old.pages) {
          return {
            pages: [{ comments: [optimisticComment], hasMore: false }],
            pageParams: [undefined],
          };
        }

        return {
          ...old,
          pages: [
            {
              ...old.pages[0],
              comments: [optimisticComment, ...old.pages[0].comments],
            },
            ...old.pages.slice(1),
          ],
        };
      });
    },

    queryKeysToInvalidate: [['comments', postId], ['post', postId], ['posts']],

    onError: (error) => {
      console.error('Failed to create comment:', error);
    },
  });
}
