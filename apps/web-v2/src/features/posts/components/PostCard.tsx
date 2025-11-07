/**
 * PostCard Component
 *
 * Displays a post in the feed with image, text, author info, and vibe actions.
 * Clickable to view full post details.
 */

import { MessageSquare, ThumbsDown, ThumbsUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui-next';
import { formatRelativeTime } from '@/lib/utils';
import type { Post } from '../types';
import { UserBadge } from './UserBadge';

interface PostCardProps {
  post: Post;
  onLike?: (postId: string) => void;
  onDislike?: (postId: string) => void;
  onComment?: (postId: string) => void;
}

export function PostCard({ post, onLike, onDislike, onComment }: PostCardProps) {
  // Calculate stats from reactions
  const likes = post.reactions.filter((r) => r.type === 'like').length;
  const dislikes = post.reactions.filter((r) => r.type === 'dislike').length;
  const vibesScore = likes - dislikes;

  // Determine if current user has reacted (TODO: implement when auth is fully integrated)
  // const userReaction = post.reactions.find(r => r.userId === currentUser?._id)?.type;

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onLike?.(post._id);
  };

  const handleDislike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDislike?.(post._id);
  };

  const handleComment = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onComment?.(post._id);
  };

  return (
    <Card hoverable>
      <Link to={`/post/${post._id}`} className="block">
        {/* Author Info */}
        <div className="p-4 pb-0">
          <UserBadge user={post.user} size="md" clickable={false} />
          <div className="text-xs text-text-tertiary mt-2">
            {formatRelativeTime(new Date(post.createdAt))}
          </div>
        </div>

        {/* Post Image */}
        <div className="relative aspect-square bg-surface-alt overflow-hidden">
          <img
            src={post.image}
            alt={post.text || 'Post image'}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>

        {/* Post Actions */}
        <div className="p-4">
          <div className="flex items-center gap-4 mb-3">
            {/* Like */}
            <button
              type="button"
              onClick={handleLike}
              className="flex items-center gap-1.5 text-text-secondary hover:text-vibe-positive transition-colors group"
              aria-label={`Like post (${likes} likes)`}
            >
              <ThumbsUp className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">{likes}</span>
            </button>

            {/* Dislike */}
            <button
              type="button"
              onClick={handleDislike}
              className="flex items-center gap-1.5 text-text-secondary hover:text-vibe-negative transition-colors group"
              aria-label={`Dislike post (${dislikes} dislikes)`}
            >
              <ThumbsDown className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">{dislikes}</span>
            </button>

            {/* Comment */}
            <button
              type="button"
              onClick={handleComment}
              className="flex items-center gap-1.5 text-text-secondary hover:text-brand-purple transition-colors group"
              aria-label="Comment on post"
            >
              <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>

            {/* Vibes Score */}
            <div className="ml-auto flex items-center gap-1.5">
              <span className="text-xs text-text-tertiary">Vibes:</span>
              <span
                className={`text-sm font-bold ${
                  vibesScore > 0
                    ? 'text-vibe-positive'
                    : vibesScore < 0
                      ? 'text-vibe-negative'
                      : 'text-text-secondary'
                }`}
              >
                {vibesScore > 0 ? '+' : ''}
                {vibesScore}
              </span>
            </div>
          </div>

          {/* Post Text/Caption */}
          {post.text && (
            <div className="text-text-primary text-sm leading-relaxed line-clamp-3">
              {post.text}
            </div>
          )}

          {/* Hidden indicator */}
          {post.isHidden && (
            <div className="mt-3 px-3 py-2 bg-vibe-negative-bg border border-vibe-negative rounded-md">
              <p className="text-xs text-vibe-negative">
                This post has been auto-hidden due to community reports
              </p>
            </div>
          )}
        </div>
      </Link>
    </Card>
  );
}
