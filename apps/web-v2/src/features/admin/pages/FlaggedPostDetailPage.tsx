/**
 * Flagged Post Detail Page
 *
 * Displays a flagged post with full details and admin actions.
 * Follows ZEN principles:
 * - Modern PostCard design (matches production)
 * - Read-only comment list for context
 * - Compact admin intel panel with hover effects
 * - Offline-ready with proper handling
 * - Touch-optimized (44px minimum targets)
 * - Reduced spacing (space-y-3) and padding (p-3)
 * - Compact text sizes (text-xs, text-base)
 */

import { ArrowLeft, Loader2, MessageCircle, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui-next';
import { Card } from '@/components/ui-next';
import { CommentList, PostCard } from '@/features/posts';
import type { Post } from '@/features/posts/types';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import api from '@/lib/api';
import { stripHtml } from '@/lib/utils';
import type { FlaggedPost } from '@/types';

export function FlaggedPostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { isOnline } = useNetworkStatus();

  // Get post from route state (passed from FlaggedPostsPage)
  const postFromState = (location.state as { post?: FlaggedPost })?.post;

  const [post, setPost] = useState<FlaggedPost | null>(postFromState || null);
  const [isLoading, setIsLoading] = useState(!postFromState);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);

  useEffect(() => {
    // If we already have the post from state, no need to fetch
    if (postFromState) {
      setPost(postFromState);
      setIsLoading(false);
      return;
    }

    // Fallback: try to fetch the post by ID
    const fetchPost = async () => {
      if (!postId) return;

      setIsLoading(true);
      setError(null);

      try {
        // First try to get the post directly by ID
        const postResponse = (await api.get(`/post/${postId}`)) as {
          success: boolean;
          post?: FlaggedPost;
        };

        if (postResponse.success && postResponse.post) {
          setPost(postResponse.post);
          return;
        }

        // Fallback: search in flagged posts
        const response = (await api.get('/admin/flagged-posts', {
          params: { limit: 100 },
        })) as {
          success: boolean;
          posts: FlaggedPost[];
        };

        if (response.success) {
          const foundPost = response.posts.find((p) => p._id === postId);
          if (foundPost) {
            setPost(foundPost);
          } else {
            setError('Post not found');
          }
        } else {
          setError('Failed to load post');
        }
      } catch (err) {
        console.error('Error fetching post:', err);
        setError('Failed to load post');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [postId, postFromState]);

  const handleDelete = async () => {
    if (!post || !isOnline) return;

    const confirmed = window.confirm(
      'This will permanently delete this post. This cannot be undone.'
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await api.delete('/admin/posts', { data: { postHexes: [post._id] } });
      navigate('/admin/flagged');
    } catch (err) {
      console.error('Error deleting post:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDismiss = async () => {
    if (!post || !isOnline) return;

    setIsDismissing(true);
    try {
      await api.post(`/admin/posts/${post._id}/dismiss-reports`);
      navigate('/admin/flagged');
    } catch (err) {
      console.error('Error dismissing reports:', err);
    } finally {
      setIsDismissing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-purple" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="text-center py-12">
          <AlertTriangle className="mx-auto mb-4 w-12 h-12 text-warning" />
          <p className="text-text-secondary">{error || 'Post not found'}</p>
        </div>
      </div>
    );
  }

  // Convert FlaggedPost to Post type for PostCard compatibility
  const postForCard = post as unknown as Post;

  // Determine caption length for display logic
  const captionLength = post.text ? stripHtml(post.text).length : 0;
  const showFullCaptionSection = captionLength > 100;

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-3">
      {/* Back button */}
      <Button variant="ghost" onClick={() => navigate(-1)}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      {/* Admin Intel Section */}
      <Card className="hover-lift">
        <div className="p-3">
          <div className="flex items-start justify-between gap-3">
            {/* Left side - Reporters and Metadata in columns */}
            <div className="flex gap-4 flex-1">
              {/* Reporters */}
              {post.reporters && post.reporters.length > 0 && (
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-medium text-text-tertiary mb-1.5 uppercase tracking-wide">
                    Reporters ({post.reporters.length})
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {post.reporters.map((reporter) => (
                      <Badge key={reporter.userId} variant="default" size="sm">
                        @{reporter.userName}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="flex-shrink-0">
                <h3 className="text-xs font-medium text-text-tertiary mb-1.5 uppercase tracking-wide">
                  Metadata
                </h3>
                <div className="space-y-0.5 text-xs text-text-secondary">
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-text-tertiary">Post:</span>
                    <button
                      type="button"
                      className="text-xs bg-surface-secondary px-1.5 py-0.5 rounded cursor-pointer hover:bg-surface-tertiary font-mono"
                      onClick={() => navigator.clipboard.writeText(post._id)}
                      title="Click to copy full ID"
                    >
                      {post._id.slice(-8)}
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-text-tertiary">User:</span>
                    <button
                      type="button"
                      className="text-xs bg-surface-secondary px-1.5 py-0.5 rounded cursor-pointer hover:bg-surface-tertiary font-mono"
                      onClick={() => navigator.clipboard.writeText(post.user.userId)}
                      title="Click to copy full ID"
                    >
                      {post.user.userId.slice(-8)}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Actions */}
            <div className="flex gap-2 flex-shrink-0">
              {post.reporters && post.reporters.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDismiss}
                  loading={isDismissing}
                  disabled={!isOnline}
                  className="min-h-[44px]"
                >
                  Dismiss
                </Button>
              )}
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                loading={isDeleting}
                disabled={!isOnline}
                className="min-h-[44px]"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Post Display - Using modern PostCard component */}
      <PostCard post={postForCard} hideCaption={showFullCaptionSection} />

      {/* Full Caption Section - Only shown when caption exceeds 100 chars */}
      {showFullCaptionSection && (
        <Card>
          <div className="p-3">
            <div
              className="text-text-primary text-sm leading-relaxed prose prose-sm max-w-none
                prose-headings:text-text-primary
                prose-p:text-text-primary
                prose-strong:text-text-primary
                prose-a:text-brand hover:prose-a:text-brand-600"
              dangerouslySetInnerHTML={{ __html: post.text || '' }}
            />
          </div>
        </Card>
      )}

      {/* Comments Section - Read-only for context */}
      <div id="comments-section" className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <MessageCircle className="w-4 h-4 text-text-tertiary" />
          <h2 className="text-base font-semibold text-text-primary">Comments</h2>
          <span className="text-xs text-text-tertiary">(Read-only)</span>
        </div>

        {/* Comment List - No input, just display */}
        <CommentList postId={post._id} />
      </div>
    </div>
  );
}
