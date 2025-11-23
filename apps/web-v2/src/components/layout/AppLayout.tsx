/**
 * AppLayout Component
 *
 * Main layout wrapper for authenticated pages.
 * Includes TopNav (desktop), BottomNav (mobile), and main content area.
 */

import { OfflineIndicator } from '@/components/shared/OfflineIndicator';
import { BottomNav } from './BottomNav';
import { TopNav } from './TopNav';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Top Navigation (Desktop) */}
      <TopNav />

      {/* Mobile Offline Indicator - shown at top center on mobile only */}
      <div className="md:hidden fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-surface-elevated/95 backdrop-blur-md px-4 py-2 rounded-full border border-border shadow-lg">
        <OfflineIndicator />
      </div>

      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-0">{children}</main>

      {/* Bottom Navigation (Mobile) */}
      <BottomNav />
    </div>
  );
}
