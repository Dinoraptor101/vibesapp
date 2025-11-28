/**
 * useUnreadMessageCount Hook
 *
 * Returns total unread message count for the Messages badge.
 * This is the sum of:
 * 1. Unread messages from active conversations
 * 2. Pending DM requests
 *
 * This is SEPARATE from Activity counts which track notifications
 * about social interactions (likes, comments, follows, etc.)
 */

import { useMemo } from 'react';
import { useConversations } from './useConversations';
import { useDMRequests } from './useDMRequests';

/**
 * Calculate total unread message count
 * Combines unread conversation messages + pending DM requests
 */
export function useUnreadMessageCount() {
  const { data: conversations } = useConversations();
  const { data: dmRequestsData } = useDMRequests();

  const count = useMemo(() => {
    // Sum unread counts from all active conversations
    const conversationUnread =
      conversations
        ?.filter((c) => c.status !== 'archived' && c.status !== 'closed')
        ?.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0) ?? 0;

    // Add pending DM requests
    const dmRequestCount = dmRequestsData?.count ?? 0;

    return conversationUnread + dmRequestCount;
  }, [conversations, dmRequestsData]);

  return count;
}
