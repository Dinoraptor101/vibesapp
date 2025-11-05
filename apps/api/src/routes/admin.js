const express = require('express');
const router = express.Router();
const {
  adminLogin,
  updateBalance,
  deletePosts,
  getFlaggedPosts,
  dismissReports,
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

module.exports = router;
