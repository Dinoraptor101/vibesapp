/**
 * ProfilePage - User profile (read-only public view)
 */

import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout';
import { Button, Spinner } from '@/components/ui-next';
import { useAuth } from '@/features/auth';
import { DMRequestModal } from '@/features/messaging/components/DMRequestModal';
import { ProfileHeader } from '@/features/profile/components/ProfileHeader';
import { ProfilePosts } from '@/features/profile/components/ProfilePosts';
import { ProfileStats } from '@/features/profile/components/ProfileStats';
import { useProfile } from '@/features/profile/hooks/useProfile';

export function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const [showDMModal, setShowDMModal] = useState(false);
  const [showLoading, setShowLoading] = useState(false);

  const { data: profile, isLoading, isError, error } = useProfile(userId);

  // ZEN: Wait 1 second before showing loading spinner (avoid flash)
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => setShowLoading(true), 1000);
      return () => clearTimeout(timer);
    } else {
      setShowLoading(false);
    }
  }, [isLoading]);

  // ZEN: Log errors to console only, never show to user
  useEffect(() => {
    if (isError && error) {
      console.error('Profile fetch error:', error);
    }
  }, [isError, error]);

  const isOwnProfile = currentUser?._id === userId;

  // ZEN: Show loading only after 1 second delay (avoid flash for fast loads)
  if (isLoading && showLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        </div>
      </AppLayout>
    );
  }

  // ZEN: If no profile data, show nothing (Transparency)
  if (!profile) {
    return null;
  }

  return (
    <AppLayout>
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ArrowLeft size={16} />}
          onClick={() => window.history.back()}
          className="mb-6"
        >
          Back
        </Button>

        {/* Profile Content */}
        <div className="space-y-8">
          {/* Header */}
          <ProfileHeader
            profile={profile}
            isOwnProfile={isOwnProfile}
            onDMRequest={() => setShowDMModal(true)}
          />

          {/* Stats */}
          <ProfileStats
            postsCount={profile.postsCount}
            followersCount={profile.followersCount}
            followingCount={profile.followingCount}
          />

          {/* Posts Grid */}
          <div>
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Posts</h2>
            {userId && <ProfilePosts userId={userId} />}
          </div>
        </div>
      </div>

      {/* DM Request Modal */}
      {userId && profile && (
        <DMRequestModal
          userId={userId}
          username={profile.username}
          open={showDMModal}
          onOpenChange={setShowDMModal}
        />
      )}
    </AppLayout>
  );
}
