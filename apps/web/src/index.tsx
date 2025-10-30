/**
 * Main entry point for the application.
 * Initializes the root component, sets up PostHog analytics in production,
 * handles service worker registration, and wraps the app in Suspense for
 * lazy loading capabilities.
 */
import { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { PostHogProvider } from 'posthog-js/react';
import AppWrapper from './components/AppWrapper/AppWrapper';
import Spinner from './components/Spinner/Spinner';
import { registerServiceWorker, unregisterServiceWorkers } from './utils/serviceWorker';
import { logDebug } from './utils/utils';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root container missing in index.html');
}
const root = createRoot(container);

const isProduction = process.env.NODE_ENV === 'production';
logDebug(`Environment: ${isProduction ? 'Production' : 'Development'}`);

unregisterServiceWorkers();

root.render(
  isProduction ? (
    <PostHogProvider
      apiKey={process.env.REACT_APP_PUBLIC_POSTHOG_KEY || ''}
      options={{ api_host: process.env.REACT_APP_PUBLIC_POSTHOG_HOST || '' }}
    >
      <Suspense fallback={<Spinner />}>
        <AppWrapper />
      </Suspense>
    </PostHogProvider>
  ) : (
    <Suspense fallback={<Spinner />}>
      <AppWrapper />
    </Suspense>
  )
);

registerServiceWorker();
