/**
 * ProfilePage - User profile (read-only public view)
 */

import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout';
import { Button, Spinner } from '@/components/ui-next';
import { useAuth } from '@/features/auth';
import { useDMRequestStatus } from '@/features/messaging/hooks/useDMRequestStatus';
import { ProfileHeader } from '@/features/profile/components/ProfileHeader';
import { ProfilePosts } from '@/features/profile/components/ProfilePosts';
import { useProfile } from '@/features/profile/hooks/useProfile';

export function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [showLoading, setShowLoading] = useState(false);

  const { data: profile, isLoading, isError, error } = useProfile(userId);
  const { data: dmStatus } = useDMRequestStatus(userId);

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

  const isOwnProfile = currentUser?.userId === userId;

  // Handle Message button click
  const handleMessageClick = () => {
    // If already connected, navigate to conversation
    if (dmStatus?.reason === 'connected' && dmStatus.conversationId) {
      navigate(`/messages/${dmStatus.conversationId}`);
      return;
    }

    // If they sent you a request, show message to check DM Requests tab
    if (dmStatus?.reason === 'received') {
      // TODO: Show toast or alert
      console.log('This user has sent you a request. Check your DM Requests tab.');
      navigate('/messages?tab=requests');
      return;
    }

    // If you sent a request, show it's pending
    if (dmStatus?.reason === 'pending') {
      // TODO: Show toast
      console.log('Your request is pending');
      return;
    }

    // Otherwise, show DM request page
    navigate(`/dm-request/${userId}`);
  };

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
            onDMRequest={handleMessageClick}
            dmStatus={dmStatus?.reason}
            postsCount={profile.postsCount}
            followersCount={profile.followersCount}
            followingCount={profile.followingCount}
          />

          {/* Posts Grid */}
          <div>
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dim:text-gray-100 dark:text-white">
              Posts
            </h2>
            {userId && <ProfilePosts userId={userId} />}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
