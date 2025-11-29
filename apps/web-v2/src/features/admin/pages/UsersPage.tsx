import { Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import api from '@/lib/api';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import type { AdminUser } from '../../../types';
import { UsersTable } from '../components/UsersTable';

export function UsersPage() {
  const navigate = useNavigate();
  const { isOnline } = useNetworkStatus();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'banned'>('all');
  const [filterMBTI, setFilterMBTI] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  // Selection
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // Sorting
  const [sortField, setSortField] = useState<string | null>('userName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const mbtiTypes = [
    'INTJ',
    'INTP',
    'ENTJ',
    'ENTP',
    'INFJ',
    'INFP',
    'ENFJ',
    'ENFP',
    'ISTJ',
    'ISFJ',
    'ESTJ',
    'ESFJ',
    'ISTP',
    'ISFP',
    'ESTP',
    'ESFP',
  ];

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = (await api.get('/admin/users', {
        search: searchQuery,
        filter: filterStatus,
        mbti: filterMBTI,
        location: '',
        page: currentPage,
        limit: 100,
      })) as {
        success: boolean;
        users: AdminUser[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          pages: number;
        };
      };

      setUsers(response.users);
      setTotalPages(response.pagination.pages);
      setTotalUsers(response.pagination.total);
      setSelectedUserIds([]);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, filterStatus, filterMBTI, currentPage]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleViewDetails = (user: AdminUser) => {
    navigate(`/admin/users/${user.userId}`, { state: { user } });
  };

  const handleViewPosts = (user: AdminUser) => {
    navigate(`/admin/users/${user.userId}/posts`, { state: { user } });
  };

  const handleToggleBan = async (userId: string) => {
    try {
      await api.post(`/admin/users/${userId}/toggle-ban`);
      await fetchUsers();
    } catch (err) {
      console.error('Error toggling ban:', err);
      alert('Failed to toggle ban status');
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUserIds(users.map((u) => u.userId));
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleBulkBan = async () => {
    if (selectedUserIds.length === 0) return;

    if (!confirm(`Ban ${selectedUserIds.length} users?`)) return;

    try {
      await Promise.all(
        selectedUserIds.map((userId) => api.post(`/admin/users/${userId}/toggle-ban`))
      );
      await fetchUsers();
    } catch (err) {
      console.error('Error banning users:', err);
      alert('Failed to ban users');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dim:text-white dark:text-white">
          User Management
        </h1>
        <p className="mt-2 text-gray-600 dim:text-gray-400 dark:text-gray-400">
          Manage users, ban/unban, and view user activity
        </p>
      </div>

      {/* Search and Filters */}
      <div className="rounded-lg border border-gray-200 dim:border-gray-700 dark:border-gray-800 bg-white dim:bg-gray-800 dark:bg-gray-900 p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {/* Search */}
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Search by username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dim:border-gray-600 dark:border-gray-700 bg-white dim:bg-gray-700 dark:bg-gray-800 text-gray-900 dim:text-white dark:text-white placeholder:text-gray-400 dim:placeholder:text-gray-500 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              data-testid="users-search-input"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'banned')}
              className="w-full rounded-lg border border-gray-300 dim:border-gray-600 dark:border-gray-700 bg-white dim:bg-gray-700 dark:bg-gray-800 text-gray-900 dim:text-white dark:text-white px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              data-testid="users-filter-select"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="banned">Banned</option>
            </select>
          </div>

          {/* MBTI Filter */}
          <div>
            <select
              value={filterMBTI}
              onChange={(e) => setFilterMBTI(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dim:border-gray-600 dark:border-gray-700 bg-white dim:bg-gray-700 dark:bg-gray-800 text-gray-900 dim:text-white dark:text-white px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All MBTI Types</option>
              {mbtiTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats and Bulk Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-lg border border-gray-200 dim:border-gray-700 dark:border-gray-800 bg-white dim:bg-gray-800 dark:bg-gray-900 p-3">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 dim:text-gray-400 dark:text-gray-400">
            {selectedUserIds.length > 0
              ? `${selectedUserIds.length} selected`
              : `${totalUsers} total users`}
          </span>

          {selectedUserIds.length > 0 && (
            <Button variant="destructive" size="sm" onClick={handleBulkBan} disabled={!isOnline}>
              Ban Selected
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3 text-sm text-gray-600 dim:text-gray-400 dark:text-gray-400">
          <Badge variant="success" size="sm">
            {users.filter((u) => !u.isBanned).length} active
          </Badge>
          <Badge variant="error" size="sm">
            {users.filter((u) => u.isBanned).length} banned
          </Badge>
        </div>
      </div>

      {/* User Table */}
      {isLoading && (
        <div className="flex items-center justify-center py-12" data-testid="users-loading">
          <Loader2 className="w-8 h-8 animate-spin text-brand-purple" />
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <p className="text-error-600 mb-4">{error}</p>
          <Button variant="outline" onClick={fetchUsers}>
            Try Again
          </Button>
        </div>
      )}

      {!isLoading && !error && users.length === 0 && (
        <div
          className="rounded-lg border border-gray-200 dim:border-gray-700 dark:border-gray-800 bg-white dim:bg-gray-800 dark:bg-gray-900 p-12 text-center"
          data-testid="users-empty-state"
        >
          <p className="text-gray-500 dim:text-gray-400 dark:text-gray-500">No users found</p>
        </div>
      )}

      {!isLoading && !error && users.length > 0 && (
        <div data-testid="users-list">
          <UsersTable
            users={users}
            selectedUserIds={selectedUserIds}
            onSelectUser={handleSelectUser}
            onSelectAll={handleSelectAll}
            onViewDetails={handleViewDetails}
            onViewPosts={handleViewPosts}
            onToggleBan={handleToggleBan}
            isOnline={isOnline}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2" data-testid="pagination-controls">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            data-testid="pagination-prev"
          >
            Previous
          </Button>

          <div className="flex items-center gap-2" data-testid="pagination-info">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = currentPage <= 3 ? i + 1 : currentPage + i - 2;
              if (pageNum > totalPages) return null;
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === currentPage ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            data-testid="pagination-next"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
