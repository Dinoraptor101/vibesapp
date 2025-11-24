import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { getConversation, getConversations } from '../api/dmService';

/**
 * Unified messaging polling hook
 * Manages polling for both conversations list and active conversation
 * with adaptive intervals based on tab visibility
 *
 * Features:
 * - Auto-detects active conversation from URL
 * - 30s polling for active conversation (optimized for scale)
 * - 30s polling for conversations list
 * - 6x slower polling when tab hidden (battery friendly)
 * - Reduces server load by 6x vs 5s interval
 */
export function useMessagingPolling() {
  const { user } = useAuth();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(!document.hidden);

  // Auto-detect active conversation from URL
  const activeConversationId = location.pathname.match(/\/messages\/(.+)/)?.[1];

  // Track tab visibility for adaptive polling
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Conversations list polling (30s, 180s when hidden)
  const conversationsQuery = useQuery({
    queryKey: ['conversations', user?._id],
    queryFn: () => {
      if (!user?._id) throw new Error('User ID is required');
      return getConversations(user._id);
    },
    enabled: !!user?._id,
    refetchInterval: isVisible ? 30000 : 180000, // 30s visible, 180s hidden
    staleTime: 20000,
    refetchIntervalInBackground: false, // Stop polling when tab hidden
  });

  // Active conversation polling (30s, 180s when hidden)
  // Changed from 5s to 30s to improve scalability (6x load reduction)
  // See docs/Web-v2/SCALING/01-API-POLLING-CAPACITY.md for details
  const conversationQuery = useQuery({
    queryKey: ['conversation', activeConversationId],
    queryFn: () => {
      if (!activeConversationId) throw new Error('Conversation ID is required');
      return getConversation(activeConversationId);
    },
    enabled: !!activeConversationId,
    refetchInterval: isVisible ? 30000 : 180000, // 30s visible, 180s hidden (was 5s/30s)
    staleTime: 20000,
    refetchIntervalInBackground: false,
  });

  return {
    conversations: conversationsQuery.data ?? [],
    activeConversation: conversationQuery.data,
    isLoading: conversationsQuery.isLoading || conversationQuery.isLoading,
    error: conversationsQuery.error || conversationQuery.error,
    isTabVisible: isVisible,
  };
}
