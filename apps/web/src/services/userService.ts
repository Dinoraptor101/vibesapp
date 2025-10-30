/**
 * Service for managing user-related operations and data.
 * Handles user data fetching, caching, and permission checks based on user vibes level.
 * Provides methods to access user properties and determine feature access permissions.
 */

import type { UserData } from '../types';
import type { IUserPostsParams, IUserPostsResponse } from '../types/post';
import { deleteCookie, getCookie } from '../utils/cookieUtils';
import apiService from './apiService';

let userData: UserData | null = null;
/**
 * PRIVATE METHOD
 * Retrieves user data, fetching it from the API if not already cached or if the cached data is for a different user.
 * @returns The user data.
 */
async function getCurrentUserData() {
  const userId = getCookie('userId');
  // Prevents duplicate API calls by checking if the cached data is for the same user.
  if (!userData || userData.userId !== userId) {
    try {
      const res = await apiService.get(`/api/users/${userId}`);
      userData = res.data;
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  }
  return userData;
}

export async function getUserId(): Promise<string> {
  const data = await getCurrentUserData();
  if (!data?.userId) throw new Error('User ID is undefined');
  return data.userId;
}
export async function getUserName(userId?: string): Promise<string> {
  const data = userId
    ? (await apiService.get(`/api/users/${userId}`)).data
    : await getCurrentUserData();
  return data.userName;
}

export async function getUserAge(userId?: string): Promise<number> {
  const birthYear = await getUserBirthYear(userId);
  const birthMonth = await getUserBirthMonth(userId);
  const today = new Date();
  let age = today.getFullYear() - birthYear;
  if (
    today.getMonth() + 1 < birthMonth ||
    (today.getMonth() + 1 === birthMonth && today.getDate() < 1)
  ) {
    age--;
  }
  return age;
}

export async function getUserSex(userId?: string): Promise<string> {
  const data = userId
    ? (await apiService.get(`/api/users/${userId}`)).data
    : await getCurrentUserData();
  return data.sex;
}

export async function getUserBirthYear(userId?: string): Promise<number> {
  const data = userId
    ? (await apiService.get(`/api/users/${userId}`)).data
    : await getCurrentUserData();
  return data.birthYear;
}

export async function getUserBirthMonth(userId?: string): Promise<number> {
  const data = userId
    ? (await apiService.get(`/api/users/${userId}`)).data
    : await getCurrentUserData();
  return data.birthMonth;
}

export const getUserPolarity = async (userId?: string): Promise<string> => {
  const data = userId
    ? (await apiService.get(`/api/users/${userId}`)).data
    : await getCurrentUserData();
  return data.polarity;
};

export const getUserMBTIPersonality = async (userId?: string): Promise<string> => {
  const data = userId
    ? (await apiService.get(`/api/users/${userId}`)).data
    : await getCurrentUserData();
  return data.mbtiPersonality;
};

export async function updateUserPolarity(userId: string, polarity: string): Promise<void> {
  await apiService.updateUserPolarity(userId, polarity);
}

export async function updateUserMBTIPersonality(
  userId: string,
  mbtiPersonality: string
): Promise<void> {
  await apiService.updateUserMBTIPersonality(userId, mbtiPersonality);
}

//*** Functions for userProfile only ***/

// Returns self user vibes
export async function getUserVibes(): Promise<number> {
  const data = await getCurrentUserData();
  if (data?.vibes === undefined) throw new Error('User vibes are undefined');
  return data.vibes;
}

// Translate vibes to colors
export function getVibesColor(vibes: number): string {
  if (vibes > 400) return 'red';
  if (vibes > 300) return 'blue';
  if (vibes > 200) return 'green';
  if (vibes > 100) return 'yellow';
  return 'grey';
}

// logs out the user by deleting the cookies
export function logout() {
  deleteCookie('userId');
  deleteCookie('PigeonId');
  window.location.reload();
}

export const getUserPosts = async ({
  userId,
  page = 1,
  limit = 20,
}: IUserPostsParams): Promise<IUserPostsResponse> => {
  try {
    const response = await apiService.get(`/api/users/${userId}/posts?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user posts:', error);
    return {
      results: [],
      nextPage: null,
      totalPosts: 0,
      totalPages: 0,
    };
  }
};
