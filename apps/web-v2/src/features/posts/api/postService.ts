/**
 * Post API Service
 *
 * Handles all post-related API calls including fetching, creating,
 * reacting to, and deleting posts.
 */

import apiClient from '@/lib/api';
import type { Post, CreatePostPayload, PostFilters, PostsResponse } from '../types';

interface PostResponse {
  post: Post;
}

interface ReactionResponse {
  success: boolean;
  likes: number;
  dislikes: number;
  vibeScore: number;
}

// Backend API response format (different from our PostsResponse)
interface ApiPostsResponse {
  posts: Post[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * Fetch posts with optional filters and pagination
 */
export async function fetchPosts(
  filters?: PostFilters,
  page = 1,
  limit = 20
): Promise<PostsResponse> {
  const params = new URLSearchParams();

  if (filters?.userId) params.append('userId', filters.userId);
  if (filters?.following) params.append('following', 'true');
  if (filters?.nearby) {
    params.append('latitude', filters.nearby.lat.toString());
    params.append('longitude', filters.nearby.lon.toString());
    params.append('radius', filters.nearby.radius.toString());
  }

  params.append('page', page.toString());
  params.append('limit', limit.toString());

  const response = await apiClient.get<ApiPostsResponse>(`/api/posts?${params.toString()}`);

  // Transform to match our PostsResponse interface
  return {
    posts: response.posts,
    pagination: {
      page: response.page,
      limit: response.limit,
      total: response.total,
      hasMore: response.hasMore,
    },
  };
}

/**
 * Fetch a single post by ID
 */
export async function getPostById(postId: string, userId: string): Promise<Post> {
  const params = new URLSearchParams({ userId });
  const response = await apiClient.get<PostResponse>(`/api/posts/${postId}?${params.toString()}`);
  return response.post;
}

/**
 * Create a new post
 */
export async function createPost(data: CreatePostPayload): Promise<Post> {
  const response = await apiClient.post<PostResponse>('/api/posts/create', data);
  return response.post;
}

/**
 * Toggle like on a post (backend handles like/unlike logic)
 */
export async function toggleLikePost(postId: string): Promise<ReactionResponse> {
  // Simply POST to the like endpoint - backend will toggle like/unlike automatically
  const response = await apiClient.post<ReactionResponse>(`/api/posts/${postId}/like`, {});
  return response;
}

/**
 * Delete a post
 */
export async function deletePost(postId: string): Promise<void> {
  await apiClient.delete(`/api/posts/${postId}`);
}

/**
 * Get posts from users near a location (proximal posts)
 */
export async function getNearbyPosts(
  latitude: number,
  longitude: number,
  radius = 5000, // Default 5km
  limit = 20
): Promise<Post[]> {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    radius: radius.toString(),
    limit: limit.toString(),
  });

  const response = await apiClient.get<ApiPostsResponse>(`/api/posts/nearby?${params.toString()}`);

  return response.posts;
}

/**
 * Get posts from a specific user
 */
export async function getUserPosts(userId: string, page = 1, limit = 20): Promise<PostsResponse> {
  const params = new URLSearchParams({
    userId,
    page: page.toString(),
    limit: limit.toString(),
  });

  const response = await apiClient.get<ApiPostsResponse>(`/api/posts?${params.toString()}`);

  // Transform to match our PostsResponse interface
  return {
    posts: response.posts,
    pagination: {
      page: response.page,
      limit: response.limit,
      total: response.total,
      hasMore: response.hasMore,
    },
  };
}

/**
 * Get posts filtered by MBTI type
 */
export async function getPostsByMBTI(
  mbtiType: string,
  page = 1,
  limit = 20
): Promise<PostsResponse> {
  const params = new URLSearchParams({
    mbtiType,
    page: page.toString(),
    limit: limit.toString(),
  });

  const response = await apiClient.get<ApiPostsResponse>(`/api/posts?${params.toString()}`);

  // Transform to match our PostsResponse interface
  return {
    posts: response.posts,
    pagination: {
      page: response.page,
      limit: response.limit,
      total: response.total,
      hasMore: response.hasMore,
    },
  };
}
