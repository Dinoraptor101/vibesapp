/**
 * SSEManager - Singleton class for managing Server-Sent Events connections
 *
 * Handles real-time event streaming to connected clients using SSE protocol.
 * Maintains active connections and provides methods to broadcast events to users.
 *
 * @class SSEManager
 */
class SSEManager {
  constructor() {
    if (SSEManager.instance) {
      return SSEManager.instance;
    }

    // Map<userId: string, response: Express.Response>
    this.connections = new Map();

    // Track connection metadata for debugging
    this.connectionMetadata = new Map();

    SSEManager.instance = this;

    console.log('[SSEManager] Initialized');
  }

  /**
   * Add a new SSE client connection
   * @param {string} userId - The user's ID
   * @param {Express.Response} response - Express response object
   * @returns {boolean} - Success status
   */
  addClient(userId, response) {
    try {
      if (!userId || !response) {
        console.error('[SSEManager] Invalid parameters for addClient');
        return false;
      }

      // Close existing connection if user reconnects
      if (this.connections.has(userId)) {
        console.log(`[SSEManager] User ${userId} reconnecting, closing old connection`);
        const oldResponse = this.connections.get(userId);
        try {
          oldResponse.end();
        } catch (error) {
          console.error(`[SSEManager] Error closing old connection: ${error.message}`);
        }
      }

      // Store the connection
      this.connections.set(userId, response);
      this.connectionMetadata.set(userId, {
        connectedAt: new Date(),
        lastEventAt: null,
        eventCount: 0,
      });

      console.log(
        `[SSEManager] Client added: ${userId} (Total connections: ${this.connections.size})`
      );
      return true;
    } catch (error) {
      console.error(`[SSEManager] Error adding client ${userId}:`, error);
      return false;
    }
  }

  /**
   * Remove an SSE client connection
   * @param {string} userId - The user's ID
   * @returns {boolean} - Success status
   */
  removeClient(userId) {
    try {
      if (!userId) {
        console.error('[SSEManager] Invalid userId for removeClient');
        return false;
      }

      const hadConnection = this.connections.has(userId);

      if (hadConnection) {
        const response = this.connections.get(userId);

        // Safely end the connection
        try {
          if (!response.writableEnded) {
            response.end();
          }
        } catch (error) {
          console.error(`[SSEManager] Error ending response for ${userId}:`, error.message);
        }

        this.connections.delete(userId);
        this.connectionMetadata.delete(userId);

        console.log(
          `[SSEManager] Client removed: ${userId} (Total connections: ${this.connections.size})`
        );
      }

      return hadConnection;
    } catch (error) {
      console.error(`[SSEManager] Error removing client ${userId}:`, error);
      return false;
    }
  }

  /**
   * Broadcast an event to a specific user
   * @param {string} userId - The user's ID
   * @param {string} eventType - Type of event (e.g., 'notification', 'message')
   * @param {object} data - Event payload
   * @returns {boolean} - Success status
   */
  broadcast(userId, eventType, data) {
    try {
      if (!userId || !eventType) {
        console.error('[SSEManager] Invalid parameters for broadcast');
        return false;
      }

      const response = this.connections.get(userId);

      if (!response) {
        console.log(`[SSEManager] No active connection for user ${userId}`);
        return false;
      }

      // Check if connection is still writable
      if (response.writableEnded) {
        console.log(`[SSEManager] Connection ended for user ${userId}, removing`);
        this.removeClient(userId);
        return false;
      }

      // Format SSE message
      const eventData = {
        type: eventType,
        data: data,
        timestamp: new Date().toISOString(),
      };

      const sseMessage = `data: ${JSON.stringify(eventData)}\n\n`;

      // Send the event
      response.write(sseMessage);

      // Update metadata
      const metadata = this.connectionMetadata.get(userId);
      if (metadata) {
        metadata.lastEventAt = new Date();
        metadata.eventCount++;
      }

      console.log(`[SSEManager] Broadcasted '${eventType}' to user ${userId}`);
      return true;
    } catch (error) {
      console.error(`[SSEManager] Error broadcasting to ${userId}:`, error);

      // Remove broken connection
      this.removeClient(userId);
      return false;
    }
  }

