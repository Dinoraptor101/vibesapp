/**
 * User Posts Page
 *
 * Displays all posts from a specific user in admin context.
 * Follows Zen principles - no modals, full page experience.
 */

import { ArrowLeft, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import api from '@/lib/api';
import { formatRelativeTime } from '@/lib/utils';
import type { AdminUser, FlaggedPost } from '@/types';

export function UserPostsPage() {
  const { userId } = useParams<{ userId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  // Get user from route state (passed from UsersPage)
  const userFromState = (location.state as { user?: AdminUser })?.user;

  const [user, setUser] = useState<AdminUser | null>(userFromState || null);
  const [posts, setPosts] = useState<FlaggedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!userId) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = (await api.get(`/admin/users/${userId}/posts`)) as {
          success: boolean;
          posts: FlaggedPost[];
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
    try {
      await api.delete('/admin/posts', { data: { postHexes: [postId] } });
      setPosts(posts.filter((p) => p._id !== postId));
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  const handleViewPost = (post: FlaggedPost) => {
    navigate(`/admin/flagged/${post._id}`, { state: { post } });
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
                  Posts by @{user.userName}
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
                <p>{posts.length} posts</p>
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
            {posts.length} posts found
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

      {/* Posts Grid */}
      {posts.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {posts.map((post) => {
            const imageUrl = post.image.startsWith('http')
              ? post.image
              : `${import.meta.env.VITE_CDN_URL}/${post.image}`;

            return (
              <Card
                key={post._id}
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleViewPost(post)}
              >
                <div className="relative aspect-square">
                  <img
                    src={imageUrl}
                    alt={post.text || 'Post'}
                    className="h-full w-full object-cover"
                  />

                  {/* Status Badge */}
                  {post.isHidden && (
                    <Badge variant="error" size="sm" className="absolute top-2 right-2">
                      HIDDEN
                    </Badge>
                  )}

                  {/* Overlay with stats */}
                  <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 hover:opacity-100 transition-opacity">
                    {post.text && (
                      <p className="line-clamp-2 text-sm text-white mb-2">{post.text}</p>
                    )}
                    <div className="flex items-center justify-between text-xs text-white/80">
                      <div className="flex items-center gap-2">
                        <span>👍 {post.proximal_likes || 0}</span>
                        {(post.proximal_dislikes || 0) > 0 && (
                          <span className="text-red-300">👎 {post.proximal_dislikes}</span>
                        )}
                      </div>
                      <span>{formatRelativeTime(new Date(post.createdAt))}</span>
                    </div>
                  </div>
                </div>

                {/* Post Footer */}
                <CardContent className="p-3 bg-white dim:bg-gray-800 dark:bg-gray-900">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dim:text-gray-400 dark:text-gray-400">
                      {formatRelativeTime(new Date(post.createdAt))}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePost(post._id);
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
