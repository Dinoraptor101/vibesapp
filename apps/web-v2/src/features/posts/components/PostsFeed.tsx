/**
 * PostsFeed Component
 *
 * Main feed container with infinite scroll, filtering, and real-time updates.
 * Displays a scrollable list of posts with loading states and error handling.
 * Supports search mode to display global search results.
 */

import { AlertCircle, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui-next';
import { searchPosts } from '../api/postService';
import { useDeletePost } from '../hooks/useDeletePost';
import { useInfinitePosts } from '../hooks/useInfinitePosts';
import { usePostFilters } from '../hooks/usePostFilters';
import type { Post } from '../types';
import { FilterBar } from './FilterBar';
import { PostsGrid } from './PostsGrid';
import { PostSkeleton } from './PostSkeleton';

interface PostsFeedProps {
  className?: string;
  searchQuery?: string;
}

export function PostsFeed({ className, searchQuery }: PostsFeedProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Search state
  const [searchResults, setSearchResults] = useState<Post[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchPage, setSearchPage] = useState(1);
  const [searchHasMore, setSearchHasMore] = useState(false);
  const [showSearchLoading, setShowSearchLoading] = useState(false);

  // Filter state (tab-based) - only used when NOT searching
  const { filters, activeTab, setActiveTab, isFiltering, hasLocation } = usePostFilters();

  // Posts data with infinite scroll - only used when NOT searching
  const {
    posts,
    isLoading,
    isError,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
    toggleLike,
  } = useInfinitePosts({ filters: filters });

  const isSearchMode = searchQuery && searchQuery.trim().length > 0;

  // Zen: Wait 1 second before showing loading spinner (search mode)
  useEffect(() => {
    if (!searchLoading) {
      setShowSearchLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      setShowSearchLoading(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchLoading]);

  // Execute search when query changes
  useEffect(() => {
    if (!isSearchMode) {
      setSearchResults([]);
      setSearchPage(1);
      setSearchHasMore(false);
      return;
    }

    const performSearch = async () => {
      setSearchLoading(true);
      setSearchPage(1);

      try {
        const response = await searchPosts(searchQuery, 1, 20);
        setSearchResults(response.posts);
        setSearchHasMore(response.pagination.hasMore);
      } catch (err) {
        // Zen: Console log only, never show to user
        console.error('Search error:', err);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    };

    performSearch();
  }, [searchQuery, isSearchMode]);

  // Load more search results
  const loadMoreSearchResults = useCallback(async () => {
    if (!isSearchMode || !searchQuery || searchLoading || !searchHasMore) return;

    setSearchLoading(true);

    try {
      const nextPage = searchPage + 1;
      const response = await searchPosts(searchQuery, nextPage, 20);
      setSearchResults((prev) => [...prev, ...response.posts]);
      setSearchPage(nextPage);
      setSearchHasMore(response.pagination.hasMore);
    } catch (err) {
      console.error('Load more search error:', err);
    } finally {
      setSearchLoading(false);
    }
  }, [isSearchMode, searchQuery, searchLoading, searchHasMore, searchPage]);

  // Infinite scroll observer (for both normal feed and search)
  useEffect(() => {
    if (!loadMoreRef.current) return;

    // Different logic for search vs normal feed
    const shouldLoadMore = isSearchMode
      ? searchHasMore && !searchLoading
      : hasNextPage && !isFetchingNextPage;

    if (!shouldLoadMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          if (isSearchMode) {
            loadMoreSearchResults();
          } else if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [
    isSearchMode,
    searchHasMore,
    searchLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    loadMoreSearchResults,
  ]);

  // Handle comment navigation
  const handleComment = (postId: string) => {
    // TODO: Navigate to post detail page or open comment modal
    console.log('Comment on post:', postId);
  };

  // Handle report
  const handleReport = (postId: string) => {
    navigate(`/report/${postId}`);
  };

  // Handle delete
  const { mutate: deletePost } = useDeletePost();
  const handleDelete = (postId: string) => {
    deletePost(postId);
  };

  // SEARCH MODE RENDERING
  if (isSearchMode) {
    // Zen: Show loading only after 1 second
    if (searchLoading && showSearchLoading) {
      return (
        <div className={className}>
          <div className="flex justify-center py-12 animate-in fade-in duration-300">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple" />
          </div>
        </div>
      );
    }

    // Zen: Show nothing when no results (transparency)
    if (!searchLoading && searchResults.length === 0) {
      return null;
    }

    // Search results
    return (
      <div className={className}>
        {/* Posts Grid */}
        <PostsGrid
          posts={searchResults}
          onLike={toggleLike}
          onReport={handleReport}
          onDelete={handleDelete}
          onComment={handleComment}
        />

        {/* Load more trigger */}
        <div ref={loadMoreRef} className="py-4">
          {searchLoading && (
            <div className="flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-brand-purple" />
            </div>
          )}
          {!searchHasMore && searchResults.length > 0 && (
            <div className="flex justify-center py-4">
              <div className="w-32 h-px bg-border opacity-50" />
            </div>
          )}
        </div>
      </div>
    );
  }

  // NORMAL FEED MODE RENDERING
  // Error state
  if (isError) {
    return (
      <div className={className}>
        <FilterBar activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">Failed to load posts</h2>
          <p className="text-text-secondary text-center mb-4">
            {error?.message || 'Something went wrong. Please try again.'}
          </p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      </div>
    );
  }

  // Loading state (initial load) OR location being determined for nearby tab
  if (isLoading || (activeTab === 'nearby' && !hasLocation)) {
    return (
      <div className={className}>
        <FilterBar activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="space-y-4">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      </div>
    );
  }

  // Empty state
  if (posts.length === 0) {
    return (
      <div className={className}>
        <FilterBar activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-6xl mb-4">🕊️</div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">No posts yet</h2>
          <p className="text-text-secondary text-center">
            {isFiltering
              ? 'Try adjusting your filters to see more posts.'
              : 'Be the first to share something!'}
          </p>
        </div>
      </div>
    );
  }

  // Posts list
  return (
    <div className={className}>
      <FilterBar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Posts Grid */}
      <PostsGrid
        posts={posts}
        onLike={toggleLike}
        onReport={handleReport}
        onDelete={handleDelete}
        onComment={handleComment}
      />

      {/* Load more trigger */}
      <div ref={loadMoreRef} className="py-4">
        {isFetchingNextPage && (
          <div className="flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-brand-purple" />
          </div>
        )}
        {!hasNextPage && posts.length > 0 && (
          <div className="flex justify-center py-4">
            <div className="w-32 h-px bg-border opacity-50" />
          </div>
        )}
      </div>
    </div>
  );
}
