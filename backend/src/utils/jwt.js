/**
 * JWT Token Utilities
 * Handle access and refresh token generation and verification
 */

import jwt from 'jsonwebtoken';

/**
 * Generate an access token
 * @param {Object} payload - Token payload (user ID, role, etc.)
 * @param {string} secret - JWT secret
 * @param {string} expiresIn - Token expiration (default from config)
 * @returns {string} Signed JWT token
 */
export function generateAccessToken(payload, secret, expiresIn = '24h') {
  return jwt.sign(payload, secret, {
    expiresIn,
    algorithm: 'HS256',
  });
}

/**
 * Generate a refresh token
 * @param {Object} payload - Token payload
 * @param {string} secret - Refresh token secret
 * @param {string} expiresIn - Token expiration (default from config)
 * @returns {string} Signed refresh token
 */
export function generateRefreshToken(payload, secret, expiresIn = '7d') {
  return jwt.sign(payload, secret, {
    expiresIn,
    algorithm: 'HS256',
  });
}

/**
 * Verify an access token
 * @param {string} token - Token to verify
 * @param {string} secret - JWT secret
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
export function verifyAccessToken(token, secret) {
  try {
    return jwt.verify(token, secret, { algorithms: ['HS256'] });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw error;
  }
}

/**
 * Verify a refresh token
 * @param {string} token - Refresh token to verify
 * @param {string} secret - Refresh token secret
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
export function verifyRefreshToken(token, secret) {
  try {
    return jwt.verify(token, secret, { algorithms: ['HS256'] });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Refresh token has expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid refresh token');
    }
    throw error;
  }
}

/**
 * Decode token without verification (for inspection)
 * SECURITY: Only use for debugging or when verification already passed
 * @param {string} token - Token to decode
 * @returns {Object} Decoded payload
 */
export function decodeToken(token) {
  return jwt.decode(token);
}

export default {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
};
