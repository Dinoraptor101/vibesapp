import { Bell, Home, MessageSquare, Plus } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUnreadCounts } from '@/features/activity';
import { useAuth } from '@/features/auth/context/useAuth';
import { UserMenu } from './UserMenu';

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch real unread counts from Activity API
  const { data: activityCounts } = useUnreadCounts();
  const unreadActivity = activityCounts?.all || 0;
  const unreadMessages = activityCounts?.messages || 0;

  const isActive = (path: string) => location.pathname === path;

  if (!user) return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-elevated/95 backdrop-blur-md border-t border-border z-40">
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
            isActive('/activity')
              ? 'text-brand-purple'
              : unreadActivity > 0
                ? 'text-vibe-negative'
                : 'text-text-secondary'
          }`}
          aria-label={`Activity${unreadActivity > 0 ? ` (${unreadActivity} unread)` : ''}`}
        >
          <div className="relative">
            <Bell className={`w-6 h-6 ${isActive('/activity') ? 'fill-current' : ''}`} />
            {unreadActivity > 0 && (
              <span className="absolute -top-1.5 -right-1.5 text-[10px] font-bold tabular-nums">
                {unreadActivity > 99 ? '99+' : unreadActivity}
              </span>
            )}
          </div>
          <span className="text-xs font-medium">Activity</span>
        </Link>

        {/* Create Post */}
        <button
          type="button"
          onClick={() => navigate('/create-post')}
          className="flex flex-col items-center gap-1 px-4 py-2 min-w-[64px]"
          aria-label="Create post"
        >
          <div className="bg-brand-purple text-white rounded-full p-3 shadow-lg hover:scale-110 transition-transform">
            <Plus className="w-6 h-6" strokeWidth={2.5} />
          </div>
        </button>

        {/* Messages */}
        <Link
          to="/messages"
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors min-w-[64px] relative ${
            isActive('/messages')
              ? 'text-brand-purple'
              : unreadMessages > 0
                ? 'text-vibe-negative'
                : 'text-text-secondary'
          }`}
          aria-label={`Messages${unreadMessages > 0 ? ` (${unreadMessages} unread)` : ''}`}
        >
          <div className="relative">
            <MessageSquare className={`w-6 h-6 ${isActive('/messages') ? 'fill-current' : ''}`} />
            {unreadMessages > 0 && (
              <span className="absolute -top-1.5 -right-1.5 text-[10px] font-bold tabular-nums">
                {unreadMessages > 99 ? '99+' : unreadMessages}
              </span>
            )}
          </div>
          <span className="text-xs font-medium">Messages</span>
        </Link>

        {/* User Menu */}
        <div className="flex flex-col items-center gap-1 px-4 py-2 min-w-[64px]">
          <UserMenu />
        </div>
      </div>
    </nav>
  );
}
