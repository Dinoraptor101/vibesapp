/**
 * Core SSE (Server-Sent Events) Hook
 *
 * Manages EventSource connection to backend SSE endpoint with:
 * - Auto-reconnect with exponential backoff
 * - Event routing to registered handlers
 * - Feature flag support
 * - Connection state management
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { getCookie } from '@/lib/api';

const SSE_ENDPOINT = '/api/sse/connect';
const SSE_ENABLED = import.meta.env.VITE_USE_SSE === 'true';
const MAX_BACKOFF_MS = 30000; // 30 seconds max

type SSEEventHandler = (event: MessageEvent) => void;

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
 * Core SSE connection manager
 * Handles connection lifecycle, reconnection logic, and event routing
 */
export function useSSE(options: UseSSEOptions = {}): UseSSEReturn {
  const { enabled = true, onConnect, onDisconnect, onError } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const backoffTimeRef = useRef<number>(1000); // Start with 1s
  const eventHandlersRef = useRef<Map<string, Set<SSEEventHandler>>>(new Map());
  const isManualCloseRef = useRef(false);

  /**
   * Register event handler for specific event type
   */
  const addEventListener = useCallback((eventType: string, handler: SSEEventHandler) => {
    if (!eventHandlersRef.current.has(eventType)) {
      eventHandlersRef.current.set(eventType, new Set());
    }
    eventHandlersRef.current.get(eventType)?.add(handler);
  }, []);

  /**
   * Unregister event handler
   */
  const removeEventListener = useCallback((eventType: string, handler: SSEEventHandler) => {
    eventHandlersRef.current.get(eventType)?.delete(handler);
  }, []);

  /**
   * Close existing connection
   */
  const closeConnection = useCallback(() => {
    if (eventSourceRef.current) {
      isManualCloseRef.current = true;
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  /**
   * Attempt to connect to SSE endpoint
   */
  const connect = useCallback(() => {
    // Don't connect if SSE is disabled or not enabled
    if (!SSE_ENABLED || !enabled) return;

    // Don't connect if already connected
    if (eventSourceRef.current?.readyState === EventSource.OPEN) return;

    // Get auth token from cookie
    const pigeonId = getCookie('pigeonId');
    if (!pigeonId) {
      console.warn('[useSSE] No pigeonId found, skipping SSE connection');
      setError('Authentication required');
      return;
    }

    try {
      // Close any existing connection
      closeConnection();
      isManualCloseRef.current = false;

      // Build SSE URL with auth
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const sseUrl = `${apiUrl}${SSE_ENDPOINT}?pigeonId=${pigeonId}`;

      console.log('[useSSE] Connecting to SSE:', sseUrl);
      const eventSource = new EventSource(sseUrl);

      // Connection opened
      eventSource.onopen = () => {
        console.log('[useSSE] Connected');
        setIsConnected(true);
        setError(null);
        backoffTimeRef.current = 1000; // Reset backoff
        onConnect?.();
      };

      // Generic error handler
      eventSource.onerror = (event) => {
        console.error('[useSSE] Connection error:', event);
        setIsConnected(false);

        if (!isManualCloseRef.current) {
          const errorMessage = 'Connection lost';
          setError(errorMessage);
          onError?.(event);

          // Attempt reconnect with exponential backoff
          const backoffTime = backoffTimeRef.current;
          console.log(`[useSSE] Reconnecting in ${backoffTime}ms...`);

          reconnectTimeoutRef.current = setTimeout(() => {
            // Exponential backoff: 1s → 2s → 4s → 8s → 16s → 30s
            backoffTimeRef.current = Math.min(backoffTime * 2, MAX_BACKOFF_MS);
            connect();
          }, backoffTime);
        }

        onDisconnect?.();
      };

      // Generic message handler - routes to registered handlers
      eventSource.onmessage = (event) => {
        console.log('[useSSE] Generic message received:', event.data);
      };

      eventSourceRef.current = eventSource;
    } catch (err) {
      console.error('[useSSE] Failed to create EventSource:', err);
      setError(err instanceof Error ? err.message : 'Connection failed');
      setIsConnected(false);
    }
  }, [enabled, onConnect, onDisconnect, onError, closeConnection]);

  /**
   * Setup event listeners when handlers change
   */
  useEffect(() => {
    const eventSource = eventSourceRef.current;
    if (!eventSource) return;

    // Register all event handlers with EventSource
    const cleanupFns: (() => void)[] = [];

    eventHandlersRef.current.forEach((handlers, eventType) => {
      const eventHandler = (event: MessageEvent) => {
        console.log(`[useSSE] Event received: ${eventType}`, event.data);

        // Call all registered handlers for this event type
        handlers.forEach((handler) => {
          try {
            handler(event);
          } catch (err) {
            console.error(`[useSSE] Handler error for ${eventType}:`, err);
          }
        });
      };

      eventSource.addEventListener(eventType, eventHandler as EventListener);
      cleanupFns.push(() => {
        eventSource.removeEventListener(eventType, eventHandler as EventListener);
      });
    });

    return () => {
      cleanupFns.forEach((cleanup) => {
        cleanup();
      });
    };
  }, []); // Only run once, handlers managed via ref

  /**
   * Initial connection and cleanup
   */
  useEffect(() => {
    connect();

    return () => {
      closeConnection();
    };
  }, [connect, closeConnection]);

  return {
    isConnected,
    error,
    addEventListener,
    removeEventListener,
  };
}
