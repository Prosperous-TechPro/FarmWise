/**
 * Authentication Controller
 * Handles HTTP requests for authentication endpoints
 */

import {
  validateRegistration,
  validateLogin,
  validateOtpVerification,
  validateOtpRequest,
  validatePasswordChange,
  validatePasswordReset,
  validateRefreshToken,
  validateProfileUpdate,
} from '../validators/authValidator.js';
import {
  verifyEmail,
  verifyPhone,
  login,
  refreshAccessToken,
  logout,
  logoutAll,
  changePassword,
  resetPassword,
  createPendingRegistration,
  completePendingRegistration,
} from '../services/authService.js';
import { generateAndSendOtp, verifyOtp, resendOtp } from '../services/otpService.js';
import { findUserById, findUserByPhone, updateUser } from '../repositories/userRepository.js';
import logger from '../utils/logger.js';
import { findPendingRegistrationById } from '../repositories/pendingRegistrationRepository.js';

/**
 * POST /api/v1/auth/register
 * Register a new user account
 */
export async function register(req, res) {
  try {
    const { email, phone, firstName, lastName, password, confirmPassword, verificationMethod } =
      req.body;

    // Validate input
    const validation = validateRegistration({
      email,
      phone,
      firstName,
      lastName,
      password,
      confirmPassword,
      verificationMethod,
    });

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors,
      });
    }

    // Register user
    const result = await createPendingRegistration({
      ...validation.normalizedData,
    });

    // Generate and send OTP
    let otpResult;
    try {
      const destination = validation.normalizedData[verificationMethod === 'EMAIL' ? 'email' : 'phone'];

      otpResult = await generateAndSendOtp({
        pendingRegistrationId: result.pendingRegistrationId,
        purpose: 'ACCOUNT_VERIFICATION',
        channel: verificationMethod,
        destination,
        emailProvider: req.app.get('emailProvider'),
        smsProvider: req.app.get('smsProvider'),
        expiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES) || 10,
        length: parseInt(process.env.OTP_LENGTH) || 6,
      });
    } catch (otpError) {
      logger.error(`OTP generation failed during registration`, {
        pendingRegistrationId: result.pendingRegistrationId,
        error: otpError.message,
      });

      return res.status(502).json({
        success: false,
        message: 'Account is pending verification, but OTP delivery failed. Please request a new OTP.',
        data: {
          pendingRegistrationId: result.pendingRegistrationId,
          email: result.email,
          verificationMethod,
        },
      });
    }

    return res.status(201).json({
      success: true,
      message: `Verification code sent to your ${verificationMethod.toLowerCase()}. Complete verification to create your account.`,
      data: {
        pendingRegistrationId: result.pendingRegistrationId,
        email: result.email,
        verificationMethod,
        otpExpiresIn: otpResult.expiresIn,
      },
    });
  } catch (error) {
    logger.error(`Registration error`, {
      error: error.message,
      body: { ...req.body, password: '[REDACTED]', confirmPassword: '[REDACTED]' },
    });

    // Handle specific error messages
    if (error.message.includes('already registered')) {
      return res.status(409).json({
        success: false,
        message: 'User already exists',
        errors: { email: 'This email address is already registered' },
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Registration failed',
      errors: { server: error.message },
    });
  }
}

/**
 * POST /api/v1/auth/verify-otp
 * Verify OTP and complete account verification
 */
export async function verifyOtpEndpoint(req, res) {
  try {
    const { userId, pendingRegistrationId, code, channel } = req.body;
    const targetId = pendingRegistrationId || userId;

    if (!targetId || !code || !channel || (pendingRegistrationId && userId)) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        errors: {
          pendingRegistrationId: !targetId ? 'Pending registration ID is required' : undefined,
          code: !code ? 'OTP code is required' : undefined,
          channel: !channel ? 'Channel is required' : undefined,
        },
      });
    }

    // Validate OTP code
    const validation = validateOtpVerification({ code });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors,
      });
    }

    // Verify OTP
    await verifyOtp({
      userId: pendingRegistrationId ? undefined : userId,
      pendingRegistrationId,
      purpose: 'ACCOUNT_VERIFICATION',
      channel,
      code,
    });

    // Update user verification status
    if (pendingRegistrationId) {
      const pendingRegistration = await findPendingRegistrationById(pendingRegistrationId);
      if (!pendingRegistration) throw new Error('Pending registration not found');
      if (pendingRegistration.verificationMethod !== channel) {
        throw new Error('Verification channel does not match pending registration');
      }
      const user = await completePendingRegistration(pendingRegistrationId);
      return res.status(200).json({
        success: true,
        message: 'Account verified successfully. You can now log in.',
        data: { userId: user.id },
      });
    }

    if (channel === 'EMAIL') {
      await verifyEmail(userId);
    } else if (channel === 'SMS') {
      await verifyPhone(userId);
    }

    logger.info(`Account verified for user`, {
      userId: targetId,
      channel,
    });

    return res.status(200).json({
      success: true,
      message: 'Account verified successfully. You can now log in.',
      data: { userId },
    });
  } catch (error) {
    logger.error(`OTP verification error`, {
      error: error.message,
      userId: req.body.userId,
      pendingRegistrationId: req.body.pendingRegistrationId,
    });

    // Determine status code based on error
    let statusCode = 400;
    if (error.message.includes('not found')) {
      statusCode = 404;
    } else if (error.message.includes('expired')) {
      statusCode = 400; // Client should request new OTP
    }

    return res.status(statusCode).json({
      success: false,
      message: 'OTP verification failed',
      errors: { otp: error.message },
    });
  }
}

