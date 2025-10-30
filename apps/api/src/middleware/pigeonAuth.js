const User = require('../models/User');

module.exports = async (req, res, next) => {
  // The following routes can be used without Pigeon ID validation
  const excludedRoutes = ['/api/issues/createIssue', '/api/recaptcha', '/api/users/create'];
  if (excludedRoutes.some((route) => req.path.startsWith(route))) {
    // console.log(`Excluding route from Pigeon ID validation: ${req.path}`);
    return next();
  }

  // Allow GET requests to pass through without validation
  if (req.method === 'GET') {
    return next();
  }

  // Extract the Pigeon ID from the request headers
  const pigeonId = req.headers['x-pigeon-id'];

  // If no Pigeon ID is provided, respond with a 403 Forbidden status
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

    // Attach the validated userId to the request object
    req.validatedUserId = user.userId;

    // Check if the request's userId matches the validated userId
    const requestUserId = req.body.userId || req.params.userId;
    if (requestUserId && requestUserId !== req.validatedUserId) {
      console.log(
        `403 User ID mismatch: requestUserId=${requestUserId}, validatedUserId=${req.validatedUserId}`
      );
      return res.status(403).json({ error: 'Forbidden: User ID mismatch' });
    }

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    // Handle any errors that occur during validation
    console.error('Error validating Pigeon ID:', error);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
};
