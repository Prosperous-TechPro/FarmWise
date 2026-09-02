/**
 * ErrorDisplay Component
 * 
 * Display error messages with retry option
 */

import './ErrorDisplay.css';

export function ErrorDisplay({
  title = 'Something went wrong',
  message = 'An error occurred while processing your request.',
  error,
  onRetry,
}) {
  const displayMessage = message || error?.message || 'Unknown error';

  return (
    <div className="error-display error-display--error">
      <div className="error-display__content">
        <div className="error-display__icon">⚠️</div>
        <h3 className="error-display__title">{title}</h3>
        <p className="error-display__message">{displayMessage}</p>
        {onRetry && (
          <button className="error-display__button" onClick={onRetry}>
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * WarningDisplay Component
 */
export function WarningDisplay({ title = 'Warning', message = '' }) {
  return (
    <div className="error-display error-display--warning">
      <div className="error-display__icon">⚡</div>
      <div>
        <h3 className="error-display__title">{title}</h3>
        {message && <p className="error-display__message">{message}</p>}
      </div>
    </div>
  );
}

/**
 * SuccessDisplay Component
 */
export function SuccessDisplay({ title = 'Success', message = '' }) {
  return (
    <div className="error-display error-display--success">
      <div className="error-display__icon">✓</div>
      <div>
        <h3 className="error-display__title">{title}</h3>
        {message && <p className="error-display__message">{message}</p>}
      </div>
    </div>
  );
}

export default ErrorDisplay;
