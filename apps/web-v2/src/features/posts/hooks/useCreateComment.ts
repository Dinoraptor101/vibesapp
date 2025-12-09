/**
 * useCreateComment Hook
 *
 * Mutation for creating comments with optimistic updates.
 * Auto-invalidates post comment count and adds to cache.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { InfiniteData } from '@tanstack/react-query';
import { useAuth } from '@/features/auth';
import { createComment, type CreateCommentPayload } from '../api/commentService';
import type { Post, PostsResponse } from '../types';

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
    onMutate: ({ text, replyToCommentId }) => {
      // Create optimistic comment
      const tempComment: Post = {
        _id: `temp-${Date.now()}`,
        text,
        image: '', // Comments don't have images
        user: {
          userId: user?._id || '',
          userName: user?.userName || 'You',
          birthYear: 2000, // Default values for required fields
          birthMonth: 1,
          sex: 'other',
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
        likeCount: 0,
        commentCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Add to comments cache (infinite query structure)
      queryClient.setQueryData<InfiniteData<PostsResponse>>(['comments', postId], (old) => {
        if (!old) {
          return {
            pages: [
              {
                posts: [tempComment],
                pagination: {
                  page: 1,
                  limit: 20,
                  total: 1,
                  hasMore: false,
                },
              },
            ],
            pageParams: [1],
          };
        }

        // Add to first page
        const updatedPages = [...old.pages];
        if (updatedPages[0]) {
          updatedPages[0] = {
            ...updatedPages[0],
            posts: [tempComment, ...updatedPages[0].posts],
            pagination: {
              ...updatedPages[0].pagination,
              total: updatedPages[0].pagination.total + 1,
            },
          };
        }

        return {
          ...old,
          pages: updatedPages,
        };
      });
    },
    onSuccess: (realComment) => {
      // Replace temp comment with real one
      queryClient.setQueryData<InfiniteData<PostsResponse>>(['comments', postId], (old) => {
        if (!old) return old;

        const updatedPages = old.pages.map((page) => ({
          ...page,
          posts: page.posts.map((comment) =>
            comment._id.startsWith('temp-') ? realComment : comment
          ),
        }));

        return {
          ...old,
          pages: updatedPages,
        };
      });

      // Invalidate post query to update comment count
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error) => {
      console.error('Failed to create comment:', error);
      // Remove optimistic comment on error
      queryClient.setQueryData<InfiniteData<PostsResponse>>(['comments', postId], (old) => {
        if (!old) return old;

        const updatedPages = old.pages.map((page) => ({
          ...page,
          posts: page.posts.filter((comment) => !comment._id.startsWith('temp-')),
          pagination: {
            ...page.pagination,
            total: Math.max(0, page.pagination.total - 1),
          },
        }));

        return {
          ...old,
          pages: updatedPages,
        };
      });
    },
  });
}
