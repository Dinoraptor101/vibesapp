import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatRelativeTime } from '@/lib/utils';
import type { FlaggedPost } from '@/types';

interface PostDetailModalProps {
  post: FlaggedPost | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (postId: string) => void;
  onDismiss: (postId: string) => void;
}

export function PostDetailModal({
  post,
  isOpen,
  onClose,
  onDelete,
  onDismiss,
}: PostDetailModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);

  if (!post) return null;

  const imageUrl = post.image.startsWith('http')
    ? post.image
    : `${import.meta.env.VITE_CDN_URL}/${post.image}`;

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(post._id);
    setIsDeleting(false);
    onClose();
  };

  const handleDismiss = async () => {
    setIsDismissing(true);
    await onDismiss(post._id);
    setIsDismissing(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Flagged Post Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Image */}
          <div className="relative">
            <img
              src={imageUrl}
              alt={`Post by ${post.user.userName}`}
              className="w-full max-h-[500px] object-contain rounded-lg"
            />
            {post.isHidden && (
              <Badge variant="error" size="lg" className="absolute top-4 left-4">
                🚨 Auto-hidden
              </Badge>
            )}
          </div>

          {/* Post info */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">@{post.user.userName}</span>
                  <Badge variant={post.isHidden ? 'error' : 'warning'} size="md">
                    👎 {post.dislikeCount} {post.dislikeCount === 1 ? 'dislike' : 'dislikes'}
                  </Badge>
                </div>
                <div className="text-sm text-text-secondary">
                  Posted {formatRelativeTime(new Date(post.createdAt))}
                </div>
              </div>
            </div>

            {/* Caption */}
            {post.text && (
              <div className="p-4 bg-bg-secondary rounded-lg">
                <p className="text-base">{post.text}</p>
              </div>
            )}

            {/* Location */}
            {post.user.location && (
              <div className="text-sm text-text-secondary">
                📍 Location: {post.user.location.lat.toFixed(4)},{' '}
                {post.user.location.lon.toFixed(4)}
              </div>
            )}

            {/* Status */}
            <div className="p-4 bg-bg-secondary rounded-lg space-y-2">
              <div className="font-semibold">Status:</div>
              {post.isHidden ? (
                <div className="text-red-600 dim:text-red-500 dark:text-red-400">
                  ⚠️ This post has been auto-hidden due to receiving {post.dislikeCount} dislikes
                  from unique users (threshold: {Math.ceil(post.proximal_users / 3)} dislikes)
                </div>
              ) : (
                <div className="text-yellow-600 dim:text-yellow-500 dark:text-yellow-400">
                  ⚠️ This post has {post.dislikeCount} dislikes but is still visible. It will be
                  auto-hidden at {Math.ceil(post.proximal_users / 3)} dislikes.
                </div>
              )}
            </div>

            {/* Reporters */}
            <div className="p-4 bg-bg-secondary rounded-lg space-y-2">
              <div className="font-semibold">Reporters ({post.reporters.length}):</div>
              <div className="flex flex-wrap gap-2">
                {post.reporters.map((reporter) => (
                  <Badge key={reporter.userId} variant="default" size="sm">
                    @{reporter.userName}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Post metadata */}
            <div className="p-4 bg-bg-secondary rounded-lg space-y-1 text-sm">
              <div>
                <span className="font-medium">Post ID:</span> {post._id}
              </div>
              <div>
                <span className="font-medium">User ID:</span> {post.user.userId}
              </div>
              <div>
                <span className="font-medium">Proximal users:</span> {post.proximal_users}
              </div>
              <div>
                <span className="font-medium">Proximal likes:</span> {post.proximal_likes}
              </div>
              <div>
                <span className="font-medium">Proximal dislikes:</span> {post.proximal_dislikes}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button variant="secondary" onClick={handleDismiss} loading={isDismissing}>
            Dismiss Reports
          </Button>
          <Button variant="destructive" onClick={handleDelete} loading={isDeleting}>
            Delete Post
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
