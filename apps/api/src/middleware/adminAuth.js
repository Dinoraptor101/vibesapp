/**
 * Admin Authentication Middleware
 *
 * Validates that requests to admin endpoints include a valid admin token.
 * The token is generated during admin login and must be present in the
 * X-Admin-Token header.
 *
 * SECURITY: This prevents unauthorized access to admin-only operations like:
 * - User management (ban, delete, regenerate passwords)
 * - Post moderation (delete, dismiss reports)
 * - Dashboard metrics and analytics
 */

// Store for valid admin tokens (in-memory for now)
// In production, use Redis or database with expiration
const validTokens = new Set();

/**
 * Register a new admin token (called after successful login)
 */
function registerAdminToken(token) {
  validTokens.add(token);

  // Auto-expire token after 1 hour
  setTimeout(
    () => {
      validTokens.delete(token);
    },
    60 * 60 * 1000
  );
}

/**
 * Middleware to validate admin token
 */
function adminAuth(req, res, next) {
  const token = req.headers['x-admin-token'];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Admin token required',
    });
  }

  if (!validTokens.has(token)) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid or expired admin token',
    });
  }

  // Token is valid, proceed
  next();
}

module.exports = {
  adminAuth,
  registerAdminToken,
};
