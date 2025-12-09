/**
 * Routes excluded from Pigeon Auth validation
 * These routes are either public or use alternative auth mechanisms
 */
module.exports = [
  '/api/admin', // Admin routes use admin token auth instead
  '/api/users/create', // Public signup
  '/api/users/login', // Public login
  '/api/recaptcha', // Public reCAPTCHA verification
  '/api/issues/createIssue', // Public issue reporting
  '/api/health', // Public health check
];
