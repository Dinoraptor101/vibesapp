/**
 * PostActions Component
 *
 * Reusable action buttons for posts (heart, report, comment, share).
 * Handles reactions and moderation reports with optimistic UI updates.
 *
 * Design Change (Nov 7, 2025): Replaced like/dislike with heart/report system
 */

import { Flag, Heart, MessageCircle, Share2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui-next';
import { cn } from '@/lib/cn';

interface PostActionsProps {
  postId: string;
  initialHearts: number;
  initialComments: number;
  userHasHearted?: boolean;
  userHasReported?: boolean;
  onHeart?: (postId: string) => void;
  onReport?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  className?: string;
}

export function PostActions({
  postId,
  initialHearts,
  initialComments,
  userHasHearted,
  userHasReported,
  onHeart,
  onReport,
  onComment,
  onShare,
  className,
}: PostActionsProps) {
  const [hasHearted, setHasHearted] = useState(userHasHearted ?? false);
  const [hasReported, setHasReported] = useState(userHasReported ?? false);
  const [hearts, setHearts] = useState(initialHearts);

  // Handle heart action
  const handleHeart = () => {
    const newHasHearted = !hasHearted;
    setHasHearted(newHasHearted);
    setHearts((prev) => prev + (newHasHearted ? 1 : -1));
    onHeart?.(postId);
  };

  // Handle report action
  const handleReport = () => {
    setHasReported(true);
    onReport?.(postId);
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

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {/* Heart button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleHeart}
        className={cn(
          'gap-1.5 text-gray-600 dark:text-gray-400',
          hasHearted && 'text-pink-600 dark:text-pink-500'
        )}
        aria-label={hasHearted ? 'Remove heart' : 'Heart post'}
      >
        <Heart className={cn('w-5 h-5', hasHearted && 'fill-current')} aria-hidden="true" />
        <span className="text-sm font-medium">{formatCount(hearts)}</span>
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

      {/* Report button - hidden after user reports */}
      {!hasReported && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReport}
          className="ml-auto text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500"
          aria-label="Report post"
        >
          <Flag className="w-5 h-5" aria-hidden="true" />
        </Button>
      )}
    </div>
  );
}
