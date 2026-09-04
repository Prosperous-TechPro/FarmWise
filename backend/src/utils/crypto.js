/**
 * Cryptography utilities
 * Secure password hashing and token generation
 */

import bcrypt from 'bcryptjs';
import crypto from 'crypto';

/**
 * Hash a password using bcrypt
 * @param {string} password - Plain text password
 * @param {number} saltRounds - Number of salt rounds (default 10)
 * @returns {Promise<string>} Hashed password
 */
export async function hashPassword(password, saltRounds = 10) {
  try {
    return await bcrypt.hash(password, saltRounds);
  } catch (error) {
    throw new Error(`Password hashing failed: ${error.message}`);
  }
}

/**
 * Compare a password with its hash
 * @param {string} password - Plain text password to verify
 * @param {string} hash - Previously hashed password
 * @returns {Promise<boolean>} True if password matches hash
 */
export async function comparePassword(password, hash) {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    throw new Error(`Password comparison failed: ${error.message}`);
  }
}

/**
 * Hash a value securely (for OTP codes and refresh tokens)
 * Uses SHA-256 hashing
 * @param {string} value - Value to hash
 * @returns {string} SHA-256 hash
 */
export function hashValue(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

/**
 * Generate a random OTP code
 * @param {number} length - Length of OTP (default 6)
 * @returns {string} Random numeric OTP
 */
export function generateOtp(length = 6) {
  const digits = Array.from({ length }, () => {
    const value = crypto.randomInt(0, 10);
    return String(value);
  });

  return digits.join('');
}

/**
 * Generate a random token (for password reset, refresh token, etc.)
 * @param {number} length - Length in bytes (default 32 = 64 hex chars)
 * @returns {string} Random hex token
 */
export function generateToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
export function validatePasswordStrength(password) {
  const errors = [];

  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export default {
  hashPassword,
  comparePassword,
  hashValue,
  generateOtp,
  generateToken,
  validatePasswordStrength,
};
