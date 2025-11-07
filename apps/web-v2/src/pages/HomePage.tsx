/**
 * HomePage - Main feed
 * Shows posts from followed users and nearby
 */

import { AppLayout } from '@/components/layout';
import { PostsFeed } from '@/features/posts';

export function HomePage() {
  return (
    <AppLayout>
      <PostsFeed className="max-w-2xl mx-auto" />
    </AppLayout>
  );
}
