/**
 * Post-specific API service
 */

import type { ApiResponse } from '../../types/api';
import type {
  CreatePostRequest,
  IFetchPostsParams,
  IPost,
  IUserPostsResponse,
  UpdatePostRequest,
} from '../../types/post';
import { BaseApiService } from './BaseApiService';

export class PostService extends BaseApiService {
  /**
   * Fetch posts with pagination and filters
   */
  static async getPosts(params: IFetchPostsParams): Promise<ApiResponse<IPost[]>> {
    const searchParams = new URLSearchParams({
      page: (params.pageParam || 1).toString(),
      lat: params.lat.toString(),
      lon: params.lon.toString(),
      range: params.range.toString(),
      withReplies: params.withReplies.toString(),
    });

    return PostService.get<IPost[]>(`/api/post?${searchParams}`);
  }

  /**
   * Create a new post
   */
  static async createPost(postData: CreatePostRequest): Promise<ApiResponse<IPost>> {
    return PostService.post<IPost>('/api/post/create', postData);
  }

  /**
   * Update an existing post
   */
  static async updatePost(
    postId: string,
    updateData: UpdatePostRequest
  ): Promise<ApiResponse<IPost>> {
    return PostService.put<IPost>(`/api/post/${postId}`, updateData);
  }

  /**
   * Delete a post
   */
  static async deletePost(postId: string, userId: string): Promise<ApiResponse<void>> {
    return PostService.delete<void>(`/api/post/${postId}`, { userId });
  }

  /**
   * Get user's posts
   */
  static async getUserPosts(userId: string, page: number = 1): Promise<IUserPostsResponse> {
    const response = await PostService.get<IUserPostsResponse>(
      `/api/users/${userId}/posts?page=${page}`
    );
    return response.data;
  }

  /**
   * Like a post
   */
  static async likePost(postId: string, userId: string): Promise<ApiResponse<void>> {
    return PostService.post<void>(`/api/post/${postId}/like`, { userId });
  }

  /**
   * Unlike a post
   */
  static async unlikePost(postId: string, userId: string): Promise<ApiResponse<void>> {
    return PostService.delete<void>(`/api/post/${postId}/like`, { userId });
  }
}
