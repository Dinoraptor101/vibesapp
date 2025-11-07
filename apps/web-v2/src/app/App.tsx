/**
 * Main App Component
 * Root component that wraps the entire application with providers
 */

import { Providers } from './providers';
import { Router } from './Router';
import '../styles/globals.css';

function App() {
  return (
    <Providers>
      <Router />
    </Providers>
  );
}

export default App;
