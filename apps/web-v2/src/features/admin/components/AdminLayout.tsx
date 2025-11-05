/**
 * Admin Layout
 * Common layout for all admin pages with header and navigation
 */

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
    <div className="min-h-screen bg-surface-1">
      {/* Header */}
      <header className="bg-surface-2 border-b border-border sticky top-0 z-50">
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
              <h1 className="text-xl font-bold text-text-primary">Vibes Admin</h1>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <NavLink
                to="/admin/dashboard"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-purple text-white'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-3'
                  }`
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/admin/flagged"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-purple text-white'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-3'
                  }`
                }
              >
                Flagged Posts
              </NavLink>
              <NavLink
                to="/admin/users"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-purple text-white'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-3'
                  }`
                }
              >
                Users
              </NavLink>
              <NavLink
                to="/admin/settings"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-purple text-white'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-3'
                  }`
                }
              >
                Settings
              </NavLink>
            </nav>

            {/* Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-vibe-negative-light 
                       hover:bg-surface-3 rounded-lg transition-colors
                       flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">{children}</main>

      {/* Footer (Optional) */}
      <footer className="mt-auto py-6 text-center text-sm text-text-tertiary border-t border-border">
        <p>Vibes Admin Panel - All actions are logged</p>
      </footer>
    </div>
  );
}
