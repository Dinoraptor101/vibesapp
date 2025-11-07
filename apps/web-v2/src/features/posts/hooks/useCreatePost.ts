/**
 * useCreatePost Hook
 *
 * React Query hook for creating posts with optimistic updates.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth';
import { createPost } from '../api/postService';
import type { CreatePostPayload, Post } from '../types';

interface CreatePostVariables {
  image: string; // S3 key
  text?: string;
  location: {
    lat: number;
    lon: number;
  };
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (variables: CreatePostVariables) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const payload: CreatePostPayload = {
        image: variables.image,
        text: variables.text,
        location: variables.location,
      };

      // Call API (backend will add userId from auth)
      return createPost(payload);
    },

    onSuccess: (newPost: Post) => {
      // Invalidate posts query to refetch with new post
      queryClient.invalidateQueries({ queryKey: ['posts'] });

      // Optionally add optimistic update to cache
      queryClient.setQueryData(['posts'], (old: unknown) => {
        if (!old || typeof old !== 'object' || !('pages' in old)) return old;

        const data = old as { pages: Array<{ posts: Post[] }> };

        // Add new post to the beginning of the first page
        const newPages = [...data.pages];
        if (newPages[0]?.posts) {
          newPages[0] = {
            ...newPages[0],
            posts: [newPost, ...newPages[0].posts],
          };
        }

        return {
          ...data,
          pages: newPages,
        };
      });
    },

    onError: (error) => {
      console.error('Failed to create post:', error);
    },
  });
}
