/**
 * SearchPage - Global text-based search for posts
 * Following Zen principles: Clean, simple, transparent
 */

import { Search, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout';
import { PostCard } from '@/features/posts';
import { searchPosts } from '@/features/posts/api/postService';
import type { Post } from '@/features/posts/types';

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Debounce search query (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Zen: Wait 1 second before showing loading spinner
  useEffect(() => {
    if (!isLoading) {
      setShowLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      setShowLoading(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isLoading]);

  // Execute search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim().length === 0) {
      setPosts([]);
      setHasSearched(false);
      return;
    }

    const performSearch = async () => {
      setIsLoading(true);
      setPage(1);

      try {
        const response = await searchPosts(debouncedQuery, 1, 20);
        setPosts(response.posts);
        setHasMore(response.pagination.hasMore);
        setHasSearched(true);
      } catch (error) {
        // Zen: Console log only, never show errors to user
        console.error('Search error:', error);
        setPosts([]);
        setHasSearched(true);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery]);

  // Load more posts (pagination)
  const loadMore = async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);

    try {
      const nextPage = page + 1;
      const response = await searchPosts(debouncedQuery, nextPage, 20);
      setPosts((prev) => [...prev, ...response.posts]);
      setPage(nextPage);
      setHasMore(response.pagination.hasMore);
    } catch (error) {
      console.error('Load more error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setPosts([]);
    setHasSearched(false);
    setPage(1);
    setHasMore(false);
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Search Input */}
        <div className="relative mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search posts..."
              className="w-full pl-12 pr-12 py-3 rounded-xl border border-surface-border bg-surface-elevated text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent transition-all"
              autoFocus
            />
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-surface-hover transition-colors"
                aria-label="Clear search"
              >
                <X className="w-5 h-5 text-text-secondary" />
              </button>
            )}
          </div>
        </div>

        {/* Zen: Show loading only after 1 second */}
        {isLoading && showLoading && (
          <div className="flex justify-center py-12 animate-in fade-in duration-300">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple" />
          </div>
        )}

        {/* Zen: Show nothing when no results (transparency) */}
        {!isLoading && hasSearched && posts.length === 0 && null}

        {/* Results */}
        {posts.length > 0 && (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}

            {/* Load More */}
            {hasMore && (
              <button
                type="button"
                onClick={loadMore}
                disabled={isLoading}
                className="w-full py-3 text-brand-purple font-medium hover:bg-surface-hover rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Loading...' : 'Load more'}
              </button>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
