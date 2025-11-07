const express = require('express');
const router = express.Router();
const {
  adminLogin,
  updateBalance,
  deletePosts,
  getFlaggedPosts,
  dismissReports,
  getUsers,
  toggleBanUser,
  regeneratePassword,
  deleteUser,
  getUserPosts,
  bulkDeleteUserPosts,
  getDashboardMetrics,
  getActivityData,
  updateSettings,
} = require('../controllers/admin');

// Admin login (no auth required)
router.post('/login', adminLogin);

// Update Vibes balance
router.put('/vibes', updateBalance);

// Get flagged posts
router.get('/flagged-posts', getFlaggedPosts);

// Dismiss reports for a post
router.post('/posts/:postId/dismiss-reports', dismissReports);

// Delete posts in bulk
router.delete('/posts', deletePosts);

// User management routes
router.get('/users', getUsers);
router.post('/users/:userId/toggle-ban', toggleBanUser);
router.post('/users/:userId/regenerate-password', regeneratePassword);
router.delete('/users/:userId', deleteUser);
router.get('/users/:userId/posts', getUserPosts);
router.delete('/users/:userId/posts', bulkDeleteUserPosts);

// Analytics routes
router.get('/metrics', getDashboardMetrics);
router.get('/activity', getActivityData);

// Settings route
router.put('/settings', updateSettings);

module.exports = router;
