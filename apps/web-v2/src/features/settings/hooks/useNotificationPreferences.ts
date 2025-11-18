/**
 * useNotificationPreferences Hook
 *
 * Fetches user's notification preferences from the backend
 */

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/features/auth';
import api from '@/lib/api';

export interface NotificationPreferences {
  new_follower: boolean;
  following_post: boolean;
  nearby_post: boolean;
  comment: boolean;
  comment_reply: boolean;
  post_hidden: boolean;
  reactions: boolean;
}

interface UserResponse {
  notificationPreferences?: NotificationPreferences;
}

export function useNotificationPreferences() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['notification-preferences', user?.userId],
    queryFn: async (): Promise<NotificationPreferences> => {
      if (!user?.userId) {
        throw new Error('User not authenticated');
      }

      const response = await api.get<UserResponse>(`/api/users/${user.userId}`);

      // Return preferences with defaults if not set
      return (
        response.notificationPreferences || {
          new_follower: true,
          following_post: true,
          nearby_post: true,
          comment: true,
          comment_reply: true,
          post_hidden: true,
          reactions: true,
        }
      );
    },
    enabled: !!user?.userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
