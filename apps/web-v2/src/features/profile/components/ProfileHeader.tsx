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
  dmStatus?: 'connected' | 'pending' | 'received' | 'none';
  postsCount: number;
  followersCount: number;
  followingCount: number;
}

export function ProfileHeader({
  profile,
  isOwnProfile,
  onDMRequest,
  dmStatus,
  postsCount,
  followersCount,
  followingCount,
}: ProfileHeaderProps) {
  // Determine button text and state
  const getMessageButtonProps = () => {
    if (dmStatus === 'pending') {
      return {
        text: 'Requested',
        disabled: true,
      };
    }
    return {
      text: 'Message',
      disabled: false,
    };
  };

  const messageButtonProps = getMessageButtonProps();

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

          {/* Distance & Stats */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500 dim:text-gray-450 dark:text-gray-400">
            {profile.distance && (
              <>
                <div className="flex items-center gap-1">
                  <MapPin size={14} />
                  <span>{profile.distance}</span>
                </div>
                <span className="text-gray-400">•</span>
              </>
            )}
            <span>{postsCount} posts</span>
            <span className="text-gray-400">•</span>
            <span>{followersCount} followers</span>
            <span className="text-gray-400">•</span>
            <span>{followingCount} following</span>
          </div>

          {/* Action Buttons */}
          {!isOwnProfile && (
            <div className="flex gap-2">
              <FollowButton userId={profile.userId} isFollowing={profile.isFollowing} />
              <Button
                variant="outline"
                size="md"
                leftIcon={<MessageCircle size={16} />}
                onClick={onDMRequest}
                disabled={messageButtonProps.disabled}
              >
                {messageButtonProps.text}
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
