/**
 * Flagged Post Detail Page
 *
 * Displays a flagged post with full details and admin actions.
 * Follows Zen principles - no modals, full page experience.
 */

import { ArrowLeft, Loader2, MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CommentList, useComments } from '@/features/posts';
import api from '@/lib/api';
import { formatRelativeTime } from '@/lib/utils';
import type { FlaggedPost } from '@/types';

/**
 * Comments section that only renders if there are comments
 */
function CommentsSection({ postId }: { postId: string }) {
  const { data, isLoading } = useComments(postId);

  // Get comment count from all pages
  const commentCount = data?.pages.reduce((total, page) => total + page.posts.length, 0) ?? 0;

  // Don't show anything if loading or no comments
  if (isLoading || commentCount === 0) {
    return null;
  }

  return (
    <Card>
      <CardContent className="p-4 bg-white dim:bg-gray-800 dark:bg-gray-900">
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="w-5 h-5 text-gray-600 dim:text-gray-400 dark:text-gray-400" />
          <h3 className="font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100">
            Comments ({commentCount})
          </h3>
        </div>
        <CommentList postId={postId} />
      </CardContent>
    </Card>
  );
}

export function FlaggedPostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

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
    if (!post) return;

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
    if (!post) return;

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
      <div className="max-w-4xl mx-auto p-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="text-center py-12">
          <p className="text-text-secondary">{error || 'Post not found'}</p>
        </div>
      </div>
    );
  }

  const imageUrl = post.image.startsWith('http')
    ? post.image
    : `${import.meta.env.VITE_CDN_URL}/${post.image}`;

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Back button */}
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      {/* Post Card - Similar to PostDetailPage */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {/* Image */}
          <div className="relative">
            <img
              src={imageUrl}
              alt={`Post by ${post.user.userName}`}
              className="w-full max-h-[600px] object-contain bg-black"
            />
            {post.isHidden && (
              <Badge variant="error" size="lg" className="absolute top-4 left-4">
                🚨 Auto-hidden
              </Badge>
            )}
          </div>

          {/* Post Info */}
          <div className="p-6 space-y-4 bg-white dim:bg-gray-800 dark:bg-gray-900">
            {/* User info and stats */}
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100">
                    @{post.user.userName}
                  </span>
                  <Badge variant={post.isHidden ? 'error' : 'warning'} size="md">
                    👎 {post.dislikeCount} {post.dislikeCount === 1 ? 'dislike' : 'dislikes'}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600 dim:text-gray-400 dark:text-gray-400">
                  Posted {formatRelativeTime(new Date(post.createdAt))}
                </div>
              </div>
            </div>

            {/* Caption */}
            {post.text && (
              <div className="p-4 bg-gray-50 dim:bg-gray-700 dark:bg-gray-800 rounded-lg border border-gray-200 dim:border-gray-600 dark:border-gray-700">
                <p className="text-base text-gray-900 dim:text-gray-100 dark:text-gray-100">
                  {post.text}
                </p>
              </div>
            )}

            {/* Location */}
            {post.user.location && (
              <div className="text-sm text-gray-600 dim:text-gray-400 dark:text-gray-400">
                📍 Location: {post.user.location.lat.toFixed(4)},{' '}
                {post.user.location.lon.toFixed(4)}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Admin Info Section */}
      <div className="mt-6 space-y-4">
        {/* Status Card - Only show if post is hidden */}
        {post.isHidden && (
          <Card>
            <CardContent className="p-4 bg-white dim:bg-gray-800 dark:bg-gray-900">
              <h3 className="font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100 mb-2">
                Status
              </h3>
              <p className="text-red-600 dim:text-red-400 dark:text-red-400">
                ⚠️ This post has been hidden
              </p>
            </CardContent>
          </Card>
        )}

        {/* Reporters Card - Only show if there are reporters */}
        {post.reporters && post.reporters.length > 0 && (
          <Card>
            <CardContent className="p-4 bg-white dim:bg-gray-800 dark:bg-gray-900">
              <h3 className="font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100 mb-2">
                Reporters ({post.reporters.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {post.reporters.map((reporter) => (
                  <Badge key={reporter.userId} variant="default" size="sm">
                    @{reporter.userName}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Metadata Card */}
        <Card>
          <CardContent className="p-4 bg-white dim:bg-gray-800 dark:bg-gray-900">
            <h3 className="font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100 mb-2">
              Post Metadata
            </h3>
            <div className="space-y-1 text-sm text-gray-700 dim:text-gray-300 dark:text-gray-300">
              <div>
                <span className="font-medium">Post ID:</span> {post._id}
              </div>
              <div>
                <span className="font-medium">User ID:</span> {post.user.userId}
              </div>
              <div>
                <span className="font-medium">Likes:</span> ❤️ {post.proximal_likes || 0}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comments Section - Only shown if there are comments */}
        <CommentsSection postId={post._id} />

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Back
          </Button>
          {post.reporters && post.reporters.length > 0 && (
            <Button variant="outline" onClick={handleDismiss} loading={isDismissing}>
              Dismiss Reports
            </Button>
          )}
          <Button variant="destructive" onClick={handleDelete} loading={isDeleting}>
            Delete Post
          </Button>
        </div>
      </div>
    </div>
  );
}
