/**
 * User Detail Page
 *
 * Full page view for user details in admin context.
 * Follows Zen principles - no modals, full page experience.
 */

import { ArrowLeft, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PigeonIdRegenerator } from '@/components/PigeonIdRegenerator';
import api from '@/lib/api';
import { formatRelativeTime } from '@/lib/utils';
import type { AdminUser, FlaggedPost } from '@/types';

export function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  // Get user from route state (passed from UsersPage)
  const userFromState = (location.state as { user?: AdminUser })?.user;

  const [user, setUser] = useState<AdminUser | null>(userFromState || null);
  const [userPosts, setUserPosts] = useState<FlaggedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRegenerateSection, setShowRegenerateSection] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;

      setIsLoading(true);
      setError(null);

      try {
        // Fetch user posts (and potentially user data)
        const response = (await api.get(`/admin/users/${userId}/posts`)) as {
          success: boolean;
          posts: FlaggedPost[];
          user?: AdminUser;
        };

        setUserPosts(response.posts || []);

        // If we didn't have user from state, try to get it from response
        if (!userFromState && response.user) {
          setUser(response.user);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [userId, userFromState]);

  const handleToggleBan = async () => {
    if (!user) return;

    try {
      await api.post(`/admin/users/${user.userId}/toggle-ban`);
      // Update local state
      setUser({ ...user, isBanned: !user.isBanned });
    } catch (err) {
      console.error('Error toggling ban:', err);
      alert('Failed to toggle ban status');
    }
  };

  const handleDeleteUser = async () => {
    if (!user) return;

    if (
      !confirm('Are you sure you want to delete this user? This action marks the user as deleted.')
    ) {
      return;
    }

    try {
      await api.delete(`/admin/users/${user.userId}`);
      navigate('/admin/users');
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Failed to delete user');
    }
  };

  const handleDeleteAllPosts = async () => {
    if (!user) return;

    if (
      !confirm(
        'Are you sure you want to delete ALL posts from this user? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      await api.delete(`/admin/users/${user.userId}/posts`);
      setUserPosts([]);
      alert('All posts deleted successfully');
    } catch (err) {
      console.error('Error deleting posts:', err);
      alert('Failed to delete posts');
    }
  };

  const handleViewPost = (post: FlaggedPost) => {
    navigate(`/admin/flagged/${post._id}`, { state: { post } });
  };

  // Simple polarity label
  const polarityLabel = user ? ((user.masculineFeminineScale ?? 0) > 0 ? '☀️ Yang' : '🌙 Yin') : '';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-purple" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <Button variant="ghost" onClick={() => navigate('/admin/users')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Users
        </Button>
        <div className="text-center py-12">
          <p className="text-text-secondary">{error || 'User not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Back button */}
      <Button
        variant="ghost"
        onClick={() => navigate('/admin/users')}
        className="mb-4"
        data-testid="back-to-users"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Users
      </Button>

      {/* User Profile Card */}
      <Card className="mb-6" data-testid="user-detail-header">
        <CardContent className="p-6 bg-white dim:bg-gray-800 dark:bg-gray-900">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            {user.profilePictureUrl ? (
              <img
                src={user.profilePictureUrl}
                alt={user.userName}
                className="h-24 w-24 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary-100 text-4xl font-semibold text-primary-700">
                {user.userName.charAt(0).toUpperCase()}
              </div>
            )}

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1
                  className="text-2xl font-bold text-gray-900 dim:text-gray-100 dark:text-gray-100"
                  data-testid="user-detail-username"
                >
                  {user.userName}
                </h1>
                {user.isOnline && (
                  <div className="h-3 w-3 rounded-full bg-success-500" title="Online" />
                )}
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                {user.mbtiPersonality && (
                  <Badge variant="default" size="md">
                    {user.mbtiPersonality}
                  </Badge>
                )}
                <Badge variant="brand" size="md">
                  {polarityLabel}
                </Badge>
                {user.isBanned && (
                  <Badge variant="error" size="md" data-testid="user-banned-badge">
                    BANNED {user.bannedAt && `since ${formatRelativeTime(user.bannedAt)}`}
                  </Badge>
                )}
              </div>

              {user.bio && (
                <p className="mt-3 text-gray-600 dim:text-gray-400 dark:text-gray-400">
                  {user.bio}
                </p>
              )}

              {/* User Stats Grid */}
              <div
                className="mt-4 grid grid-cols-2 gap-4 text-sm"
                data-testid="user-activity-summary"
              >
                <div>
                  <span className="text-gray-500 dim:text-gray-400 dark:text-gray-400">
                    User ID:
                  </span>
                  <span className="ml-2 font-mono text-gray-900 dim:text-gray-100 dark:text-gray-100">
                    {user.userId}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dim:text-gray-400 dark:text-gray-400">
                    Pigeon ID:
                  </span>
                  <span
                    className="ml-2 font-mono text-gray-900 dim:text-gray-100 dark:text-gray-100"
                    data-testid="user-detail-pigeon-id"
                  >
                    {user.pigeonId}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dim:text-gray-400 dark:text-gray-400">
                    Joined:
                  </span>
                  <span className="ml-2 text-gray-900 dim:text-gray-100 dark:text-gray-100">
                    {formatRelativeTime(user.createdAt)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dim:text-gray-400 dark:text-gray-400">Posts:</span>
                  <span className="ml-2 font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100">
                    {user.postCount || 0}
                  </span>
                </div>
                {user.flaggedPostCount && user.flaggedPostCount > 0 && (
                  <div>
                    <span className="text-gray-500 dim:text-gray-400 dark:text-gray-400">
                      Flagged Posts:
                    </span>
                    <Badge variant="warning" size="sm" className="ml-2">
                      {user.flaggedPostCount}
                    </Badge>
                  </div>
                )}
                {user.lastActive && !user.isOnline && (
                  <div>
                    <span className="text-gray-500 dim:text-gray-400 dark:text-gray-400">
                      Last Active:
                    </span>
                    <span className="ml-2 text-gray-900 dim:text-gray-100 dark:text-gray-100">
                      {formatRelativeTime(user.lastActive)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions Card */}
      <Card className="mb-6">
        <CardContent className="p-4 bg-white dim:bg-gray-800 dark:bg-gray-900">
          <h2 className="text-lg font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100 mb-4">
            Actions
          </h2>
          <div className="flex flex-wrap gap-3">
            <Button
              variant={user.isBanned ? 'outline' : 'destructive'}
              onClick={handleToggleBan}
              data-testid="toggle-ban-button"
            >
              {user.isBanned ? 'Unban User' : 'Ban User'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowRegenerateSection(!showRegenerateSection)}
              data-testid="regenerate-password-button"
            >
              {showRegenerateSection ? 'Hide Password Section' : 'Regenerate Password'}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(`/admin/users/${user.userId}/posts`, { state: { user } })}
            >
              View All Posts
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAllPosts}
              data-testid="delete-all-posts-button"
            >
              Delete All Posts
            </Button>
            <Button
              variant="ghost"
              onClick={handleDeleteUser}
              data-testid="soft-delete-user-button"
            >
              Delete User
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Posts Section */}
      <Card>
        <CardContent
          className="p-4 bg-white dim:bg-gray-800 dark:bg-gray-900"
          data-testid="user-posts-section"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100">
              Recent Posts ({userPosts.length})
            </h2>
            {userPosts.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/admin/users/${user.userId}/posts`, { state: { user } })}
              >
                View All →
              </Button>
            )}
          </div>

          {userPosts.length === 0 && (
            <p className="text-center py-8 text-gray-500 dim:text-gray-400 dark:text-gray-400">
              No posts yet
            </p>
          )}

          {userPosts.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {userPosts
                .filter((post) => post.image) // Filter out posts without images (comments)
                .slice(0, 8)
                .map((post) => {
                  const imageUrl = post.image.startsWith('http')
                    ? post.image
                    : `${import.meta.env.VITE_CDN_URL}/${post.image}`;

                  return (
                    <button
                      type="button"
                      key={post._id}
                      className="group relative aspect-square overflow-hidden rounded-lg cursor-pointer text-left"
                      onClick={() => handleViewPost(post)}
                    >
                      <img
                        src={imageUrl}
                        alt={post.text || 'Post'}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />

                      {/* Overlay with caption - always visible */}
                      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 to-transparent p-3">
                        {post.text && (
                          <p className="line-clamp-2 text-sm text-white">{post.text}</p>
                        )}
                        <div className="mt-2 flex items-center gap-2 text-xs text-white/80">
                          <span>❤️ {post.proximal_likes || 0}</span>
                          {(post.proximal_dislikes || 0) > 0 && (
                            <span className="text-red-300">💔 {post.proximal_dislikes}</span>
                          )}
                        </div>
                      </div>

                      {post.isHidden && (
                        <div className="absolute right-2 top-2">
                          <Badge variant="error" size="sm">
                            HIDDEN
                          </Badge>
                        </div>
                      )}
                    </button>
                  );
                })}
            </div>
          )}

          {userPosts.length > 8 && (
            <div className="mt-4 text-center">
              <Button
                variant="outline"
                onClick={() => navigate(`/admin/users/${user.userId}/posts`, { state: { user } })}
              >
                View All {userPosts.length} Posts
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Password Regeneration Section */}
      {showRegenerateSection && (
        <Card>
          <CardHeader>
            <CardTitle>Regenerate Password</CardTitle>
          </CardHeader>
          <CardContent>
            <PigeonIdRegenerator
              userId={user.userId}
              userName={user.userName}
              context="admin"
              isOnline={true}
              onSuccess={() => {
                console.log('Password regenerated for user:', user.userName);
                // Optionally auto-hide after successful regeneration
                setTimeout(() => setShowRegenerateSection(false), 5000);
              }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
