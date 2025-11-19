/**
 * useCreateComment Hook - Offline Enabled
 *
 * Mutation for creating comments with offline support and optimistic updates.
 * Auto-invalidates post comment count and adds to cache.
 */

import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth';
import { useOfflineMutation } from '@/hooks/useOfflineMutation';
import { createComment, type CreateCommentPayload } from '../api/commentService';
import type { Post } from '../types';

export function useCreateComment(postId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useOfflineMutation({
    action: 'create_comment',
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
    optimisticUpdate: ({ text, replyToCommentId }) => {
      // Create optimistic comment
      const tempComment: Post = {
        _id: `temp-${Date.now()}`,
        text,
        image: '', // Comments don't have images
        user: {
          userId: user?._id || '',
          userName: user?.userName || 'You',
          birthYear: user?.birthYear || 2000,
          birthMonth: user?.birthMonth || 1,
          sex: user?.sex || 'other',
          location: {
            lat: user?.location?.latitude || 0,
            lon: user?.location?.longitude || 0,
            city: user?.location?.city,
          },
          mbtiPersonality: user?.mbtiPersonality,
          profilePictureUrl: user?.profilePictureUrl,
        },
        commentOn: postId,
        replyToCommentId,
        reactions: [],
        proximal_likes: 0,
        proximal_dislikes: 0,
        proximal_users: 0,
        isHidden: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Add to comments cache
      queryClient.setQueryData<{ posts: Post[] }>(['comments', postId], (old) => {
        if (!old) return { posts: [tempComment] };
        return {
          ...old,
          posts: [...old.posts, tempComment],
        };
      });
    },
    onSuccess: (realComment) => {
      // Replace temp comment with real one
      queryClient.setQueryData<{ posts: Post[] }>(['comments', postId], (old) => {
        if (!old) return { posts: [realComment] };
        return {
          ...old,
          posts: old.posts.map((comment) =>
            comment._id.startsWith('temp-') ? realComment : comment
          ),
        };
      });

      // Invalidate post query to update comment count
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error) => {
      console.error('Failed to create comment:', error);
      // Remove optimistic comment on error
      queryClient.setQueryData<{ posts: Post[] }>(['comments', postId], (old) => {
        if (!old) return old;
        return {
          ...old,
          posts: old.posts.filter((comment) => !comment._id.startsWith('temp-')),
        };
      });
    },
  });
}
