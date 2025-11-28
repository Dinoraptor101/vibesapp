/**
 * useDeletePost Hook
 *
 * Mutation for soft-deleting user's own posts with optimistic updates.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { deletePost } from '../api/postService';

export function useDeletePost() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (postId: string) => deletePost(postId),
    onSuccess: (_data, postId) => {
      // Invalidate all post-related queries to refetch
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      queryClient.invalidateQueries({ queryKey: ['userPosts'] });

      // Navigate to home if we're on the deleted post's detail page
      const currentPath = window.location.pathname;
      if (currentPath === `/post/${postId}`) {
        navigate('/');
      }
    },
    onError: (error) => {
      console.error('Failed to delete post:', error);
    },
  });
}
