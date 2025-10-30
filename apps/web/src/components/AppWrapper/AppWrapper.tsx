import { useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import App from '../../App';
import apiService from '../../services/apiService';
import quotes from '../../utils/quotes';
import { logDebug } from '../../utils/utils';
import AddToHomeScreenPrompt from '../AddToHomeScreenPompt/AddToHomeScreenPrompt';
import LoadingScreen from '../LoadingScreen/LoadingScreen';

/**
 * AppWrapper serves as the root component that initializes and manages the application's core functionality.
 * It handles:
 * - Backend health checking
 * - Query client initialization
 * - Loading screen with quotes
 * - reCAPTCHA script integration (in production)
 * - Progressive Web App (PWA) installation prompt
 *
 * @returns {JSX.Element} The wrapped application with necessary providers and initialization states
 */
const AppWrapper = () => {
  const [isBackendReady, setIsBackendReady] = useState(false);
  const [quote, setQuote] = useState('');
  const [showInitialLoading, setShowInitialLoading] = useState(true);

  const queryClient = useMemo(() => new QueryClient(), []);

  useEffect(() => {
    const fetchBackendHealth = async () => {
      setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
      const isHealthy = await apiService.checkBackendHealth();
      setIsBackendReady(isHealthy);
    };

    const timer = setTimeout(() => {
      setShowInitialLoading(false);
    }, 2000);

    fetchBackendHealth();

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (process.env.REACT_APP_ENABLE_RECAPTCHA === 'true') {
      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?render=${process.env.REACT_APP_RECAPTCHA_SITE_KEY}`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        logDebug('reCAPTCHA script loaded successfully');
      };
      script.onerror = () => {
        console.error('Failed to load reCAPTCHA script');
      };
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }
  }, []);

  if (!isBackendReady) {
    return <LoadingScreen showQuote={!showInitialLoading} quote={quote} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <App />
      <AddToHomeScreenPrompt />
    </QueryClientProvider>
  );
};

export default AppWrapper;