/**
 * POST /api/v1/auth/resend-otp
 * Resend OTP code
 */
export async function resendOtpEndpoint(req, res) {
  try {
    const { userId, pendingRegistrationId, channel } = req.body;
    const targetId = pendingRegistrationId || userId;

    if (!targetId || !channel || (pendingRegistrationId && userId)) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        errors: {
          pendingRegistrationId: !targetId ? 'Pending registration ID is required' : undefined,
          channel: !channel ? 'Channel is required' : undefined,
        },
      });
    }

    // Validate channel
    const validation = validateOtpRequest({ channel });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors,
      });
    }

    const user = pendingRegistrationId ? null : await findUserById(userId);
    const pendingRegistration = pendingRegistrationId
      ? await findPendingRegistrationById(pendingRegistrationId)
      : null;
    if (!user && !pendingRegistration) {
      return res.status(404).json({ success: false, message: 'Registration target not found' });
    }
    if (pendingRegistration && pendingRegistration.verificationMethod !== channel) {
      return res.status(400).json({ success: false, message: 'Verification channel does not match pending registration' });
    }

    const destination = channel === 'EMAIL'
      ? (pendingRegistration || user).email
      : (pendingRegistration || user).phone;

    // Resend OTP
    const result = await resendOtp({
      userId: pendingRegistrationId ? undefined : userId,
      pendingRegistrationId,
      purpose: 'ACCOUNT_VERIFICATION',
      channel,
      destination,
      emailProvider: req.app.get('emailProvider'),
      smsProvider: req.app.get('smsProvider'),
    });

    return res.status(200).json({
      success: true,
      message: `Verification code resent to your ${channel.toLowerCase()}`,
      data: {
        userId: pendingRegistrationId ? undefined : userId,
        pendingRegistrationId,
        channel,
        expiresIn: result.expiresIn,
        retryAfter: result.cooldownSeconds,
      },
    });
  } catch (error) {
    logger.error(`OTP resend error`, {
      error: error.message,
      userId: req.body.userId,
    });

    if (error.statusCode === 429) {
      res.set('Retry-After', String(error.retryAfter || 60));
      return res.status(429).json({
        success: false,
        message: error.message,
        errors: { otp: error.message },
        retryAfter: error.retryAfter || 60,
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Failed to resend OTP',
      errors: { otp: error.message },
    });
  }
}

/**
 * POST /api/v1/auth/login
 * Authenticate user and create session
 */
export async function loginEndpoint(req, res) {
  try {
    const { email, phone, password } = req.body;

    // Validate input
    const validation = validateLogin({ email, phone, password });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors,
      });
    }

    // Get client info for session
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    const deviceIdentifier = req.body.deviceId || null;

    // Login
    const result = await login({
      email: validation.normalizedData.email,
      phone: validation.normalizedData.phone,
      password: validation.normalizedData.password,
      ipAddress,
      userAgent,
      deviceIdentifier,
      jwtConfig: {
        secret: process.env.JWT_SECRET,
        refreshSecret: process.env.JWT_REFRESH_SECRET,
        accessTokenExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
        refreshTokenExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      },
    });

    // Set refresh token in httpOnly cookie (optional, for better security)
    // res.cookie('refreshToken', result.refreshToken, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production',
    //   sameSite: 'strict',
    //   maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    // });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        user: result.user,
        sessionId: result.sessionId,
      },
    });
  } catch (error) {
    logger.error(`Login error`, {
      error: error.message,
      email: req.body.email,
    });

    return res.status(401).json({
      success: false,
      message: 'Login failed',
      errors: { credentials: error.message },
    });
  }
}

/**
 * POST /api/v1/auth/refresh
 * Refresh access token
 */
