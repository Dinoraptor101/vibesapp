const express = require('express');
const router = express.Router();
const { createComment, getComments, deleteComment } = require('../controllers/comment');

// Create a comment
router.post('/', createComment);

// Get comments for a post
router.get('/:postId', getComments);

// Delete a comment
router.delete('/:commentId', deleteComment);

module.exports = router;
