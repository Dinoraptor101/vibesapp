const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');

// POST endpoint to create a new user
router.post('/create', userController.createUser);

// GET endpoint to login with a Pigeon ID
router.get('/login/:pigeonId', userController.login);

// GET endpoint to retrieve user's posts
router.get('/:userId/posts', userController.getUserPosts);

// GET endpoint to retrieve user details by userId
router.get('/:userId', userController.getUserById);

// PUT endpoint to update existing user details
router.put('/:userId', userController.updateUser);

module.exports = router;
