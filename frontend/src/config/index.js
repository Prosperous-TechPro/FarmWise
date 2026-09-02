/**
 * Frontend Configuration
 * 
 * Centralized configuration management for frontend
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

const config = {
  // API Configuration
  api: {
    baseURL: API_BASE_URL,
    timeout: 10000,
    retryAttempts: 2,
    retryDelay: 400,
  },

  // Feature flags
  features: {
    enableOfflineMode: true,
    enableNotifications: true,
    enableAnalytics: false, // Set to true in production
  },

  // Environment
  environment: import.meta.env.MODE || 'development',
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,

  // Logging
  logging: {
    enabled: true,
    level: import.meta.env.DEV ? 'debug' : 'info',
  },
};

/**
 * Validate frontend configuration
 */
export function validateConfig() {
  if (!config.api.baseURL) {
    throw new Error('API_BASE_URL is not configured');
  }

  if (config.api.timeout <= 0) {
    throw new Error('API timeout must be greater than 0');
  }
}

export default config;
