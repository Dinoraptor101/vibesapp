import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatRelativeTime } from '@/lib/utils';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import type { AdminUser, FlaggedPost } from '../../../types';

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AdminUser | null;
  onBanToggle: (userId: string) => void;
  onRegeneratePassword: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
  onDeleteAllPosts: (userId: string) => void;
}

export function UserDetailModal({
  isOpen,
  onClose,
  user,
  onBanToggle,
  onRegeneratePassword,
  onDeleteUser,
  onDeleteAllPosts,
}: UserDetailModalProps) {
  const [userPosts, setUserPosts] = useState<FlaggedPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !user) return;

    const fetchUserPosts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = (await api.get(`/admin/users/${user.userId}/posts`)) as {
          success: boolean;
          posts: FlaggedPost[];
        };
        setUserPosts(response.posts || []);
      } catch (err) {
        console.error('Error fetching user posts:', err);
        setError('Failed to load user posts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserPosts();
  }, [isOpen, user]);

  if (!user) return null;

  // Calculate polarity
  const polarityPercent = user.masculineFeminineScale
    ? Math.round((user.masculineFeminineScale + 50) * 100) / 100
    : 50;
  const polarityLabel =
    polarityPercent > 50
      ? `${polarityPercent}% Yang (Masculine)`
      : `${100 - polarityPercent}% Yin (Feminine)`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Profile */}
          <div className="flex items-start gap-4">
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

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-gray-900">{user.userName}</h2>
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
                  <Badge variant="error" size="md">
                    BANNED {user.bannedAt && `since ${formatRelativeTime(user.bannedAt)}`}
                  </Badge>
                )}
              </div>

              {user.bio && <p className="mt-3 text-gray-600">{user.bio}</p>}

              <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">User ID:</span>
                  <span className="ml-2 font-mono text-gray-900">{user.userId}</span>
                </div>
                <div>
                  <span className="text-gray-500">Pigeon ID:</span>
                  <span className="ml-2 font-mono text-gray-900">{user.pigeonId}</span>
                </div>
                <div>
                  <span className="text-gray-500">Joined:</span>
                  <span className="ml-2 text-gray-900">{formatRelativeTime(user.createdAt)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Posts:</span>
                  <span className="ml-2 font-semibold text-gray-900">{user.postCount || 0}</span>
                </div>
                {user.flaggedPostCount && user.flaggedPostCount > 0 && (
                  <div>
                    <span className="text-gray-500">Flagged Posts:</span>
                    <Badge variant="warning" size="sm" className="ml-2">
                      {user.flaggedPostCount}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 border-t border-gray-200 pt-4">
            <Button
              variant={user.isBanned ? 'outline' : 'destructive'}
              onClick={() => onBanToggle(user.userId)}
            >
              {user.isBanned ? 'Unban User' : 'Ban User'}
            </Button>
            <Button variant="outline" onClick={() => onRegeneratePassword(user.userId)}>
              Regenerate Password
            </Button>
            <Button variant="destructive" onClick={() => onDeleteAllPosts(user.userId)}>
              Delete All Posts
            </Button>
            <Button variant="ghost" onClick={() => onDeleteUser(user.userId)}>
              Delete User
            </Button>
          </div>

          {/* User Posts */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Posts ({userPosts.length})</h3>

            {isLoading && <p className="text-center text-gray-500">Loading posts...</p>}

            {error && <p className="text-center text-error-600">{error}</p>}

            {!isLoading && !error && userPosts.length === 0 && (
              <p className="text-center text-gray-500">No posts yet</p>
            )}

            {!isLoading && !error && userPosts.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                {userPosts.map((post) => (
                  <div
                    key={post._id}
                    className="group relative aspect-square overflow-hidden rounded-lg"
                  >
                    <img
                      src={post.image}
                      alt={post.text || 'Post'}
                      className="h-full w-full object-cover"
                    />

                    {/* Overlay with post info */}
                    <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
                      {post.text && <p className="line-clamp-2 text-sm text-white">{post.text}</p>}
                      <div className="mt-2 flex items-center gap-2 text-xs text-white/80">
                        <span>👍 {post.proximal_likes}</span>
                        {post.proximal_dislikes > 0 && (
                          <span className="text-error-300">👎 {post.proximal_dislikes}</span>
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
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
