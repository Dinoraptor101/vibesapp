/**
 * PostCard Component
 *
 * Displays a post in the feed with Polaroid-style design:
 * - Image with rounded corners fills the card
 * - Username + timestamp overlay at top-right
 * - Caption and actions in compact footer
 * - Image is not clickable; only comment button navigates to detail
 */

import { MessageSquare, Heart, Flag, Trash2 } from 'lucide-react';
import { useState, memo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui-next';
import { useAuth } from '@/features/auth';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { formatRelativeTime, stripHtml } from '@/lib/utils';
import type { Post } from '../types';
import { UserBadge } from './UserBadge';

interface PostCardProps {
  post: Post;
  onLike?: (postId: string) => void;
  onReport?: (postId: string) => void;
  onDelete?: (postId: string) => void;
  onComment?: (postId: string) => void; // Legacy prop - not used in new design
  hideCaption?: boolean; // Hide caption overlay when showing full caption section in detail view
  disableLink?: boolean; // Disable image click navigation (e.g., when already on detail page)
}

function PostCardComponent({
  post,
  onLike,
  onReport,
  onDelete,
  hideCaption = false,
  disableLink = false,
}: PostCardProps) {
  const { user: currentUser } = useAuth();
  const { isOnline } = useNetworkStatus();

  // Track if this specific post's like is being processed
  const [isLiking, setIsLiking] = useState(false);
  // Track if delete is being processed
  const [isDeleting, setIsDeleting] = useState(false);
  // Track delete hold progress (0-100)
  const [deleteProgress, setDeleteProgress] = useState(0);
  // Refs for delete hold timers
  const deleteTimerRef = useRef<number | null>(null);
  const deleteIntervalRef = useRef<number | null>(null);
  // Track image load state for progressive loading
  const [imageLoaded, setImageLoaded] = useState(false);
  // Track if image error fallback was already attempted (prevents infinite loop)
  const [imageFailed, setImageFailed] = useState(false);

  // Cleanup delete timers on unmount
  useEffect(() => {
    const timerRef = deleteTimerRef;
    const intervalRef = deleteIntervalRef;
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Use backend-computed likeCount (no frontend derivation)
  const likes = post.likeCount ?? 0;

  // Check if current user has liked this post
  const userHasLiked = currentUser
    ? post.reactions.some((r) => r.type === 'like' && r.userId === currentUser._id)
    : false;

  // Check if current user can report (not their own post)
  const canReport = currentUser && post.user.userId !== currentUser._id;

  // Check if current user is the post owner (can delete)
  const isOwner = currentUser && post.user.userId === currentUser._id;

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
    if (!isOnline || isLiking || !canReport) return; // Prevent action when offline, already processing, or own post

    setIsLiking(true);
    onLike?.(post._id);

    // Reset after a short delay to allow the mutation to complete
    // The mutation itself prevents duplicates, this is just UI feedback
    setTimeout(() => setIsLiking(false), 500);
  };

  const handleReport = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onReport?.(post._id);
  };

  // Execute delete after hold completes
  const executeDelete = () => {
    setIsDeleting(true);
    setDeleteProgress(0);
    onDelete?.(post._id);
  };

  // Hold-to-delete handlers
  const handleDeleteMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isDeleting) return;

    // Start progress animation
    setDeleteProgress(0);
    const startTime = Date.now();
    const holdDuration = 1500; // 1.5 seconds hold required

    deleteIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / holdDuration) * 100, 100);
      setDeleteProgress(progress);
    }, 30);

    // Trigger delete after hold duration
    deleteTimerRef.current = window.setTimeout(() => {
      if (deleteIntervalRef.current) {
        clearInterval(deleteIntervalRef.current);
      }
      setDeleteProgress(100);
      executeDelete();
    }, holdDuration);
  };

  const handleDeleteMouseUp = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Cancel if not held long enough
    if (deleteTimerRef.current) {
      clearTimeout(deleteTimerRef.current);
      deleteTimerRef.current = null;
    }
    if (deleteIntervalRef.current) {
      clearInterval(deleteIntervalRef.current);
      deleteIntervalRef.current = null;
    }
    setDeleteProgress(0);
  };

  // Don't render if no image (e.g., comments)
  if (!imageUrl) {
    return null;
  }

  return (
    <Card noPadding className="min-w-[280px]" data-post-id={post._id}>
      {/* Image with Caption Overlay - Full width, edge-to-edge */}
      {isOnline && !disableLink ? (
        <Link to={`/post/${post._id}`} className="block">
          <div className="relative aspect-square bg-surface-alt overflow-hidden">
            {/* Blur placeholder - shown while loading */}
            {!imageLoaded && post.blurPlaceholder && (
              <img
                src={post.blurPlaceholder}
                alt=""
                className="absolute inset-0 w-full h-full object-cover blur-xl scale-110"
                aria-hidden="true"
              />
            )}

            {/* Actual image */}
            <img
              src={imageUrl}
              alt={post.text || 'Post image'}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                if (imageFailed) return; // Prevent infinite loop
                setImageFailed(true);
                setImageLoaded(true);
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
      ) : (
        <div className="block">
          <div className="relative aspect-square bg-surface-alt overflow-hidden">
            {/* Blur placeholder - shown while loading */}
            {!imageLoaded && post.blurPlaceholder && (
              <img
                src={post.blurPlaceholder}
                alt=""
                className="absolute inset-0 w-full h-full object-cover blur-xl scale-110"
                aria-hidden="true"
              />
            )}

            {/* Actual image */}
            <img
              src={imageUrl}
              alt={post.text || 'Post image'}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                if (imageFailed) return; // Prevent infinite loop
                setImageFailed(true);
                setImageLoaded(true);
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
        </div>
      )}

      {/* Footer with user info and actions - Fixed position */}
      <div className="p-3">
        {/* Username (left) + Timestamp (right) */}
        <div className="flex items-center justify-between gap-2">
          <UserBadge user={post.user} size="sm" clickable={isOnline} />
          <span className="text-xs text-text-tertiary flex-shrink-0 max-w-[60px] truncate">
            {formatRelativeTime(new Date(post.createdAt))}
          </span>
        </div>

        {/* Actions - Only shown when online */}
        {isOnline && (
          <div className="flex items-center gap-4 mt-3">
            {/* Like (Heart) */}
            {canReport && (
              <button
                type="button"
                onClick={handleLike}
                disabled={isLiking}
                data-testid="post-like-button"
                className={`flex items-center gap-1.5 transition-colors duration-200 group ${
                  isLiking
                    ? 'opacity-50 cursor-not-allowed'
                    : userHasLiked
                      ? 'text-vibe-positive'
                      : 'text-text-secondary hover:text-vibe-positive'
                }`}
                aria-label={
                  isLiking
                    ? 'Processing...'
                    : `${userHasLiked ? 'Unlike' : 'Like'} post (${likes} likes)`
                }
              >
                <Heart
                  className={`w-5 h-5 transition-transform duration-200 ${
                    userHasLiked ? 'fill-current' : ''
                  } ${isLiking ? 'animate-pulse' : ''}`}
                />
                {likes > 0 && <span className="text-sm font-medium">{likes}</span>}
              </button>
            )}

            {/* Comment - navigates to post detail */}
            <Link
              to={`/post/${post._id}`}
              data-testid="post-comment-link"
              className="flex items-center gap-1.5 text-text-secondary hover:text-brand-purple transition-colors duration-200 group"
              aria-label={`View comments (${post.commentCount})`}
            >
              <MessageSquare className="w-5 h-5 transition-transform duration-200" />
              {post.commentCount > 0 && (
                <span className="text-sm font-medium">{post.commentCount}</span>
              )}
            </Link>

            {/* Report (only if not author) */}
            {canReport && (
              <button
                type="button"
                onClick={handleReport}
                data-testid="post-report-button"
                className="flex items-center gap-1.5 text-text-secondary hover:text-warning transition-colors duration-200 group ml-auto"
                aria-label="Report post"
              >
                <Flag className="w-4 h-4 transition-transform duration-200" />
              </button>
            )}

            {/* Delete (only if owner) - Hold to confirm */}
            {isOwner && (
              <button
                type="button"
                onMouseDown={handleDeleteMouseDown}
                onMouseUp={handleDeleteMouseUp}
                onMouseLeave={handleDeleteMouseUp}
                onTouchStart={handleDeleteMouseDown}
                onTouchEnd={handleDeleteMouseUp}
                disabled={isDeleting}
                data-testid="post-delete-button"
                className={`relative flex items-center gap-1.5 transition-colors duration-200 group ml-auto ${
                  isDeleting
                    ? 'opacity-50 cursor-not-allowed text-text-secondary'
                    : deleteProgress > 0
                      ? 'text-vibe-negative'
                      : 'text-text-secondary hover:text-vibe-negative'
                }`}
                aria-label="Hold to delete post"
                title="Hold to delete"
              >
                <div className="relative">
                  <Trash2
                    className={`w-4 h-4 transition-transform duration-200 relative z-10 ${isDeleting ? 'animate-pulse' : ''}`}
                  />
                  {/* Circular progress indicator */}
                  {deleteProgress > 0 && !isDeleting && (
                    <svg
                      className="absolute -inset-1 w-6 h-6 -rotate-90"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeDasharray={`${(deleteProgress / 100) * 62.8} 62.8`}
                        className="text-vibe-negative"
                      />
                    </svg>
                  )}
                </div>
              </button>
            )}
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
    </Card>
  );
}

const PostCardMemoized = memo(PostCardComponent, (prev, next) => {
  // Only re-render if post data actually changed
  return (
    prev.post._id === next.post._id &&
    prev.post.reactions.length === next.post.reactions.length &&
    prev.post.isHidden === next.post.isHidden &&
    prev.post.text === next.post.text
  );
});

export { PostCardMemoized as PostCard };
