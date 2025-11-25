import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import type { FlaggedPost } from '@/types';
import { FlaggedPostCard } from '../components/FlaggedPostCard';

type FilterType = 'all' | 'auto-hidden' | 'under-review';
type SortType = 'most-reports' | 'recent' | 'oldest';

export function FlaggedPostsPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<FlaggedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('most-reports');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response = (await api.get('/admin/reported-posts', {
          params: { filter, sort, page, limit: 20 },
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
    } catch (error) {
      console.error('Error bulk deleting posts:', error);
    }
  };

  const handleViewDetails = (post: FlaggedPost) => {
    navigate(`/admin/flagged/${post._id}`, { state: { post } });
  };

  const allCount = posts.length;
  const autoHiddenCount = posts.filter((p) => p.isHidden).length;
  const underReviewCount = posts.filter((p) => !p.isHidden && (p.reportCount || 0) > 0).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" data-testid="flagged-posts-title">
          🚩 Flagged Posts
        </h1>
        <p className="text-text-secondary mt-1">
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
            All ({allCount})
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
            Auto-Hidden ({autoHiddenCount})
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
            Under Review ({underReviewCount})
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-text-secondary">Sort:</span>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as SortType);
              setPage(1);
            }}
            className="px-3 py-1.5 rounded-lg border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
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

      {/* Bulk actions */}
      {selectedPosts.size > 0 && (
        <div
          className="flex items-center gap-4 p-4 bg-bg-secondary rounded-lg"
          data-testid="bulk-action-bar"
        >
          <Badge variant="brand" size="md" data-testid="selection-count">
            {selectedPosts.size} selected
          </Badge>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleBulkDelete}
            data-testid="bulk-delete-button"
          >
            Delete Selected Posts
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSelectedPosts(new Set())}>
            Clear Selection
          </Button>
        </div>
      )}

      {/* Posts list */}
      <div className="space-y-4" data-testid="flagged-posts-list">
        {loading ? (
          <div
            className="text-center py-12 text-text-secondary"
            data-testid="flagged-posts-loading"
          >
            Loading flagged posts...
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-text-secondary" data-testid="flagged-posts-empty">
            No flagged posts found
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedPosts.size === posts.length && posts.length > 0}
                onChange={handleSelectAll}
                className="h-4 w-4 cursor-pointer rounded border-border bg-bg focus:ring-2 focus:ring-brand-primary"
                aria-label="Select all posts"
                data-testid="select-all-checkbox"
              />
              <span className="text-sm text-text-secondary">Select All</span>
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
          <span className="text-sm text-text-secondary">
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
