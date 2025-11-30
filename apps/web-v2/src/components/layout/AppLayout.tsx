/**
 * AppLayout Component
 *
 * Main layout wrapper for authenticated pages.
 * Includes TopNav (desktop), BottomNav (mobile), and main content area.
 *
 * Standard Layout:
 * - pt-8 for breathing room (works for mobile notch + desktop aesthetics)
 * - px-4 side padding
 * - max-w-2xl centered
 *
 * For immersive/full-bleed pages (chat, media viewers), use ImmersiveLayout instead.
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
        className="flex-1"
        style={{
          paddingTop: 'var(--top-nav-height)', // Desktop only - TopNav is hidden md:flex
          paddingBottom: 'var(--bottom-nav-height)', // Mobile only - BottomNav is md:hidden
        }}
      >
        {/* Standard content wrapper: consistent padding + width */}
        <div className="pt-8 px-4 max-w-2xl mx-auto">{children}</div>
      </main>

      {/* Bottom Navigation (Mobile) */}
      <BottomNav />
    </div>
  );
}
