import { createRoot } from 'react-dom/client';
import './styles/themes.css';
import './styles/globals.css';
import App from './app/App';
import { initializeVersionCheck } from './utils/versionCheck';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

// Initialize build version checking for automatic cache invalidation on deployments
initializeVersionCheck();

// Note: StrictMode removed for production-like QA behavior
// StrictMode causes double renders and double effect calls in development
createRoot(rootElement).render(<App />);
