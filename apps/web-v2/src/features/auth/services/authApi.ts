/**
 * Authentication API Service
 *
 * Handles all authentication-related API calls including login, signup, and user fetching.
 */

import apiClient from '@/lib/api';
import type { User } from '@/types';

interface LoginResponse {
  userId: string;
  userName: string;
  mbtiPersonality: string;
  polarity: string;
  profilePictureUrl?: string;
  bio?: string;
  location?: {
    lat: number;
    lon: number;
    city?: string;
  };
  vibes?: number;
  createdAt: string;
  updatedAt: string;
  lastActiveAt?: string;
}

interface SignupData {
  pigeonId: string; // Frontend generates this
  userName: string;
  birthYear: number;
  birthMonth: number;
  sex: 'male' | 'female' | 'other';
  location: {
    lat: number;
    lon: number;
    city?: string;
  };
  polarity?: string;
  mbtiPersonality: string;
  profilePictureUrl?: string;
  bio?: string;
}

interface SignupResponse extends LoginResponse {
  pigeonId: string; // Only returned on signup
}

/**
 * Transform backend user response to frontend User type
 */
function transformUserData(data: LoginResponse): User {
  return {
    _id: data.userId,
    username: data.userName,
    polarity: data.polarity || 'neutral',
    mbtiPersonality: data.mbtiPersonality,
    profilePictureUrl: data.profilePictureUrl,
    bio: data.bio,
    location: data.location
      ? {
          latitude: data.location.lat,
          longitude: data.location.lon,
          city: data.location.city,
        }
      : undefined,
    vibes: data.vibes || 0,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
    lastSeen: data.lastActiveAt ? new Date(data.lastActiveAt) : undefined,
  };
}

export const authApi = {
  /**
   * Login with Pigeon ID (password)
   */
  async login(pigeonId: string): Promise<User> {
    const response = await apiClient.get<LoginResponse>(`/api/users/login/${pigeonId}`);
    return transformUserData(response);
  },

  /**
   * Create new user account
   */
  async signup(data: SignupData): Promise<{ user: User; pigeonId: string }> {
    const response = await apiClient.post<SignupResponse>('/api/users/create', data);
    return {
      user: transformUserData(response),
      pigeonId: response.pigeonId,
    };
  },

  /**
   * Get current user data by userId
   */
  async getCurrentUser(userId: string): Promise<User> {
    const response = await apiClient.get<LoginResponse>(`/api/users/${userId}`);
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
    const response = await apiClient.put<LoginResponse>(`/api/users/${userId}`, data);
    return transformUserData(response);
  },

  /**
   * Logout (client-side only - clear cookies)
   */
  logout(): void {
    // No backend call needed for logout
    // Auth context will handle cookie clearing
  },
};
