const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const { authenticate } = require('../middleware/authenticate');

// POST endpoint to create a new user
router.post('/create', userController.createUser);

// GET endpoint to login with a Pigeon ID
router.get('/login/:pigeonId', userController.login);

// GET endpoint to retrieve user's posts
router.get('/:userId/posts', userController.getUserPosts);

// GET endpoint to retrieve user profile with stats (Phase 4.2)
router.get('/:userId/profile', authenticate, userController.getUserProfile);

// POST endpoint to toggle follow/unfollow (Phase 4.2)
router.post('/:userId/follow', authenticate, userController.toggleFollow);

// GET endpoint to retrieve user's followers (Phase 4.2)
router.get('/:userId/followers', authenticate, userController.getFollowers);

// GET endpoint to retrieve users that this user follows (Phase 4.2)
router.get('/:userId/following', authenticate, userController.getFollowing);

// GET endpoint to retrieve user details by userId
router.get('/:userId', userController.getUserById);

// GET endpoint to retrieve user strikes (Phase 3.4)
router.get('/:userId/strikes', userController.getUserStrikes);

// PUT endpoint to update existing user details
router.put('/:userId', userController.updateUser);

module.exports = router;
