// middleware/apiKey.js
const excludedRoutes = require('./excludedRoutes');

module.exports = (req, res, next) => {
  // Check if the current route should be excluded
  if (excludedRoutes.some((route) => req.path.startsWith(route))) {
    return next();
  }

  const apiKey = req.headers['x-api-key'];
  if (apiKey && apiKey === process.env.API_KEY) {
    return next();
  }

  res.status(403).json({ error: 'Forbidden: Invalid API Key' });
};
