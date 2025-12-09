const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authenticate');
const {
  sendDMRequest,
  approveDMRequest,
  getConversations,
  sendDMMessage,
  declineDMRequest,
  markMessagesAsRead,
  closeConversation,
  getConversation,
  getConversationStatus,
} = require('../controllers/dm');

// Send a DM request
router.post('/request', authenticate, sendDMRequest);

// Approve a DM request
router.post('/approve', authenticate, approveDMRequest);

// Decline a DM request
router.post('/decline', authenticate, declineDMRequest);

// Send a new DM message
router.post('/message', authenticate, sendDMMessage);

// Get all conversations for the current user
router.get('/conversations/:userId', authenticate, getConversations);

// Get a specific conversation by ID
router.get('/conversation/:conversationId', authenticate, getConversation);

// Mark messages as read
router.post('/conversation/:conversationId/markAsRead', authenticate, markMessagesAsRead);

// Close a conversation
router.post('/conversation/:conversationId/close', authenticate, closeConversation);

// Check conversation status between two users
router.get('/status', authenticate, getConversationStatus);

module.exports = router;
