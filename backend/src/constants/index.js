/**
 * Application Constants
 * 
 * Centralized constants used throughout the application
 */

// User roles
export const USER_ROLES = {
  SUPERADMIN: 'SUPERADMIN',
  ADMIN: 'ADMIN',
  FARM_OWNER: 'FARM_OWNER',
  WORKER: 'WORKER',
};

// Environment
export const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TEST: 'test',
};

// HTTP status messages
export const HTTP_STATUS = {
  OK: 'OK',
  CREATED: 'Created',
  BAD_REQUEST: 'Bad Request',
  UNAUTHORIZED: 'Unauthorized',
  FORBIDDEN: 'Forbidden',
  NOT_FOUND: 'Not Found',
  CONFLICT: 'Conflict',
  INTERNAL_ERROR: 'Internal Server Error',
  SERVICE_UNAVAILABLE: 'Service Unavailable',
};

// Error codes
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  CONFLICT: 'CONFLICT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
};

export default {
  USER_ROLES,
  ENVIRONMENTS,
  HTTP_STATUS,
  ERROR_CODES,
};
