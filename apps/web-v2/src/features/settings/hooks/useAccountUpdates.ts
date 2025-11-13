/**
 * useAccountUpdates Hook
 *
 * Handles auto-save for account settings with:
 * - Debounced batch updates (300ms)
 * - Error callbacks for rollback
 * - Optimistic UI updates with revert on failure
 */

import { useRef, useCallback } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import api from '@/lib/api';

interface AccountUpdate {
  avatar?: string;
  bio?: string;
  mbtiPersonality?: string;
  zipCode?: string;
  location?: { lat: number; lon: number };
  polarity?: 'yin' | 'yang';
  proximityRange?: number;
}

interface QueueOptions {
  onSuccess?: () => void;
  onError?: (error: unknown, updates: AccountUpdate) => void;
}

export function useAccountUpdates() {
  const { user, refreshUser } = useAuth();
  const updateQueue = useRef<AccountUpdate>({});
  const callbacksRef = useRef<QueueOptions>({});
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Queue an account update with debounced batch sending
   */
  const queueUpdate = useCallback(
    (changes: AccountUpdate, options?: QueueOptions) => {
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
    [user, refreshUser]
  );

  return { queueUpdate };
}
