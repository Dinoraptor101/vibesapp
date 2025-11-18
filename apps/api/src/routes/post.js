const express = require('express');
const router = express.Router();
const {
  createPost,
  getPosts,
  getPostById,
  deletePost,
  likePost,
  unlikePost,
  reactToPost,
  reportPost,
  searchPosts,
} = require('../controllers/post');
const { checkPostingRestrictions } = require('../middleware/strikeEnforcement');
const pigeonAuth = require('../middleware/pigeonAuth');

router.post('/create', checkPostingRestrictions, createPost);
router.get('/', pigeonAuth, getPosts);
router.get('/search', searchPosts); // Search must come before /:id to avoid conflict
router.get('/:id', getPostById);
router.delete('/:postId', deletePost);
router.post('/:id/like', likePost);
router.post('/:id/react', reactToPost); // Toggle like/unlike
router.delete('/:id/reaction', unlikePost); // Unlike a post
router.post('/:id/report', reportPost); // Phase 3.4

module.exports = router;
