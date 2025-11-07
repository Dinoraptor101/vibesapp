/**
 * ProfilePage - User profile
 */

import { useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout';

export function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold text-text-primary mb-4">Profile</h1>
        <p className="text-text-secondary">User profile for {userId} coming soon...</p>
      </div>
    </AppLayout>
  );
}
