/**
 * UserMenu Component
 *
 * Dropdown menu triggered by user avatar showing profile options.
 * Uses Radix UI DropdownMenu for accessibility.
 */

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { LogOut, Moon, Settings, Sun, Sunrise, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar } from '@/components/ui-next';
import { useAuth } from '@/features/auth/context/useAuth';
import { getAvatarUrl } from '@/lib/avatarUtils';
import type { Theme } from '@/lib/theme';
import { useTheme } from '@/lib/useTheme';

export function UserMenu() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleThemeChange = () => {
    // Cycle through themes: light -> dim -> dark -> light
    const themeOrder: Theme[] = ['light', 'dim', 'dark'];
    const currentIndex = themeOrder.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    setTheme(themeOrder[nextIndex]);
  };

  if (!user) return null;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          data-testid="user-menu-button"
          className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple"
          aria-label="User menu"
        >
          <Avatar
            src={getAvatarUrl(user.profilePictureUrl)}
            alt={user.username}
            name={user.username}
            size="md"
          />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[220px] bg-surface-elevated/95 backdrop-blur-md border border-border rounded-lg shadow-xl p-1 z-50 animate-in fade-in-0 zoom-in-95"
          sideOffset={8}
          align="end"
        >
          {/* User Info */}
          <div className="px-3 py-2 border-b border-border">
            <p className="text-sm font-semibold text-text-primary truncate">{user.username}</p>
            <p className="text-xs text-text-tertiary">{user.mbtiPersonality}</p>
          </div>

          {/* Profile */}
          <DropdownMenu.Item asChild>
            <Link
              to={`/profile/${user.userId}`}
              className="flex items-center gap-3 px-3 py-2 text-sm text-text-primary rounded-md hover:bg-surface-hover cursor-pointer outline-none focus:bg-surface-hover"
            >
              <User className="w-4 h-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenu.Item>

          {/* Settings */}
          <DropdownMenu.Item asChild>
            <Link
              to="/settings"
              data-testid="settings-menu-item"
              className="flex items-center gap-3 px-3 py-2 text-sm text-text-primary rounded-md hover:bg-surface-hover cursor-pointer outline-none focus:bg-surface-hover"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenu.Item>

          {/* Theme Toggle */}
          <DropdownMenu.Item
            data-testid="theme-toggle-button"
            className="flex items-center gap-3 px-3 py-2 text-sm text-text-primary rounded-md hover:bg-surface-hover cursor-pointer outline-none focus:bg-surface-hover"
            onSelect={(e) => {
              e.preventDefault(); // Prevent menu from closing
              handleThemeChange();
            }}
          >
            {theme === 'light' && <Sun className="w-4 h-4" />}
            {theme === 'dim' && <Sunrise className="w-4 h-4" />}
            {theme === 'dark' && <Moon className="w-4 h-4" />}
            <span>Theme</span>
            <span className="ml-auto text-xs text-text-tertiary capitalize">{theme}</span>
          </DropdownMenu.Item>

          {/* Separator */}
          <DropdownMenu.Separator className="h-px bg-border my-1" />

          {/* Logout */}
          <DropdownMenu.Item
            className="flex items-center gap-3 px-3 py-2 text-sm text-vibe-negative rounded-md hover:bg-vibe-negative-bg cursor-pointer outline-none focus:bg-vibe-negative-bg"
            onSelect={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            <span>Log out</span>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
