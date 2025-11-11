/**
 * Post Detail Page
 *
 * Displays a single post with full details, comments, and interactions.
 */

import { ArrowLeft, Loader2, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout';
import { Button } from '@/components/ui-next';
import {
  CommentInput,
  CommentList,
  PostCard,
  ReportPostDialog,
  reactToPost,
  useCreateComment,
  usePost,
} from '@/features/posts';

export function PostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { post, isLoading, isError, error, refetch } = usePost(postId || '');
  const [reportingPostId, setReportingPostId] = useState<string | null>(null);
  const [isLiking, setIsLiking] = useState(false);
  const [replyTo, setReplyTo] = useState<{ id: string; username: string } | undefined>();

  const createComment = useCreateComment(postId || '');

  // Redirect if no postId
  if (!postId) {
    navigate('/');
    return null;
  }

  const handleLike = async (postId: string) => {
    if (isLiking || !post) return;

    try {
      setIsLiking(true);
      // Check if user has already liked
      const hasLike = post.reactions.some((r) => r.type === 'like');
      // Toggle like/unlike
      await reactToPost(postId, hasLike ? null : 'like');
      // Refetch post to get updated data
      await refetch();
    } catch (error) {
      console.error('Error liking post:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleReport = (postId: string) => {
    setReportingPostId(postId);
  };

  const handleComment = () => {
    // Scroll to comments section
    const commentsSection = document.getElementById('comments-section');
    commentsSection?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmitComment = async (text: string) => {
    if (!postId) {
      console.error('Cannot create comment: postId is missing');
      return;
    }

    try {
      await createComment.mutateAsync(text);
    } catch (error) {
      console.error('Failed to create comment:', error);
    }
  };

  const handleReply = (commentId: string, username: string) => {
    setReplyTo({ id: commentId, username });
  };

  const handleCancelReply = () => {
    setReplyTo(undefined);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-brand-purple" />
        </div>
      </AppLayout>
    );
  }

  if (isError || !post) {
    // Log error to console for debugging, but don't show to user (ZEN approach)
    if (error) {
      console.error('Error loading post:', error);
    }

    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto p-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="text-center py-12">
            <p className="text-text-secondary">Post not found</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto p-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <PostCard
          post={post}
          onLike={handleLike}
          onReport={handleReport}
          onComment={handleComment}
        />

        {/* Comments Section */}
        <div id="comments-section" className="mt-6 space-y-4">
          {/* Section Header */}
          <div className="flex items-center gap-2 px-1">
            <MessageCircle className="w-5 h-5 text-text-tertiary" />
            <h2 className="text-lg font-semibold text-text-primary">Comments</h2>
          </div>

          {/* Comment Input */}
          <CommentInput
            onSubmit={handleSubmitComment}
            replyTo={replyTo}
            onCancelReply={handleCancelReply}
            disabled={createComment.isPending}
          />

          {/* Comment List */}
          <CommentList postId={postId || ''} onReply={handleReply} />
        </div>
      </div>

      {/* Report Dialog */}
      {reportingPostId && (
        <ReportPostDialog
          postId={reportingPostId}
          isOpen={!!reportingPostId}
          onClose={() => setReportingPostId(null)}
        />
      )}
    </AppLayout>
  );
}
