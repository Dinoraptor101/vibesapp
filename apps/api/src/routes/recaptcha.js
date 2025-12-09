const express = require('express');
const router = express.Router();
const recaptchaController = require('../controllers/recaptcha');

// Define the POST route for recaptcha verification
router.post('/', recaptchaController.verifyToken);

module.exports = router;
