/**
 * useComments Hook
 *
 * Fetches comments for a post with infinite scroll pagination.
 * Comments are posts with replyTo field matching the postId.
 */

import { useInfiniteQuery } from '@tanstack/react-query';
import { getComments } from '../api/commentService';
import type { PostsResponse } from '../types';

export function useComments(postId: string) {
  return useInfiniteQuery<PostsResponse>({
    queryKey: ['comments', postId],
    queryFn: ({ pageParam }) => getComments(postId, pageParam as number, 20),
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes - comments don't change frequently
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!postId, // Only fetch if postId exists
  });
}
