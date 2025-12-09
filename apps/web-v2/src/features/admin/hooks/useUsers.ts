import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { AdminUser } from '@/types';
/**
 * React Query hook for fetching and managing users list
 */

interface UseUsersParams {
  search?: string;
  filter?: 'all' | 'banned' | 'active' | 'has-flagged';
  mbti?: string;
  location?: string;
  page?: number;
  limit?: number;
}

interface UsersResponse {
  success: boolean;
  users: AdminUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export function useUsers(params: UseUsersParams = {}) {
  const { search = '', filter = 'all', mbti = '', location = '', page = 1, limit = 50 } = params;

  return useQuery({
    queryKey: ['admin-users', { search, filter, mbti, location, page, limit }],
    queryFn: async () => {
      return await api.get<UsersResponse>('/admin/users', {
        search,
        filter,
        mbti,
        location,
        page,
        limit,
      });
    },
    staleTime: 30000, // Cache for 30 seconds
  });
}

export function useUserById(userId: string | null) {
  return useQuery({
    queryKey: ['admin-user', userId],
    queryFn: async () => {
      if (!userId) return null;
      const response = await api.get<{ success: boolean; user: AdminUser }>(
        `/admin/users/${userId}`
      );
      return response.user;
    },
    enabled: !!userId,
  });
}

export function useUserPosts(userId: string | null, page = 1, limit = 20) {
  return useQuery({
    queryKey: ['admin-user-posts', userId, page, limit],
    queryFn: async () => {
      if (!userId) return null;
      return await api.get(`/admin/users/${userId}/posts`, {
        page,
        limit,
      });
    },
    enabled: !!userId,
  });
}
