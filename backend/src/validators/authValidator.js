/**
 * Authentication Input Validators
 * Validate request data for all authentication endpoints
 */

import { normalizePhoneNumber } from '../utils/phone.js';
import { validatePasswordStrength } from '../utils/crypto.js';

/**
 * Validate registration request
 * @param {Object} data - Request data
 * @returns {Object} { isValid: boolean, errors: Object, normalizedData?: Object }
 */
export function validateRegistration(data) {
  const errors = {};

  // Validate email
  if (!data.email || typeof data.email !== 'string') {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Invalid email address';
  }

  // Validate phone
  if (!data.phone || typeof data.phone !== 'string') {
    errors.phone = 'Phone number is required';
  } else {
    const phoneResult = normalizePhoneNumber(data.phone);
    if (!phoneResult.isValid) {
      errors.phone = phoneResult.error;
    }
  }

  // Validate first name
  if (!data.firstName || typeof data.firstName !== 'string') {
    errors.firstName = 'First name is required';
  } else if (data.firstName.trim().length < 2) {
    errors.firstName = 'First name must be at least 2 characters';
  } else if (data.firstName.trim().length > 50) {
    errors.firstName = 'First name must not exceed 50 characters';
  }

  // Validate last name
  if (!data.lastName || typeof data.lastName !== 'string') {
    errors.lastName = 'Last name is required';
  } else if (data.lastName.trim().length < 2) {
    errors.lastName = 'Last name must be at least 2 characters';
  } else if (data.lastName.trim().length > 50) {
    errors.lastName = 'Last name must not exceed 50 characters';
  }

  // Validate password
  if (!data.password || typeof data.password !== 'string') {
    errors.password = 'Password is required';
  } else {
    const pwdValidation = validatePasswordStrength(data.password);
    if (!pwdValidation.isValid) {
      errors.password = pwdValidation.errors[0]; // Return first error
      errors.passwordDetails = pwdValidation.errors; // Include all details for debugging
    }
  }

  // Validate password confirmation
  if (!data.confirmPassword || typeof data.confirmPassword !== 'string') {
    errors.confirmPassword = 'Password confirmation is required';
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  // Validate verification method
  if (!data.verificationMethod || !['EMAIL', 'SMS'].includes(data.verificationMethod)) {
    errors.verificationMethod = 'Verification method must be EMAIL or SMS';
  }

  // If valid, normalize data
  let normalizedData;
  if (Object.keys(errors).length === 0) {
    const phoneResult = normalizePhoneNumber(data.phone);
    normalizedData = {
      email: data.email.toLowerCase().trim(),
      phone: phoneResult.normalizedNumber,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      password: data.password, // Don't modify password
      verificationMethod: data.verificationMethod,
    };
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    normalizedData,
  };
}

/**
 * Validate login request
 * @param {Object} data - Request data
 * @returns {Object} { isValid: boolean, errors: Object, normalizedData?: Object }
 */
export function validateLogin(data) {
  const errors = {};

  // Email or phone is required
  const hasEmail = data.email && typeof data.email === 'string';
  const hasPhone = data.phone && typeof data.phone === 'string';

  if (!hasEmail && !hasPhone) {
    errors.loginIdentifier = 'Email or phone number is required';
  }

  // Validate email if provided
  if (hasEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Invalid email address';
  }

  // Validate phone if provided
  if (hasPhone) {
    const phoneResult = normalizePhoneNumber(data.phone);
    if (!phoneResult.isValid) {
      errors.phone = phoneResult.error;
    }
  }

  // Validate password
  if (!data.password || typeof data.password !== 'string') {
    errors.password = 'Password is required';
  } else if (data.password.length === 0) {
    errors.password = 'Password is required';
  }

  // Normalize data
  let normalizedData;
  if (Object.keys(errors).length === 0) {
    normalizedData = {
      email: hasEmail ? data.email.toLowerCase().trim() : null,
      phone: hasPhone ? normalizePhoneNumber(data.phone).normalizedNumber : null,
      password: data.password,
    };
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    normalizedData,
  };
}

export function validateProfileUpdate(data = {}) {
  const errors = {};
  const normalizedData = {};

  if (data.firstName !== undefined) {
    if (typeof data.firstName !== 'string' || data.firstName.trim().length < 2 || data.firstName.trim().length > 50) {
      errors.firstName = 'First name must be between 2 and 50 characters';
    } else normalizedData.firstName = data.firstName.trim();
  }

  if (data.lastName !== undefined) {
    if (typeof data.lastName !== 'string' || data.lastName.trim().length < 2 || data.lastName.trim().length > 50) {
      errors.lastName = 'Last name must be between 2 and 50 characters';
    } else normalizedData.lastName = data.lastName.trim();
  }

  if (data.phone !== undefined) {
    if (typeof data.phone !== 'string') errors.phone = 'Phone number must be a string';
    else {
      const phoneResult = normalizePhoneNumber(data.phone);
      if (!phoneResult.isValid) errors.phone = phoneResult.error;
      else normalizedData.phone = phoneResult.normalizedNumber;
    }
  }

  if (data.profilePictureUrl !== undefined) {
    if (data.profilePictureUrl !== null && (typeof data.profilePictureUrl !== 'string' || !/^data:image\/(png|jpeg|jpg|webp);base64,[A-Za-z0-9+/=]+$/.test(data.profilePictureUrl) || data.profilePictureUrl.length > 5 * 1024 * 1024)) {
      errors.profilePictureUrl = 'Profile picture must be a PNG, JPG, or WEBP image smaller than 5 MB';
    } else normalizedData.profilePictureUrl = data.profilePictureUrl;
  }

  if (!Object.keys(normalizedData).length && !Object.keys(errors).length) {
    errors.profile = 'At least one profile field is required';
  }

  return { isValid: !Object.keys(errors).length, errors, normalizedData };
}

/**
 * Validate OTP verification request
 * @param {Object} data - Request data
 * @returns {Object} { isValid: boolean, errors: Object }
 */
export function validateOtpVerification(data) {
  const errors = {};

  // Validate OTP code
  if (!data.code || typeof data.code !== 'string') {
    errors.code = 'OTP code is required';
  } else if (!/^\d+$/.test(data.code)) {
    errors.code = 'OTP code must contain only digits';
  } else if (data.code.length !== 6) {
    errors.code = 'OTP code must be exactly 6 digits';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate OTP request (generate/resend)
 * @param {Object} data - Request data
 * @returns {Object} { isValid: boolean, errors: Object }
 */
export function validateOtpRequest(data) {
  const errors = {};

  // Validate channel
  if (!data.channel || !['EMAIL', 'SMS'].includes(data.channel)) {
    errors.channel = 'Channel must be EMAIL or SMS';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate password change request
 * @param {Object} data - Request data
 * @returns {Object} { isValid: boolean, errors: Object }
 */
export function validatePasswordChange(data) {
  const errors = {};

  // Validate current password
  if (!data.currentPassword || typeof data.currentPassword !== 'string') {
    errors.currentPassword = 'Current password is required';
  }

  // Validate new password
  if (!data.newPassword || typeof data.newPassword !== 'string') {
    errors.newPassword = 'New password is required';
  } else {
    const pwdValidation = validatePasswordStrength(data.newPassword);
    if (!pwdValidation.isValid) {
      errors.newPassword = pwdValidation.errors[0];
    }
  }

  // Validate password confirmation
  if (!data.confirmPassword || typeof data.confirmPassword !== 'string') {
    errors.confirmPassword = 'Password confirmation is required';
  } else if (data.newPassword !== data.confirmPassword) {
    errors.confirmPassword = 'New passwords do not match';
  }

  // Validate that current and new passwords are different
  if (data.currentPassword && data.newPassword && data.currentPassword === data.newPassword) {
    errors.newPassword = 'New password must be different from current password';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate password reset request
 * @param {Object} data - Request data
 * @returns {Object} { isValid: boolean, errors: Object }
 */
export function validatePasswordReset(data) {
  const errors = {};

  // Validate new password
  if (!data.newPassword || typeof data.newPassword !== 'string') {
    errors.newPassword = 'New password is required';
  } else {
    const pwdValidation = validatePasswordStrength(data.newPassword);
    if (!pwdValidation.isValid) {
      errors.newPassword = pwdValidation.errors[0];
    }
  }

  // Validate password confirmation
  if (!data.confirmPassword || typeof data.confirmPassword !== 'string') {
    errors.confirmPassword = 'Password confirmation is required';
  } else if (data.newPassword !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate refresh token request
 * @param {Object} data - Request data
 * @returns {Object} { isValid: boolean, errors: Object }
 */
export function validateRefreshToken(data) {
  const errors = {};

  if (!data.refreshToken || typeof data.refreshToken !== 'string') {
    errors.refreshToken = 'Refresh token is required';
  } else if (data.refreshToken.trim().length === 0) {
    errors.refreshToken = 'Refresh token cannot be empty';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export default {
  validateRegistration,
  validateLogin,
  validateOtpVerification,
  validateOtpRequest,
  validatePasswordChange,
  validatePasswordReset,
  validateRefreshToken,
};
