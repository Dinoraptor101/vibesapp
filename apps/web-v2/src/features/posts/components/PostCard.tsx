/**
 * PostCard Component
 *
 * Displays a post in the feed with image, text, author info, and interaction actions.
 * Clickable to view full post details.
 */

import { MessageSquare, Heart, Flag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui-next';
import { useAuth } from '@/features/auth';
import { formatRelativeTime } from '@/lib/utils';
import type { Post } from '../types';
import { UserBadge } from './UserBadge';

interface PostCardProps {
  post: Post;
  onLike?: (postId: string) => void;
  onReport?: (postId: string) => void;
  onComment?: (postId: string) => void;
}

export function PostCard({ post, onLike, onReport, onComment }: PostCardProps) {
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

  const imageUrl = post.image.startsWith('http') ? post.image : `${CDN_URL}/${post.image}`;

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

  const handleComment = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onComment?.(post._id);
  };

  return (
    <Card hoverable>
      {/* Author Info - NOT wrapped in Link so UserBadge can be clickable */}
      <div className="p-4 pb-0">
        <UserBadge user={post.user} size="md" clickable={true} />
        <div className="text-xs text-text-tertiary mt-2">
          {formatRelativeTime(new Date(post.createdAt))}
        </div>
      </div>

      <Link to={`/post/${post._id}`} className="block">
        {/* Post Image */}
        <div className="relative aspect-square bg-surface-alt overflow-hidden">
          <img
            src={imageUrl}
            alt={post.text || 'Post image'}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              // Fallback for broken images
              console.error('Image failed to load:', imageUrl);
              e.currentTarget.src = import.meta.env.VITE_PLACEHOLDER_IMAGE_URL || '';
            }}
          />
        </div>

        {/* Post Actions */}
        <div className="p-4">
          <div className="flex items-center gap-4 mb-3">
            {/* Like (Heart) */}
            <button
              type="button"
              onClick={handleLike}
              className={`flex items-center gap-1.5 transition-colors group ${
                userHasLiked ? 'text-vibe-positive' : 'text-text-secondary hover:text-vibe-positive'
              }`}
              aria-label={`${userHasLiked ? 'Unlike' : 'Like'} post (${likes} likes)`}
            >
              <Heart
                className={`w-5 h-5 group-hover:scale-110 transition-transform ${
                  userHasLiked ? 'fill-current' : ''
                }`}
              />
              <span className="text-sm font-medium">{likes}</span>
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

            {/* Report (only if not author) */}
            {canReport && (
              <button
                type="button"
                onClick={handleReport}
                className="flex items-center gap-1.5 text-text-secondary hover:text-warning transition-colors group ml-auto"
                aria-label="Report post"
              >
                <Flag className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </button>
            )}
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
