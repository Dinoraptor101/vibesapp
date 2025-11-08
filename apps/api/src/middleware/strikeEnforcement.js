// Phase 3.4: Strike enforcement middleware
const User = require('../models/User');

/**
 * Middleware to check if user can perform posting actions based on strikes
 * Should be applied to routes that create posts, comments, or other content
 */
const checkPostingRestrictions = async (req, res, next) => {
  try {
    const userId = req.body.userId || req.validatedUserId;

    if (!userId) {
      return res.status(400).json({
        error: 'Missing user ID',
      });
    }

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    const restrictions = user.getCurrentRestrictions();

    // Check if user is banned (Strike 4)
    if (restrictions.isBanned) {
      return res.status(403).json({
        error: 'Your account has been permanently banned due to repeated violations.',
        restrictions,
      });
    }

    // Check if user can post (Strike 1-3 cooldown)
    if (!restrictions.canPost) {
      return res.status(403).json({
        error: 'You cannot post during the cooldown period.',
        restrictions,
        cooldownEnd: restrictions.cooldownEnd,
        message: `Your posting privileges are temporarily suspended until ${restrictions.cooldownEnd}. Strike count: ${restrictions.strikeCount}`,
      });
    }

    // User is allowed to post
    next();
  } catch (error) {
    console.error('Error checking posting restrictions:', error);
    return res.status(500).json({
      error: 'Internal server error',
    });
  }
};

/**
 * Middleware to check if user can comment
 */
const checkCommentRestrictions = async (req, res, next) => {
  try {
    const userId = req.body.userId || req.validatedUserId;

    if (!userId) {
      return res.status(400).json({
        error: 'Missing user ID',
      });
    }

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    const restrictions = user.getCurrentRestrictions();

    // Check if user is banned (Strike 4)
    if (restrictions.isBanned) {
      return res.status(403).json({
        error: 'Your account has been permanently banned due to repeated violations.',
        restrictions,
      });
    }

    // Check if user can comment (Strike 1-3 cooldown)
    if (!restrictions.canComment) {
      return res.status(403).json({
        error: 'You cannot comment during the cooldown period.',
        restrictions,
        cooldownEnd: restrictions.cooldownEnd,
        message: `Your commenting privileges are temporarily suspended until ${restrictions.cooldownEnd}. Strike count: ${restrictions.strikeCount}`,
      });
    }

    // User is allowed to comment
    next();
  } catch (error) {
    console.error('Error checking comment restrictions:', error);
    return res.status(500).json({
      error: 'Internal server error',
    });
  }
};

module.exports = {
  checkPostingRestrictions,
  checkCommentRestrictions,
};
