// routes/groupChats.js

const express = require('express');
const router = express.Router();
const { getGroupChats, createGroupChat } = require('../controllers/groupchat');
const { watchGroupChatToggle, getGroupChatWatchStatus } = require('../controllers/activity');

// Fetch group chats by postId
router.get('/', getGroupChats);

// Create a new group chat
router.post('/', createGroupChat);

// Toggle Watch status
router.post('/:id/watch', watchGroupChatToggle);

// Route to get watch status for a group chat
router.get('/:groupChatId/watch/status/:userId', getGroupChatWatchStatus);

module.exports = router;
