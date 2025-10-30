const express = require('express');
const { getActivities, getUnreadStatus } = require('../controllers/activity');
const router = express.Router();

// API route to get activities for a user (by originalPosterId)
router.get('/:originalPosterId', async (req, res) => {
  const originalPosterId = req.params.originalPosterId;
  try {
    const activities = await getActivities(originalPosterId);
    res.json(activities.length === 0 ? [] : activities);
  } catch (err) {
    const message = 'Server error while fetching activities:';
    console.error(message, err);
    res.status(500).json({ message: message, error: err.message });
  }
});

// API route to check unread status for a user
router.get('/unread/:originalPosterId', async (req, res) => {
  const originalPosterId = req.params.originalPosterId;
  try {
    const hasUnread = await getUnreadStatus(originalPosterId);
    res.json({ hasUnread });
  } catch (err) {
    console.error('Error fetching unread status:', err);
    res.status(500).json({
      message: 'Server error while fetching unread status',
      error: err.message,
    });
  }
});

module.exports = router;
