/**
 * Request logging middleware for FarmWise API
 */

import { createLogger } from '../utils/logger.js';

const logger = createLogger('requestLogger');

/**
 * Simple request logger middleware
 */
export const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  const originalSend = res.send;

  // Override send to capture response
  res.send = function (data) {
    res.send = originalSend;
    const duration = Date.now() - startTime;

    // Log request details
    const logLevel = res.statusCode >= 400 ? 'error' : 'info';

    if (res.statusCode >= 400) {
      logger.error(`Request failed`, {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        query: req.query,
        body: req.body,
      });
    } else {
      logger.info(`Request completed`, {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
      });
    }

    return res.send(data);
  };

  next();
};
