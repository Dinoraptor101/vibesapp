const express = require('express');
const router = express.Router();
const { createIssue } = require('../controllers/issue'); // Ensure correct path

// Route for creating an issue on GitHub
router.post('/', createIssue);

module.exports = router;
