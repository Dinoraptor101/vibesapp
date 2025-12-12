const User = require('../models/User');
const excludedRoutes = require('./excludedRoutesPigeonAuth');

module.exports = async (req, res, next) => {
  // The following routes can be used without Pigeon ID validation
  console.log(`[pigeonAuth] path: ${req.path} | originalUrl: ${req.originalUrl}`);
  console.log('[pigeonAuth] Excluded routes:', excludedRoutes);
  if (excludedRoutes.some((route) => req.path.startsWith(route))) {
    console.log(`✅ Excluding route from Pigeon ID validation: ${req.path}`);
    return next();
  }

  // Extract the Pigeon ID from the request headers
  const pigeonId = req.headers['x-pigeon-id'];

  // For GET requests, if no Pigeon ID is provided, allow the request to continue
  // but don't set validatedUserId (for public endpoints)
  if (req.method === 'GET' && !pigeonId) {
    return next();
  }

  // If no Pigeon ID is provided for non-GET requests, respond with a 403 Forbidden status
  if (!pigeonId) {
    console.log('403 Forbidden: Missing Pigeon ID');
    return res.status(403).json({ error: 'Forbidden: Missing Pigeon ID' });
  }

  // Validate the Pigeon ID's user matches the request's userId
  try {
    const user = await User.findOne({ pigeonId });

    // If no user is found with the provided Pigeon ID, respond with a 403 Forbidden status
    if (!user) {
      return res.status(403).json({ error: 'Forbidden: Invalid Pigeon ID' });
    }

    // Attach the validated userId and user object to the request object
    req.validatedUserId = user.userId;
    req.user = user;

    // For non-GET requests, check if the request's userId matches the validated userId
    if (req.method !== 'GET') {
      const requestUserId = req.body.userId || req.params.userId;
      if (requestUserId && requestUserId !== req.validatedUserId) {
        console.log(
          `403 User ID mismatch: requestUserId=${requestUserId}, validatedUserId=${req.validatedUserId}`
        );
        return res.status(403).json({ error: 'Forbidden: User ID mismatch' });
      }
    }

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    // Handle any errors that occur during validation
    console.error('Error validating Pigeon ID:', error);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
};
