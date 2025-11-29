/**
 * Admin Layout
 * Common layout for all admin pages with header and navigation
 */

import { Flag, LayoutDashboard, LogOut, Settings, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../hooks/useAdminAuth';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dim:bg-gray-900 dark:bg-gray-950">
      {/* Header */}
      <header
        className="glass border-b border-gray-200 dim:border-gray-700 dark:border-gray-800 sticky top-0 z-50"
        data-testid="admin-header"
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Title */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-purple rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900 dim:text-white dark:text-white">
                Vibes Admin
              </h1>
            </div>

            {/* Navigation */}
            <nav className="flex items-center gap-1">
              <NavLink
                to="/admin/dashboard"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-purple text-white'
                      : 'text-gray-600 dim:text-gray-300 dark:text-gray-400 hover:text-gray-900 dim:hover:text-white dark:hover:text-white hover:bg-gray-100 dim:hover:bg-gray-700 dark:hover:bg-gray-800'
                  }`
                }
                title="Dashboard"
                data-testid="admin-nav-dashboard"
              >
                <LayoutDashboard className="w-5 h-5 md:hidden" />
                <span className="hidden md:inline" data-testid="admin-nav-dashboard-text">
                  Dashboard
                </span>
              </NavLink>
              <NavLink
                to="/admin/flagged"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-purple text-white'
                      : 'text-gray-600 dim:text-gray-300 dark:text-gray-400 hover:text-gray-900 dim:hover:text-white dark:hover:text-white hover:bg-gray-100 dim:hover:bg-gray-700 dark:hover:bg-gray-800'
                  }`
                }
                title="Flagged Posts"
                data-testid="admin-nav-flagged-posts"
              >
                <Flag className="w-5 h-5 md:hidden" />
                <span className="hidden md:inline" data-testid="admin-nav-flagged-posts-text">
                  Flagged Posts
                </span>
              </NavLink>
              <NavLink
                to="/admin/users"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-purple text-white'
                      : 'text-gray-600 dim:text-gray-300 dark:text-gray-400 hover:text-gray-900 dim:hover:text-white dark:hover:text-white hover:bg-gray-100 dim:hover:bg-gray-700 dark:hover:bg-gray-800'
                  }`
                }
                title="Users"
                data-testid="admin-nav-users"
              >
                <Users className="w-5 h-5 md:hidden" />
                <span className="hidden md:inline" data-testid="admin-nav-users-text">
                  Users
                </span>
              </NavLink>
              <NavLink
                to="/admin/settings"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-purple text-white'
                      : 'text-gray-600 dim:text-gray-300 dark:text-gray-400 hover:text-gray-900 dim:hover:text-white dark:hover:text-white hover:bg-gray-100 dim:hover:bg-gray-700 dark:hover:bg-gray-800'
                  }`
                }
                title="Settings"
                data-testid="admin-nav-settings"
              >
                <Settings className="w-5 h-5 md:hidden" />
                <span className="hidden md:inline" data-testid="admin-nav-settings-text">
                  Settings
                </span>
              </NavLink>
            </nav>

            {/* Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-2 text-sm font-medium text-gray-600 dim:text-gray-300 dark:text-gray-400 hover:text-red-600 dim:hover:text-red-400 dark:hover:text-red-400
                       hover:bg-gray-100 dim:hover:bg-gray-700 dark:hover:bg-gray-800 rounded-lg transition-colors
                       flex items-center gap-2"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">{children}</main>

      {/* Footer (Optional) */}
      <footer className="mt-auto py-6 text-center text-sm text-gray-500 dim:text-gray-400 dark:text-gray-500 border-t border-gray-200 dim:border-gray-700 dark:border-gray-800">
        <p>Vibes Admin Panel - All actions are logged</p>
      </footer>
    </div>
  );
}
