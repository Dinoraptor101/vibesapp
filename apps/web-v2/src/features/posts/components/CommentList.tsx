/**
 * CommentList Component
 *
 * Container for comments with infinite scroll, loading states, and empty state.
 */

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui-next/Button';
import { cn } from '@/lib/cn';
import { useComments } from '../hooks/useComments';
import { useDeleteComment } from '../hooks/useDeleteComment';
import { useHeartComment } from '../hooks/useHeartComment';
import type { Post } from '../types';
import { CommentCard } from './CommentCard';
import { CommentSkeleton } from './CommentSkeleton';

interface CommentListProps {
  postId: string;
  onReply?: (commentId: string, username: string) => void;
  className?: string;
}

export function CommentList({ postId, onReply, className }: CommentListProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useComments(postId);

  const deleteComment = useDeleteComment(postId);
  const heartComment = useHeartComment(postId);

  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

  // Intersection observer for infinite scroll
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Flatten comments from all pages
  const comments = data?.pages.flatMap((page) => page.posts) ?? [];

  // Thread comments: group top-level comments with their replies
  const threadedComments = (() => {
    // Separate top-level comments and replies
    const topLevel: Post[] = [];
    const replies: Post[] = [];

    for (const comment of comments) {
      if (comment.replyToCommentId) {
        replies.push(comment);
      } else {
        topLevel.push(comment);
      }
    }

    // Sort top-level comments by creation time (newest first)
    topLevel.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Helper to find the root comment (top-level) for any reply
    const findRootComment = (replyId: string): string => {
      const reply = replies.find((r) => r._id === replyId);
      if (!reply) return replyId; // It's already a top-level comment
      if (reply.replyToCommentId) {
        // This reply is itself replying to something - recurse
        return findRootComment(reply.replyToCommentId);
      }
      return replyId;
    };

    // Build threaded list: top-level comment followed by ALL its replies (including nested)
    const result: Post[] = [];
    for (const comment of topLevel) {
      result.push(comment);

      // Find all replies that belong to this thread (directly or indirectly)
      const threadReplies = replies.filter((r) => {
        // Check if this reply's root is the current top-level comment
        const rootId = findRootComment(r.replyToCommentId || '');
        return rootId === comment._id;
      });

      // Sort replies by creation time (oldest first for natural flow)
      threadReplies.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      result.push(...threadReplies);
    }

    return result;
  })();

  const handleHeart = async (commentId: string, isHearted: boolean) => {
    await heartComment.mutateAsync({ commentId, isHearted });
  };

  const handleDelete = async (commentId: string) => {
    setDeletingCommentId(commentId);
    try {
      await deleteComment.mutateAsync(commentId);
    } catch (err) {
      console.error('Failed to delete comment:', err);
    } finally {
      setDeletingCommentId(null);
    }
  };

  const handleReply = (comment: Post) => {
    onReply?.(comment._id, comment.user.userName);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={cn('space-y-1', className)}>
        <CommentSkeleton />
        <CommentSkeleton />
        <CommentSkeleton />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className={cn('text-center py-8', className)}>
        <p className="text-text-secondary mb-4">
          {error instanceof Error ? error.message : 'Failed to load comments'}
        </p>
        <Button variant="secondary" onClick={() => refetch()}>
          Try Again
        </Button>
      </div>
    );
  }

  // Empty state
  if (threadedComments.length === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <p className="text-text-secondary text-lg mb-1">💬</p>
        <p className="text-text-secondary">Be the first to comment!</p>
      </div>
    );
  }

  // Comments list
  return (
    <div className={cn('space-y-1 overflow-visible', className)}>
      {threadedComments.map((comment) => (
        <CommentCard
          key={comment._id}
          comment={comment}
          onHeart={handleHeart}
          onReply={() => handleReply(comment)}
          onDelete={handleDelete}
          className={cn(deletingCommentId === comment._id && 'opacity-50 pointer-events-none')}
        />
      ))}

      {/* Load more trigger */}
      {hasNextPage && (
        <div ref={loadMoreRef} className="py-4">
          {isFetchingNextPage ? (
            <CommentSkeleton />
          ) : (
            <Button variant="ghost" onClick={() => fetchNextPage()} className="w-full">
              Load more comments
            </Button>
          )}
        </div>
      )}

      {/* End message */}
      {!hasNextPage && threadedComments.length > 5 && (
        <p className="text-center text-text-tertiary text-sm py-4">You've reached the end!</p>
      )}
    </div>
  );
}
