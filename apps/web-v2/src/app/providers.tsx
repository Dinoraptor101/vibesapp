/**
 * Application Providers
 * Wraps the app with all necessary context providers
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type React from 'react';
import { Toaster } from 'sonner';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';
import { AdminAuthProvider } from '@/features/admin';
import { ReCaptchaProvider } from '@/lib/recaptcha';
import { ThemeProvider } from '@/lib/theme';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps): JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ReCaptchaProvider>
          <AdminAuthProvider>
            <Toaster position="top-right" richColors />
            <PWAInstallPrompt />
            {children}
            {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
          </AdminAuthProvider>
        </ReCaptchaProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
