/**
 * useAccountUpdates Hook
 *
 * Handles auto-save for account settings with:
 * - Debounced batch updates (300ms)
 * - Error callbacks for rollback
 * - Optimistic UI updates with revert on failure
 * - Flush pending updates on unmount
 */

import { useQueryClient } from '@tanstack/react-query';
import { useRef, useCallback, useEffect } from 'react';
import { useAuth } from '@/features/auth/context/useAuth';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import api from '@/lib/api';

interface AccountUpdate {
  avatar?: string;
  bio?: string;
  mbtiPersonality?: string;
  location?: { lat: number; lon: number; city?: string };
  polarity?: 'yin' | 'yang';
  proximityRange?: number;
}

interface QueueOptions {
  onSuccess?: () => void;
  onError?: (error: unknown, updates: AccountUpdate) => void;
}

export function useAccountUpdates() {
  const { user, refreshUser } = useAuth();
  const { isOnline } = useNetworkStatus();
  const queryClient = useQueryClient();
  const updateQueue = useRef<AccountUpdate>({});
  const callbacksRef = useRef<QueueOptions>({});
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Queue an account update with debounced batch sending
   */
  const queueUpdate = useCallback(
    (changes: AccountUpdate, options?: QueueOptions) => {
      // Prevent queueing when offline
      if (!isOnline) {
        console.log('Offline: Settings changes blocked');
        return;
      }

      // Add changes to queue
      updateQueue.current = {
        ...updateQueue.current,
        ...changes,
      };

      // Store callbacks (later callbacks override earlier ones)
      if (options) {
        callbacksRef.current = {
          ...callbacksRef.current,
          ...options,
        };
      }

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Schedule batch update after 300ms
      timeoutRef.current = setTimeout(async () => {
        const updates = { ...updateQueue.current };
        const callbacks = { ...callbacksRef.current };
        updateQueue.current = {}; // Clear queue
        callbacksRef.current = {}; // Clear callbacks

        try {
          // Send batch update to API
          await api.patch(`/api/users/${user?._id}`, updates);

          // Refresh user data silently
          await refreshUser();

          // Invalidate profile cache so other pages show updated data
          if (user?._id) {
            queryClient.invalidateQueries({ queryKey: ['profile', user._id] });
          }

          // Call success callback if provided
          callbacks.onSuccess?.();
        } catch (error) {
          console.error('Failed to update account:', error);

          // Call error callback to allow rollback
          callbacks.onError?.(error, updates);

          // Refresh to get server state
          await refreshUser();
        }
      }, 300);
    },
    [user, refreshUser, queryClient, isOnline]
  );

  /**
   * Flush any pending updates when component unmounts
   * This ensures changes are saved even if user navigates away quickly
   */
  useEffect(() => {
    return () => {
      // If there are pending updates, send them immediately
      if (Object.keys(updateQueue.current).length > 0) {
        const updates = { ...updateQueue.current };
        const callbacks = { ...callbacksRef.current };

        // Clear timeout to prevent duplicate send
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        // Send immediately (async, fire-and-forget since component is unmounting)
        api
          .patch(`/api/users/${user?._id}`, updates)
          .then(() => {
            callbacks.onSuccess?.();
          })
          .catch((error) => {
            console.error('Failed to flush pending updates on unmount:', error);
            callbacks.onError?.(error, updates);
          });
      }
    };
  }, [user]);

  return { queueUpdate };
}
