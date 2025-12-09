/**
 * Core SSE (Server-Sent Events) Hook
 *
 * Uses singleton SSEManager to provide:
 * - Single shared connection across all hooks
 * - Auto-reconnect with exponential backoff
 * - Event routing to registered handlers
 * - Feature flag support
 * - Connection state management
 */

import { useCallback, useEffect, useState } from 'react';
import { sseManager } from '@/lib/sse';

const SSE_ENABLED = import.meta.env.VITE_USE_SSE === 'true';

type SSEEventHandler = (data: unknown) => void;

interface UseSSEOptions {
  enabled?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

interface UseSSEReturn {
  isConnected: boolean;
  error: string | null;
  addEventListener: (eventType: string, handler: SSEEventHandler) => void;
  removeEventListener: (eventType: string, handler: SSEEventHandler) => void;
}

/**
 * Core SSE connection manager hook
 * Uses singleton SSEManager - multiple hooks share one connection
 */
export function useSSE(options: UseSSEOptions = {}): UseSSEReturn {
  const { enabled = true, onConnect, onDisconnect } = options;

  const [isConnected, setIsConnected] = useState(sseManager.isConnected);
  const [error, setError] = useState<string | null>(null);

  /**
   * Register event handler for specific event type
   */
  const addEventListener = useCallback((eventType: string, handler: SSEEventHandler) => {
    sseManager.addEventListener(eventType, handler);
  }, []);

  /**
   * Unregister event handler
   */
  const removeEventListener = useCallback((eventType: string, handler: SSEEventHandler) => {
    sseManager.removeEventListener(eventType, handler);
  }, []);

  /**
   * Subscribe to connection state changes
   */
  useEffect(() => {
    const unsubscribe = sseManager.onConnectionStateChange((connected) => {
      setIsConnected(connected);
      setError(connected ? null : 'Connection lost');

      if (connected) {
        onConnect?.();
      } else {
        onDisconnect?.();
      }
    });

    return unsubscribe;
  }, [onConnect, onDisconnect]);

  /**
   * Connect to SSE on mount (if enabled)
   */
  useEffect(() => {
    if (SSE_ENABLED && enabled) {
      sseManager.connect();
    }
    // Note: We don't disconnect on unmount - singleton manages connection lifecycle
  }, [enabled]);

  return {
    isConnected,
    error,
    addEventListener,
    removeEventListener,
  };
}
