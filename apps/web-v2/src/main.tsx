import { createRoot } from 'react-dom/client';
import './styles/themes.css';
import './styles/globals.css';
import App from './app/App';
import { MaintenanceMode } from './components/MaintenanceMode';
import { isMaintenanceModeEnabled } from './utils/maintenanceMode';
import { initializeVersionCheck } from './utils/versionCheck';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

// Check if maintenance mode is enabled
const isUnderMaintenance = isMaintenanceModeEnabled();

if (isUnderMaintenance) {
  // Show maintenance page only
  createRoot(rootElement).render(<MaintenanceMode />);
} else {
  // Initialize build version checking for automatic cache invalidation on deployments
  initializeVersionCheck();

  // Note: StrictMode removed for production-like QA behavior
  // StrictMode causes double renders and double effect calls in development
  createRoot(rootElement).render(<App />);
}
