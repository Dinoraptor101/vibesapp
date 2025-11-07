/**
 * UserBadge Component
 *
 * Compact user information display with avatar, username, MBTI, and location.
 * Used in posts, comments, and activity feeds.
 */

import { MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Avatar, Badge } from '@/components/ui-next';
import type { PostUser } from '../types';

interface UserBadgeProps {
  user: PostUser;
  showLocation?: boolean;
  showMBTI?: boolean;
  size?: 'sm' | 'md';
  clickable?: boolean;
}

export function UserBadge({
  user,
  showLocation = true,
  showMBTI = true,
  size = 'md',
  clickable = true,
}: UserBadgeProps) {
  const avatarSize = size === 'sm' ? 'sm' : 'md';
  const textSize = size === 'sm' ? 'text-sm' : 'text-base';

  const content = (
    <div className="flex items-center gap-3">
      {/* Avatar */}
      <Avatar name={user.userName} size={avatarSize} />

      {/* User info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Username */}
          <span className={`${textSize} font-semibold text-text-primary truncate`}>
            @{user.userName}
          </span>

          {/* MBTI Badge */}
          {showMBTI && user.mbtiPersonality && (
            <Badge variant="default" size="sm">
              {user.mbtiPersonality}
            </Badge>
          )}
        </div>

        {/* Location */}
        {showLocation && user.location.city && (
          <div className="flex items-center gap-1 text-text-tertiary text-xs mt-0.5">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{user.location.city}</span>
          </div>
        )}
      </div>
    </div>
  );

  if (!clickable) {
    return content;
  }

  return (
    <Link to={`/profile/${user.userId}`} className="block hover:opacity-80 transition-opacity">
      {content}
    </Link>
  );
}
