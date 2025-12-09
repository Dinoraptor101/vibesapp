const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityNew');
const { authenticate } = require('../middleware/authenticate');

// Get activities for a user
router.get('/:userId', authenticate, activityController.getActivities);

// Mark activity as read
router.patch('/:activityId/read', authenticate, activityController.markAsRead);

// Mark all activities as read
router.patch('/:userId/read-all', authenticate, activityController.markAllAsRead);

// Get unread counts
router.get('/:userId/unread-count', authenticate, activityController.getUnreadCounts);

module.exports = router;
