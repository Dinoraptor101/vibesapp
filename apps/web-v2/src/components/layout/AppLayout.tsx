/**
 * AppLayout Component
 *
 * Main layout wrapper for authenticated pages.
 * Includes TopNav (desktop), BottomNav (mobile), and main content area.
 */

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

      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-0">{children}</main>

      {/* Bottom Navigation (Mobile) */}
      <BottomNav />
    </div>
  );
}
