/**
 * reCAPTCHA Verification Utility
 *
 * Shared utility for verifying reCAPTCHA v3 tokens in controllers.
 * Returns score-based verification with configurable threshold.
 */

const axios = require('axios');

const RECAPTCHA_SECRET = process.env.REACT_APP_RECAPTCHA_SECRET;
const RECAPTCHA_ENABLED = process.env.ENABLE_RECAPTCHA === 'true';
const SCORE_THRESHOLD = 0.5; // Default threshold for bot detection

/**
 * Verify a reCAPTCHA v3 token
 * @param {string} token - The reCAPTCHA token from the client
 * @param {string} expectedAction - The expected action name (e.g., 'login', 'signup')
 * @returns {Promise<{success: boolean, score?: number, action?: string, error?: string}>}
 */
async function verifyRecaptcha(token, expectedAction = null) {
  // If reCAPTCHA is disabled, always return success
  if (!RECAPTCHA_ENABLED) {
    console.log('reCAPTCHA is disabled via ENABLE_RECAPTCHA env var');
    return { success: true, score: 1.0, bypassed: true };
  }

  // If no secret is configured, skip verification
  if (!RECAPTCHA_SECRET) {
    console.warn('REACT_APP_RECAPTCHA_SECRET not configured - skipping verification');
    return { success: true, score: 1.0, bypassed: true };
  }

  // If no token provided, only fail if reCAPTCHA is enabled
  // When disabled, we already returned success above, so this handles edge cases
  if (!token) {
    console.log('No reCAPTCHA token provided');
    // Should not reach here if RECAPTCHA_ENABLED is false, but handle it anyway
    return { success: false, error: 'reCAPTCHA token is required' };
  }

  try {
    console.log('Verifying reCAPTCHA token...');
    const response = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
      params: {
        secret: RECAPTCHA_SECRET,
        response: token,
      },
      timeout: 5000,
    });

    const { success, score, action, 'error-codes': errorCodes } = response.data;

    if (!success) {
      console.log('reCAPTCHA verification failed:', errorCodes);
      return { success: false, error: 'reCAPTCHA verification failed', errorCodes };
    }

    // Check score threshold
    if (score < SCORE_THRESHOLD) {
      console.log(`reCAPTCHA score too low: ${score} (threshold: ${SCORE_THRESHOLD})`);
      return {
        success: false,
        score,
        action,
        error: `Suspicious activity detected (score: ${score})`,
      };
    }

    // Optionally verify action matches expected
    if (expectedAction && action !== expectedAction) {
      console.log(`reCAPTCHA action mismatch: expected ${expectedAction}, got ${action}`);
      // We log but don't fail on action mismatch - just a warning
    }

    console.log(`reCAPTCHA verification successful (score: ${score}, action: ${action})`);
    return { success: true, score, action };
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      console.error('reCAPTCHA verification timed out');
      return { success: false, error: 'reCAPTCHA verification timed out' };
    }
    console.error('reCAPTCHA verification error:', error.message);
    return { success: false, error: 'reCAPTCHA verification error' };
  }
}

module.exports = {
  verifyRecaptcha,
  RECAPTCHA_ENABLED,
  SCORE_THRESHOLD,
};
