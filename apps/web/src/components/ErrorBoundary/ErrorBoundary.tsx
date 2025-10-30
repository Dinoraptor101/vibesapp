import type React from 'react';
import { Component, type ComponentType, type ErrorInfo, type PropsWithChildren } from 'react';
import { ErrorReportingService } from '../../services/errorReportingService';
import { logDebug } from '../../utils/utils';

interface IErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

interface IErrorBoundaryProps {
  fallback?: ComponentType<IErrorBoundaryState>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  context?: {
    featureName?: string;
    userId?: string;
    userVibes?: number;
    lastUserAction?: string;
  };
}

const DefaultErrorFallback: React.FC<IErrorBoundaryState> = ({ error, errorInfo }) => (
  <div
    className="error-boundary-fallback"
    style={{
      padding: '20px',
      margin: '20px',
      border: '1px solid #f5c6cb',
      borderRadius: '4px',
      backgroundColor: '#f8d7da',
      color: '#721c24',
    }}
  >
    <h2>Something went wrong</h2>
    <p>We&apos;re sorry, but something unexpected happened.</p>
    {process.env.NODE_ENV === 'development' && (
      <details style={{ whiteSpace: 'pre-wrap', marginTop: '10px' }}>
        <summary>Error Details (Development Only)</summary>
        <p>
          <strong>Error:</strong> {error?.message}
        </p>
        <p>
          <strong>Stack:</strong> {error?.stack}
        </p>
        <p>
          <strong>Component Stack:</strong> {errorInfo?.componentStack}
        </p>
      </details>
    )}
    <button
      type="button"
      onClick={() => window.location.reload()}
      style={{
        marginTop: '10px',
        padding: '8px 16px',
        backgroundColor: '#721c24',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
      }}
    >
      Reload Page
    </button>
  </div>
);

/**
 * ErrorBoundary component that catches JavaScript errors anywhere in the child component tree,
 * reports them to PostHog analytics, and displays a fallback UI.
 *
 * @component
 * @example
 * ```tsx
 * <ErrorBoundary
 *   context={{ featureName: 'chat', userId: 'user123' }}
 *   fallback={CustomErrorFallback}
 * >
 *   <ChatComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<
  PropsWithChildren<IErrorBoundaryProps>,
  IErrorBoundaryState
> {
  constructor(props: PropsWithChildren<IErrorBoundaryProps>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): IErrorBoundaryState {
    logDebug('ErrorBoundary: Error caught', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    logDebug('ErrorBoundary caught an error:', error, errorInfo);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Report to PostHog with context
    ErrorReportingService.reportError(error, errorInfo, {
      userId: this.props.context?.userId,
      userVibes: this.props.context?.userVibes,
      currentRoute: window.location.pathname,
      lastUserAction: this.props.context?.lastUserAction,
      featureName: this.props.context?.featureName,
    });
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent {...this.state} />;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
