/**
 * Service worker management utilities.
 * Handles registration and unregistration of service workers
 * for offline capabilities and caching.
 */

import { logDebug } from './utils';

export const unregisterServiceWorkers = async () => {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    registrations.forEach((registration) => {
      registration.unregister();
    });
  }
};

export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/serviceWorker.js')
        .then(() => {
          logDebug('Service worker registered successfully');
        })
        .catch((registrationError) => {
          console.error(`SW registration failed: ${registrationError}`);
        });
    });
  }
};
