/**
 * TopNav Component
 *
 * Desktop navigation bar with logo, nav links, create button, and user menu.
 * Hidden on mobile (< md breakpoint).
 */

import { Bell, Home, MessageSquare, Plus } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { OfflineIndicator } from '@/components/shared/OfflineIndicator';
import { Button } from '@/components/ui-next';
import { useUnreadCounts } from '@/features/activity';
import { UserMenu } from './UserMenu';

export function TopNav() {
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch real unread counts from Activity API
  // Note: This is safe to call even when not logged in because the query
  // has `enabled: !!user?._id` which prevents execution until user is loaded
  const { data: activityCounts } = useUnreadCounts();

  // Messages count comes from activity feed (messages category)
  const unreadActivity = activityCounts?.all || 0;
  const unreadMessages = activityCounts?.messages || 0;

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="hidden md:flex items-center justify-between px-6 py-3 bg-surface-elevated/95 backdrop-blur-md border-b border-border sticky top-0 z-40">
      {/* Left: Logo + Offline Indicator */}
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="text-2xl font-bold text-brand-purple group-hover:scale-110 transition-transform">
            🕊️
          </div>
          <span className="text-xl font-bold text-text-primary hidden lg:inline">VibesApp</span>
        </Link>
        <OfflineIndicator />
      </div>

      {/* Center: Nav Links */}
      <div className="flex items-center gap-1">
        {/* Home */}
        <Link
          to="/"
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            isActive('/')
              ? 'bg-brand-purple text-white'
              : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
          }`}
          aria-label="Home"
        >
          <Home className="w-5 h-5" />
          <span className="hidden lg:inline font-medium">Home</span>
        </Link>

        {/* Activity */}
        <Link
          to="/activity"
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors relative ${
            isActive('/activity')
              ? 'bg-brand-purple text-white'
              : unreadActivity > 0
                ? 'text-vibe-negative hover:bg-surface-hover'
                : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
          }`}
          aria-label={`Activity${unreadActivity > 0 ? ` (${unreadActivity} unread)` : ''}`}
        >
          <div className="relative">
            <Bell className="w-5 h-5" />
            {unreadActivity > 0 && (
              <span className="absolute -top-1.5 -right-1.5 text-[10px] font-bold tabular-nums">
                {unreadActivity > 99 ? '99+' : unreadActivity}
              </span>
            )}
          </div>
          <span className="hidden lg:inline font-medium">Activity</span>
        </Link>

        {/* Messages */}
        <Link
          to="/messages"
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors relative ${
            isActive('/messages')
              ? 'bg-brand-purple text-white'
              : unreadMessages > 0
                ? 'text-vibe-negative hover:bg-surface-hover'
                : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
          }`}
          aria-label={`Messages${unreadMessages > 0 ? ` (${unreadMessages} unread)` : ''}`}
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5" />
            {unreadMessages > 0 && (
              <span className="absolute -top-1.5 -right-1.5 text-[10px] font-bold tabular-nums">
                {unreadMessages > 99 ? '99+' : unreadMessages}
              </span>
            )}
          </div>
          <span className="hidden lg:inline font-medium">Messages</span>
        </Link>
      </div>

      {/* Right: Create Post + User Menu */}
      <div className="flex items-center gap-3">
        {/* Create Post Button */}
        <Button
          size="md"
          leftIcon={<Plus className="w-5 h-5" />}
          onClick={() => navigate('/create-post')}
          aria-label="Create post"
          className={`!text-white focus-visible:ring-2 focus-visible:ring-offset-2 ${
            isActive('/create-post')
              ? '!bg-brand-purple hover:!bg-brand-purple-hover focus-visible:ring-brand-purple'
              : '!bg-notification hover:!bg-notification-hover focus-visible:ring-notification'
          }`}
        >
          <span className="hidden lg:inline">Post</span>
        </Button>

        {/* User Menu */}
        <UserMenu isActive={isActive('/settings')} />
      </div>
    </nav>
  );
}
