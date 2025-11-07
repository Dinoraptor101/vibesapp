/**
 * Main App Component
 * Root component that wraps the entire application with providers
 */

import { Router } from './Router';
import { Providers } from './providers';
import '../styles/globals.css';

function App() {
  return (
    <Providers>
      <Router />
    </Providers>
  );
}

export default App;
