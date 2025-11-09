/**
 * usePost Hook
 *
 * React Query hook for fetching a single post by ID.
 */

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/features/auth';
import { getPostById } from '../api/postService';
import type { Post } from '../types';

interface UsePostReturn {
  post: Post | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook for fetching a single post
 */
export function usePost(postId: string): UsePostReturn {
  const { user } = useAuth();

  const {
    data: post,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => getPostById(postId, user?._id || ''),
    enabled: !!postId && !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    post,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}
