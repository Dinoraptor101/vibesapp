const User = require('../models/User');

/**
 * Authentication middleware for protected routes
 * Validates user session from Pigeon ID in cookies, headers, or query params
 * Attaches user object to req.user
 */
const authenticate = async (req, res, next) => {
  try {
    // Extract Pigeon ID from cookies, headers, or query params (for SSE EventSource)
    const pigeonId = req.cookies?.pigeonId || req.headers['x-pigeon-id'] || req.query?.pigeonId;

    if (!pigeonId) {
      return res.status(401).json({ error: 'Unauthorized: Missing authentication' });
    }

    // Find user by Pigeon ID
    const user = await User.findOne({ pigeonId });

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: Invalid authentication' });
    }

    // Check if user is banned
    if (user.isBanned) {
      return res.status(403).json({ error: 'Forbidden: Account is banned' });
    }

    // Attach user to request object
    req.user = user;
    // Also attach pigeonId since it's excluded from User model by default (select: false)
    req.user.pigeonId = pigeonId;

    next();
  } catch (error) {
    console.error('Error in authentication middleware:', error);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
};

module.exports = { authenticate };
