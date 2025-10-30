const express = require('express');
const router = express.Router();
const {
  createPost,
  getPosts,
  getPostById,
  deletePost,
  likePost,
  dislikePost,
} = require('../controllers/post');

router.post('/create', createPost);
router.get('/', getPosts);
router.get('/:id', getPostById);
router.delete('/:postId', deletePost);
router.post('/:id/like', likePost);
router.post('/:id/dislike', dislikePost);

module.exports = router;
