/**
 * PostCard Component
 *
 * Displays a post in the feed with Polaroid-style design:
 * - Image with rounded corners fills the card
 * - Username + timestamp overlay at top-right
 * - Caption and actions in compact footer
 * - Image is not clickable; only comment button navigates to detail
 */

import { MessageSquare, Heart, Flag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui-next';
import { useAuth } from '@/features/auth';
import { formatRelativeTime, stripHtml } from '@/lib/utils';
import type { Post } from '../types';
import { UserBadge } from './UserBadge';

interface PostCardProps {
  post: Post;
  onLike?: (postId: string) => void;
  onReport?: (postId: string) => void;
  onComment?: (postId: string) => void; // Legacy prop - not used in new design
  hideCaption?: boolean; // Hide caption overlay when showing full caption section in detail view
}

export function PostCard({ post, onLike, onReport, hideCaption = false }: PostCardProps) {
  const { user: currentUser } = useAuth();

  // Calculate stats from reactions
  const likes = post.reactions.filter((r) => r.type === 'like').length;

  // Check if current user has liked this post
  const userHasLiked = currentUser
    ? post.reactions.some((r) => r.type === 'like' && r.userId === currentUser._id)
    : false;

  // Check if current user can report (not their own post)
  const canReport = currentUser && post.user.userId !== currentUser._id;

  // Construct full image URL from CloudFront CDN
  const CDN_URL = import.meta.env.VITE_CDN_URL;

  if (!CDN_URL) {
    throw new Error('VITE_CDN_URL environment variable is required');
  }

  // Handle optional image field (comments don't have images)
  const imageUrl = post.image
    ? post.image.startsWith('http')
      ? post.image
      : `${CDN_URL}/${post.image}`
    : null;

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onLike?.(post._id);
  };

  const handleReport = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onReport?.(post._id);
  };

  // Don't render if no image (e.g., comments)
  if (!imageUrl) {
    return null;
  }

  return (
    <Card noPadding className="min-w-[280px]">
      {/* Image with Caption Overlay - Full width, edge-to-edge */}
      <Link to={`/post/${post._id}`} className="block">
        <div className="relative aspect-square bg-surface-alt overflow-hidden">
          <img
            src={imageUrl}
            alt={post.text || 'Post image'}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              console.error('Image failed to load:', imageUrl);
              e.currentTarget.src = import.meta.env.VITE_PLACEHOLDER_IMAGE_URL || '';
            }}
          />

          {/* Caption Overlay - Only shown if caption exists and not hidden */}
          {post.text && !hideCaption && (
            <div className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-gradient-to-t from-black/75 via-black/50 to-transparent">
              <p className="text-white text-sm font-medium leading-snug line-clamp-2">
                {stripHtml(post.text)}
              </p>
            </div>
          )}
        </div>
      </Link>

      {/* Footer with user info and actions - Fixed position */}
      <div className="p-3">
        {/* Username (left) + Timestamp (right) */}
        <div className="flex items-center justify-between gap-2">
          <UserBadge user={post.user} size="sm" clickable={true} />
          <span className="text-xs text-text-tertiary flex-shrink-0 max-w-[60px] truncate">
            {formatRelativeTime(new Date(post.createdAt))}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 mt-3">
          {/* Like (Heart) */}
          <button
            type="button"
            onClick={handleLike}
            disabled={!canReport}
            className={`flex items-center gap-1.5 transition-colors duration-200 group ${
              !canReport
                ? 'opacity-50 cursor-not-allowed'
                : userHasLiked
                  ? 'text-vibe-positive'
                  : 'text-text-secondary hover:text-vibe-positive'
            }`}
            aria-label={
              !canReport
                ? 'Cannot like your own post'
                : `${userHasLiked ? 'Unlike' : 'Like'} post (${likes} likes)`
            }
          >
            <Heart
              className={`w-5 h-5 transition-transform duration-200 ${
                userHasLiked ? 'fill-current' : ''
              }`}
            />
            <span className="text-sm font-medium">{likes}</span>
          </button>

          {/* Comment - navigates to post detail */}
          <Link
            to={`/post/${post._id}`}
            className="flex items-center gap-1.5 text-text-secondary hover:text-brand-purple transition-colors duration-200 group"
            aria-label="View comments"
          >
            <MessageSquare className="w-5 h-5 transition-transform duration-200" />
          </Link>

          {/* Report (only if not author) */}
          {canReport && (
            <button
              type="button"
              onClick={handleReport}
              className="flex items-center gap-1.5 text-text-secondary hover:text-warning transition-colors duration-200 group ml-auto"
              aria-label="Report post"
            >
              <Flag className="w-4 h-4 transition-transform duration-200" />
            </button>
          )}
        </div>

        {/* Hidden indicator */}
        {post.isHidden && (
          <div className="mt-3 px-3 py-2 bg-vibe-negative-bg border border-vibe-negative rounded-md">
            <p className="text-xs text-vibe-negative">
              This post has been auto-hidden due to community reports
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
