/**
 * ConversationList Component
 * Displays list of all conversations with unread indicators
 */

import { AlertCircle, MessageCircle } from 'lucide-react';
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
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-sm text-gray-600 dark:text-gray-400">Failed to load conversations</p>
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
      <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
        <MessageCircle className="h-16 w-16 text-gray-300 dark:text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          No conversations yet
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Send a DM request to start a conversation
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conversation) => {
        const otherUser = conversation.otherUser;
        const lastMessage = conversation.lastMessage;
        const unreadCount = conversation.unreadCount || 0;

        return (
          <div
            key={conversation._id}
            className="flex w-full items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 transition-all hover:border-brand-primary hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-brand-primary dark:hover:bg-gray-750"
          >
            {/* Avatar - clickable to profile */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (otherUser?._id) navigate(`/profile/${otherUser._id}`);
              }}
              className="hover:opacity-80 transition-opacity"
            >
              <Avatar
                src={otherUser?.profilePictureUrl}
                alt={otherUser?.username || 'User'}
                size="md"
              />
            </button>

            {/* Content - clickable to conversation */}
            <button
              type="button"
              onClick={() => navigate(`/messages/${conversation._id}`)}
              className="flex-1 overflow-hidden text-left"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {otherUser?.username || 'Unknown'}
                  </span>
                  {otherUser?.mbtiPersonality && (
                    <Badge variant="brand" size="sm">
                      {otherUser.mbtiPersonality}
                    </Badge>
                  )}
                </div>
                {lastMessage && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatRelativeTime(lastMessage.timestamp)}
                  </span>
                )}
              </div>

              {lastMessage && (
                <p className="truncate text-sm text-gray-600 dark:text-gray-400">
                  {lastMessage.senderId === user?._id && 'You: '}
                  {lastMessage.body}
                </p>
              )}
            </button>

            {/* Unread Badge */}
            {unreadCount > 0 && (
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
