/**
 * Singleton SSE (Server-Sent Events) Manager
 *
 * Provides a single shared SSE connection for the entire application.
 * Multiple hooks can subscribe to events without creating duplicate connections.
 */

import { getCookie } from '@/lib/api';

const SSE_ENDPOINT = '/sse/connect';
const SSE_ENABLED = import.meta.env.VITE_USE_SSE === 'true';
const MAX_BACKOFF_MS = 30000; // 30 seconds max

type SSEEventHandler = (data: unknown) => void;
type ConnectionStateHandler = (isConnected: boolean) => void;

class SSEManager {
  private static instance: SSEManager | null = null;

  private eventSource: EventSource | null = null;
  private eventHandlers: Map<string, Set<SSEEventHandler>> = new Map();
  private connectionStateHandlers: Set<ConnectionStateHandler> = new Set();
  private attachedEventTypes: Set<string> = new Set(); // Track which event types are attached to EventSource
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private backoffTime: number = 1000;
  private isManualClose: boolean = false;
  private _isConnected: boolean = false;

  private constructor() {
    // Private constructor for singleton
  }

  static getInstance(): SSEManager {
    if (!SSEManager.instance) {
      SSEManager.instance = new SSEManager();
    }
    return SSEManager.instance;
  }

  get isConnected(): boolean {
    return this._isConnected;
  }

  /**
   * Connect to SSE endpoint (idempotent - safe to call multiple times)
   */
  connect(): void {
    // Don't connect if SSE is disabled
    if (!SSE_ENABLED) {
      console.log('[SSEManager] SSE is disabled via feature flag');
      return;
    }

    // Don't connect if already connected
    if (this.eventSource?.readyState === EventSource.OPEN) {
      console.log('[SSEManager] Already connected');
      return;
    }

    // Don't connect if connecting
    if (this.eventSource?.readyState === EventSource.CONNECTING) {
      console.log('[SSEManager] Connection in progress');
      return;
    }

    // Get auth token from cookie
    const pigeonId = getCookie('pigeonId');
    if (!pigeonId) {
      console.warn('[SSEManager] No pigeonId found, skipping SSE connection');
      return;
    }

    try {
      this.isManualClose = false;

      // Build SSE URL with auth
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const sseUrl = `${apiUrl}${SSE_ENDPOINT}?pigeonId=${pigeonId}`;

      console.log('[SSEManager] Connecting to SSE:', sseUrl);
      const eventSource = new EventSource(sseUrl);

      // Connection opened
      eventSource.onopen = () => {
        console.log('[SSEManager] Connected');
        this._isConnected = true;
        this.backoffTime = 1000; // Reset backoff
        this.notifyConnectionState(true);
      };

      // Generic error handler
      eventSource.onerror = (event) => {
        console.error('[SSEManager] Connection error:', event);
        this._isConnected = false;
        this.notifyConnectionState(false);

        if (!this.isManualClose) {
          // Attempt reconnect with exponential backoff
          console.log(`[SSEManager] Reconnecting in ${this.backoffTime}ms...`);

          this.reconnectTimeout = setTimeout(() => {
            // Exponential backoff: 1s → 2s → 4s → 8s → 16s → 30s
            this.backoffTime = Math.min(this.backoffTime * 2, MAX_BACKOFF_MS);
            this.connect();
          }, this.backoffTime);
        }
      };

      // Generic message handler - dispatches to event handlers based on message type
      eventSource.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          const eventType = message.type;
          const eventData = message.data;

          console.log(`[SSEManager] Message received: ${eventType}`);

          // Dispatch to registered handlers for this event type
          const handlers = this.eventHandlers.get(eventType);
          if (handlers && handlers.size > 0) {
            handlers.forEach((handler) => {
              try {
                handler(eventData);
              } catch (err) {
                console.error(`[SSEManager] Handler error for ${eventType}:`, err);
              }
            });
          } else {
            console.log(`[SSEManager] No handlers registered for: ${eventType}`);
          }
        } catch (err) {
          console.error('[SSEManager] Failed to parse message:', err, event.data);
        }
      };

      this.eventSource = eventSource;

      // Re-register all event listeners
      this.reattachEventListeners();
    } catch (err) {
      console.error('[SSEManager] Failed to create EventSource:', err);
      this._isConnected = false;
    }
  }

  /**
   * Disconnect from SSE endpoint
   */
  disconnect(): void {
    this.isManualClose = true;

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    this._isConnected = false;
    this.notifyConnectionState(false);
    console.log('[SSEManager] Disconnected');
  }

  /**
   * Subscribe to a specific event type
   */
  addEventListener(eventType: string, handler: SSEEventHandler): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set());
    }
    this.eventHandlers.get(eventType)?.add(handler);

    // If already connected, attach this listener to EventSource
    if (this.eventSource) {
      this.attachEventListener(eventType);
    }
  }

  /**
   * Unsubscribe from a specific event type
   */
  removeEventListener(eventType: string, handler: SSEEventHandler): void {
    this.eventHandlers.get(eventType)?.delete(handler);
  }

  /**
   * Subscribe to connection state changes
   */
  onConnectionStateChange(handler: ConnectionStateHandler): () => void {
    this.connectionStateHandlers.add(handler);
    // Immediately notify of current state
    handler(this._isConnected);
    // Return unsubscribe function
    return () => {
      this.connectionStateHandlers.delete(handler);
    };
  }

  /**
   * Internal: Notify all connection state handlers
   */
  private notifyConnectionState(isConnected: boolean): void {
    this.connectionStateHandlers.forEach((handler) => {
      try {
        handler(isConnected);
      } catch (err) {
        console.error('[SSEManager] Connection state handler error:', err);
      }
    });
  }

  /**
   * Internal: Attach a single event listener to EventSource
   */
  private attachEventListener(eventType: string): void {
    if (!this.eventSource) return;

    // Don't attach if already attached for this event type
    if (this.attachedEventTypes.has(eventType)) {
      console.log(`[SSEManager] Event listener already attached for: ${eventType}`);
      return;
    }

    console.log(`[SSEManager] Attaching event listener for: ${eventType}`);

    const eventHandler = (event: MessageEvent) => {
      console.log(`[SSEManager] Event received: ${eventType}`, event.data);

      try {
        const data = JSON.parse(event.data);
        this.eventHandlers.get(eventType)?.forEach((handler) => {
          try {
            handler(data);
          } catch (err) {
            console.error(`[SSEManager] Handler error for ${eventType}:`, err);
          }
        });
      } catch (err) {
        console.error(`[SSEManager] Failed to parse event data for ${eventType}:`, err);
      }
    };

    this.eventSource.addEventListener(eventType, eventHandler as EventListener);
    this.attachedEventTypes.add(eventType);
  }

  /**
   * Internal: Reattach all event listeners to EventSource
   */
  private reattachEventListeners(): void {
    // Clear the attached set since we have a new EventSource
    this.attachedEventTypes.clear();

    this.eventHandlers.forEach((_, eventType) => {
      this.attachEventListener(eventType);
    });
  }
}

// Export singleton instance
export const sseManager = SSEManager.getInstance();
