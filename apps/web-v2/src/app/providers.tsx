/**
 * Application Providers
 * Wraps the app with all necessary context providers
 *
 * SECURITY NOTE: DevTools are ONLY loaded in local development mode.
 * They are excluded from all production builds (including QA/staging).
 * See: docs/Web-V2/development-log/DEVTOOLS-SECURITY.md
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type React from 'react';
import { lazy, Suspense } from 'react';
import { Toaster } from 'sonner';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';
import { AdminAuthProvider } from '@/features/admin';
import { ReCaptchaProvider } from '@/lib/recaptcha';
import { ThemeProvider } from '@/lib/theme';

/**
 * DevTools are lazy-loaded ONLY in development mode.
 * This ensures the devtools bundle is completely excluded from production builds.
 *
 * IMPORTANT: Do NOT change this condition without security review.
 * - import.meta.env.DEV is true ONLY during `vite dev` (local development)
 * - In production builds (QA, staging, production), this evaluates to false
 *   and the dynamic import is never executed, excluding devtools from bundle.
 */
const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(() =>
      import('@tanstack/react-query-devtools').then((mod) => ({
        default: mod.ReactQueryDevtools,
      }))
    )
  : () => null;

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

export function Providers({ children }: ProvidersProps): React.ReactNode {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ReCaptchaProvider>
          <AdminAuthProvider>
            <Toaster position="top-right" richColors />
            <PWAInstallPrompt />
            {children}
            {import.meta.env.DEV && (
              <Suspense fallback={null}>
                <ReactQueryDevtools initialIsOpen={false} />
              </Suspense>
            )}
          </AdminAuthProvider>
        </ReCaptchaProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
