const { getFirebaseAdmin } = require('../config/firebase');
const User = require('../models/User');

// Tolerant Bearer extraction: case-insensitive scheme, trims whitespace,
// accepts arbitrary whitespace between scheme and token.
const BEARER_RE = /^Bearer\s+(.+)$/i;

function extractBearerToken(req) {
  const header = req.headers.authorization || req.headers.Authorization;
  if (!header || typeof header !== 'string') return null;
  const match = header.trim().match(BEARER_RE);
  return match ? match[1].trim() : null;
}

module.exports = async (req, res, next) => {
  const token = extractBearerToken(req);

  if (!token) {
    return next();
  }

  // If the SDK isn't initialized, firebase.js already warned once at boot.
  // Don't log per-request — requests with Bearer tokens simply fall through
  // to legacy auth.
  const adminSdk = getFirebaseAdmin();
  if (!adminSdk) {
    return next();
  }

  try {
    const decoded = await adminSdk.auth().verifyIdToken(token);

    req.firebaseUser = {
      uid: decoded.uid,
      email: decoded.email || null,
      emailVerified: decoded.email_verified === true,
      provider: decoded.firebase?.sign_in_provider || null,
    };

    const user = await User.findOne({ firebaseUid: decoded.uid });
    if (user) {
      req.user = user;
      req.validatedUserId = user.userId;
    }

    return next();
  } catch (err) {
    if (err.code === 'auth/id-token-expired') {
      return res.status(401).json({ error: 'Unauthorized: Firebase ID token expired' });
    }
    console.warn('[firebaseAuth] Token verification failed:', err.message);
    return res.status(401).json({ error: 'Unauthorized: Invalid Firebase ID token' });
  }
};
