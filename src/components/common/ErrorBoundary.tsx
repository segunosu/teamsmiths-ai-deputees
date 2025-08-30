import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; onRetry: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} onRetry={this.handleRetry} />;
      }

      return (
        <Alert className="my-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <Button onClick={this.handleRetry} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

// Specific error fallback components
export const PaymentErrorFallback: React.FC<{ error?: Error; onRetry: () => void }> = ({ 
  error, 
  onRetry 
}) => (
  <Alert className="my-4">
    <AlertTriangle className="h-4 w-4" />
    <AlertTitle>Payment Authorization Failed</AlertTitle>
    <AlertDescription className="mt-2">
      <p className="mb-4">
        We couldn't authorize your payment. Your proposal remains in "accepted pending payment" status.
      </p>
      <div className="flex gap-2">
        <Button onClick={onRetry} size="sm">
          Retry Payment
        </Button>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          Refresh Page
        </Button>
      </div>
    </AlertDescription>
  </Alert>
);

export const TranscriptErrorFallback: React.FC<{ error?: Error; onRetry: () => void }> = ({ 
  error, 
  onRetry 
}) => (
  <Alert className="my-4">
    <AlertTriangle className="h-4 w-4" />
    <AlertTitle>Transcript Processing Failed</AlertTitle>
    <AlertDescription className="mt-2">
      <p className="mb-4">
        We're having trouble processing the meeting transcript. A placeholder has been created and admin has been notified.
      </p>
      <Button onClick={onRetry} variant="outline" size="sm">
        <RefreshCw className="h-4 w-4 mr-2" />
        Check again
      </Button>
    </AlertDescription>
  </Alert>
);