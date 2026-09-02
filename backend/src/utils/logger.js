/**
 * Structured logging utility for FarmWise
 */

import config from '../config/index.js';

const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const LEVEL_NAMES = {
  0: 'ERROR',
  1: 'WARN',
  2: 'INFO',
  3: 'DEBUG',
};

class Logger {
  constructor(module) {
    this.module = module;
    this.currentLevel = LOG_LEVELS[config.logging.level] || LOG_LEVELS.info;
  }

  /**
   * Format log message with timestamp, level, module, and context
   */
  format(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const levelName = LEVEL_NAMES[level];
    const baseLog = {
      timestamp,
      level: levelName,
      module: this.module,
      message,
    };

    // Add request ID if available
    if (meta.requestId) {
      baseLog.requestId = meta.requestId;
    }

    // Add additional metadata
    if (Object.keys(meta).length > 0) {
      baseLog.meta = meta;
    }

    return JSON.stringify(baseLog);
  }

  /**
   * Log at ERROR level
   */
  error(message, meta = {}) {
    if (LOG_LEVELS.error <= this.currentLevel) {
      const output = this.format(LOG_LEVELS.error, message, meta);
      console.error(output);
    }
  }

  /**
   * Log at WARN level
   */
  warn(message, meta = {}) {
    if (LOG_LEVELS.warn <= this.currentLevel) {
      const output = this.format(LOG_LEVELS.warn, message, meta);
      console.warn(output);
    }
  }

  /**
   * Log at INFO level
   */
  info(message, meta = {}) {
    if (LOG_LEVELS.info <= this.currentLevel) {
      const output = this.format(LOG_LEVELS.info, message, meta);
      console.log(output);
    }
  }

  /**
   * Log at DEBUG level
   */
  debug(message, meta = {}) {
    if (LOG_LEVELS.debug <= this.currentLevel) {
      const output = this.format(LOG_LEVELS.debug, message, meta);
      console.debug(output);
    }
  }

  /**
   * Safely log request/response
   * Excludes sensitive information
   */
  logRequest(req) {
    this.debug('HTTP Request', {
      requestId: req.id,
      method: req.method,
      path: req.path,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
  }

  /**
   * Safely log response
   */
  logResponse(req, res, duration) {
    const level = res.statusCode >= 400 ? LOG_LEVELS.warn : LOG_LEVELS.info;
    if (level <= this.currentLevel) {
      const output = this.format(level, `HTTP Response - ${res.statusCode}`, {
        requestId: req.id,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
      });
      if (level === LOG_LEVELS.warn) {
        console.warn(output);
      } else {
        console.log(output);
      }
    }
  }
}

/**
 * Create logger instance for a module
 */
export const createLogger = (module) => {
  return new Logger(module);
};

// Default export: create a default logger instance for use when logger module is imported as default
export default createLogger('farmwise');

