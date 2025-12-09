/**
 * Authentication API Service
 *
 * Handles all authentication-related API calls including login, signup, and user fetching.
 */

import apiClient from '@/lib/api';
import type { User } from '@/types';

interface LoginResponse {
  userId: string;
  userName: string; // camelCase - consistent with database
  mbtiPersonality: string;
  polarity: string;
  profilePictureUrl?: string;
  bio?: string;
  location?: {
    lat: number;
    lon: number;
    city?: string;
    state?: string;
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
    state?: string;
  };
  polarity: 'yin' | 'yang';
  mbtiPersonality: string;
  profilePictureUrl?: string;
  bio?: string;
  recaptchaToken?: string; // reCAPTCHA v3 token
}

interface SignupResponse extends LoginResponse {
  pigeonId: string; // Only returned on signup
}

/**
 * Transform backend user response to frontend User type
 * Backend may return location as lat/lon OR latitude/longitude depending on endpoint
 */
function transformUserData(data: LoginResponse): User {
  // Handle both location formats: lat/lon (signup) and latitude/longitude (profile)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawLocation = data.location as any;
  const location = rawLocation
    ? {
        latitude: rawLocation.latitude ?? rawLocation.lat,
        longitude: rawLocation.longitude ?? rawLocation.lon,
        city: rawLocation.city,
        state: rawLocation.state,
      }
    : undefined;

  return {
    _id: data.userId,
    userId: data.userId, // UUID - business logic identifier
    userName: data.userName, // camelCase - consistent with database
    polarity: data.polarity || 'neutral',
    mbtiPersonality: data.mbtiPersonality,
    profilePictureUrl: data.profilePictureUrl,
    bio: data.bio,
    location,
    vibes: data.vibes || 0,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
    lastSeen: data.lastActiveAt ? new Date(data.lastActiveAt) : undefined,
  };
}

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
