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

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  if (!user) return null;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="rounded-full focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-offset-2 focus:ring-offset-surface"
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
              className="flex items-center gap-3 px-3 py-2 text-sm text-text-primary rounded-md hover:bg-surface-hover cursor-pointer outline-none focus:bg-surface-hover"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenu.Item>

          {/* Theme Submenu */}
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger className="flex items-center gap-3 px-3 py-2 text-sm text-text-primary rounded-md hover:bg-surface-hover cursor-pointer outline-none focus:bg-surface-hover data-[state=open]:bg-surface-hover">
              {theme === 'light' && <Sun className="w-4 h-4" />}
              {theme === 'dim' && <Sunrise className="w-4 h-4" />}
              {theme === 'dark' && <Moon className="w-4 h-4" />}
              <span>Theme</span>
              <span className="ml-auto text-xs text-text-tertiary capitalize">{theme}</span>
            </DropdownMenu.SubTrigger>

            <DropdownMenu.Portal>
              <DropdownMenu.SubContent
                className="min-w-[160px] bg-surface-elevated/95 backdrop-blur-md border border-border rounded-lg shadow-xl p-1 z-50 animate-in fade-in-0 zoom-in-95"
                sideOffset={8}
              >
                <DropdownMenu.Item
                  className="flex items-center gap-3 px-3 py-2 text-sm text-text-primary rounded-md hover:bg-surface-hover cursor-pointer outline-none focus:bg-surface-hover"
                  onSelect={() => handleThemeChange('light')}
                >
                  <Sun className="w-4 h-4" />
                  <span>Light</span>
                  {theme === 'light' && <span className="ml-auto text-brand-purple">✓</span>}
                </DropdownMenu.Item>

                <DropdownMenu.Item
                  className="flex items-center gap-3 px-3 py-2 text-sm text-text-primary rounded-md hover:bg-surface-hover cursor-pointer outline-none focus:bg-surface-hover"
                  onSelect={() => handleThemeChange('dim')}
                >
                  <Sunrise className="w-4 h-4" />
                  <span>Dim</span>
                  {theme === 'dim' && <span className="ml-auto text-brand-purple">✓</span>}
                </DropdownMenu.Item>

                <DropdownMenu.Item
                  className="flex items-center gap-3 px-3 py-2 text-sm text-text-primary rounded-md hover:bg-surface-hover cursor-pointer outline-none focus:bg-surface-hover"
                  onSelect={() => handleThemeChange('dark')}
                >
                  <Moon className="w-4 h-4" />
                  <span>Dark</span>
                  {theme === 'dark' && <span className="ml-auto text-brand-purple">✓</span>}
                </DropdownMenu.Item>
              </DropdownMenu.SubContent>
            </DropdownMenu.Portal>
          </DropdownMenu.Sub>

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
