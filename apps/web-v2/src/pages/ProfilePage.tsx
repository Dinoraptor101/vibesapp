/**
 * ProfilePage - User profile (read-only public view)
 */

import { ArrowLeft } from 'lucide-react';
import { memo, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout';
import { Button, PageLoader } from '@/components/ui-next';
import { useAuth } from '@/features/auth';
import { useDMRequestStatus } from '@/features/messaging/hooks/useDMRequestStatus';
import { ProfileHeader } from '@/features/profile/components/ProfileHeader';
import { ProfilePosts } from '@/features/profile/components/ProfilePosts';
import { useProfile } from '@/features/profile/hooks/useProfile';

interface ProfilePageContentProps {
  userId?: string;
}

/**
 * Page content without layout wrapper (for persistent pages)
 * Memoized to prevent unnecessary re-renders when userId stays the same
 */
const ProfilePageContentInner = memo(function ProfilePageContentInner({
  userId: propUserId,
}: ProfilePageContentProps) {
  const { userId: paramUserId } = useParams<{ userId: string }>();
  const userId = propUserId || paramUserId;
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const { data: profile, isLoading, isError, error } = useProfile(userId);
  const { data: dmStatus } = useDMRequestStatus(userId);

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

  // Show nothing if no userId (will show when route doesn't match)
  if (!userId) {
    return null;
  }

  // ZEN: PageLoader includes 1-second delay internally
  if (isLoading) {
    return <PageLoader />;
  }

  // ZEN: If no profile data, show nothing (Transparency)
  if (!profile) {
    return null;
  }

  return (
    <div>
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
  );
});

/**
 * Wrapper that manages userId stability to prevent unnecessary re-renders
 */
export function ProfilePageContent({ userId: propUserId }: ProfilePageContentProps) {
  const { userId: paramUserId } = useParams<{ userId: string }>();
  const userId = propUserId || paramUserId;

  // Use a ref to track the stable userId - only update when it actually changes
  const stableUserIdRef = useRef<string | undefined>(userId);

  // Only update stable userId when it actually changes (not on every render)
  if (userId && userId !== stableUserIdRef.current) {
    stableUserIdRef.current = userId;
  }

  // Pass the stable userId to prevent re-renders
  return <ProfilePageContentInner userId={stableUserIdRef.current} />;
}

/**
 * Full page with layout wrapper (for standalone routing)
 */
export function ProfilePage() {
  return (
    <AppLayout>
      <ProfilePageContent />
    </AppLayout>
  );
}
