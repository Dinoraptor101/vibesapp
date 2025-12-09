/**
 * Global SSE Provider
 *
 * Sets up SSE connection and event subscriptions at the app level.
 * This ensures real-time events are received regardless of which page the user is on.
 */

import { useEffect } from 'react';
import { useActivitySSE } from '@/features/activity/hooks/useActivitySSE';
import { useAuth } from '@/features/auth';
import { useDMRequestsSSE } from '@/features/messaging/hooks/useDMRequestsSSE';
import { useMessagingSSE } from '@/features/messaging/hooks/useMessagingSSE';

interface SSEProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component that initializes global SSE subscriptions
 * Should be placed inside AuthProvider but outside of routing
 */
export function SSEProvider({ children }: SSEProviderProps) {
  const { user } = useAuth();
  const userId = user?._id;

  // Initialize all SSE event subscriptions globally
  // These hooks will subscribe to events and update React Query cache
  useActivitySSE(userId);
  useMessagingSSE(userId);
  useDMRequestsSSE(userId);

  useEffect(() => {
    if (userId) {
      console.log('[SSEProvider] SSE subscriptions initialized for user:', userId);
    }
  }, [userId]);

  return <>{children}</>;
}
