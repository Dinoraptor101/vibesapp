/**
 * CommentCard Component
 *
 * Displays an individual comment with user info, text, heart button, reply button, and delete option.
 */

import { Heart, MessageCircle, Trash2 } from 'lucide-react';
import { Avatar } from '@/components/ui-next/Avatar';
import { useAuth } from '@/features/auth';
import { cn } from '@/lib/cn';
import { formatRelativeTime } from '@/lib/utils';
import type { Post } from '../types';

interface CommentCardProps {
  comment: Post; // Comments are posts with replyTo field
  onHeart?: (commentId: string, isHearted: boolean) => void;
  onReply?: (commentId: string) => void;
  onDelete?: (commentId: string) => void;
  className?: string;
}

export function CommentCard({ comment, onHeart, onReply, onDelete, className }: CommentCardProps) {
  const { user: currentUser } = useAuth();

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

  return (
    <div className={cn('flex gap-3 py-3', className)}>
      {/* Avatar */}
      <Avatar
        src={comment.user.profilePictureUrl}
        alt={comment.user.userName}
        name={comment.user.userName}
        size="sm"
        className="mt-1"
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-text-primary text-sm">{comment.user.userName}</span>
          <span className="text-text-tertiary text-xs">
            {age} • {comment.user.mbtiPersonality || 'XXXX'}
          </span>
          <span className="text-text-tertiary text-xs">•</span>
          <span className="text-text-tertiary text-xs">
            {formatRelativeTime(new Date(comment.createdAt))}
          </span>
        </div>

        {/* Comment Text */}
        <p className="text-text-secondary text-sm mb-2 whitespace-pre-wrap break-words">
          {comment.text}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Heart Button */}
          {onHeart && (
            <button
              type="button"
              onClick={() => onHeart(comment._id, userHasHearted)}
              className={cn(
                'flex items-center gap-1 text-xs transition-colors',
                userHasHearted
                  ? 'text-vibe-positive'
                  : 'text-text-tertiary hover:text-vibe-positive'
              )}
            >
              <Heart className={cn('w-4 h-4', userHasHearted && 'fill-current')} />
              {heartCount > 0 && <span>{heartCount}</span>}
            </button>
          )}

          {/* Reply Button */}
          {onReply && (
            <button
              type="button"
              onClick={() => onReply(comment._id)}
              className="flex items-center gap-1 text-xs text-text-tertiary hover:text-brand transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Reply</span>
            </button>
          )}

          {/* Delete Button (own comments only) */}
          {onDelete && isOwnComment && (
            <button
              type="button"
              onClick={() => onDelete(comment._id)}
              className="flex items-center gap-1 text-xs text-text-tertiary hover:text-error transition-colors ml-auto"
            >
              <Trash2 className="w-4 h-4" />
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