  /**
   * Broadcast an event to multiple users
   * @param {string[]} userIds - Array of user IDs
   * @param {string} eventType - Type of event
   * @param {object} data - Event payload
   * @returns {object} - Results summary { success: number, failed: number }
   */
  broadcastToMultiple(userIds, eventType, data) {
    try {
      if (!Array.isArray(userIds) || userIds.length === 0) {
        console.error('[SSEManager] Invalid userIds array for broadcastToMultiple');
        return { success: 0, failed: 0 };
      }

      let successCount = 0;
      let failedCount = 0;

      for (const userId of userIds) {
        const result = this.broadcast(userId, eventType, data);
        if (result) {
          successCount++;
        } else {
          failedCount++;
        }
      }

      console.log(
        `[SSEManager] Broadcast to multiple users - Success: ${successCount}, Failed: ${failedCount}`
      );

      return { success: successCount, failed: failedCount };
    } catch (error) {
      console.error('[SSEManager] Error in broadcastToMultiple:', error);
      return { success: 0, failed: userIds.length };
    }
  }

  /**
   * Check if a user has an active SSE connection
   * @param {string} userId - The user's ID
   * @returns {boolean} - Connection status
   */
  isConnected(userId) {
    if (!userId) {
      return false;
    }

    const hasConnection = this.connections.has(userId);

    if (hasConnection) {
      const response = this.connections.get(userId);
      // Double check if connection is still writable
      if (response.writableEnded) {
        this.removeClient(userId);
        return false;
      }
    }

    return hasConnection;
  }

  /**
   * Get the number of active connections
   * @returns {number} - Count of active connections
   */
  getActiveConnections() {
    return this.connections.size;
  }

  /**
   * Get detailed statistics about connections
   * @returns {object} - Connection statistics
   */
  getConnectionStats() {
    const stats = {
      totalConnections: this.connections.size,
      connections: [],
    };

    for (const [userId, metadata] of this.connectionMetadata.entries()) {
      stats.connections.push({
        userId,
        connectedAt: metadata.connectedAt,
        lastEventAt: metadata.lastEventAt,
        eventCount: metadata.eventCount,
        duration: Date.now() - metadata.connectedAt.getTime(),
      });
    }

    return stats;
  }

  /**
   * Get online status for multiple users
   * @param {string[]} userIds - Array of user IDs to check
   * @returns {Object.<string, boolean>} - Map of userId to online status
   */
  getOnlineStatus(userIds) {
    if (!Array.isArray(userIds)) {
      console.error('[SSEManager] Invalid userIds array for getOnlineStatus');
      return {};
    }

    const onlineStatus = {};
    for (const userId of userIds) {
      onlineStatus[userId] = this.isConnected(userId);
    }

    return onlineStatus;
  }

  /**
   * Get all currently online user IDs
   * @returns {string[]} - Array of online user IDs
   */
  getOnlineUserIds() {
    return Array.from(this.connections.keys());
  }

  /**
   * Clean up all connections (useful for graceful shutdown)
   */
  cleanup() {
    console.log(`[SSEManager] Cleaning up ${this.connections.size} connections`);

    for (const [userId, response] of this.connections.entries()) {
      try {
        if (!response.writableEnded) {
          response.write(
            'data: {"type":"server_shutdown","message":"Server is shutting down"}\n\n'
          );
          response.end();
        }
      } catch (error) {
        console.error(`[SSEManager] Error during cleanup for ${userId}:`, error.message);
      }
    }

    this.connections.clear();
    this.connectionMetadata.clear();

    console.log('[SSEManager] Cleanup complete');
  }
}

// Create and export singleton instance
const sseManager = new SSEManager();

module.exports = sseManager;
