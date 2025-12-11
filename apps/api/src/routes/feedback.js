const express = require('express');
const router = express.Router();
const pigeonAuth = require('../middleware/pigeonAuth');
const { submitFeedback } = require('../controllers/feedback');

// Submit feedback (requires auth)
router.post('/submit', pigeonAuth, submitFeedback);

module.exports = router;
