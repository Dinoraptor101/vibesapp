const { getFirebaseAdmin } = require('../config/firebase');
const User = require('../models/User');

function extractBearerToken(req) {
  const header = req.headers.authorization || req.headers.Authorization;
  if (!header || typeof header !== 'string') return null;
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  return token;
}

module.exports = async (req, res, next) => {
  const token = extractBearerToken(req);

  if (!token) {
    return next();
  }

  const adminSdk = getFirebaseAdmin();
  if (!adminSdk) {
    console.warn('[firebaseAuth] Token present but Admin SDK not initialized; skipping');
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
