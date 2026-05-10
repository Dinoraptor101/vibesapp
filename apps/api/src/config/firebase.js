const admin = require('firebase-admin');

let initialized = false;

function getServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error('[firebase] FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON:', err.message);
    return null;
  }
}

function initFirebase() {
  if (initialized) return admin;

  const serviceAccount = getServiceAccount();

  if (!serviceAccount) {
    if (process.env.NODE_ENV !== 'test') {
      console.warn(
        '[firebase] FIREBASE_SERVICE_ACCOUNT_JSON not set. Firebase Auth verification will reject every token. Set it in .env to enable Firebase login.'
      );
    }
    return null;
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    initialized = true;
    console.log(`[firebase] Admin SDK initialized for project: ${serviceAccount.project_id}`);
    return admin;
  } catch (err) {
    console.error('[firebase] Failed to initialize Admin SDK:', err.message);
    return null;
  }
}

function getFirebaseAdmin() {
  if (!initialized) {
    return initFirebase();
  }
  return admin;
}

module.exports = {
  initFirebase,
  getFirebaseAdmin,
};
