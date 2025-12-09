/**
 * reCAPTCHA Verification Utility
 *
 * Shared utility for verifying reCAPTCHA v3 tokens in controllers.
 * Returns score-based verification with configurable threshold.
 */

const axios = require('axios');

const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET;
const RECAPTCHA_ENABLED = process.env.ENABLE_RECAPTCHA === 'true';
const SCORE_THRESHOLD = 0.5; // Default threshold for bot detection
const E2E_BYPASS_TOKEN = process.env.E2E_BYPASS_TOKEN || 'e2e-test-bypass-secret-token-2024';

/**
 * Verify a reCAPTCHA v3 token
 * @param {string} token - The reCAPTCHA token from the client
 * @param {string} expectedAction - The expected action name (e.g., 'login', 'signup')
 * @param {object} req - Express request object (optional, for checking bypass headers)
 * @returns {Promise<{success: boolean, score?: number, action?: string, error?: string}>}
 */
async function verifyRecaptcha(token, expectedAction = null, req = null) {
  // Check for E2E test bypass token (from header or cookie)
  if (req) {
    const bypassHeader = req.headers['x-e2e-bypass'];
    const bypassCookie = req.cookies?.e2eBypass;

    console.log('🔍 [reCAPTCHA] Checking for E2E bypass token...');
    console.log(`   - Header 'x-e2e-bypass': ${bypassHeader ? '✓ present' : '✗ not found'}`);
    console.log(`   - Cookie 'e2eBypass': ${bypassCookie ? '✓ present' : '✗ not found'}`);

    if (bypassHeader === E2E_BYPASS_TOKEN) {
      console.log('✅ [reCAPTCHA] Bypass APPROVED via header (x-e2e-bypass)');
      console.log(`   - Expected action: ${expectedAction || 'none'}`);
      console.log('   - Returning mock success response (score: 1.0)\n');
      return { success: true, score: 1.0, bypassed: true, e2eTest: true, bypassSource: 'header' };
    }

    if (bypassCookie === E2E_BYPASS_TOKEN) {
      console.log('✅ [reCAPTCHA] Bypass APPROVED via cookie (e2eBypass)');
      console.log(`   - Expected action: ${expectedAction || 'none'}`);
      console.log('   - Returning mock success response (score: 1.0)\n');
      return { success: true, score: 1.0, bypassed: true, e2eTest: true, bypassSource: 'cookie' };
    }

    if (bypassHeader || bypassCookie) {
      console.warn(
        '⚠️  [reCAPTCHA] Bypass token present but INVALID - will proceed with normal verification'
      );
      console.warn(`   - Header value: ${bypassHeader ? '[REDACTED - mismatch]' : 'N/A'}`);
      console.warn(`   - Cookie value: ${bypassCookie ? '[REDACTED - mismatch]' : 'N/A'}\n`);
    } else {
      console.log(
        'ℹ️  [reCAPTCHA] No bypass token detected - proceeding with standard verification\n'
      );
    }
  }

  // If reCAPTCHA is disabled, always return success
  if (!RECAPTCHA_ENABLED) {
    console.log(
      '⚙️  [reCAPTCHA] Verification DISABLED via ENABLE_RECAPTCHA=false environment variable'
    );
    console.log(`   - Expected action: ${expectedAction || 'none'}`);
    console.log('   - Returning mock success response (score: 1.0)\n');
    return { success: true, score: 1.0, bypassed: true, disabledViaEnv: true };
  }

  // If no secret is configured, skip verification
  if (!RECAPTCHA_SECRET) {
    console.warn(
      '⚠️  [reCAPTCHA] Secret not configured (RECAPTCHA_SECRET missing) - skipping verification'
    );
    console.warn(`   - Expected action: ${expectedAction || 'none'}`);
    console.warn('   - Returning mock success response (score: 1.0)\n');
    return { success: true, score: 1.0, bypassed: true, secretMissing: true };
  }

  // If no token provided, only fail if reCAPTCHA is enabled
  // When disabled, we already returned success above, so this handles edge cases
  if (!token) {
    console.error('❌ [reCAPTCHA] No token provided in request');
    console.error(`   - Expected action: ${expectedAction || 'none'}`);
    console.error('   - Returning error response\n');
    return { success: false, error: 'reCAPTCHA token is required' };
  }

  try {
    console.log('🔐 [reCAPTCHA] Verifying token with Google reCAPTCHA API...');
    console.log(`   - Expected action: ${expectedAction || 'none'}`);
    console.log(`   - Token length: ${token.length} characters`);
    const response = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
      params: {
        secret: RECAPTCHA_SECRET,
        response: token,
      },
      timeout: 5000,
    });

    const { success, score, action, 'error-codes': errorCodes } = response.data;

    if (!success) {
      console.error('❌ [reCAPTCHA] Verification FAILED - Google API returned success=false');
      console.error(`   - Error codes: ${JSON.stringify(errorCodes)}`);
      console.error(`   - Expected action: ${expectedAction || 'none'}\n`);
      return { success: false, error: 'reCAPTCHA verification failed', errorCodes };
    }

    // Check score threshold
    if (score < SCORE_THRESHOLD) {
      console.warn('⚠️  [reCAPTCHA] Verification REJECTED - Score below threshold');
      console.warn(`   - Score: ${score} (threshold: ${SCORE_THRESHOLD})`);
      console.warn(`   - Action: ${action}`);
      console.warn(`   - Expected action: ${expectedAction || 'none'}\n`);
      return {
        success: false,
        score,
        action,
        error: `Suspicious activity detected (score: ${score})`,
      };
    }

    // Optionally verify action matches expected
    if (expectedAction && action !== expectedAction) {
      console.warn('⚠️  [reCAPTCHA] Action mismatch detected (non-blocking)');
      console.warn(`   - Expected: ${expectedAction}`);
      console.warn(`   - Received: ${action}`);
      // We log but don't fail on action mismatch - just a warning
    }

    console.log('✅ [reCAPTCHA] Verification SUCCESSFUL');
    console.log(`   - Score: ${score} (threshold: ${SCORE_THRESHOLD})`);
    console.log(`   - Action: ${action}`);
    console.log(`   - Expected action: ${expectedAction || 'none'}\n`);
    return { success: true, score, action };
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      console.error('❌ [reCAPTCHA] Verification TIMEOUT - Google API did not respond in time');
      console.error('   - Timeout limit: 5000ms');
      console.error(`   - Expected action: ${expectedAction || 'none'}\n`);
      return { success: false, error: 'reCAPTCHA verification timed out' };
    }
    console.error('❌ [reCAPTCHA] Verification ERROR - Exception during API call');
    console.error(`   - Error message: ${error.message}`);
    console.error(`   - Error code: ${error.code || 'N/A'}`);
    console.error(`   - Expected action: ${expectedAction || 'none'}\n`);
    return { success: false, error: 'reCAPTCHA verification error' };
  }
}

module.exports = {
  verifyRecaptcha,
  RECAPTCHA_ENABLED,
  SCORE_THRESHOLD,
};
