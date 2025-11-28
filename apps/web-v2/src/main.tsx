import { createRoot } from 'react-dom/client';
import './styles/themes.css';
import './styles/globals.css';
import App from './app/App';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

// Note: StrictMode removed for production-like QA behavior
// StrictMode causes double renders and double effect calls in development
createRoot(rootElement).render(<App />);
