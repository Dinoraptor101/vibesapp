import { formatRelativeTime } from '@/lib/utils';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import type { AdminUser } from '../../../types';

interface UserCardProps {
  user: AdminUser;
  onViewDetails: (user: AdminUser) => void;
  onToggleBan: (userId: string) => void;
  isSelected?: boolean;
  onSelect?: (userId: string) => void;
}

export function UserCard({
  user,
  onViewDetails,
  onToggleBan,
  isSelected = false,
  onSelect,
}: UserCardProps) {
  // Calculate polarity percentage
  const polarityPercent = user.masculineFeminineScale
    ? Math.round((user.masculineFeminineScale + 50) * 100) / 100
    : 50;
  const polarityLabel =
    polarityPercent > 50
      ? `${polarityPercent}% Yang (Masculine)`
      : `${100 - polarityPercent}% Yin (Feminine)`;

  return (
    <Card className="relative">
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
                <h3 className="truncate text-lg font-semibold text-gray-900">{user.userName}</h3>

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
                    <Badge variant="error" size="sm">
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
            <div className="mt-4 flex gap-2">
              <Button variant="primary" size="sm" onClick={() => onViewDetails(user)}>
                View Details
              </Button>
              <Button
                variant={user.isBanned ? 'outline' : 'destructive'}
                size="sm"
                onClick={() => onToggleBan(user.userId)}
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
