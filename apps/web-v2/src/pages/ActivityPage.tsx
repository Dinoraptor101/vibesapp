/**
 * ActivityPage - Notifications and activity feed
 */

import { AppLayout } from '@/components/layout';

export function ActivityPage() {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold text-text-primary mb-4">Activity</h1>
        <p className="text-text-secondary">Activity feed coming soon...</p>
      </div>
    </AppLayout>
  );
}
