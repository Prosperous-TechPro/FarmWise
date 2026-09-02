/**
 * Request ID middleware for FarmWise API
 * Assigns a unique ID to each request for tracing
 */

import { randomUUID } from 'crypto';

/**
 * Generate and attach request ID to each request
 */
export const requestIdMiddleware = (req, res, next) => {
  // Check if request already has an ID (from client or proxy)
  const requestId = req.headers['x-request-id'] || randomUUID();
  
  // Attach to request object
  req.id = requestId;
  req.requestId = requestId;
  
  // Add to response headers for client tracking
  res.setHeader('x-request-id', requestId);
  
  // Add to response locals for middleware access
  res.locals.requestId = requestId;
  
  next();
};

/**
 * Get request ID from request object
 */
export const getRequestId = (req) => {
  return req?.id || req?.requestId || 'unknown';
};
