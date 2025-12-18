const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authenticate');
const sseManager = require('../handlers/sseManager');
const Conversation = require('../models/Conversation');

/**
 * Notify conversation participants about online/offline status
 * @param {string} userId - User who came online/offline
 * @param {boolean} isOnline - Whether user is online or offline
 */
async function notifyConversationParticipants(userId, isOnline) {
  try {
    // Find all approved conversations for this user
    const conversations = await Conversation.find({
      $or: [{ user1Id: userId }, { user2Id: userId }],
      status: 'approved', // Only notify for active conversations
    });

    // Get list of participants to notify (excluding the user themselves)
    const participantsToNotify = new Set();
    for (const conversation of conversations) {
      const otherUserId = conversation.user1Id === userId ? conversation.user2Id : conversation.user1Id;
      participantsToNotify.add(otherUserId);
    }

    // Send presence update to each participant
    const userIdsToNotify = Array.from(participantsToNotify);
    if (userIdsToNotify.length > 0) {
      const result = sseManager.broadcastToMultiple(userIdsToNotify, 'presence-update', {
        userId: userId,
        isOnline: isOnline,
      });
      console.log(`[SSE Presence] Notified ${result.success} users about ${userId} going ${isOnline ? 'online' : 'offline'}`);
    }
  } catch (error) {
    console.error('[SSE Presence] Error notifying conversation participants:', error);
  }
}

/**
 * SSE Connection Endpoint
 * Establishes a Server-Sent Events connection for real-time updates
 *
 * GET /api/sse/connect
 * Requires: Authentication (pigeonId in cookies or headers)
 * Returns: Event stream (text/event-stream)
 */
router.get('/connect', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId; // Use public userId, not pigeonId

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable buffering for nginx

    // Important: Don't use compression for SSE
    res.setHeader('Content-Encoding', 'none');

    // Disable any timeout
    res.setTimeout(0);

    console.log(`[SSE Route] Client connecting: ${userId}`);

    // Add client to SSE manager
    const added = sseManager.addClient(userId, res);

    if (!added) {
      console.error(`[SSE Route] Failed to add client ${userId}`);
      return res.status(500).end();
    }

    // Send initial connection event
    const initialEvent = {
      type: 'connected',
      data: {
        message: 'SSE connection established',
        userId: userId,
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };

    res.write(`data: ${JSON.stringify(initialEvent)}\n\n`);

    console.log(`[SSE Route] Initial event sent to ${userId}`);

    // Notify conversation participants that this user is now online
    await notifyConversationParticipants(userId, true);

    // Handle client disconnect
    req.on('close', () => {
      console.log(`[SSE Route] Client disconnected: ${userId}`);
      sseManager.removeClient(userId);
      // Notify conversation participants that this user is now offline
      notifyConversationParticipants(userId, false);
    });

    // Handle connection errors
    req.on('error', (error) => {
      console.error(`[SSE Route] Connection error for ${userId}:`, error.message);
      sseManager.removeClient(userId);
      // Notify conversation participants that this user is now offline
      notifyConversationParticipants(userId, false);
    });

    // Send periodic heartbeat to keep connection alive (every 30 seconds)
    const heartbeatInterval = setInterval(() => {
      if (res.writableEnded) {
        clearInterval(heartbeatInterval);
        return;
      }

      try {
        // Send a comment as heartbeat (comments start with : in SSE)
        res.write(`: heartbeat ${Date.now()}\n\n`);
      } catch (error) {
        console.error(`[SSE Route] Heartbeat error for ${userId}:`, error.message);
        clearInterval(heartbeatInterval);
        sseManager.removeClient(userId);
      }
    }, 30000);

    // Clean up interval on disconnect
    res.on('close', () => {
      clearInterval(heartbeatInterval);
    });
  } catch (error) {
    console.error('[SSE Route] Error establishing SSE connection:', error);

    // Try to send error message if possible
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to establish SSE connection' });
    } else {
      res.end();
    }
  }
});

/**
 * SSE Status Endpoint
 * Returns information about active SSE connections (for debugging/monitoring)
 *
 * GET /api/sse/status
 * Requires: Authentication
 * Returns: Connection statistics
 */
router.get('/status', authenticate, (req, res) => {
  try {
    const userId = req.user.userId;

    const stats = {
      isConnected: sseManager.isConnected(userId),
      totalActiveConnections: sseManager.getActiveConnections(),
      connectionDetails: sseManager.getConnectionStats(),
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('[SSE Route] Error getting status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get SSE status',
    });
  }
});

/**
 * SSE Test Broadcast Endpoint (for testing purposes)
 * Sends a test event to the authenticated user's SSE connection
 *
 * POST /api/sse/test-broadcast
 * Requires: Authentication
 * Body: { message: string }
 * Returns: Broadcast result
 */
router.post('/test-broadcast', authenticate, (req, res) => {
  try {
    const userId = req.user.userId;
    const { message = 'Test broadcast message' } = req.body;

    const result = sseManager.broadcast(userId, 'test', {
      message,
      sentAt: new Date().toISOString(),
    });

    res.json({
      success: result,
      message: result
        ? 'Test event broadcasted successfully'
        : 'User not connected or broadcast failed',
    });
  } catch (error) {
    console.error('[SSE Route] Error in test broadcast:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send test broadcast',
    });
  }
});

module.exports = router;
