/**
 * useProfile Hook
 * Fetches and manages user profile data
 */

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { User } from '@/types';

export interface ProfileData extends User {
  postsCount: number;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
  distance?: string; // e.g., "2.3 km away"
  age?: number;
}

export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');

      const data = await api.get<ProfileData>(`/api/users/${userId}/profile`);
      return data;
    },
    enabled: !!userId,
    staleTime: 15 * 60 * 1000, // 15 minutes - profiles are very static
    refetchOnMount: 'always', // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when user returns to tab
  });
}
