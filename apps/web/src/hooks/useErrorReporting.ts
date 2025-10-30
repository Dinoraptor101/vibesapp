import { useCallback } from 'react';
import { ErrorReportingService } from '../services/errorReportingService';

interface IUseErrorReportingOptions {
  userId?: string;
  featureName?: string;
  userVibes?: number;
}

/**
 * Hook for reporting custom errors to PostHog analytics.
 * Use this for handled errors that you want to track.
 *
 * @param options - Configuration options including userId, featureName, and userVibes
 * @returns Object containing reportError function
 *
 * @example
 * ```tsx
 * const { reportError } = useErrorReporting({
 *   featureName: 'posts',
 *   userId: 'user123'
 * });
 *
 * // In an error handler
 * reportError('api_error', 'Failed to fetch posts', { postId: '123' });
 * ```
 */
export const useErrorReporting = (options: IUseErrorReportingOptions = {}) => {
  const reportError = useCallback(
    (errorType: string, message: string, additionalContext: Record<string, unknown> = {}) => {
      ErrorReportingService.reportCustomError(errorType, message, {
        ...options,
        ...additionalContext,
        timestamp: new Date().toISOString(),
      });
    },
    [options]
  );

  const reportApiError = useCallback(
    (endpoint: string, error: unknown, additionalContext: Record<string, unknown> = {}) => {
      const errorMessage = error instanceof Error ? error.message : 'Unknown API error';

      reportError('api_error', `API request failed: ${endpoint}`, {
        endpoint,
        error_message: errorMessage,
        ...additionalContext,
      });
    },
    [reportError]
  );

  const reportUserActionError = useCallback(
    (action: string, error: unknown, additionalContext: Record<string, unknown> = {}) => {
      const errorMessage = error instanceof Error ? error.message : 'Unknown user action error';

      reportError('user_action_error', `User action failed: ${action}`, {
        action,
        error_message: errorMessage,
        ...additionalContext,
      });
    },
    [reportError]
  );

  return {
    reportError,
    reportApiError,
    reportUserActionError,
  };
};
