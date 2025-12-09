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
  bulkDeleteUsers,
  bulkDeletePostsByUsers,
  getDashboardMetrics,
  getActivityData,
  getSettings,
  updateSettings,
  getReportedPosts,
  restorePost,
  banUser,
  cleanupTestData,
} = require('../controllers/admin');

// Middleware to validate E2E bypass token (for test cleanup only)
const e2eBypassAuth = (req, res, next) => {
  const bypassToken = req.headers['x-e2e-bypass'];
  const expectedToken = process.env.E2E_BYPASS_TOKEN;

  if (!expectedToken) {
    return res.status(500).json({ error: 'Server configuration error: E2E_BYPASS_TOKEN not set' });
  }

  if (bypassToken && bypassToken === expectedToken) {
    return next();
  }

  return res.status(403).json({ error: 'Forbidden: Invalid E2E bypass token' });
};

// Admin login (no auth required)
router.post('/login', adminLogin);

// Test data cleanup (E2E bypass token required - for automated tests only)
router.delete('/cleanup-test-data', e2eBypassAuth, cleanupTestData);

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

// Bulk operations (MUST be before parameterized routes to avoid matching :userId)
router.delete('/users/bulk', bulkDeleteUsers);
router.delete('/users/bulk/posts', bulkDeletePostsByUsers);

// Individual user routes (parameterized - must come after specific paths)
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

// Settings routes
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

module.exports = router;
