import { Bell, Home, Menu, MessageSquare, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUnreadCounts } from '@/features/activity';
import { useAuth } from '@/features/auth/context/useAuth';
import { useUnreadMessageCount } from '@/features/messaging';
import { UserMenu } from './UserMenu';

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Activity counts (likes, comments, follows, etc.)
  const { data: activityCounts } = useUnreadCounts();
  const unreadActivity = activityCounts?.all || 0;

  // Message counts (unread conversations + pending DM requests)
  const unreadMessages = useUnreadMessageCount();

  // Track previous counts to detect new notifications
  const prevActivityRef = useRef(unreadActivity);
  const prevMessagesRef = useRef(unreadMessages);
  const [shakeActivity, setShakeActivity] = useState(false);
  const [shakeMessages, setShakeMessages] = useState(false);

  // Trigger shake animation when counts increase
  useEffect(() => {
    if (unreadActivity > prevActivityRef.current) {
      setShakeActivity(true);
      const timer = setTimeout(() => setShakeActivity(false), 1000);
      return () => clearTimeout(timer);
    }
    prevActivityRef.current = unreadActivity;
  }, [unreadActivity]);

  useEffect(() => {
    if (unreadMessages > prevMessagesRef.current) {
      setShakeMessages(true);
      const timer = setTimeout(() => setShakeMessages(false), 1000);
      return () => clearTimeout(timer);
    }
    prevMessagesRef.current = unreadMessages;
  }, [unreadMessages]);

  const isActive = (path: string) => location.pathname === path;

  if (!user) return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 glass border-t border-border z-40 safe-area-inset-bottom">
      <div className="grid grid-cols-5 items-end px-2 py-2">
        {/* Home */}
        <Link
          to="/"
          className={`flex flex-col items-center gap-1 py-2 rounded-lg transition-colors ${
            isActive('/') ? 'text-brand-purple' : 'text-text-secondary'
          }`}
          aria-label="Home"
        >
          <div className="h-6 flex items-center justify-center">
            <Home className={`w-6 h-6 ${isActive('/') ? 'fill-current' : ''}`} />
          </div>
          <span className="text-xs font-medium">Home</span>
        </Link>

        {/* Activity */}
        <Link
          to="/activity"
          className={`flex flex-col items-center gap-1 py-2 rounded-lg transition-colors relative ${
            isActive('/activity') ? 'text-brand-purple' : 'text-text-secondary'
          }`}
          aria-label={`Activity${unreadActivity > 0 ? ` (${unreadActivity} unread)` : ''}`}
        >
          <div
            className={`h-6 flex items-center justify-center relative ${shakeActivity ? 'animate-notification-shake' : ''}`}
          >
            <Bell className={`w-6 h-6 ${isActive('/activity') ? 'fill-current' : ''}`} />
            {unreadActivity > 0 && (
              <span
                className={`absolute text-[10px] font-bold tabular-nums ${unreadActivity >= 10 ? '-top-2 -right-2' : '-top-1.5 -right-1.5'}`}
              >
                {unreadActivity > 99 ? '99+' : unreadActivity}
              </span>
            )}
          </div>
          <span className="text-xs font-medium">Activity</span>
        </Link>

        {/* Create Post - True Center */}
        <button
          type="button"
          onClick={() => navigate('/create-post')}
          className={`flex flex-col items-center gap-1 py-2 rounded-lg transition-colors ${
            isActive('/create-post') ? 'text-brand-purple' : 'text-text-secondary'
          }`}
          aria-label="Create post"
        >
          <div className="h-6 flex items-center justify-center">
            <Plus
              className={`w-6 h-6 ${isActive('/create-post') ? 'fill-current' : ''}`}
              strokeWidth={2.5}
            />
          </div>
          <span className="text-xs font-medium">Post</span>
        </button>

        {/* Messages */}
        <Link
          to="/messages"
          data-testid="nav-messages"
          className={`flex flex-col items-center gap-1 py-2 rounded-lg transition-colors relative ${
            isActive('/messages') ? 'text-brand-purple' : 'text-text-secondary'
          }`}
          aria-label={`Messages${unreadMessages > 0 ? ` (${unreadMessages} unread)` : ''}`}
        >
          <div
            className={`h-6 flex items-center justify-center relative ${shakeMessages ? 'animate-notification-shake' : ''}`}
          >
            <MessageSquare className={`w-6 h-6 ${isActive('/messages') ? 'fill-current' : ''}`} />
            {unreadMessages > 0 && (
              <span
                className={`absolute text-[10px] font-bold tabular-nums ${unreadMessages >= 10 ? '-top-2 -right-2' : '-top-1.5 -right-1.5'}`}
              >
                {unreadMessages > 99 ? '99+' : unreadMessages}
              </span>
            )}
          </div>
          <span className="text-xs font-medium">Messages</span>
        </Link>

        {/* Menu */}
        <div
          className={`flex flex-col items-center gap-1 py-2 rounded-lg transition-colors ${
            isActive('/settings') ? 'text-brand-purple' : 'text-text-secondary'
          }`}
        >
          <div className="h-6 flex items-center justify-center">
            <UserMenu
              isActive={isActive('/settings')}
              icon={<Menu className={`w-6 h-6 ${isActive('/settings') ? 'fill-current' : ''}`} />}
            />
          </div>
          <span className="text-xs font-medium">Menu</span>
        </div>
      </div>
    </nav>
  );
}
