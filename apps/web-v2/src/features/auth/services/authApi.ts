/**
 * Authentication API Service
 *
 * Handles all authentication-related API calls including login, signup, and user fetching.
 */

import apiClient from '@/lib/api';
import type { User, LoginResponse, SignupData, SignupResponse } from '@/types';
import { transformUserData } from '@/utils/transformers';

export const authApi = {
  /**
   * Generate a unique Pigeon ID from the backend
   */
  async generatePigeonId(): Promise<string> {
    const response = await apiClient.get<{ pigeonId: string }>('/users/generate-pigeon-id');
    return response.pigeonId;
  },

  /**
   * Login with Pigeon ID (password)
   * @param pigeonId - The user's Pigeon ID
   * @param recaptchaToken - Optional reCAPTCHA v3 token for bot protection
   */
  async login(pigeonId: string, recaptchaToken?: string): Promise<User> {
    const response = await apiClient.post<LoginResponse>('/users/login', {
      pigeonId,
      recaptchaToken,
    });
    return transformUserData(response);
  },

  /**
   * Create new user account
   */
  async signup(data: SignupData): Promise<{ user: User; pigeonId: string }> {
    const response = await apiClient.post<SignupResponse>('/users/create', data);
    return {
      user: transformUserData(response),
      pigeonId: response.pigeonId,
    };
  },

  /**
   * Get current user data by userId
   */
  async getCurrentUser(userId: string): Promise<User> {
    const response = await apiClient.get<LoginResponse>(`/users/${userId}`);
    return transformUserData(response);
  },

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    data: Partial<{
      userName: string;
      bio: string;
      profilePictureUrl: string;
      location: {
        lat: number;
        lon: number;
        city?: string;
      };
    }>
  ): Promise<User> {
    const response = await apiClient.put<LoginResponse>(`/users/${userId}`, data);
    return transformUserData(response);
  },

  /**
   * Regenerate Pigeon ID for the current user
   */
  async regeneratePigeonId(userId: string): Promise<string> {
    const response = await apiClient.put<{ message: string; pigeonId: string }>(
      `/users/${userId}/regenerate-pigeon-id`
    );
    return response.pigeonId;
  },

  /**
   * Logout (client-side only - clear cookies)
   */
  logout(): void {
    // No backend call needed for logout
    // Auth context will handle cookie clearing
  },
};
