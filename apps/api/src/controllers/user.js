const User = require('../models/User');
const Post = require('../models/Post'); // Add this line
const karma = require('./karma');
const UserHandler = require('../handlers/UserHandler');

// Controller function to create a new user
const createUser = async (req, res) => {
  console.log('Creating a new user...');
  const {
    userName,
    birthYear,
    birthMonth,
    sex,
    location,
    polarity,
    mbtiPersonality,
    pigeonId,
    profilePictureUrl,
    bio,
  } = req.body;

  // Log the received data
  console.log('Received data:', {
    userName,
    birthYear,
    birthMonth,
    sex,
    location,
    polarity,
    mbtiPersonality,
    pigeonId,
    profilePictureUrl,
    bio,
  });

  // Check for missing required fields
  if (
    !userName ||
    !birthYear ||
    !birthMonth ||
    !sex ||
    !location ||
    !location.lat ||
    !location.lon ||
    !pigeonId
  ) {
    console.error('Missing required fields');
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const userId = UserHandler.generateUUID();

    // Create new user with pigeonId from frontend
    const user = new User({
      userId,
      pigeonId, // Use pigeonId from request body (frontend generates it)
      userName,
      birthYear,
      birthMonth,
      sex,
      location,
      polarity,
      mbtiPersonality,
      profilePictureUrl,
      bio,
      lastActiveAt: new Date(),
    });

    await user.save();
    console.log('User created successfully:', user.userId);

    // Initialize user vibes
    const result = await karma.initializeUser(user);
    if (result !== true) {
      console.error('Error granting user initial vibes:', result);
      return res.status(500).json({ message: 'Error granting user initial vibes', error: result });
    }

    // Retrieve updated user JSON with initialized vibes from MongoDB
    const updatedUserWithPigeon = await User.findOne({ userId }); //Include Pigeon ID Just this once for the user to save it.

    console.log('User created and initialized successfully:');
    res.status(201).json(updatedUserWithPigeon);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error creating user', error });
  }
};

// Controller function to login with a Pigeon ID
const login = async (req, res) => {
  console.log('Logging in with Pigeon ID...');
  const pigeonId = req.params.pigeonId;
  if (!pigeonId) {
    console.error('pigeonId is required');
    return res.status(400).json({ message: 'pigeonId is required' });
  }

  try {
    let user = await User.findOne({ pigeonId }).select('-pigeonId');
    if (!user) {
      console.error('User not found');
      return res.status(404).json({ message: 'User not found with PigeonId' });
    }

    console.log('User details retrieved successfully:');
    res.status(200).json(user);
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Error logging in', error });
  }
};

// Controller function to update existing user details
const updateUser = async (req, res) => {
  console.log('Updating user details...');
  const { userName, birthYear, birthMonth, sex, location, polarity, mbtiPersonality } = req.body;
  const { userId } = req.params;

  try {
    // Check if userId is provided
    if (!userId) {
      console.error('userId is required');
      return res.status(400).json({ message: 'userId is required' });
    }

    // Check if user with userId exists
    const user = await User.findOne({ userId });
    if (!user) {
      console.error('User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user details
    if (userName !== undefined) user.userName = userName;
    if (birthYear !== undefined) user.birthYear = birthYear;
    if (birthMonth !== undefined) user.birthMonth = birthMonth;
    if (sex !== undefined) user.sex = sex;
    if (location !== undefined) user.location = location;
    if (polarity !== undefined) user.polarity = polarity;
    if (mbtiPersonality !== undefined) user.mbtiPersonality = mbtiPersonality;

    console.log('Updated user details:', user);

    await user.save();
    const updatedUser = await User.findOne({ userId }).select('-pigeonId');
    console.log('User details updated successfully.');
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user', error });
  }
};

// Controller function to retrieve user details by public userId
// Used exclusively when logging in.
const getUserById = async (req, res) => {
  console.log('Fetching user details...');
  const { userId } = req.params;
  try {
    let user = await User.findOne({ userId }).select('-pigeonId');
    if (!user) {
      console.error('User not found');
      return res.status(404).json({ message: 'User not found' });
    }
    console.log('User details retrieved successfully:');
    res.status(200).json(user);
  } catch (error) {
    console.error('Error retrieving user:', error);
    res.status(500).json({ message: 'Error retrieving user', error });
  }
};

// Controller function to get posts by userId
/**
 * Retrieves posts for a specific user with pagination.
 *
 * @async
 * @function getUserPosts
 * @param {Object} req - Express request object.
 * @param {Object} req.params - Request parameters.
 * @param {string} req.params.userId - ID of the user whose posts are to be retrieved.
 * @param {Object} req.query - Query parameters.
 * @param {number} [req.query.page=1] - Page number for pagination.
 * @param {number} [req.query.limit=20] - Number of posts per page.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - Returns a promise that resolves to void.
 *
 * @example
 * // Example usage in an Express route
 * const express = require('express');
 * const router = express.Router();
 * const { getUserPosts } = require('./controllers/user');
 *
 * router.get('/user/:userId/posts', getUserPosts);
 *
 * // Request: GET /user/123/posts?page=2&limit=10
 * // Response: {
 * //   results: [...], // Array of posts
 * //   nextPage: 3,
 * //   totalPosts: 50,
 * //   totalPages: 5
 * // }
 */
const getUserPosts = async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 20 } = req.query;

  try {
    // Verify user exists
    const user = await User.findOne({ userId });
    if (!user) {
      console.error('User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    console.log('Searching posts for userId:', userId);

    // Find all posts by this user
    const query = { 'user.userId': userId, isHidden: false };

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    console.log(`Found ${posts.length} posts`);

    // Get total count for pagination
    const totalPosts = await Post.countDocuments(query);
    console.log('Total posts count:', totalPosts);

    const totalPages = Math.ceil(totalPosts / limitNumber);
    const hasMorePosts = pageNumber < totalPages;
    const nextPage = hasMorePosts ? pageNumber + 1 : null;

    const responsePayload = {
      results: posts,
      nextPage,
      totalPosts,
      totalPages,
    };

    res.status(200).json(responsePayload);
  } catch (error) {
    console.error('Error retrieving user posts:', error);
    console.error('Error details:', error.stack);
    res.status(500).json({ message: 'Error retrieving user posts', error: error.message });
  }
};

// Phase 3.4: Get user strikes and restrictions
const getUserStrikes = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const activeStrikes = user.getActiveStrikes();
    const restrictions = user.getCurrentRestrictions();

    return res.status(200).json({
      strikes: user.strikes, // All strikes for history
      activeStrikes, // Only non-expired strikes
      activeStrikeCount: activeStrikes.length,
      restrictions, // Current permissions and cooldown
    });
  } catch (error) {
    console.error('Error getting user strikes:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  createUser,
  login,
  updateUser,
  getUserById,
  getUserPosts,
  getUserStrikes,
};
