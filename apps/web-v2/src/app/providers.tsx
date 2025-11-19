/**
 * Application Providers
 * Wraps the app with all necessary context providers
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type React from 'react';
import { Toaster } from 'sonner';
import { AdminAuthProvider } from '@/features/admin';
import { ThemeProvider } from '@/lib/theme';
import { useAutoSync } from '@/lib/useAutoSync';

// Create a client with offline-friendly defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      networkMode: 'offlineFirst', // Use cache when offline
    },
    mutations: {
      networkMode: 'offlineFirst', // Allow mutations when offline
    },
  },
});

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * AutoSync Component - Initializes offline sync
 */
function AutoSyncInitializer() {
  useAutoSync();
  return null;
}

export function Providers({ children }: ProvidersProps): JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AdminAuthProvider>
          <AutoSyncInitializer />
          <Toaster position="top-right" richColors />
          {children}
          {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
        </AdminAuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
