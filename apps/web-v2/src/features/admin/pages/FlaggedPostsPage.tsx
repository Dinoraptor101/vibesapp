import { CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import api from '@/lib/api';
import type { FlaggedPost } from '@/types';
import { FlaggedPostCard } from '../components/FlaggedPostCard';

type FilterType = 'all' | 'auto-hidden' | 'under-review';
type SortType = 'most-reports' | 'recent' | 'oldest';

function FlaggedPostsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="p-3">
            <div className="flex gap-4">
              <div className="w-32 h-32 bg-surface-2 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-5 bg-surface-2 rounded w-1/3" />
                <div className="h-4 bg-surface-2 rounded w-1/2" />
                <div className="h-4 bg-surface-2 rounded w-2/3" />
                <div className="flex gap-2 mt-4">
                  <div className="h-8 bg-surface-2 rounded w-24" />
                  <div className="h-8 bg-surface-2 rounded w-24" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function FlaggedPostsPage() {
  const navigate = useNavigate();
  const { isOnline } = useNetworkStatus();
  const [posts, setPosts] = useState<FlaggedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('most-reports');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
  const [counts, setCounts] = useState({ all: 0, autoHidden: 0, underReview: 0 });
  const [postsCount, setPostsCount] = useState(0);

  // Fetch counts for all filter categories (independent of current filter)
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // Fetch counts for each filter type
        const [allResponse, autoHiddenResponse, underReviewResponse] = await Promise.all([
          api.get('/admin/reported-posts', { filter: 'all', limit: 1 }) as Promise<{
            pagination: { total: number };
          }>,
          api.get('/admin/reported-posts', { filter: 'auto-hidden', limit: 1 }) as Promise<{
            pagination: { total: number };
          }>,
          api.get('/admin/reported-posts', { filter: 'under-review', limit: 1 }) as Promise<{
            pagination: { total: number };
          }>,
        ]);

        setCounts({
          all: allResponse.pagination.total,
          autoHidden: autoHiddenResponse.pagination.total,
          underReview: underReviewResponse.pagination.total,
        });
      } catch (error) {
        console.error('Error fetching counts:', error);
      }
    };

    fetchCounts();
  }, [postsCount]); // Refetch counts when posts are added/removed

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response = (await api.get('/admin/reported-posts', {
          filter,
          sort,
          page,
          limit: 20,
        })) as {
          success: boolean;
          posts: FlaggedPost[];
          pagination: { total: number; pages: number; page: number; limit: number };
        };

        if (response.success) {
          setPosts(response.posts);
          setTotalPages(response.pagination.pages);
        }
      } catch (error) {
        console.error('Error fetching flagged posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [filter, sort, page]);

  const handleSelectPost = (postId: string) => {
    const newSelected = new Set(selectedPosts);
    if (newSelected.has(postId)) {
      newSelected.delete(postId);
    } else {
      newSelected.add(postId);
    }
    setSelectedPosts(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedPosts.size === posts.length) {
      setSelectedPosts(new Set());
    } else {
      setSelectedPosts(new Set(posts.map((p) => p._id)));
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await api.delete('/admin/posts', { data: { postHexes: [postId] } });
      setPosts(posts.filter((p) => p._id !== postId));
      setSelectedPosts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
      setPostsCount((prev) => prev + 1); // Trigger count refresh
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleDismissReports = async (postId: string) => {
    try {
      await api.post(`/admin/posts/${postId}/dismiss-reports`);
      setPosts(posts.filter((p) => p._id !== postId));
      setSelectedPosts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
      setPostsCount((prev) => prev + 1); // Trigger count refresh
    } catch (error) {
      console.error('Error dismissing reports:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPosts.size === 0) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedPosts.size} post(s)?`
    );

    if (!confirmed) return;

    try {
      await api.delete('/admin/posts', {
        data: { postHexes: Array.from(selectedPosts) },
      });
      setPosts(posts.filter((p) => !selectedPosts.has(p._id)));
      setSelectedPosts(new Set());
      setPostsCount((prev) => prev + 1); // Trigger count refresh
    } catch (error) {
      console.error('Error bulk deleting posts:', error);
    }
  };

  const handleViewDetails = (post: FlaggedPost) => {
    navigate(`/admin/flagged/${post._id}`, { state: { post } });
  };

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-bold text-gray-900 dim:text-white dark:text-white"
          data-testid="flagged-posts-title"
        >
          🚩 Flagged Posts
        </h1>
        <p className="text-gray-600 dim:text-gray-400 dark:text-gray-400 mt-1">
          Review and manage posts reported by the community
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-2" data-testid="filter-dropdown">
          <Button
            variant={filter === 'all' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => {
              setFilter('all');
              setPage(1);
            }}
            data-testid="filter-option-all"
          >
            All ({counts.all})
          </Button>
          <Button
            variant={filter === 'auto-hidden' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => {
              setFilter('auto-hidden');
              setPage(1);
            }}
            data-testid="filter-option-auto-hidden"
          >
            Auto-Hidden ({counts.autoHidden})
          </Button>
          <Button
            variant={filter === 'under-review' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => {
              setFilter('under-review');
              setPage(1);
            }}
            data-testid="filter-option-under-review"
          >
            Under Review ({counts.underReview})
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dim:text-gray-400 dark:text-gray-400">Sort:</span>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as SortType);
              setPage(1);
            }}
            className="px-3 py-1.5 rounded-lg border border-gray-200 dim:border-gray-600 dark:border-gray-700 bg-white dim:bg-gray-800 dark:bg-gray-900 text-gray-900 dim:text-white dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
            data-testid="sort-dropdown"
          >
            <option value="most-reports" data-testid="sort-option-most-reports">
              Most Reports
            </option>
            <option value="recent" data-testid="sort-option-most-recent">
              Most Recent
            </option>
            <option value="oldest" data-testid="sort-option-oldest-first">
              Oldest First
            </option>
          </select>
        </div>
      </div>

      {/* Posts list */}
      <div className="space-y-4" data-testid="flagged-posts-list">
        {loading ? (
          <FlaggedPostsSkeleton />
        ) : posts.length === 0 ? (
          <div className="text-center py-12" data-testid="flagged-posts-empty">
            <CheckCircle className="mx-auto mb-4 w-12 h-12 text-green-500" />
            <h3 className="text-lg font-medium mb-2 text-gray-900 dim:text-white dark:text-white">
              All clear!
            </h3>
            <p className="text-gray-600 dim:text-gray-400 dark:text-gray-400">
              No flagged posts to review right now
            </p>
          </div>
        ) : (
          <>
            {/* Select All + Bulk Actions - Single Row */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedPosts.size === posts.length && posts.length > 0}
                  onChange={handleSelectAll}
                  className="h-4 w-4 cursor-pointer rounded border-gray-300 dim:border-gray-600 dark:border-gray-700 bg-white dim:bg-gray-800 dark:bg-gray-900 focus:ring-2 focus:ring-brand-primary"
                  aria-label="Select all posts"
                  data-testid="select-all-checkbox"
                />
                <span className="text-sm text-gray-600 dim:text-gray-400 dark:text-gray-400">
                  Select All
                </span>
              </div>

              {/* Bulk actions - only show when posts are selected */}
              {selectedPosts.size > 0 && (
                <div className="contents" data-testid="bulk-action-bar">
                  <Badge variant="brand" size="md" data-testid="selection-count">
                    {selectedPosts.size} selected
                  </Badge>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleBulkDelete}
                    disabled={!isOnline}
                    data-testid="bulk-delete-button"
                  >
                    Delete Selected
                  </Button>
                </div>
              )}
            </div>

            {posts.map((post) => (
              <FlaggedPostCard
                key={post._id}
                post={post}
                selected={selectedPosts.has(post._id)}
                onSelect={handleSelectPost}
                onViewDetails={handleViewDetails}
                onDelete={handleDeletePost}
                onDismiss={handleDismissReports}
                isOnline={isOnline}
              />
            ))}
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600 dim:text-gray-400 dark:text-gray-400">
            Page {page} of {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
