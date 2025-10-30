import posthog from 'posthog-js';
import type { ErrorInfo } from 'react';

interface IErrorReport {
  errorMessage: string;
  errorStack?: string;
  componentStack?: string;
  userAgent: string;
  url: string;
  timestamp: string;
  userId?: string;
  sessionId?: string;
  buildVersion?: string;
}

interface IErrorContext {
  userId?: string;
  userVibes?: number;
  currentRoute?: string;
  featureFlags?: Record<string, boolean>;
  lastUserAction?: string;
  featureName?: string;
}

/**
 * Service for reporting errors to PostHog analytics platform.
 * Handles both development logging and production error tracking.
 */
export class ErrorReportingService {
  private static readonly isProduction = process.env.NODE_ENV === 'production';
  private static readonly isDevelopment = process.env.NODE_ENV === 'development';

  /**
   * Reports an error to PostHog with context information.
   *
   * @param error - The JavaScript error that occurred
   * @param errorInfo - React error info containing component stack
   * @param context - Additional context about the user and app state
   */
  static async reportError(
    error: Error,
    errorInfo: ErrorInfo,
    context: IErrorContext = {}
  ): Promise<void> {
    const errorReport = ErrorReportingService.buildErrorReport(error, errorInfo, context);

    if (ErrorReportingService.isDevelopment) {
      ErrorReportingService.logDevelopmentError(error, errorInfo, errorReport);
    }

    if (ErrorReportingService.isPostHogEnabled()) {
      try {
        await ErrorReportingService.sendToPostHog(errorReport, context);
      } catch (reportingError) {
        console.error('Failed to report error to PostHog:', reportingError);
        // Fallback to console in production if PostHog fails
        if (ErrorReportingService.isProduction) {
          console.error('Original error:', error);
        }
      }
    }
  }
  /**
   * Reports a custom error event to PostHog.
   * Use this for handled errors that you want to track.
   */
  static reportCustomError(
    errorType: string,
    message: string,
    context: Record<string, unknown> = {}
  ): void {
    if (ErrorReportingService.isPostHogEnabled()) {
      posthog.capture('custom_error', {
        error_type: errorType,
        error_message: message,
        ...context,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        user_id: ErrorReportingService.getCurrentUserId(),
      });
    }
  }

  private static buildErrorReport(
    error: Error,
    errorInfo: ErrorInfo,
    context: IErrorContext
  ): IErrorReport {
    return {
      errorMessage: error.message,
      errorStack: error.stack,
      componentStack: errorInfo.componentStack || undefined,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      userId: context.userId || ErrorReportingService.getCurrentUserId(),
      sessionId: ErrorReportingService.getSessionId(),
      buildVersion: process.env.REACT_APP_VERSION || 'unknown',
    };
  }

  private static async sendToPostHog(
    errorReport: IErrorReport,
    context: IErrorContext
  ): Promise<void> {
    // Capture the error event
    posthog.capture('react_error_boundary', {
      ...errorReport,
      // Additional context
      user_vibes: context.userVibes,
      current_route: context.currentRoute || window.location.pathname,
      feature_flags: context.featureFlags || ErrorReportingService.getFeatureFlags(),
      last_user_action: context.lastUserAction,
      feature_name: context.featureName,
      // Error classification
      error_severity: ErrorReportingService.classifyErrorSeverity(errorReport.errorMessage),
      component_type: ErrorReportingService.extractComponentType(errorReport.componentStack),
      browser_info: ErrorReportingService.getBrowserInfo(),
    });

    // Also update user properties for better error context
    if (errorReport.userId) {
      posthog.identify(errorReport.userId, {
        last_error_timestamp: errorReport.timestamp,
        total_errors: posthog.get_property('total_errors')
          ? posthog.get_property('total_errors') + 1
          : 1,
      });
    }
  }

  private static logDevelopmentError(
    error: Error,
    errorInfo: ErrorInfo,
    errorReport: IErrorReport
  ): void {
    console.group('🚨 ErrorBoundary Caught Error');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.table(errorReport);
    console.groupEnd();
  }

  private static getCurrentUserId(): string | undefined {
    // Get from your auth system - using pigeonId for VibesApp
    return localStorage.getItem('pigeonId') || undefined;
  }

  private static getSessionId(): string {
    try {
      return posthog.get_session_id?.() || 'unknown';
    } catch {
      return 'unknown';
    }
  }

  private static getFeatureFlags(): Record<string, boolean> {
    try {
      // PostHog uses getFeatureFlag for individual flags, so we'll return empty object
      // Individual feature flags should be checked where needed
      return {};
    } catch {
      return {};
    }
  }

  private static isPostHogEnabled(): boolean {
    return typeof posthog !== 'undefined' && posthog.__loaded;
  }

  private static classifyErrorSeverity(
    errorMessage: string
  ): 'low' | 'medium' | 'high' | 'critical' {
    const criticalKeywords = ['auth', 'login', 'payment', 'security', 'unauthorized'];
    const highKeywords = ['api', 'network', 'server', 'fetch', 'timeout', 'abort'];
    const mediumKeywords = ['render', 'component', 'state', 'props', 'hook'];

    const message = errorMessage.toLowerCase();

    if (criticalKeywords.some((keyword) => message.includes(keyword))) {
      return 'critical';
    }
    if (highKeywords.some((keyword) => message.includes(keyword))) {
      return 'high';
    }
    if (mediumKeywords.some((keyword) => message.includes(keyword))) {
      return 'medium';
    }
    return 'low';
  }

  private static extractComponentType(componentStack?: string): string {
    if (!componentStack) return 'unknown';

    // Extract the first component name from the stack
    const match = componentStack.match(/in (\w+)/);
    return match?.[1] || 'unknown';
  }

  private static getBrowserInfo(): Record<string, string> {
    return {
      user_agent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
    };
  }
}
