/**
 * ProfilePage - User profile (read-only public view)
 */

import { AlertCircle, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Spinner,
} from '@/components/ui-next';
import { useAuth } from '@/features/auth';
import { ProfileHeader } from '@/features/profile/components/ProfileHeader';
import { ProfilePosts } from '@/features/profile/components/ProfilePosts';
import { ProfileStats } from '@/features/profile/components/ProfileStats';
import { useProfile } from '@/features/profile/hooks/useProfile';

export function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const [showDMModal, setShowDMModal] = useState(false);

  const { data: profile, isLoading, isError, error, refetch } = useProfile(userId);

  const isOwnProfile = currentUser?._id === userId;

  // Loading state
  if (isLoading) {
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

  // Error state
  if (isError || !profile) {
    return (
      <AppLayout>
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <AlertCircle className="h-12 w-12 text-red-500" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Failed to load profile
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {error instanceof Error ? error.message : 'User not found'}
              </p>
            </div>
            <Button variant="outline" onClick={() => refetch()}>
              Try Again
            </Button>
          </div>
        </div>
      </AppLayout>
    );
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

      {/* DM Request Modal (Placeholder for Phase 4.3) */}
      <Dialog open={showDMModal} onOpenChange={setShowDMModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Direct Message</DialogTitle>
            <DialogDescription>
              DM functionality is coming in Phase 4.3! This is a placeholder for the DM request
              system.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setShowDMModal(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
