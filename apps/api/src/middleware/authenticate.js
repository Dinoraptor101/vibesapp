const User = require('../models/User');

// E2E test bypass token and account IDs
const E2E_BYPASS_TOKEN = process.env.E2E_BYPASS_TOKEN;
const E2E_TEST_USER_IDS = [
  process.env.QA_TEST_USER_ID,
  process.env.QA_TEST_USER_2_ID, // VIXEN (second test user)
].filter(Boolean);

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

    // Check for E2E test bypass on banned accounts
    const bypassHeader = req.headers['x-e2e-bypass'];
    const bypassCookie = req.cookies?.e2eBypass;
    const isTestAccount = E2E_TEST_USER_IDS.includes(user.userId);
    const hasBypassToken = bypassHeader === E2E_BYPASS_TOKEN || bypassCookie === E2E_BYPASS_TOKEN;

    // Check if user is banned (bypass for E2E test accounts)
    if (user.isBanned && !(hasBypassToken && isTestAccount)) {
      return res.status(403).json({ error: 'Forbidden: Account is banned' });
    }

    if (hasBypassToken && isTestAccount && user.isBanned) {
      console.log('✅ [Authenticate] E2E test bypass APPROVED for banned account');
      console.log(`   - User ID: ${user.userId}`);
      console.log('   - Bypassing ban check\n');
    }

    // Attach user to request object
    req.user = user;

    next();
  } catch (error) {
    console.error('Error in authentication middleware:', error);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
};

module.exports = { authenticate };
