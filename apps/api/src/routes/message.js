// routes/messages.js

const express = require('express');
const router = express.Router();
const {
  sendMessage,
  likeMessage,
  dislikeMessage,
  getMessagesByGroupChat,
  sendDMMessage,
} = require('../controllers/message');
const { watchMessageToggle } = require('../controllers/activity');

// Send a new message
router.post(
  '/',
  (req, res, next) => {
    next();
  },
  sendMessage
);

// Like a message
router.post(
  '/:id/like',
  (req, res, next) => {
    next();
  },
  likeMessage
);

// Dislike a message
router.post(
  '/:id/dislike',
  (req, res, next) => {
    next();
  },
  dislikeMessage
);

// Watch a message
router.post(
  '/:id/watch',
  (req, res, next) => {
    next();
  },
  watchMessageToggle
);

// Fetch messages by groupChatId
router.get(
  '/groupChat/:groupChatId/user/:userId',
  (req, res, next) => {
    next();
  },
  getMessagesByGroupChat
);

module.exports = router;
