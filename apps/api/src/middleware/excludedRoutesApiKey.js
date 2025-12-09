/**
 * Routes excluded from API Key validation
 * API Key is for server-to-server authentication only
 * These routes use pigeonAuth or are public
 */
module.exports = [
  '/api/admin', // Admin routes use admin token auth
  '/api/users/', // All user routes use pigeonAuth
  '/api/posts', // Post routes use pigeonAuth
  '/api/comments', // Comment routes use pigeonAuth
  '/api/reactions', // Reaction routes use pigeonAuth
  '/api/messages', // Message routes use pigeonAuth
  '/api/messaging', // Messaging routes use pigeonAuth
  '/api/dm', // DM routes use pigeonAuth
  '/api/dm-requests', // DM request routes use pigeonAuth
  '/api/activities', // Activity routes use pigeonAuth
  '/api/recaptcha', // Public reCAPTCHA verification
  '/api/issues/createIssue', // Public issue reporting
  '/api/health', // Public health check
  '/api/sse', // SSE uses query param auth
  '/api/s3', // S3 upload routes use pigeonAuth
];
