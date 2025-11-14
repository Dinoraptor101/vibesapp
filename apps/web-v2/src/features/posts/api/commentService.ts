/**
 * Comment API Service
 *
 * API functions for comment operations (fetching, creating, deleting).
 * Comments are posts with a replyTo field pointing to the parent post.
 */

import apiClient from '@/lib/api';
import type { Post, PostsResponse } from '../types';

export interface CreateCommentPayload {
  text: string;
  postId: string; // Parent post ID
  replyToCommentId?: string; // Optional: Comment being replied to
  location: {
    lat: number;
    lon: number;
  };
}

/**
 * Get comments for a post
 * Returns posts where replyTo matches the postId
 */
export async function getComments(
  postId: string,
  page: number = 1,
  limit: number = 20
): Promise<PostsResponse> {
  const response = await apiClient.get<{
    posts: Post[];
    currentPage: number;
    totalPages: number;
    totalPosts: number;
    hasMore: boolean;
  }>(`/api/comments/${postId}?page=${page}&limit=${limit}`);

  // Transform to PostsResponse format
  return {
    posts: response.posts,
    pagination: {
      page: response.currentPage,
      limit,
      total: response.totalPosts,
      hasMore: response.hasMore,
    },
  };
}

/**
 * Create a comment on a post
 * Creates a comment using the dedicated comment endpoint
 */
export async function createComment(payload: CreateCommentPayload): Promise<Post> {
  const response = await apiClient.post<{ post: Post }>('/api/comments', payload);
  return response.post;
}

/**
 * Delete a comment
 * Same as deleting a post
 */
export async function deleteComment(commentId: string): Promise<void> {
  await apiClient.delete(`/api/posts/${commentId}`);
}

/**
 * Heart a comment
 * Same as reacting to a post
 */
export async function heartComment(commentId: string, isHearted: boolean): Promise<Post> {
  const response = await apiClient.post<{ post: Post }>(`/api/posts/${commentId}/react`, {
    type: isHearted ? null : 'like', // Toggle heart
  });
  return response.post;
}
