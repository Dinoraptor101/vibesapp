/**
 * MessageBubble Component
 * Individual message display in chat
 */

import { Avatar } from '@/components/ui-next';
import { formatRelativeTime } from '@/lib/utils';
import type { Message } from '../api/dmService';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  otherUserAvatar?: string;
  otherUserName?: string;
}

export function MessageBubble({
  message,
  isCurrentUser,
  otherUserAvatar,
  otherUserName,
}: MessageBubbleProps) {
  return (
    <div className={`flex items-end gap-2 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar (only for other user) */}
      {!isCurrentUser && <Avatar src={otherUserAvatar} alt={otherUserName || 'User'} size="sm" />}

      {/* Message Content */}
      <div
        className={`flex max-w-[70%] flex-col gap-1 ${isCurrentUser ? 'items-end' : 'items-start'}`}
      >
        <div
          className={`rounded-2xl px-4 py-2 ${
            isCurrentUser
              ? 'bg-brand-primary text-white'
              : 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white'
          }`}
        >
          <p className="break-words text-sm">{message.body}</p>
        </div>

        {/* Timestamp */}
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {formatRelativeTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
}
