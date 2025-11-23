import { Loader2 } from 'lucide-react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

/**
 * OfflineIndicator Component
 *
 * Displays a subtle indicator when the user is offline.
 * Design Philosophy (Zen):
 * - Minimal and unobtrusive
 * - Appears only when offline
 * - No error messages or intrusive alerts
 * - Simple tooltip provides context
 *
 * Aligned with VibesApp's "silent and subtle" offline strategy.
 */
export function OfflineIndicator() {
  const { isOnline } = useNetworkStatus();

  if (isOnline) return null;

  return (
    <div
      className="flex items-center gap-1.5 text-gray-400 animate-in fade-in duration-300"
      title="Reconnecting..."
    >
      <Loader2 className="w-4 h-4 animate-spin" />
      <span className="text-xs">connecting...</span>
    </div>
  );
}
