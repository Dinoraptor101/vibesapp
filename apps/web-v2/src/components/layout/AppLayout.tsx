/**
 * AppLayout Component
 *
 * Main layout wrapper for authenticated pages.
 * Includes TopNav (desktop), BottomNav (mobile), and main content area.
 */

import { OfflineIndicator } from '@/components/shared/OfflineIndicator';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { BottomNav } from './BottomNav';
import { TopNav } from './TopNav';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { isOnline } = useNetworkStatus();

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Top Navigation (Desktop) - Fixed position */}
      <TopNav />

      {/* Mobile Offline Indicator - shown at top center on mobile only */}
      {!isOnline && (
        <div className="md:hidden fixed top-4 left-1/2 -translate-x-1/2 z-50 glass px-4 py-2 rounded-full border border-border">
          <OfflineIndicator />
        </div>
      )}

      {/* Main Content - md:pt adds padding for fixed TopNav on desktop */}
      <main
        className="flex-1 md:pt-[var(--top-nav-height)]"
        style={{ paddingBottom: 'var(--bottom-nav-height)' }}
      >
        {children}
      </main>

      {/* Bottom Navigation (Mobile) */}
      <BottomNav />
    </div>
  );
}
