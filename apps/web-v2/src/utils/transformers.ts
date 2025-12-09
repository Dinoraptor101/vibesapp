/**
 * Data transformation utilities
 * Handles conversion between backend and frontend data formats
 */

import type { LoginResponse, User } from '@/types';

/**
 * Transform backend user response to frontend User type
 * Backend may return location as lat/lon OR latitude/longitude depending on endpoint
 */
export function transformUserData(data: LoginResponse): User {
  // Handle both location formats: lat/lon (signup) and latitude/longitude (profile)
  const lat = data.location?.latitude ?? data.location?.lat;
  const lon = data.location?.longitude ?? data.location?.lon;

  const location =
    lat !== undefined && lon !== undefined
      ? {
          latitude: lat,
          longitude: lon,
          city: data.location?.city,
          state: data.location?.state,
        }
      : undefined;

  return {
    _id: data.userId,
    userId: data.userId,
    userName: data.userName,
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
