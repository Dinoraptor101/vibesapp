/**
 * Post Detail Page
 *
 * Displays a single post with full details, comments, and interactions.
 */

import { ArrowLeft, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout';
import { Button } from '@/components/ui-next';
import { PostCard, usePost, reactToPost, ReportPostDialog } from '@/features/posts';

export function PostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { post, isLoading, isError, error, refetch } = usePost(postId || '');
  const [reportingPostId, setReportingPostId] = useState<string | null>(null);
  const [isLiking, setIsLiking] = useState(false);

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

  const handleComment = (postId: string) => {
    // TODO: Scroll to comments section or open comment modal
    console.log('Comment on post:', postId);
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

        {/* TODO: Add comments section */}
        <div className="mt-6 p-6 bg-surface-alt rounded-lg border border-border">
          <p className="text-text-tertiary text-sm text-center">Comments section coming soon...</p>
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
