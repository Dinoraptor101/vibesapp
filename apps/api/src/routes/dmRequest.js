const express = require('express');
const router = express.Router();
const dmRequestController = require('../controllers/dmRequest');
const { authenticate } = require('../middleware/authenticate');

// All routes require authentication
router.use(authenticate);

// Send DM request to a user
router.post('/:userId', dmRequestController.sendDMRequest);

// Get all pending DM requests (as recipient)
router.get('/', dmRequestController.getDMRequests);

// Accept a DM request
router.post('/:requestId/accept', dmRequestController.acceptDMRequest);

// Decline a DM request
router.post('/:requestId/decline', dmRequestController.declineDMRequest);

// Check DM request status with a user
router.get('/status/:userId', dmRequestController.checkDMRequestStatus);

module.exports = router;
