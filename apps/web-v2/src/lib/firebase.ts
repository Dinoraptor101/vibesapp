/**
 * Firebase Web SDK initialization.
 *
 * Lazy: the SDK is created only on first access. If VITE_FIREBASE_* env vars
 * are missing, returns null and logs a warning — the rest of the app keeps
 * working on the legacy pigeonId path.
 */

import { type FirebaseApp, initializeApp } from 'firebase/app';
import { type Auth, getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let warned = false;

function isConfigured(): boolean {
  // authDomain is required by Firebase Auth for redirect/popup flows;
  // a partial config silently breaks sign-in at runtime, so treat it as
  // not-configured rather than half-enabling the SDK.
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.appId
  );
}

export function getFirebaseApp(): FirebaseApp | null {
  if (app) return app;
  if (!isConfigured()) {
    if (!warned) {
      warned = true;
      console.warn(
        '[firebase] VITE_FIREBASE_* env vars not set; Firebase Auth is disabled. Falling back to legacy pigeonId auth.'
      );
    }
    return null;
  }
  app = initializeApp(firebaseConfig);
  return app;
}

export function getFirebaseAuth(): Auth | null {
  if (auth) return auth;
  const a = getFirebaseApp();
  if (!a) return null;
  auth = getAuth(a);
  return auth;
}

export function isFirebaseEnabled(): boolean {
  return isConfigured();
}
