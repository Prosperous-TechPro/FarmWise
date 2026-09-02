/**
 * Frontend API Client Service
 * 
 * Centralized HTTP client for all API communication
 * Handles request/response transformation, error handling, timeouts, retries
 */

import config from '../config/index.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('api');

/**
 * API Client Class
 * Provides methods for GET, POST, PUT, PATCH, DELETE requests
 */
class APIClient {
  constructor(baseURL = config.api.baseURL) {
    this.baseURL = baseURL;
    this.timeout = config.api.timeout;
    this.retryAttempts = config.api.retryAttempts;
    this.retryDelay = config.api.retryDelay;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  /**
   * Make an HTTP request with retry logic
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      method: options.method || 'GET',
      headers: {
        ...this.defaultHeaders,
        ...(localStorage.getItem('farmwise.accessToken')
          ? { Authorization: `Bearer ${localStorage.getItem('farmwise.accessToken')}` }
          : {}),
        ...options.headers,
      },
      signal: AbortSignal.timeout(options.timeout || this.timeout),
    };

    // Add body for non-GET requests
    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    let lastError;
    let attempt = 0;

    while (attempt < this.retryAttempts) {
      try {
        const response = await fetch(url, config);

        // Handle response
        const contentType = response.headers.get('content-type');
        let data;

        if (contentType?.includes('application/json')) {
          data = await response.json();
        } else {
          data = await response.text();
        }

        // Log request
        logger.info(`${config.method} ${endpoint}`, {
          status: response.status,
          attempt: attempt + 1,
        });

        // Handle HTTP errors
        if (!response.ok) {
          const error = new Error(data?.message || `HTTP ${response.status}`);
          error.status = response.status;
          error.data = data;
          throw error;
        }

        return data;
      } catch (error) {
        lastError = error;
        attempt++;

        // Only retry on network errors or 5xx status codes
        const isNetworkError = error instanceof TypeError;
        const isServerError = error.status >= 500;
        const isTimeout = error.name === 'AbortError';

        if (
          (isNetworkError || isServerError || isTimeout) &&
          attempt < this.retryAttempts
        ) {
          logger.warn(`Retry attempt ${attempt} after ${this.retryDelay}ms`, {
            endpoint,
            error: error.message,
          });
          await new Promise((resolve) =>
            setTimeout(resolve, this.retryDelay * attempt)
          );
        } else {
          logger.error(`Request failed: ${config.method} ${endpoint}`, {
            status: error.status,
            message: error.message,
            attempts: attempt,
          });
          break;
        }
      }
    }

    throw lastError;
  }

  /**
   * GET request
   */
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  async post(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body });
  }

  /**
   * PUT request
   */
  async put(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', body });
  }

  /**
   * PATCH request
   */
  async patch(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'PATCH', body });
  }

  /**
   * DELETE request
   */
  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * Set authorization header (for future auth implementation)
   */
  setAuthToken(token) {
    if (token) {
      this.defaultHeaders.Authorization = `Bearer ${token}`;
    } else {
      delete this.defaultHeaders.Authorization;
    }
  }
}

// Create and export singleton instance
export const apiClient = new APIClient();

export default apiClient;
