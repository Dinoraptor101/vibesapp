/**
 * TopNav Component
 *
 * Desktop navigation bar with logo, nav links, create button, and user menu.
 * Hidden on mobile (< md breakpoint).
 */

import { Bell, Home, MessageSquare, Plus } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Badge, Button } from '@/components/ui-next';
import { CreatePostModal } from '@/features/posts';
import { UserMenu } from './UserMenu';

// Mock badge counts - will be replaced with real data later
const MOCK_UNREAD_ACTIVITY = 3;
const MOCK_UNREAD_MESSAGES = 5;

export function TopNav() {
  const location = useLocation();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="hidden md:flex items-center justify-between px-6 py-3 bg-surface-elevated border-b border-border sticky top-0 z-40">
      {/* Left: Logo */}
      <Link to="/" className="flex items-center gap-2 group">
        <div className="text-2xl font-bold text-brand-purple group-hover:scale-110 transition-transform">
          🕊️
        </div>
        <span className="text-xl font-bold text-text-primary hidden lg:inline">VibesApp</span>
      </Link>

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
              : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
          }`}
          aria-label={`Activity${MOCK_UNREAD_ACTIVITY > 0 ? ` (${MOCK_UNREAD_ACTIVITY} unread)` : ''}`}
        >
          <div className="relative">
            <Bell className="w-5 h-5" />
            {MOCK_UNREAD_ACTIVITY > 0 && (
              <div className="absolute -top-1 -right-1">
                <Badge variant="error" size="sm" count={MOCK_UNREAD_ACTIVITY} />
              </div>
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
              : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
          }`}
          aria-label={`Messages${MOCK_UNREAD_MESSAGES > 0 ? ` (${MOCK_UNREAD_MESSAGES} unread)` : ''}`}
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5" />
            {MOCK_UNREAD_MESSAGES > 0 && (
              <div className="absolute -top-1 -right-1">
                <Badge variant="error" size="sm" count={MOCK_UNREAD_MESSAGES} />
              </div>
            )}
          </div>
          <span className="hidden lg:inline font-medium">Messages</span>
        </Link>
      </div>

      {/* Right: Create Post + User Menu */}
      <div className="flex items-center gap-3">
        {/* Create Post Button */}
        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="w-5 h-5" />}
          onClick={() => setIsCreateModalOpen(true)}
          aria-label="Create post"
        >
          <span className="hidden lg:inline">Post</span>
        </Button>

        {/* User Menu */}
        <UserMenu />
      </div>

      {/* Create Post Modal */}
      <CreatePostModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
    </nav>
  );
}
