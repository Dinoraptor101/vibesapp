import api from '@/lib/api';
import { useCallback, useEffect, useState } from 'react';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import type { AdminUser } from '../../../types';
import { RegeneratePasswordModal } from '../components/RegeneratePasswordModal';
import { UserCard } from '../components/UserCard';
import { UserDetailModal } from '../components/UserDetailModal';

export function UsersPage() {
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
  const [selectAll, setSelectAll] = useState(false);

  // Modal
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Password modal
  const [regeneratedPassword, setRegeneratedPassword] = useState<string | null>(null);
  const [passwordUser, setPasswordUser] = useState<string>('');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

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
        limit: 50,
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
      setSelectAll(false);
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
    setSelectedUser(user);
    setIsModalOpen(true);
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

  const handleRegeneratePassword = async (userId: string) => {
    try {
      const response = (await api.post(`/admin/users/${userId}/regenerate-password`)) as {
        success: boolean;
        newPassword: string;
        user: {
          userId: string;
          userName: string;
        };
      };

      setRegeneratedPassword(response.newPassword);
      setPasswordUser(response.user.userName);
      setIsPasswordModalOpen(true);
    } catch (err) {
      console.error('Error regenerating password:', err);
      alert('Failed to regenerate password');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (
      !confirm('Are you sure you want to delete this user? This action marks the user as deleted.')
    ) {
      return;
    }

    try {
      await api.delete(`/admin/users/${userId}`);
      await fetchUsers();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Failed to delete user');
    }
  };

  const handleDeleteAllPosts = async (userId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete ALL posts from this user? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      await api.delete(`/admin/users/${userId}/posts`);
      await fetchUsers();
      alert('All posts deleted successfully');
    } catch (err) {
      console.error('Error deleting posts:', err);
      alert('Failed to delete posts');
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(users.map((u) => u.userId));
    }
    setSelectAll(!selectAll);
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
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="mt-2 text-gray-600">Manage users, ban/unban, and view user activity</p>
      </div>

      {/* Search and Filters */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {/* Search */}
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Search by username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'banned')}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
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
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
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
      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectAll}
              onChange={handleSelectAll}
              className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-600">
              {selectedUserIds.length > 0 ? `${selectedUserIds.length} selected` : 'Select all'}
            </span>
          </div>

          {selectedUserIds.length > 0 && (
            <Button variant="destructive" size="sm" onClick={handleBulkBan}>
              Ban Selected
            </Button>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600">
          <Badge variant="default">{totalUsers} total users</Badge>
          <Badge variant="success">{users.filter((u) => !u.isBanned).length} active</Badge>
          <Badge variant="error">{users.filter((u) => u.isBanned).length} banned</Badge>
        </div>
      </div>

      {/* User List */}
      {isLoading && <p className="text-center text-gray-500">Loading users...</p>}

      {error && <p className="text-center text-error-600">{error}</p>}

      {!isLoading && !error && users.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-500">No users found</p>
        </div>
      )}

      {!isLoading && !error && users.length > 0 && (
        <div className="space-y-4">
          {users.map((user) => (
            <UserCard
              key={user.userId}
              user={user}
              onViewDetails={handleViewDetails}
              onViewPosts={handleViewDetails}
              onToggleBan={handleToggleBan}
              isSelected={selectedUserIds.includes(user.userId)}
              onSelect={handleSelectUser}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>

          <div className="flex items-center gap-2">
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
          >
            Next
          </Button>
        </div>
      )}

      {/* User Detail Modal */}
      <UserDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={selectedUser}
        onBanToggle={handleToggleBan}
        onRegeneratePassword={handleRegeneratePassword}
        onDeleteUser={handleDeleteUser}
        onDeleteAllPosts={handleDeleteAllPosts}
      />

      {/* Regenerate Password Modal */}
      <RegeneratePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => {
          setIsPasswordModalOpen(false);
          setRegeneratedPassword(null);
          setPasswordUser('');
        }}
        password={regeneratedPassword}
        userName={passwordUser}
      />
    </div>
  );
}
