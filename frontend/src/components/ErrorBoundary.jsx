/**
 * ErrorBoundary Component
 * 
 * Catches React errors and displays a fallback UI
 */

import React from 'react';
import { createLogger } from '../utils/logger';
import { ErrorDisplay } from './ErrorDisplay';

const logger = createLogger('ErrorBoundary');

/**
 * Error Boundary Class Component
 * Catches JavaScript errors anywhere in the child component tree
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error for debugging (not for production)
    if (import.meta.env.DEV) {
      logger.error('ErrorBoundary caught an error:', { error, errorInfo });
    }

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem' }}>
          <ErrorDisplay
            title="Something went wrong"
            message="An unexpected error occurred. Please try again."
            error={this.state.error}
            onRetry={this.handleReset}
          />
          {import.meta.env.DEV && this.state.errorInfo && (
            <details
              style={{
                margin: '1rem 0',
                padding: '1rem',
                backgroundColor: '#f3f4f6',
                borderRadius: '0.5rem',
                fontSize: '0.8125rem',
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                overflow: 'auto',
              }}
            >
              <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                Error Details (Development Only)
              </summary>
              <p>{this.state.error?.toString()}</p>
              <p>{this.state.errorInfo.componentStack}</p>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
