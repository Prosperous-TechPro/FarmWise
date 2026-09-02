/**
 * Frontend Logger Utility
 * 
 * Provides structured logging for frontend applications
 */

import config from '../config/index.js';

/**
 * Log levels
 */
const LOG_LEVELS = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
};

/**
 * Get log level priority
 */
function getLogLevelPriority(level) {
  const levels = {
    [LOG_LEVELS.ERROR]: 0,
    [LOG_LEVELS.WARN]: 1,
    [LOG_LEVELS.INFO]: 2,
    [LOG_LEVELS.DEBUG]: 3,
  };
  return levels[level] || 2;
}

/**
 * Logger class for structured logging
 */
class Logger {
  constructor(module) {
    this.module = module;
    this.level = config.logging.level;
  }

  /**
   * Should log based on level
   */
  shouldLog(level) {
    if (!config.logging.enabled) return false;
    return getLogLevelPriority(level) <= getLogLevelPriority(this.level);
  }

  /**
   * Format log message
   */
  formatMessage(level, message, metadata = {}) {
    return {
      timestamp: new Date().toISOString(),
      level,
      module: this.module,
      message,
      ...metadata,
    };
  }

  /**
   * Log error
   */
  error(message, metadata = {}) {
    if (this.shouldLog(LOG_LEVELS.ERROR)) {
      const log = this.formatMessage(LOG_LEVELS.ERROR, message, metadata);
      console.error('[ERROR]', log);
    }
  }

  /**
   * Log warning
   */
  warn(message, metadata = {}) {
    if (this.shouldLog(LOG_LEVELS.WARN)) {
      const log = this.formatMessage(LOG_LEVELS.WARN, message, metadata);
      console.warn('[WARN]', log);
    }
  }

  /**
   * Log info
   */
  info(message, metadata = {}) {
    if (this.shouldLog(LOG_LEVELS.INFO)) {
      const log = this.formatMessage(LOG_LEVELS.INFO, message, metadata);
      console.log('[INFO]', log);
    }
  }

  /**
   * Log debug
   */
  debug(message, metadata = {}) {
    if (this.shouldLog(LOG_LEVELS.DEBUG)) {
      const log = this.formatMessage(LOG_LEVELS.DEBUG, message, metadata);
      console.debug('[DEBUG]', log);
    }
  }
}

/**
 * Create a logger for a specific module
 */
export function createLogger(module) {
  return new Logger(module);
}

export const logger = createLogger('app');

export default {
  Logger,
  createLogger,
  logger,
};
