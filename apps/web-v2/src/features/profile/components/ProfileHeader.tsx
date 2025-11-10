/**
 * ProfileHeader Component
 * Displays user profile information including avatar, bio, MBTI, polarity, location
 */

import { MapPin, MessageCircle } from 'lucide-react';
import { Avatar, Badge, Button } from '@/components/ui-next';
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
          src={profile.profilePictureUrl}
          alt={profile.username}
          name={profile.username}
          size="xl"
        />

        <div className="flex-1 space-y-2">
          {/* Username and Age */}
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{profile.username}</h1>
            {profile.age && (
              <span className="text-sm text-gray-500 dark:text-gray-400">Age: {profile.age}</span>
            )}
          </div>

          {/* MBTI Badge */}
          {profile.mbtiPersonality && (
            <div>
              <Badge variant="brand">{profile.mbtiPersonality}</Badge>
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
        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">{profile.bio}</p>
        </div>
      )}

      {/* Additional Info */}
      <div className="space-y-2 text-sm">
        {/* Polarity */}
        {profile.polarity && (
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <span className="font-medium">Polarity:</span>
            <span>{profile.polarity === 'yin' ? 'YIN (Feminine)' : 'YANG (Masculine)'}</span>
          </div>
        )}

        {/* Location (as distance) */}
        {profile.distance && (
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <MapPin size={16} />
            <span>{profile.distance}</span>
          </div>
        )}
      </div>
    </div>
  );
}
