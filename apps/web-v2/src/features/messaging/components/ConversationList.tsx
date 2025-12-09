/**
 * ConversationList Component
 * Displays list of all conversations with unread indicators
 * Shows ended conversations with archived styling at bottom
 */

import { AlertCircle, Archive, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Badge, Spinner } from '@/components/ui-next';
import { useAuth } from '@/features/auth';
import { formatRelativeTime } from '@/lib/utils';
import { useConversations } from '../hooks/useConversations';

export function ConversationList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: conversations, isLoading, error, refetch } = useConversations();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12" data-testid="conversations-loading">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-4 py-12 text-center"
        data-testid="conversations-error"
      >
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-sm text-gray-600 dim:text-gray-400 dark:text-gray-400">
          Failed to load conversations
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="text-sm text-brand-primary hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!conversations || conversations.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-2 py-12 text-center"
        data-testid="conversations-empty-state"
      >
        <MessageCircle className="h-16 w-16 text-gray-300 dim:text-gray-550 dark:text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900 dim:text-gray-100 dark:text-white">
          No conversations yet
        </h3>
        <p className="text-sm text-gray-500 dim:text-gray-450 dark:text-gray-400">
          Send a DM request to start a conversation
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2" data-testid="conversations-list">
      {conversations.map((conversation) => {
        const otherUser = conversation.otherUser;
        const lastMessage = conversation.lastMessage;
        const unreadCount = conversation.unreadCount || 0;
        const isClosed = conversation.status === 'closed';

        return (
          <div
            key={conversation._id}
            data-testid={`conversation-${conversation._id}`}
            className={`flex w-full items-center gap-3 rounded-lg border bg-white dim:bg-gray-800 dark:bg-gray-900 p-3 transition-all ${
              isClosed
                ? 'opacity-60 border-gray-200 dim:border-gray-600 dark:border-gray-700 hover:border-gray-300 hover:bg-gray-50 dim:hover:bg-gray-700 dark:hover:bg-gray-800 dim:hover:border-gray-500 dark:hover:border-gray-600'
                : 'border-gray-200 dim:border-gray-600 dark:border-gray-700 hover:border-brand-primary hover:bg-gray-50 dim:hover:bg-gray-700 dark:hover:bg-gray-800'
            }`}
          >
            {/* Avatar - clickable to profile, grayscale if closed */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (otherUser?.userId) navigate(`/profile/${otherUser.userId}`);
              }}
              className="hover:opacity-80 transition-opacity"
            >
              <div className={isClosed ? 'grayscale' : ''}>
                <Avatar
                  src={otherUser?.profilePictureUrl}
                  alt={otherUser?.userName || 'User'}
                  size="md"
                />
              </div>
            </button>

            {/* Content - clickable to conversation */}
            <button
              type="button"
              onClick={() => navigate(`/messages/${conversation._id}`)}
              className="flex-1 overflow-hidden text-left"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className="font-semibold text-gray-900 dim:text-gray-100 dark:text-white"
                    data-testid="conversation-username"
                  >
                    {otherUser?.userName || 'Unknown'}
                  </span>
                  {otherUser?.mbtiPersonality && (
                    <Badge variant="brand" size="sm">
                      {otherUser.mbtiPersonality}
                    </Badge>
                  )}
                  {/* Archive icon for closed conversations */}
                  {isClosed && (
                    <span className="flex items-center gap-1 text-xs text-gray-500 dim:text-gray-400 dark:text-gray-400">
                      <Archive className="h-3 w-3" />
                      Ended
                    </span>
                  )}
                </div>
                {lastMessage && (
                  <span
                    className="text-xs text-gray-500 dim:text-gray-450 dark:text-gray-400"
                    data-testid="conversation-timestamp"
                  >
                    {formatRelativeTime(lastMessage.timestamp)}
                  </span>
                )}
              </div>

              {lastMessage && (
                <p
                  className="truncate text-sm text-gray-600 dim:text-gray-400 dark:text-gray-400"
                  data-testid="conversation-last-message"
                >
                  {lastMessage.senderId === user?._id && 'You: '}
                  {lastMessage.body}
                </p>
              )}
            </button>

            {/* Unread Badge - hide for closed conversations */}
            {!isClosed && unreadCount > 0 && (
              <Badge variant="error" size="sm">
                {unreadCount}
              </Badge>
            )}
          </div>
        );
      })}
    </div>
  );
}
