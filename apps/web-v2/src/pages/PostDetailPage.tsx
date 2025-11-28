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
  useCreateComment,
  useDeletePost,
  usePost,
  useToggleLike,
} from '@/features/posts';
import { stripHtml } from '@/lib/utils';

interface PostDetailPageContentProps {
  postId?: string;
}

/**
 * Page content without layout wrapper (for persistent pages)
 */
export function PostDetailPageContent({ postId: propPostId }: PostDetailPageContentProps) {
  const { postId: paramPostId } = useParams<{ postId: string }>();
  const postId = propPostId || paramPostId;
  const navigate = useNavigate();
  const { post, isLoading, isError, error } = usePost(postId || '');
  const [replyTo, setReplyTo] = useState<{ id: string; username: string } | undefined>();

  const createComment = useCreateComment(postId || '');
  const toggleLike = useToggleLike();
  const { mutate: deletePostMutation } = useDeletePost();

  // Show nothing if no postId (will show when route doesn't match)
  if (!postId) {
    return null;
  }

  const handleLike = (postId: string) => {
    // Optimistic update with silent error handling (polarity pattern)
    toggleLike.mutate({ postId });
  };

  const handleReport = (postId: string) => {
    navigate(`/report/${postId}`);
  };

  const handleDelete = (postId: string) => {
    deletePostMutation(postId);
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
      await createComment.mutateAsync({
        text,
        replyToCommentId: replyTo?.id,
      });

      // Clear reply state after successful comment
      if (replyTo) {
        setReplyTo(undefined);
      }
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

  const handleBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-purple" />
      </div>
    );
  }

  if (isError || !post) {
    // Log error to console for debugging, but don't show to user (ZEN approach)
    if (error) {
      console.error('Error loading post:', error);
    }

    return (
      <div className="max-w-2xl mx-auto p-4">
        <Button variant="ghost" onClick={handleBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="text-center py-12">
          <p className="text-text-secondary">Post not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <Button variant="ghost" onClick={handleBack} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      {/* Two-column layout on desktop: Post on left, Comments on right */}
      <div className="flex flex-col md:flex-row md:gap-8">
        {/* Left Column: Post Content (UNTOUCHED) */}
        <div className="md:flex-1 md:max-w-2xl">
          {/* Smart Caption Display: Either overlay (≤100 chars) OR full section (>100 chars) - Never both */}
          {(() => {
            const captionLength = post.text ? stripHtml(post.text).length : 0;
            const showFullCaptionSection = captionLength > 100;

            return (
              <>
                <PostCard
                  post={post}
                  onLike={handleLike}
                  onReport={handleReport}
                  onDelete={handleDelete}
                  onComment={handleComment}
                  hideCaption={showFullCaptionSection}
                  disableLink
                />

                {/* Full Caption Section - Only shown when caption exceeds 100 chars (≈2 lines) */}
                {showFullCaptionSection && (
                  <div className="mt-6 p-4 bg-surface-elevated dim:bg-gray-700 dark:bg-gray-800 border border-border dim:border-gray-600 dark:border-gray-700 rounded-lg">
                    <div
                      className="text-text-primary dim:text-gray-100 dark:text-gray-200 text-sm leading-relaxed prose prose-sm max-w-none
                    prose-headings:text-text-primary dim:prose-headings:text-gray-100 dark:prose-headings:text-gray-200
                    prose-p:text-text-primary dim:prose-p:text-gray-100 dark:prose-p:text-gray-200
                    prose-strong:text-text-primary dim:prose-strong:text-gray-100 dark:prose-strong:text-gray-200
                    prose-em:text-text-primary dim:prose-em:text-gray-100 dark:prose-em:text-gray-200
                    prose-a:text-brand-primary hover:prose-a:text-brand-600
                    prose-ul:text-text-primary dim:prose-ul:text-gray-100 dark:prose-ul:text-gray-200
                    prose-ol:text-text-primary dim:prose-ol:text-gray-100 dark:prose-ol:text-gray-200"
                      dangerouslySetInnerHTML={{ __html: post.text || '' }}
                    />
                  </div>
                )}
              </>
            );
          })()}

          {/* Mobile: Comment List (scrollable, above sticky input) */}
          <div id="comments-section" className="mt-6 mb-16 space-y-4 md:mb-0 md:hidden">
            {/* Section Header */}
            <div className="flex items-center gap-2 px-1">
              <MessageCircle className="w-5 h-5 text-text-tertiary" />
              <h2 className="text-lg font-semibold text-text-primary">Comments</h2>
            </div>

            {/* Comment List */}
            <CommentList postId={postId || ''} onReply={handleReply} />
          </div>
        </div>

        {/* Right Column: Comments Section (Desktop only) */}
        <div className="hidden md:block md:w-96 md:flex-shrink-0">
          <div className="sticky top-24 space-y-4">
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
            <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
              <CommentList postId={postId || ''} onReply={handleReply} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: Sticky Comment Input - Fixed above bottom nav (z-40) */}
      <div className="md:hidden fixed bottom-20 left-0 right-0 bg-surface-elevated/95 backdrop-blur-md border-t border-border px-4 py-3 z-50 safe-area-inset-bottom">
        <CommentInput
          onSubmit={handleSubmitComment}
          replyTo={replyTo}
          onCancelReply={handleCancelReply}
          disabled={createComment.isPending}
        />
      </div>
    </div>
  );
}

/**
 * Full page with layout wrapper (for standalone routing)
 */
export function PostDetailPage() {
  return (
    <AppLayout>
      <PostDetailPageContent />
    </AppLayout>
  );
}
