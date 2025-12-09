/**
 * ImmersiveLayout Component
 *
 * Full-bleed layout for immersive experiences like:
 * - Conversation/chat views
 * - Media viewers
 * - Full-screen modals
 *
 * No padding, no max-width - page controls everything.
 * Still includes nav elements for navigation.
 */

import { OfflineIndicator } from '@/components/shared/OfflineIndicator';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { BottomNav } from './BottomNav';
import { TopNav } from './TopNav';

interface ImmersiveLayoutProps {
  children: React.ReactNode;
  /** Hide navigation elements entirely (default: false) */
  hideNav?: boolean;
}

export function ImmersiveLayout({ children, hideNav = false }: ImmersiveLayoutProps) {
  const { isOnline } = useNetworkStatus();

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Top Navigation (Desktop) - Optional */}
      {!hideNav && <TopNav />}

      {/* Mobile Offline Indicator */}
      {!isOnline && (
        <div className="md:hidden fixed top-4 left-1/2 -translate-x-1/2 z-50 glass px-4 py-2 rounded-full border border-border">
          <OfflineIndicator />
        </div>
      )}

      {/* Main Content - Full bleed, no padding */}
      <main className="flex-1">{children}</main>

      {/* Bottom Navigation (Mobile) - Optional */}
      {!hideNav && <BottomNav />}
    </div>
  );
}
