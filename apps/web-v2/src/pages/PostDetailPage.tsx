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
  usePost,
  useToggleLike,
} from '@/features/posts';
import { stripHtml } from '@/lib/utils';

export function PostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { post, isLoading, isError, error } = usePost(postId || '');
  const [replyTo, setReplyTo] = useState<{ id: string; username: string } | undefined>();

  const createComment = useCreateComment(postId || '');
  const toggleLike = useToggleLike();

  // Redirect if no postId
  if (!postId) {
    navigate('/');
    return null;
  }

  const handleLike = (postId: string) => {
    // Optimistic update with silent error handling (polarity pattern)
    toggleLike.mutate({ postId });
  };

  const handleReport = (postId: string) => {
    navigate(`/report/${postId}`);
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
                onComment={handleComment}
                hideCaption={showFullCaptionSection}
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
    </AppLayout>
  );
}
