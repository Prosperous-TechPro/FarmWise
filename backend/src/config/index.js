/**
 * FarmWise Application Configuration
 * Centralized configuration management
 * Loads and validates environment variables
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration object
const config = {
  // Environment
  env: process.env.NODE_ENV || 'development',
  isDevelopment: (process.env.NODE_ENV || 'development') === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',

  // Server
  port: parseInt(process.env.PORT || '3000', 10),
  backendUrl: process.env.BACKEND_URL || 'http://localhost:3000',

  // Frontend
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  corsOrigin: (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map(url => url.trim()),

  // Database
  database: {
    url: process.env.DATABASE_URL,
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // OTP Configuration
  otp: {
    expiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES || '15', 10),
    maxAttempts: parseInt(process.env.OTP_MAX_ATTEMPTS || '5', 10),
    length: parseInt(process.env.OTP_LENGTH || '6', 10),
  },

  // Email Service
  email: {
    service: process.env.EMAIL_SERVICE || 'smtp',
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM || 'noreply@farmwise.com',
  },

  // SMS Service (Hubtel)
  sms: {
    provider: 'hubtel',
    clientId: process.env.HUBTEL_CLIENT_ID,
    clientSecret: process.env.HUBTEL_CLIENT_SECRET,
    apiKey: process.env.HUBTEL_API_KEY,
    from: process.env.HUBTEL_SMS_FROM || 'FarmWise',
  },

  // Storage
  storage: {
    type: process.env.STORAGE_TYPE || 'local',
    path: process.env.STORAGE_PATH || './uploads',
    bucket: process.env.STORAGE_BUCKET,
    accessKey: process.env.STORAGE_ACCESS_KEY,
    secretKey: process.env.STORAGE_SECRET_KEY,
  },

  // AI Service
  ai: {
    url: process.env.AI_SERVICE_URL,
    key: process.env.AI_SERVICE_KEY,
  },

  // Push Notifications
  notifications: {
    fcmServerKey: process.env.FCM_SERVER_KEY,
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || './logs/app.log',
  },

  // Request identification
  requestId: {
    headerName: 'x-request-id',
  },
};

/**
 * Validate required configuration for the environment
 */
export function validateConfig() {
  const errors = [];

  // Required for all environments
  if (!config.port) {
    errors.push('PORT is not set');
  }

  // Required for production
  if (config.isProduction) {
    if (!config.database.url) {
      errors.push('DATABASE_URL is required in production');
    }
    if (!config.jwt.secret) {
      errors.push('JWT_SECRET is required in production');
    }
    if (!config.jwt.refreshSecret) {
      errors.push('JWT_REFRESH_SECRET is required in production');
    }
    if (!process.env.CORS_ORIGIN) {
      errors.push('CORS_ORIGIN is required in production');
    }
    if (!config.backendUrl.startsWith('https://')) {
      errors.push('BACKEND_URL must use HTTPS in production');
    }
  }

  if (errors.length > 0) {
    console.error('Configuration validation errors:');
    errors.forEach(error => console.error(`  - ${error}`));
    process.exit(1);
  }

  return true;
}

export default config;
