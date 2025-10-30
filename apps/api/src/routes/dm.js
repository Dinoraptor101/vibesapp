const express = require('express');
const router = express.Router();
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
router.post(
  '/request',
  (req, res, next) => {
    next();
  },
  sendDMRequest
);

// Approve a DM request
router.post(
  '/approve',
  (req, res, next) => {
    next();
  },
  approveDMRequest
);

// Decline a DM request
router.post(
  '/decline',
  (req, res, next) => {
    next();
  },
  declineDMRequest
);

// Send a new DM message
router.post(
  '/message',
  (req, res, next) => {
    console.log('POST /message - sendDMMessage');
    next();
  },
  sendDMMessage
);

// Get all conversations for the current user
router.get(
  '/conversations/:userId',
  (req, res, next) => {
    next();
  },
  getConversations
);

// Get a specific conversation by ID
router.get(
  '/conversation/:conversationId',
  (req, res, next) => {
    next();
  },
  getConversation
);

// Mark messages as read
router.post(
  '/conversation/:conversationId/markAsRead',
  (req, res, next) => {
    next();
  },
  markMessagesAsRead
);

// Close a conversation
router.post(
  '/conversation/:conversationId/close',
  (req, res, next) => {
    next();
  },
  closeConversation
);

// Check conversation status between two users
router.get(
  '/status',
  (req, res, next) => {
    next();
  },
  getConversationStatus
);

module.exports = router;
