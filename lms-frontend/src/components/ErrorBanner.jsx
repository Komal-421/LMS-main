import { AlertCircle, RefreshCw } from 'lucide-react';
import { memo } from 'react';
import Button from './Button';

const ErrorBanner = memo(function ErrorBanner({ message, onRetry }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-2.5">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
        <span>{message}</span>
      </div>
      {onRetry && (
        <Button
          size="sm"
          variant="secondary"
          onClick={onRetry}
          className="shrink-0 self-start sm:self-auto"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </Button>
      )}
    </div>
  );
});

export default ErrorBanner;
