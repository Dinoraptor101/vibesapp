const express = require('express');
const router = express.Router();
const {
  createPost,
  getPosts,
  getPostById,
  deletePost,
  likePost,
  dislikePost,
  reportPost,
} = require('../controllers/post');
const { checkPostingRestrictions } = require('../middleware/strikeEnforcement');

router.post('/create', checkPostingRestrictions, createPost);
router.get('/', getPosts);
router.get('/:id', getPostById);
router.delete('/:postId', deletePost);
router.post('/:id/like', likePost);
router.post('/:id/dislike', dislikePost);
router.post('/:id/report', reportPost); // Phase 3.4

module.exports = router;
