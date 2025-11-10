/**
 * FollowButton Component
 * Follow/Unfollow toggle button with loading state
 */

import { UserCheck, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui-next';
import { useFollow } from '../hooks/useFollow';

interface FollowButtonProps {
  userId: string;
  isFollowing: boolean;
  className?: string;
}

export function FollowButton({ userId, isFollowing, className }: FollowButtonProps) {
  const followMutation = useFollow(userId);

  const handleClick = () => {
    followMutation.mutate();
  };

  const Icon = isFollowing ? UserCheck : UserPlus;

  return (
    <Button
      variant={isFollowing ? 'outline' : 'primary'}
      size="md"
      onClick={handleClick}
      disabled={followMutation.isPending}
      loading={followMutation.isPending}
      leftIcon={<Icon size={16} />}
      className={className}
    >
      {isFollowing ? 'Following' : 'Follow'}
    </Button>
  );
}
