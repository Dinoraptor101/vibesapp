/**
 * ReCaptcha Provider
 * Wraps the app with Google reCAPTCHA v3 provider
 * Invisible implementation with no visible badge
 *
 * IMPORTANT: We must always wrap with GoogleReCaptchaProvider because
 * useGoogleReCaptcha() throws an error when called outside the provider.
 * When disabled, we use a dummy key - the provider will fail to load
 * the script but won't crash, and executeRecaptcha will be undefined.
 */

import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

// Use a dummy key when disabled - the provider needs some key to not crash
const RECAPTCHA_SITE_KEY =
  import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'; // Google's test key
const RECAPTCHA_ENABLED = import.meta.env.VITE_ENABLE_RECAPTCHA === 'true';

interface ReCaptchaProviderProps {
  children: React.ReactNode;
}

export function ReCaptchaProvider({ children }: ReCaptchaProviderProps): React.JSX.Element {
  // Log status for debugging
  if (!RECAPTCHA_ENABLED) {
    console.info('reCAPTCHA is disabled via VITE_ENABLE_RECAPTCHA');
  } else if (!import.meta.env.VITE_RECAPTCHA_SITE_KEY) {
    console.warn('VITE_RECAPTCHA_SITE_KEY not configured');
  }

  // Always wrap with provider - useGoogleReCaptcha throws if not wrapped
  // When disabled, executeRecaptcha returns undefined which is handled gracefully
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={RECAPTCHA_SITE_KEY}
      scriptProps={{
        async: true,
        defer: true,
        appendTo: 'head',
      }}
      container={{
        parameters: {
          badge: 'inline', // Hide default badge, we'll add our own disclosure
          theme: 'dark',
        },
      }}
    >
      {children}
    </GoogleReCaptchaProvider>
  );
}
