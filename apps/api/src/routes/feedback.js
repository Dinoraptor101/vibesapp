const express = require('express');
const router = express.Router();
const pigeonAuth = require('../middleware/pigeonAuth');
const { submitFeedback, listFeedback, meToo, addComment } = require('../controllers/feedback');

// Submit feedback (requires auth)
router.post('/submit', pigeonAuth, submitFeedback);

// List all feedback (public, allows GET without auth via pigeonAuth)
router.get('/list', pigeonAuth, listFeedback);

// Add "Me Too" to an issue (requires auth)
router.post('/:issueNumber/me-too', pigeonAuth, meToo);

// Add comment to an issue (requires auth)
router.post('/:issueNumber/comment', pigeonAuth, addComment);

module.exports = router;
