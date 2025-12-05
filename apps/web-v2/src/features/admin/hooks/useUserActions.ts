import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
/**
 * React Query mutations for admin user actions
 */

// Simple toast replacement for now (will be replaced with proper toast later)
const toast = (options: { title: string; description: string; variant?: string }) => {
  console.log(`[${options.variant || 'default'}] ${options.title}: ${options.description}`);
};

interface RegeneratePasswordResponse {
  success: boolean;
  message: string;
  newPassword: string;
  user: {
    userId: string;
    userName: string;
  };
}

export function useRegeneratePassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      return await api.post<RegeneratePasswordResponse>(
        `/admin/users/${userId}/regenerate-password`
      );
    },
    onSuccess: (data) => {
      toast({
        title: 'Password Regenerated',
        description: `New password generated for user ${data.user.userName}`,
      });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to regenerate password',
        variant: 'destructive',
      });
    },
  });
}

export function useToggleBan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      return await api.post<{ success: boolean; message: string; user: { isBanned: boolean } }>(
        `/admin/users/${userId}/toggle-ban`
      );
    },
    onSuccess: (data) => {
      const status = data.user.isBanned ? 'banned' : 'unbanned';
      toast({
        title: 'Success',
        description: `User ${status} successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to toggle ban status',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      return await api.delete<{ success: boolean; message: string }>(`/admin/users/${userId}`);
    },
    onSuccess: () => {
      toast({
        title: 'User Deleted',
        description: 'User has been soft deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete user',
        variant: 'destructive',
      });
    },
  });
}

export function useBulkDeleteUserPosts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      return await api.delete<{ success: boolean; message: string; deletedCount: number }>(
        `/admin/users/${userId}/posts`
      );
    },
    onSuccess: (data) => {
      toast({
        title: 'Posts Deleted',
        description: `Deleted ${data.deletedCount} posts successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-user-posts'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete posts',
        variant: 'destructive',
      });
    },
  });
}

export function useBulkDeleteUsers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userIds: string[]) => {
      return await api.delete<{
        success: boolean;
        message: string;
        deletedCount: number;
        anonymizedPosts: number;
      }>('/admin/users/bulk', { userIds });
    },
    onSuccess: (data) => {
      toast({
        title: 'Users Deleted',
        description: `Deleted ${data.deletedCount} users and anonymized ${data.anonymizedPosts} posts`,
      });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-user-posts'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete users',
        variant: 'destructive',
      });
    },
  });
}

export function useBulkDeletePostsByUsers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userIds: string[]) => {
      return await api.delete<{ success: boolean; message: string; deletedCount: number }>(
        '/admin/users/bulk/posts',
        { userIds }
      );
    },
    onSuccess: (data) => {
      toast({
        title: 'Posts Deleted',
        description: `Deleted ${data.deletedCount} posts from selected users`,
      });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-user-posts'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete posts',
        variant: 'destructive',
      });
    },
  });
}
