import { ArrowUpDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { AdminUser } from '@/types';

interface UsersTableProps {
  users: AdminUser[];
  selectedUserIds: string[];
  onSelectUser: (userId: string) => void;
  onSelectAll: (checked: boolean) => void;
  onViewDetails: (user: AdminUser) => void;
  onViewPosts: (user: AdminUser) => void;
  onToggleBan: (userId: string) => void;
  isOnline: boolean;
  sortField: string | null;
  sortDirection: 'asc' | 'desc';
  onSort: (field: string) => void;
}

export function UsersTable({
  users,
  selectedUserIds,
  onSelectUser,
  onSelectAll,
  onViewDetails,
  onViewPosts,
  onToggleBan,
  isOnline,
  sortField,
  onSort,
}: UsersTableProps) {
  const allSelected = users.length > 0 && selectedUserIds.length === users.length;

  const SortButton = ({ field, children }: { field: string; children: React.ReactNode }) => (
    <button
      type="button"
      onClick={() => onSort(field)}
      className="flex items-center gap-1 hover:text-gray-900 transition-colors"
      data-testid={`sort-${field}`}
    >
      {children}
      <ArrowUpDown
        className={`h-3 w-3 ${sortField === field ? 'text-brand-purple' : 'text-gray-400'}`}
      />
    </button>
  );

  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full" data-testid="users-table">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {/* Checkbox Column */}
              <th className="w-12 px-3 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  data-testid="select-all-checkbox"
                  aria-label="Select all users"
                />
              </th>

              {/* Online Column */}
              <th className="w-12 px-2 py-3 text-left hidden md:table-cell">
                <span className="sr-only">Online Status</span>
              </th>

              {/* Avatar Column */}
              <th className="w-12 px-2 py-3 text-left hidden md:table-cell">
                <span className="sr-only">Avatar</span>
              </th>

              {/* Username Column */}
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <SortButton field="userName">Username</SortButton>
              </th>

              {/* MBTI Column */}
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden lg:table-cell">
                <SortButton field="mbtiPersonality">MBTI</SortButton>
              </th>

              {/* Polarity Column */}
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden lg:table-cell">
                <SortButton field="masculineFeminineScale">Polarity</SortButton>
              </th>

              {/* Status Column */}
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden md:table-cell">
                <SortButton field="isBanned">Status</SortButton>
              </th>

              {/* Posts Column */}
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <SortButton field="postCount">Posts</SortButton>
              </th>

              {/* Ban Button Column */}
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => {
              const isSelected = selectedUserIds.includes(user.userId);
              const polarityLabel = (user.masculineFeminineScale ?? 0) > 0 ? '☀️ Yang' : '🌙 Yin';

              return (
                <tr
                  key={user.userId}
                  className="hover-lift hover:bg-gray-50 transition-colors"
                  data-testid={`user-row-${user.userId}`}
                >
                  {/* Checkbox */}
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onSelectUser(user.userId)}
                      className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      aria-label={`Select ${user.userName}`}
                    />
                  </td>

                  {/* Online Indicator */}
                  <td className="px-2 py-3 hidden md:table-cell">
                    {user.isOnline ? (
                      <div
                        className="h-2.5 w-2.5 rounded-full bg-success-500"
                        title="Online"
                        data-testid="online-indicator"
                      />
                    ) : (
                      <div className="h-2.5 w-2.5" />
                    )}
                  </td>

                  {/* Avatar */}
                  <td className="px-2 py-3 hidden md:table-cell">
                    {user.profilePictureUrl ? (
                      <img
                        src={user.profilePictureUrl}
                        alt={user.userName}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
                        {user.userName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </td>

                  {/* Username (Clickable) */}
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => onViewDetails(user)}
                      className="flex items-center gap-2 text-left hover:text-brand-purple transition-colors"
                      data-testid="user-username"
                    >
                      {/* Mobile: Show online indicator before username */}
                      {user.isOnline && (
                        <div
                          className="h-2 w-2 rounded-full bg-success-500 md:hidden"
                          title="Online"
                        />
                      )}
                      <span className="font-medium text-gray-900">{user.userName}</span>
                    </button>
                  </td>

                  {/* MBTI */}
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {user.mbtiPersonality && (
                      <Badge variant="default" size="sm">
                        {user.mbtiPersonality}
                      </Badge>
                    )}
                  </td>

                  {/* Polarity */}
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <Badge variant="brand" size="sm">
                      {polarityLabel}
                    </Badge>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3 hidden md:table-cell">
                    {user.isBanned ? (
                      <Badge variant="error" size="sm" data-testid="user-banned-badge">
                        Banned
                      </Badge>
                    ) : (
                      <Badge variant="success" size="sm">
                        Active
                      </Badge>
                    )}
                  </td>

                  {/* Posts (Clickable) */}
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => onViewPosts(user)}
                      className="text-gray-900 hover:text-brand-purple font-medium transition-colors"
                      data-testid="user-post-count"
                    >
                      {user.postCount || 0}
                    </button>
                  </td>

                  {/* Ban Button */}
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant={user.isBanned ? 'outline' : 'destructive'}
                      size="sm"
                      onClick={() => onToggleBan(user.userId)}
                      disabled={!isOnline}
                      data-testid="toggle-ban-button"
                      className="min-w-[80px]"
                    >
                      {user.isBanned ? 'Unban' : 'Ban'}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
