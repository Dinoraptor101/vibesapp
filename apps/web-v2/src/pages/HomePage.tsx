/**
 * HomePage - Main feed with integrated search
 * Shows posts from followed users and nearby, with search capability
 */

import { useState } from 'react';
import { AppLayout } from '@/components/layout';
import { PostsFeed, SearchBar } from '@/features/posts';

export function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        {/* Search Bar - Always visible on desktop, integrated into feed */}
        <div className="px-4 pt-6 pb-4">
          <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search posts..." />
        </div>

        {/* Posts Feed - Shows search results when query present, normal feed otherwise */}
        <PostsFeed searchQuery={searchQuery} />
      </div>
    </AppLayout>
  );
}
