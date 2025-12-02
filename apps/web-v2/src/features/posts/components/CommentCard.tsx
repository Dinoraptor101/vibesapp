/**
 * CommentCard Component
 *
 * Displays an individual comment with user info, text, heart button, and reply button.
 */

import { Heart, MessageCircle } from 'lucide-react';
import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '@/components/ui-next/Avatar';
import { useAuth } from '@/features/auth';
import { getAvatarUrl } from '@/lib/avatarUtils';
import { cn } from '@/lib/cn';
import { formatRelativeTime } from '@/lib/utils';
import type { Post } from '../types';

interface CommentCardProps {
  comment: Post; // Comments are posts with replyTo field
  onHeart?: (commentId: string, isHearted: boolean) => void;
  onReply?: (commentId: string, username: string) => void;
  className?: string;
}

function CommentCardComponent({ comment, onHeart, onReply, className }: CommentCardProps) {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  // Check if this comment is a reply to another comment
  const isReply = !!comment.replyToCommentId;

  // Check if current user has hearted this comment
  const userHasHearted = comment.reactions.some(
    (r) => r.type === 'like' && r.userId === currentUser?._id
  );

  // Count total hearts
  const heartCount = comment.reactions.filter((r) => r.type === 'like').length;

  // Check if this is the current user's comment
  const isOwnComment = comment.user.userId === currentUser?._id;

  // Calculate age from birth year/month
  const age = new Date().getFullYear() - comment.user.birthYear;

  const handleProfileClick = () => {
    navigate(`/profile/${comment.user.userId}`);
  };

  return (
    <div className={cn('flex gap-3 py-3', isReply && 'ml-8 relative', className)}>
      {/* Thread line for replies */}
      {isReply && (
        <div className="absolute left-[-24px] top-0 bottom-0 w-0.5 bg-border rounded-full" />
      )}

      {/* Avatar */}
      <button type="button" onClick={handleProfileClick} className="shrink-0">
        <Avatar
          src={getAvatarUrl(comment.user.profilePictureUrl)}
          alt={comment.user.userName}
          name={comment.user.userName}
          size="sm"
          className="mt-1 hover:ring-2 hover:ring-brand transition-all cursor-pointer"
        />
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <button
            type="button"
            onClick={handleProfileClick}
            className="flex items-center gap-2 min-w-0 hover:opacity-80 transition-opacity"
          >
            <span className="font-medium text-text-primary text-sm truncate">
              {comment.user.userName}
            </span>
            <span className="text-text-tertiary text-xs whitespace-nowrap">{age}</span>
          </button>
          <span className="text-text-tertiary text-xs">•</span>
          <span className="text-text-tertiary text-xs whitespace-nowrap">
            {formatRelativeTime(new Date(comment.createdAt))}
          </span>

          {/* Syncing Badge for optimistic comments */}
          {comment._id.startsWith('temp-') && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-hover text-text-tertiary text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              Syncing...
            </span>
          )}
        </div>

        {/* Comment Text */}
        <p className="text-text-secondary text-sm mb-2 whitespace-pre-wrap break-words">
          {comment.text}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Heart Button - Hidden for own comments */}
          {onHeart && !isOwnComment && (
            <button
              type="button"
              onClick={() => onHeart(comment._id, userHasHearted)}
              className={cn(
                'flex items-center gap-1 text-xs transition-colors',
                userHasHearted
                  ? 'text-vibe-positive'
                  : 'text-text-tertiary hover:text-vibe-positive'
              )}
              aria-label={userHasHearted ? 'Remove heart' : 'Heart comment'}
            >
              <Heart className={cn('w-4 h-4', userHasHearted && 'fill-current')} />
              {heartCount > 0 && <span>{heartCount}</span>}
            </button>
          )}

          {/* Reply Button */}
          {onReply && (
            <button
              type="button"
              onClick={() => onReply(comment._id, comment.user.userName)}
              className="flex items-center gap-1 text-xs text-text-tertiary hover:text-brand transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Reply</span>
            </button>
          )}
        </div>

        {/* Nested replies indicator (future feature) */}
        {/* {comment.replyCount > 0 && (
          <button
            type="button"
            onClick={() => setShowReplies(!showReplies)}
            className="text-xs text-brand hover:underline mt-2"
          >
            {showReplies ? 'Hide' : 'View'} {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'} ▼
          </button>
        )} */}
      </div>
    </div>
  );
}

const CommentCardMemoized = memo(CommentCardComponent, (prev, next) => {
  return (
    prev.comment._id === next.comment._id &&
    prev.comment.reactions.length === next.comment.reactions.length
  );
});

export { CommentCardMemoized as CommentCard };
