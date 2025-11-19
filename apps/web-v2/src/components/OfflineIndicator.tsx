/**
 * Offline Indicator Component
 * 
 * Displays a subtle grey wifi-off icon in the header when offline.
 * Non-clickable, purely informational.
 */

import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div
      className="text-gray-400"
      title="You're offline. Changes will sync when reconnected."
      aria-label="Offline indicator"
    >
      <WifiOff className="w-4 h-4" aria-hidden="true" />
    </div>
  );
}
