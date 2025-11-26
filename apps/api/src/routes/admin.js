const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/adminAuth');
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
  getReportedPosts,
  restorePost,
  banUser,
} = require('../controllers/admin');

// Admin login (no auth required)
router.post('/login', adminLogin);

// ALL routes below require admin authentication
router.use(adminAuth);

// Update Vibes balance
router.put('/vibes', updateBalance);

// Get flagged posts (legacy - dislike system)
router.get('/flagged-posts', getFlaggedPosts);

// Phase 3.4: Get reported posts (community reports)
router.get('/reported-posts', getReportedPosts);

// Phase 3.4: Restore post (unhide + remove strike)
router.post('/posts/:postId/restore', restorePost);

// Dismiss reports for a post
router.post('/posts/:postId/dismiss-reports', dismissReports);

// Delete posts in bulk
router.delete('/posts', deletePosts);

// User management routes
router.get('/users', getUsers);
router.post('/users/:userId/toggle-ban', toggleBanUser);

// Phase 3.4: Ban user (Strike 4 + hide all posts)
router.post('/users/:userId/ban', banUser);

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
