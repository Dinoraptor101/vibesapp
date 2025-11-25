import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatRelativeTime } from '@/lib/utils';
import type { FlaggedPost } from '@/types';

interface FlaggedPostCardProps {
  post: FlaggedPost;
  selected: boolean;
  onSelect: (postId: string) => void;
  onViewDetails: (post: FlaggedPost) => void;
  onDelete: (postId: string) => void;
  onDismiss: (postId: string) => void;
}

export function FlaggedPostCard({
  post,
  selected,
  onSelect,
  onViewDetails,
  onDelete,
  onDismiss,
}: FlaggedPostCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(post._id);
    setIsDeleting(false);
  };

  const handleDismiss = async () => {
    setIsDismissing(true);
    await onDismiss(post._id);
    setIsDismissing(false);
  };

  const imageUrl = post.image.startsWith('http')
    ? post.image
    : `${import.meta.env.VITE_CDN_URL}/${post.image}`;

  return (
    <Card className={selected ? 'ring-2 ring-brand-primary' : ''}>
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Thumbnail */}
          <div className="relative flex-shrink-0">
            <input
              type="checkbox"
              checked={selected}
              onChange={() => onSelect(post._id)}
              className="absolute top-2 left-2 z-10 h-4 w-4 cursor-pointer rounded border-border bg-bg focus:ring-2 focus:ring-brand-primary"
              aria-label={`Select post by ${post.user.userName}`}
            />
            <button
              type="button"
              onClick={() => onViewDetails(post)}
              className="focus:outline-none focus:ring-2 focus:ring-brand-primary rounded-lg"
            >
              <img
                src={imageUrl}
                alt={`Post by ${post.user.userName}`}
                className="w-32 h-32 object-cover rounded-lg hover:opacity-80 transition-opacity"
              />
            </button>
            {post.isHidden && (
              <Badge variant="error" size="sm" className="absolute bottom-2 left-2">
                🚨 Auto-hidden
              </Badge>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">@{post.user.userName}</span>
                  <span className="text-sm text-text-secondary">
                    • {formatRelativeTime(new Date(post.createdAt))}
                  </span>
                </div>
                <div className="text-sm text-text-secondary">
                  📍{' '}
                  {post.user.location?.lat
                    ? `${post.user.location.lat.toFixed(2)}, ${post.user.location.lon.toFixed(2)}`
                    : 'Unknown'}
                </div>
              </div>
              <Badge variant={post.isHidden ? 'error' : 'warning'} size="md">
                🚩 {post.reportCount || 0} {(post.reportCount || 0) === 1 ? 'report' : 'reports'}
              </Badge>
            </div>

            {/* Caption */}
            {post.text && <p className="text-sm line-clamp-2 text-text-secondary">"{post.text}"</p>}

            {/* Status indicator */}
            {post.isHidden && (
              <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                ⚠️ Auto-hidden ({post.reportCount || 0} reports from unique users)
              </div>
            )}

            {/* Report breakdown by reason */}
            {post.reportsByReason && Object.keys(post.reportsByReason).length > 0 && (
              <div className="flex flex-wrap gap-1 text-xs">
                {Object.entries(post.reportsByReason).map(([reason, count]) => (
                  <Badge key={reason} variant="outline" size="sm">
                    {reason.replace('_', ' ')}: {count}
                  </Badge>
                ))}
              </div>
            )}

            {/* Reporters */}
            <div className="text-sm text-text-secondary">
              <span className="font-medium">Reporters:</span>{' '}
              {post.reporters.length > 0
                ? post.reporters.map((r: { userName: string }) => `@${r.userName}`).join(', ')
                : 'None'}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-2">
              <Button size="sm" variant="outline" onClick={() => onViewDetails(post)}>
                View Full Post
              </Button>
              <Button size="sm" variant="destructive" onClick={handleDelete} loading={isDeleting}>
                Delete Post
              </Button>
              <Button size="sm" variant="secondary" onClick={handleDismiss} loading={isDismissing}>
                Dismiss Reports
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