export async function refreshTokenEndpoint(req, res) {
  try {
    const { refreshToken } = req.body;

    // Validate input
    const validation = validateRefreshToken({ refreshToken });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors,
      });
    }

    // Refresh token
    const result = await refreshAccessToken({
      refreshToken,
      jwtConfig: {
        secret: process.env.JWT_SECRET,
        refreshSecret: process.env.JWT_REFRESH_SECRET,
        accessTokenExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
        refreshTokenExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: result.accessToken,
      },
    });
  } catch (error) {
    logger.error(`Token refresh error`, {
      error: error.message,
    });

    return res.status(401).json({
      success: false,
      message: 'Token refresh failed',
      errors: { token: error.message },
    });
  }
}

/**
 * POST /api/v1/auth/logout
 * Logout user and revoke session
 */
export async function logoutEndpoint(req, res) {
  try {
    const { sessionId } = req.body;
    const userId = req.user.id; // From authenticate middleware

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required',
        errors: { sessionId: 'Session ID must be provided' },
      });
    }

    // Logout
    await logout({
      userId,
      sessionId,
    });

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    logger.error(`Logout error`, {
      userId: req.user?.id,
      error: error.message,
    });

    return res.status(400).json({
      success: false,
      message: 'Logout failed',
      errors: { session: error.message },
    });
  }
}

/**
 * POST /api/v1/auth/logout-all
 * Logout from all devices/sessions
 */
export async function logoutAllEndpoint(req, res) {
  try {
    const userId = req.user.id;

    // Logout all sessions
    const result = await logoutAll(userId);

    return res.status(200).json({
      success: true,
      message: 'Logged out from all sessions',
      data: {
        sessionsRevoked: result.sessionsRevoked,
      },
    });
  } catch (error) {
    logger.error(`Logout all error`, {
      userId: req.user?.id,
      error: error.message,
    });

    return res.status(400).json({
      success: false,
      message: 'Logout failed',
      errors: { session: error.message },
    });
  }
}

/**
 * POST /api/v1/auth/change-password
 * Change user password
 */
export async function changePasswordEndpoint(req, res) {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user.id;

    // Validate input
    const validation = validatePasswordChange({
      currentPassword,
      newPassword,
      confirmPassword,
    });

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors,
      });
    }

    // Change password
    const result = await changePassword({
      userId,
      currentPassword,
      newPassword,
    });

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    logger.error(`Password change error`, {
      userId: req.user?.id,
      error: error.message,
    });

    const statusCode = error.message.includes('incorrect') ? 401 : 400;

    return res.status(statusCode).json({
      success: false,
      message: 'Password change failed',
      errors: { password: error.message },
    });
  }
}

/**
 * POST /api/v1/auth/reset-password
 * Reset password after OTP verification
 */
export async function resetPasswordEndpoint(req, res) {
  try {
    const { userId, newPassword, confirmPassword } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
        errors: { userId: 'User ID must be provided' },
      });
    }

    // Validate input
    const validation = validatePasswordReset({
      newPassword,
      confirmPassword,
    });

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors,
      });
    }

    // Reset password
    const result = await resetPassword({
      userId,
      newPassword,
    });

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    logger.error(`Password reset error`, {
      userId: req.body.userId,
      error: error.message,
    });

    return res.status(400).json({
      success: false,
      message: 'Password reset failed',
      errors: { password: error.message },
    });
  }
}

/**
 * GET /api/v1/auth/me
 * Get current user information
 */
export async function getCurrentUser(req, res) {
  try {
    const userId = req.user.id;

    const user = await findUserById(userId, { includeRoles: true });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Remove password hash from response
    const { passwordHash, ...userSafeData } = user;

    return res.status(200).json({
      success: true,
      message: 'User information retrieved',
      data: {
        user: userSafeData,
      },
    });
  } catch (error) {
    logger.error(`Get current user error`, {
      userId: req.user?.id,
      error: error.message,
    });

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve user information',
      errors: { server: error.message },
    });
  }
}

export async function updateCurrentUser(req, res) {
  const validation = validateProfileUpdate(req.body);
  if (!validation.isValid) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: validation.errors });
  }

  if (validation.normalizedData.phone) {
    const existingUser = await findUserByPhone(validation.normalizedData.phone);
    if (existingUser && existingUser.id !== req.user.id) {
      return res.status(409).json({ success: false, message: 'Phone number is already registered' });
    }
  }

  const user = await updateUser(req.user.id, validation.normalizedData);
  const { passwordHash, ...userSafeData } = user;
  return res.status(200).json({ success: true, message: 'Profile updated successfully', data: { user: userSafeData } });
}

export default {
  register,
  verifyOtpEndpoint,
  resendOtpEndpoint,
  loginEndpoint,
  refreshTokenEndpoint,
  logoutEndpoint,
  logoutAllEndpoint,
  changePasswordEndpoint,
  resetPasswordEndpoint,
  getCurrentUser,
  updateCurrentUser,
};
