/**
 * PostActions Component
 *
 * Reusable action buttons for posts (like, dislike, comment, share).
 * Displays vibe score and handles optimistic UI updates.
 */

import { Heart, MessageCircle, Share2, ThumbsDown } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui-next';
import { cn } from '@/lib/cn';

type ReactionType = 'like' | 'dislike' | null;

interface PostActionsProps {
  postId: string;
  initialLikes: number;
  initialDislikes: number;
  initialComments: number;
  initialVibeScore: number;
  userReaction?: ReactionType;
  onReaction?: (postId: string, type: ReactionType) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  className?: string;
}

export function PostActions({
  postId,
  initialLikes,
  initialDislikes,
  initialComments,
  initialVibeScore,
  userReaction,
  onReaction,
  onComment,
  onShare,
  className,
}: PostActionsProps) {
  const [reaction, setReaction] = useState<ReactionType>(userReaction ?? null);
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [vibeScore, setVibeScore] = useState(initialVibeScore);

  // Handle like action
  const handleLike = () => {
    const newReaction = reaction === 'like' ? null : 'like';
    const likeDelta = reaction === 'like' ? -1 : reaction === 'dislike' ? 0 : 1;
    const dislikeDelta = reaction === 'dislike' ? -1 : 0;

    setReaction(newReaction);
    setLikes((prev) => prev + likeDelta);
    setDislikes((prev) => prev + dislikeDelta);
    setVibeScore((prev) => prev + likeDelta - dislikeDelta);

    onReaction?.(postId, newReaction);
  };

  // Handle dislike action
  const handleDislike = () => {
    const newReaction = reaction === 'dislike' ? null : 'dislike';
    const dislikeDelta = reaction === 'dislike' ? -1 : reaction === 'like' ? 0 : 1;
    const likeDelta = reaction === 'like' ? -1 : 0;

    setReaction(newReaction);
    setDislikes((prev) => prev + dislikeDelta);
    setLikes((prev) => prev + likeDelta);
    setVibeScore((prev) => prev - dislikeDelta + likeDelta);

    onReaction?.(postId, newReaction);
  };

  // Handle comment action
  const handleComment = () => {
    onComment?.(postId);
  };

  // Handle share action
  const handleShare = () => {
    onShare?.(postId);
  };

  // Format large numbers
  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  // Get vibe score color
  const getVibeColor = (score: number): string => {
    if (score > 20) return 'text-green-600 dark:text-green-500';
    if (score > 0) return 'text-blue-600 dark:text-blue-500';
    if (score < -20) return 'text-red-600 dark:text-red-500';
    if (score < 0) return 'text-orange-600 dark:text-orange-500';
    return 'text-gray-600 dark:text-gray-400';
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {/* Like button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLike}
        className={cn(
          'gap-1.5 text-gray-600 dark:text-gray-400',
          reaction === 'like' && 'text-pink-600 dark:text-pink-500'
        )}
        aria-label={reaction === 'like' ? 'Unlike post' : 'Like post'}
      >
        <Heart
          className={cn('w-5 h-5', reaction === 'like' && 'fill-current')}
          aria-hidden="true"
        />
        <span className="text-sm font-medium">{formatCount(likes)}</span>
      </Button>

      {/* Dislike button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDislike}
        className={cn(
          'gap-1.5 text-gray-600 dark:text-gray-400',
          reaction === 'dislike' && 'text-purple-600 dark:text-purple-500'
        )}
        aria-label={reaction === 'dislike' ? 'Remove dislike' : 'Dislike post'}
      >
        <ThumbsDown
          className={cn('w-5 h-5', reaction === 'dislike' && 'fill-current')}
          aria-hidden="true"
        />
        <span className="text-sm font-medium">{formatCount(dislikes)}</span>
      </Button>

      {/* Comment button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleComment}
        className="gap-1.5 text-gray-600 dark:text-gray-400"
        aria-label="Comment on post"
      >
        <MessageCircle className="w-5 h-5" aria-hidden="true" />
        <span className="text-sm font-medium">{formatCount(initialComments)}</span>
      </Button>

      {/* Share button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleShare}
        className="text-gray-600 dark:text-gray-400"
        aria-label="Share post"
      >
        <Share2 className="w-5 h-5" aria-hidden="true" />
      </Button>

      {/* Vibe score */}
      <div className="ml-auto flex items-center gap-1.5">
        <span className="text-xs text-gray-500 dark:text-gray-400">Vibe</span>
        <span className={cn('text-sm font-bold', getVibeColor(vibeScore))}>
          {vibeScore > 0 ? '+' : ''}
          {vibeScore}
        </span>
      </div>
    </div>
  );
}
