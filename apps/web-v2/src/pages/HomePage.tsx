/**
 * HomePage - Main feed with integrated search
 * Shows posts from followed users and nearby, with search capability
 */

import { useState } from 'react';
import { AppLayout } from '@/components/layout';
import { PostsFeed, SearchBar } from '@/features/posts';

/**
 * Page content without layout wrapper (for persistent pages)
 */
export function HomePageContent() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div>
      {/* Search Bar - Always visible on desktop, integrated into feed */}
      <div className="pb-4">
        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search posts..." />
      </div>

      {/* Posts Feed - Shows search results when query present, normal feed otherwise */}
      <PostsFeed searchQuery={searchQuery} />
    </div>
  );
}

/**
 * Full page with layout wrapper (for standalone routing)
 */
export function HomePage() {
  return (
    <AppLayout>
      <HomePageContent />
    </AppLayout>
  );
}
