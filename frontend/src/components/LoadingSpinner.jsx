/**
 * LoadingSpinner Component
 * 
 * Reusable loading indicator component
 */

import './LoadingSpinner.css';

export function LoadingSpinner({ size = 'medium', message = 'Loading...' }) {
  return (
    <div className={`loading-spinner loading-spinner--${size}`}>
      <div className="loading-spinner__content">
        <div className="loading-spinner__spinner" />
        <p className="loading-spinner__message">{message}</p>
      </div>
    </div>
  );
}

export default LoadingSpinner;
