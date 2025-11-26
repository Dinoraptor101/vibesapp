const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const { authenticate } = require('../middleware/authenticate');

// GET endpoint to generate a unique Pigeon ID
router.get('/generate-pigeon-id', userController.generateUniquePigeonId);

// POST endpoint to create a new user (with reCAPTCHA)
router.post('/create', userController.createUser);

// POST endpoint to login with a Pigeon ID (with reCAPTCHA)
router.post('/login', userController.login);

// GET endpoint to login with a Pigeon ID (DEPRECATED - security risk, no reCAPTCHA)
// TODO: Remove this endpoint after mobile apps are updated
// router.get('/login/:pigeonId', userController.login);

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

// PUT endpoint to update existing user details (requires authentication)
router.put('/:userId', authenticate, userController.updateUser);

// PATCH endpoint to update existing user details (requires authentication)
router.patch('/:userId', authenticate, userController.updateUser);

// PATCH endpoint to update notification preferences
router.patch(
  '/:userId/notification-preferences',
  authenticate,
  userController.updateNotificationPreferences
);

// PUT endpoint to regenerate Pigeon ID for a user
router.put('/:userId/regenerate-pigeon-id', authenticate, userController.regeneratePigeonId);

module.exports = router;
