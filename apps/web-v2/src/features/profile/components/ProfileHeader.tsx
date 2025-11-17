/**
 * ProfileHeader Component
 * Displays user profile information including avatar, bio, MBTI, polarity, location
 */

import { MapPin, MessageCircle } from 'lucide-react';
import { Avatar, Badge, Button } from '@/components/ui-next';
import { getAvatarUrl } from '@/lib/avatarUtils';
import type { ProfileData } from '../hooks/useProfile';
import { FollowButton } from './FollowButton';

interface ProfileHeaderProps {
  profile: ProfileData;
  isOwnProfile: boolean;
  onDMRequest: () => void;
}

export function ProfileHeader({ profile, isOwnProfile, onDMRequest }: ProfileHeaderProps) {
  return (
    <div className="space-y-6">
      {/* Avatar and Basic Info */}
      <div className="flex items-start gap-4">
        <Avatar
          src={getAvatarUrl(profile.profilePictureUrl)}
          alt={profile.username}
          name={profile.username}
          size="xl"
        />

        <div className="flex-1 space-y-2">
          {/* Username and Age */}
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dim:text-gray-100 dark:text-white">
              @{profile.username}
            </h1>
            {profile.age && (
              <span className="text-sm text-gray-500 dim:text-gray-450 dark:text-gray-400">
                Age: {profile.age}
              </span>
            )}
          </div>

          {/* MBTI + Polarity (on same line per spec) */}
          <div className="flex items-center gap-2">
            {profile.mbtiPersonality && <Badge variant="brand">{profile.mbtiPersonality}</Badge>}
            {profile.polarity && (
              <span className="text-sm font-medium text-gray-600 dim:text-gray-400 dark:text-gray-400">
                • {profile.polarity.toUpperCase()}
              </span>
            )}
          </div>

          {/* Distance */}
          {profile.distance && (
            <div className="flex items-center gap-1 text-sm text-gray-600 dim:text-gray-400 dark:text-gray-400">
              <MapPin size={16} />
              <span>{profile.distance}</span>
            </div>
          )}

          {/* Action Buttons */}
          {!isOwnProfile && (
            <div className="flex gap-2">
              <FollowButton userId={profile._id} isFollowing={profile.isFollowing} />
              <Button
                variant="outline"
                size="md"
                leftIcon={<MessageCircle size={16} />}
                onClick={onDMRequest}
              >
                Message
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Bio */}
      {profile.bio && (
        <div className="rounded-lg bg-gray-50 dim:bg-gray-700 dark:bg-gray-800 p-4">
          <p className="whitespace-pre-wrap text-gray-700 dim:text-gray-200 dark:text-gray-300">
            {profile.bio}
          </p>
        </div>
      )}
    </div>
  );
}
