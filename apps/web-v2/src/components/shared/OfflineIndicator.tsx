import { WifiOff } from 'lucide-react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export function OfflineIndicator() {
  const { isOnline } = useNetworkStatus();

  if (isOnline) return null;

  return (
    <div className="text-gray-400" title="You're offline. Changes will sync when reconnected.">
      <WifiOff className="w-4 h-4" />
    </div>
  );
}
