const express = require('express');
const router = express.Router();
const pigeonAuth = require('../middleware/pigeonAuth');
const { submitFeedback, listFeedback } = require('../controllers/feedback');

// Submit feedback (requires auth)
router.post('/submit', pigeonAuth, submitFeedback);

// List all feedback (public read, but still requires auth to prevent scraping)
router.get('/list', pigeonAuth, listFeedback);

module.exports = router;
