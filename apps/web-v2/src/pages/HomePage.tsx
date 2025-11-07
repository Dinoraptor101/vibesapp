/**
 * HomePage - Main feed
 * Shows posts from followed users and nearby
 */

import { AppLayout } from '@/components/layout';

export function HomePage() {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold text-text-primary mb-4">Home Feed</h1>
        <p className="text-text-secondary">Post feed coming soon in Phase 3...</p>
      </div>
    </AppLayout>
  );
}
