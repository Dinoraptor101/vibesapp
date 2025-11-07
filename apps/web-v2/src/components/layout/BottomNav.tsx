/**
 * BottomNav Component
 *
 * Mobile bottom navigation bar with 5 main actions.
 * Visible only on mobile (< md breakpoint).
 */

import { Bell, Home, MessageSquare, Plus, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Badge } from '@/components/ui-next';
import { useAuth } from '@/features/auth/context/useAuth';

// Mock badge counts - will be replaced with real data later
const MOCK_UNREAD_ACTIVITY = 3;
const MOCK_UNREAD_MESSAGES = 5;

export function BottomNav() {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  if (!user) return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-elevated border-t border-border z-40">
      <div className="flex items-center justify-around px-2 py-2 safe-area-inset-bottom">
        {/* Home */}
        <Link
          to="/"
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors min-w-[64px] ${
            isActive('/') ? 'text-brand-purple' : 'text-text-secondary'
          }`}
          aria-label="Home"
        >
          <Home className={`w-6 h-6 ${isActive('/') ? 'fill-current' : ''}`} />
          <span className="text-xs font-medium">Home</span>
        </Link>

        {/* Activity */}
        <Link
          to="/activity"
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors min-w-[64px] relative ${
            isActive('/activity') ? 'text-brand-purple' : 'text-text-secondary'
          }`}
          aria-label={`Activity${MOCK_UNREAD_ACTIVITY > 0 ? ` (${MOCK_UNREAD_ACTIVITY} unread)` : ''}`}
        >
          <div className="relative">
            <Bell className={`w-6 h-6 ${isActive('/activity') ? 'fill-current' : ''}`} />
            {MOCK_UNREAD_ACTIVITY > 0 && (
              <div className="absolute -top-1 -right-1">
                <Badge variant="error" size="sm" count={MOCK_UNREAD_ACTIVITY} />
              </div>
            )}
          </div>
          <span className="text-xs font-medium">Activity</span>
        </Link>

        {/* Create Post */}
        <Link
          to="/create-post"
          className="flex flex-col items-center gap-1 px-4 py-2 min-w-[64px]"
          aria-label="Create post"
        >
          <div className="bg-brand-purple text-white rounded-full p-3 shadow-lg hover:scale-110 transition-transform">
            <Plus className="w-6 h-6" strokeWidth={2.5} />
          </div>
        </Link>

        {/* Messages */}
        <Link
          to="/messages"
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors min-w-[64px] relative ${
            isActive('/messages') ? 'text-brand-purple' : 'text-text-secondary'
          }`}
          aria-label={`Messages${MOCK_UNREAD_MESSAGES > 0 ? ` (${MOCK_UNREAD_MESSAGES} unread)` : ''}`}
        >
          <div className="relative">
            <MessageSquare className={`w-6 h-6 ${isActive('/messages') ? 'fill-current' : ''}`} />
            {MOCK_UNREAD_MESSAGES > 0 && (
              <div className="absolute -top-1 -right-1">
                <Badge variant="error" size="sm" count={MOCK_UNREAD_MESSAGES} />
              </div>
            )}
          </div>
          <span className="text-xs font-medium">Messages</span>
        </Link>

        {/* Profile */}
        <Link
          to={`/profile/${user._id}`}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors min-w-[64px] ${
            location.pathname.startsWith('/profile') ? 'text-brand-purple' : 'text-text-secondary'
          }`}
          aria-label="Profile"
        >
          <User
            className={`w-6 h-6 ${location.pathname.startsWith('/profile') ? 'fill-current' : ''}`}
          />
          <span className="text-xs font-medium">Profile</span>
        </Link>
      </div>
    </nav>
  );
}
