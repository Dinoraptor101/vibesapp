/**
 * User-specific API service
 */

import type { ApiResponse } from '../../types/api';
import type { IUserData, UserLoginData, UserRegistrationData } from '../../types/user';
import { BaseApiService } from './BaseApiService';

export class UserService extends BaseApiService {
  /**
   * Register a new user
   */
  static async registerUser(
    userData: UserRegistrationData
  ): Promise<ApiResponse<{ user: IUserData; pigeonId: string }>> {
    return UserService.post<{ user: IUserData; pigeonId: string }>('/api/users/register', userData);
  }

  /**
   * Login user with pigeon ID
   */
  static async loginUser(loginData: UserLoginData): Promise<ApiResponse<IUserData>> {
    return UserService.post<IUserData>('/api/users/login', loginData);
  }

  /**
   * Get user profile
   */
  static async getUserProfile(userId: string): Promise<ApiResponse<IUserData>> {
    return UserService.get<IUserData>(`/api/users/${userId}`);
  }

  /**
   * Update user polarity
   */
  static async updateUserPolarity(
    userId: string,
    polarity: string
  ): Promise<ApiResponse<IUserData>> {
    return UserService.put<IUserData>(`/api/users/${userId}`, { polarity });
  }

  /**
   * Update user MBTI personality
   */
  static async updateUserMBTI(
    userId: string,
    mbtiPersonality: string
  ): Promise<ApiResponse<IUserData>> {
    return UserService.put<IUserData>(`/api/users/${userId}`, { mbtiPersonality });
  }

  /**
   * Update user location
   */
  static async updateUserLocation(
    userId: string,
    location: { lat: number; lon: number }
  ): Promise<ApiResponse<IUserData>> {
    return UserService.put<IUserData>(`/api/users/${userId}`, { location });
  }
}
