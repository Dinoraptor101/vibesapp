/**
 * Routes that don't require authentication
 * Used by both apiKey and pigeonAuth middleware
 */
module.exports = [
  '/api/admin', // All admin routes use admin token auth instead
  '/api/users/create',
  '/api/users/login',
  '/api/recaptcha',
  '/api/issues/createIssue',
  '/api/health',
];
