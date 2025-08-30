import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  RefreshCw, 
  Clock, 
  CreditCard,
  FileText,
  Wifi,
  Server
} from 'lucide-react';

// Loading state for slow matching
export const MatchingLoadingState: React.FC = () => (
  <Card>
    <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
      <RefreshCw className="animate-spin h-8 w-8 text-muted-foreground" />
      <div>
        <h3 className="text-lg font-semibold mb-2">Finding matching experts...</h3>
        <p className="text-muted-foreground">
          No strong matches yet. We'll notify you when experts are found.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Usually within 2 hours
        </p>
      </div>
    </CardContent>
  </Card>
);

// Payment authorization failure
export const PaymentFailureState: React.FC<{
  onRetry: () => void;
  onCancel: () => void;
}> = ({ onRetry, onCancel }) => (
  <Alert className="border-orange-200 bg-orange-50">
    <CreditCard className="h-4 w-4 text-orange-600" />
    <AlertTitle className="text-orange-800">Payment Authorization Failed</AlertTitle>
    <AlertDescription className="mt-2">
      <p className="text-orange-700 mb-4">
        We couldn't authorize your payment. Your proposal remains in "accepted pending payment" status.
        Please check your payment method and try again.
      </p>
      <div className="flex gap-2">
        <Button onClick={onRetry} size="sm" variant="default">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry Payment
        </Button>
        <Button onClick={onCancel} size="sm" variant="outline">
          Cancel
        </Button>
      </div>
    </AlertDescription>
  </Alert>
);

// Transcript processing states
export const TranscriptProcessingState: React.FC<{ 
  stage: 'processing' | 'failed' | 'placeholder';
  onRetry?: () => void;
}> = ({ stage, onRetry }) => {
  if (stage === 'processing') {
    return (
      <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <Clock className="h-4 w-4 text-blue-600 animate-pulse" />
        <span className="text-sm text-blue-700">Processing transcript...</span>
        <Badge variant="outline" className="ml-auto">
          Processing
        </Badge>
      </div>
    );
  }

  if (stage === 'failed') {
    return (
      <Alert className="border-red-200 bg-red-50">
        <FileText className="h-4 w-4 text-red-600" />
        <AlertTitle className="text-red-800">Transcript Processing Failed</AlertTitle>
        <AlertDescription className="mt-2">
          <p className="text-red-700 mb-4">
            We're having trouble processing the meeting transcript. A placeholder has been created and admin has been notified.
          </p>
          {onRetry && (
            <Button onClick={onRetry} size="sm" variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
      <FileText className="h-4 w-4 text-gray-600" />
      <span className="text-sm text-gray-700">Transcript placeholder created</span>
      <Badge variant="secondary" className="ml-auto">
        Pending Review
      </Badge>
    </div>
  );
};

// Network/API error states
export const NetworkErrorState: React.FC<{
  message?: string;
  onRetry: () => void;
}> = ({ message = "Connection error. Please check your internet connection.", onRetry }) => (
  <Alert className="border-red-200 bg-red-50">
    <Wifi className="h-4 w-4 text-red-600" />
    <AlertTitle className="text-red-800">Connection Error</AlertTitle>
    <AlertDescription className="mt-2">
      <p className="text-red-700 mb-4">{message}</p>
      <Button onClick={onRetry} size="sm" variant="outline">
        <RefreshCw className="h-4 w-4 mr-2" />
        Try Again
      </Button>
    </AlertDescription>
  </Alert>
);

// Server error state
export const ServerErrorState: React.FC<{
  onRetry: () => void;
}> = ({ onRetry }) => (
  <Alert className="border-red-200 bg-red-50">
    <Server className="h-4 w-4 text-red-600" />
    <AlertTitle className="text-red-800">Server Error</AlertTitle>
    <AlertDescription className="mt-2">
      <p className="text-red-700 mb-4">
        Something went wrong on our end. Our team has been notified.
      </p>
      <Button onClick={onRetry} size="sm" variant="outline">
        <RefreshCw className="h-4 w-4 mr-2" />
        Try Again
      </Button>
    </AlertDescription>
  </Alert>
);

// Generic error state with customization
export const GenericErrorState: React.FC<{
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  icon?: React.ReactNode;
}> = ({ 
  title = "Something went wrong",
  message = "An unexpected error occurred",
  onRetry,
  retryLabel = "Try Again",
  icon
}) => (
  <Alert className="border-red-200 bg-red-50">
    {icon || <AlertTriangle className="h-4 w-4 text-red-600" />}
    <AlertTitle className="text-red-800">{title}</AlertTitle>
    <AlertDescription className="mt-2">
      <p className="text-red-700 mb-4">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} size="sm" variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          {retryLabel}
        </Button>
      )}
    </AlertDescription>
  </Alert>
);