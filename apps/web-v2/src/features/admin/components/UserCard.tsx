import { formatRelativeTime } from '@/lib/utils';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import type { AdminUser } from '../../../types';

interface UserCardProps {
  user: AdminUser;
  onViewDetails: (user: AdminUser) => void;
  onToggleBan: (userId: string) => void;
  onViewPosts?: (user: AdminUser) => void;
  isSelected?: boolean;
  onSelect?: (userId: string) => void;
}

export function UserCard({
  user,
  onViewDetails,
  onToggleBan,
  onViewPosts,
  isSelected = false,
  onSelect,
}: UserCardProps) {
  // Simple polarity label - it's a toggle, not a ratio
  // masculineFeminineScale > 0 means Yang, <= 0 means Yin
  const polarityLabel = (user.masculineFeminineScale ?? 0) > 0 ? '☀️ Yang' : '🌙 Yin';

  return (
    <Card className="relative" data-testid={`user-card-${user.userId}`}>
      {onSelect && (
        <div className="absolute top-4 left-4 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(user.userId)}
            className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
        </div>
      )}

      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
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

            {/* Online indicator */}
            {user.isOnline && (
              <div className="absolute -mt-3 ml-12">
                <div className="h-4 w-4 rounded-full border-2 border-white bg-success-500" />
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3
                  className="truncate text-lg font-semibold text-gray-900"
                  data-testid="user-username"
                >
                  {user.userName}
                </h3>
                <p className="text-xs text-gray-500 font-mono" data-testid="user-pigeon-id">
                  {user.pigeonId}
                </p>

                <div className="mt-1 flex flex-wrap items-center gap-2">
                  {user.mbtiPersonality && (
                    <Badge variant="default" size="sm">
                      {user.mbtiPersonality}
                    </Badge>
                  )}
                  <Badge variant="brand" size="sm">
                    {polarityLabel}
                  </Badge>
                  {user.isBanned && (
                    <Badge variant="error" size="sm" data-testid="user-banned-badge">
                      BANNED
                    </Badge>
                  )}
                  {user.flaggedPostCount && user.flaggedPostCount > 0 && (
                    <Badge variant="warning" size="sm">
                      {user.flaggedPostCount} Flagged{' '}
                      {user.flaggedPostCount === 1 ? 'Post' : 'Posts'}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Bio */}
            {user.bio && <p className="mt-2 line-clamp-2 text-sm text-gray-600">{user.bio}</p>}

            {/* Stats */}
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">
              <span>
                <strong className="font-semibold text-gray-700">{user.postCount || 0}</strong> posts
              </span>
              <span>Joined {formatRelativeTime(user.createdAt)}</span>
              {user.lastActive && !user.isOnline && (
                <span>Last active {formatRelativeTime(user.lastActive)}</span>
              )}
            </div>

            {/* Actions */}
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => onViewDetails(user)}
                data-testid="view-user-details-button"
              >
                View Details
              </Button>
              {onViewPosts && (
                <Button variant="outline" size="sm" onClick={() => onViewPosts(user)}>
                  View Posts
                </Button>
              )}
              <Button
                variant={user.isBanned ? 'outline' : 'destructive'}
                size="sm"
                onClick={() => onToggleBan(user.userId)}
                data-testid="toggle-ban-button"
                data-banned={user.isBanned}
              >
                {user.isBanned ? 'Unban' : 'Ban User'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
