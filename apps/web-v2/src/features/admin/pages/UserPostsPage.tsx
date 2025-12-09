/**
 * User Posts Page
 *
 * Displays all posts from a specific user in admin context.
 * Follows Zen principles and Web-V2 design patterns with PostsGrid.
 */

import { ArrowLeft, Loader2, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui-next';
import { PostCard } from '@/features/posts/components/PostCard';
import type { Post } from '@/features/posts/types';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import api from '@/lib/api';
import { formatRelativeTime } from '@/lib/utils';
import type { AdminUser } from '@/types';

export function UserPostsPage() {
  const { userId } = useParams<{ userId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  // Get user from route state (passed from UsersPage)
  const userFromState = (location.state as { user?: AdminUser })?.user;

  const [user, setUser] = useState<AdminUser | null>(userFromState || null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const { isOnline } = useNetworkStatus();

  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!userId) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = (await api.get(`/admin/users/${userId}/posts?limit=10000`)) as {
          success: boolean;
          posts: Post[];
          user?: AdminUser;
        };

        setPosts(response.posts || []);

        // If we didn't have user from state, try to get it from response or fetch separately
        if (!userFromState && response.user) {
          setUser(response.user);
        }
      } catch (err) {
        console.error('Error fetching user posts:', err);
        setError('Failed to load user posts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserPosts();
  }, [userId, userFromState]);

  const handleDeletePost = async (postId: string) => {
    if (!isOnline) return;
    if (!confirm('Delete this post? This action cannot be undone.')) return;

    setDeletingPostId(postId);
    try {
      await api.delete('/admin/posts', { data: { postHexes: [postId] } });
      setPosts(posts.filter((p) => p._id !== postId));
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('Failed to delete post');
    } finally {
      setDeletingPostId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-purple" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <Button variant="ghost" onClick={() => navigate('/admin/users')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Users
        </Button>
        <div className="text-center py-12">
          <p className="text-text-secondary">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Back button */}
      <Button variant="ghost" onClick={() => navigate('/admin/users')} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Users
      </Button>

      {/* User Info Header */}
      {user && (
        <Card className="mb-6">
          <CardContent className="p-6 bg-white dim:bg-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-4">
              {user.profilePictureUrl ? (
                <img
                  src={user.profilePictureUrl}
                  alt={user.userName}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-2xl font-semibold text-primary-700">
                  {user.userName.charAt(0).toUpperCase()}
                </div>
              )}

              <div>
                <h1 className="text-2xl font-bold text-gray-900 dim:text-gray-100 dark:text-gray-100">
                  {user.userName}
                </h1>
                <div className="mt-1 flex items-center gap-2">
                  {user.mbtiPersonality && (
                    <Badge variant="default" size="sm">
                      {user.mbtiPersonality}
                    </Badge>
                  )}
                  <Badge variant="brand" size="sm">
                    {(user.masculineFeminineScale ?? 0) > 0 ? '☀️ Yang' : '🌙 Yin'}
                  </Badge>
                  {user.isBanned && (
                    <Badge variant="error" size="sm">
                      BANNED
                    </Badge>
                  )}
                </div>
              </div>

              <div className="ml-auto text-right text-sm text-gray-600 dim:text-gray-400 dark:text-gray-400">
                <p>
                  {posts.filter((p) => p.image).length} posts
                  {posts.filter((p) => !p.image).length > 0 &&
                    ` (${posts.filter((p) => !p.image).length} comments)`}
                </p>
                <p>Joined {formatRelativeTime(user.createdAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Page Title (fallback if no user data) */}
      {!user && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dim:text-gray-100 dark:text-gray-100">
            User Posts
          </h1>
          <p className="text-gray-600 dim:text-gray-400 dark:text-gray-400">
            {posts.filter((p) => p.image).length} posts
            {posts.filter((p) => !p.image).length > 0 &&
              ` (${posts.filter((p) => !p.image).length} comments)`}
          </p>
        </div>
      )}

      {/* Empty State */}
      {posts.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center bg-white dim:bg-gray-800 dark:bg-gray-900">
            <p className="text-gray-500 dim:text-gray-400 dark:text-gray-400">
              This user has no posts yet.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Posts Grid with Admin Actions */}
      {posts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posts
            .filter((post) => post.image) // Only show posts with images (not comments)
            .map((post) => (
              <div key={post._id} className="relative group">
                {/* Post Card - Click to view in admin detail */}
                <button
                  type="button"
                  onClick={() => navigate(`/admin/flagged/${post._id}`)}
                  className="w-full text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand rounded-lg block"
                >
                  <PostCard
                    post={post}
                    onLike={() => {}} // Admin doesn't like posts
                    onReport={() => {}} // Admin doesn't report posts
                  />
                </button>

                {/* Admin Delete Button - Overlays on hover */}
                <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDeletePost(post._id);
                    }}
                    disabled={!isOnline || deletingPostId === post._id}
                    loading={deletingPostId === post._id}
                    className="shadow-lg min-h-[44px]"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
