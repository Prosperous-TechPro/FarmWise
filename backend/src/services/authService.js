/**
 * Authentication Service
 * Handles user registration, login, logout, and token management
 */

import { hashPassword, comparePassword, generateToken, hashValue } from '../utils/crypto.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt.js';
import {
  findUserByEmail,
  findUserByPhone,
  findUserById,
  updateUser,
  updatePasswordHash,
  emailExists,
  phoneExists,
} from '../repositories/userRepository.js';
import {
  createAuthSession,
  findActiveSessionByUserAndToken,
  revokeSession,
  revokeAllUserSessions,
  updateSessionLastUsed,
  isSessionValid,
} from '../repositories/authSessionRepository.js';
import logger from '../utils/logger.js';
import prisma from '../lib/prisma.js';
import {
  createPendingRegistration as createPendingRegistrationRecord,
  findPendingRegistrationById,
  findPendingRegistrationByEmail,
  findPendingRegistrationByPhone,
} from '../repositories/pendingRegistrationRepository.js';

/**
 * Register a new user
 * @param {Object} options - Registration options
 * @param {string} options.email - Email address
 * @param {string} options.phone - Phone number
 * @param {string} options.firstName - First name
 * @param {string} options.lastName - Last name
 * @param {string} options.password - Password (will be hashed)
 * @param {string} options.verificationMethod - 'EMAIL' or 'SMS'
 * @returns {Promise<Object>} { success: boolean, userId: string, verificationMethod: string }
 */
export async function registerUser(options) {
  return createPendingRegistration(options);
}

export async function createPendingRegistration(options) {
  const { email, phone, firstName, lastName, password, verificationMethod } = options;

  try {
    if (await emailExists(email) || await findPendingRegistrationByEmail(email)) {
      throw new Error('Email address is already registered');
    }

    if (await phoneExists(phone) || await findPendingRegistrationByPhone(phone)) {
      throw new Error('Phone number is already registered');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    const pendingRegistration = await createPendingRegistrationRecord({
      email,
      phone,
      firstName,
      lastName,
      passwordHash,
      verificationMethod,
    });

    logger.info(`Pending registration created`, {
      pendingRegistrationId: pendingRegistration.id,
      email: pendingRegistration.email,
      verificationMethod,
    });

    return {
      success: true,
      pendingRegistrationId: pendingRegistration.id,
      email: pendingRegistration.email,
      verificationMethod,
    };
  } catch (error) {
    logger.error(`User registration failed`, {
      email,
      phone,
      error: error.message,
    });

    throw error;
  }
}

export async function completePendingRegistration(pendingRegistrationId) {
  const pendingRegistration = await findPendingRegistrationById(pendingRegistrationId);

  if (!pendingRegistration) {
    throw new Error('Pending registration not found');
  }

  return prisma.$transaction(async (transaction) => {
    const user = await transaction.user.create({
      data: {
        email: pendingRegistration.email,
        phone: pendingRegistration.phone,
        firstName: pendingRegistration.firstName,
        lastName: pendingRegistration.lastName,
        passwordHash: pendingRegistration.passwordHash,
        emailVerified: pendingRegistration.verificationMethod === 'EMAIL',
        emailVerifiedAt: pendingRegistration.verificationMethod === 'EMAIL' ? new Date() : null,
        phoneVerified: pendingRegistration.verificationMethod === 'SMS',
        phoneVerifiedAt: pendingRegistration.verificationMethod === 'SMS' ? new Date() : null,
        status: 'ACTIVE',
      },
    });

    const ownerRole = await transaction.role.upsert({
      where: { name: 'FARM_OWNER' },
      update: {},
      create: { name: 'FARM_OWNER', description: 'Farm owner access' },
    });

    await transaction.userRole.create({
      data: { userId: user.id, roleId: ownerRole.id },
    });

    await transaction.pendingRegistration.delete({
      where: { id: pendingRegistrationId },
    });

    return user;
  });
}

/**
 * Verify email and activate account
 * @param {string} userId - User ID
 * @returns {Promise<Object>} { success: boolean, message: string }
 */
export async function verifyEmail(userId) {
  try {
    const user = await findUserById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    if (user.emailVerified) {
      throw new Error('Email is already verified');
    }

    // Update user
    await updateUser(userId, {
      emailVerified: true,
      status: 'ACTIVE',
    });

    logger.info(`Email verified for user`, { userId });

    return {
      success: true,
      message: 'Email verified successfully',
    };
  } catch (error) {
    logger.error(`Email verification failed`, {
      userId,
      error: error.message,
    });

    throw error;
  }
}

/**
 * Verify phone and update verification status
 * @param {string} userId - User ID
 * @returns {Promise<Object>} { success: boolean, message: string }
 */
export async function verifyPhone(userId) {
  try {
    const user = await findUserById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    await updateUser(userId, {
      phoneVerified: true,
    });

    logger.info(`Phone verified for user`, { userId });

    return {
      success: true,
      message: 'Phone verified successfully',
    };
  } catch (error) {
    logger.error(`Phone verification failed`, {
      userId,
      error: error.message,
    });

    throw error;
  }
}

/**
 * Login user and create authentication session
 * @param {Object} options - Login options
 * @param {string} options.email - User email (or null if using phone)
 * @param {string} options.phone - User phone (or null if using email)
 * @param {string} options.password - Password
 * @param {string} options.ipAddress - Client IP address
 * @param {string} options.userAgent - Client user agent
 * @param {string} options.deviceIdentifier - Device identifier
 * @param {Object} options.jwtConfig - JWT configuration
 * @returns {Promise<Object>} { success: boolean, accessToken, refreshToken, user }
 */
export async function login(options) {
  const {
    email,
    phone,
    password,
    ipAddress,
    userAgent,
    deviceIdentifier,
    jwtConfig,
  } = options;

  try {
    // Find user by email or phone
    let user;
    if (email) {
      user = await findUserByEmail(email);
    } else if (phone) {
      user = await findUserByPhone(phone);
    } else {
      throw new Error('Email or phone is required for login');
    }

    if (!user) {
      // Generic error message to prevent user enumeration
      throw new Error('Invalid credentials');
    }

    if (user.status !== 'ACTIVE' || (!user.emailVerified && !user.phoneVerified)) {
      throw new Error('Your account must be active and verified before logging in');
    }

    // Check if account is suspended
    if (user.status === 'SUSPENDED') {
      throw new Error('Your account has been suspended. Please contact support.');
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate tokens
    const accessTokenPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles ? user.roles.map((ur) => ur.role.name) : [],
    };

    const accessToken = generateAccessToken(
      accessTokenPayload,
      jwtConfig.secret,
      jwtConfig.accessTokenExpiresIn
    );

    const refreshTokenPlain = generateToken(32);
    const refreshTokenHash = hashValue(refreshTokenPlain);

    const refreshToken = generateRefreshToken(
      { sub: user.id, sessionToken: refreshTokenPlain },
      jwtConfig.refreshSecret,
      jwtConfig.refreshTokenExpiresIn
    );

    // Create session
    const expiresAt = new Date();
    const refreshExpiryMs = parseInt(jwtConfig.refreshTokenExpiresIn) * 1000 || 7 * 24 * 60 * 60 * 1000; // Default 7 days
    expiresAt.setTime(expiresAt.getTime() + refreshExpiryMs);

    const session = await createAuthSession({
      userId: user.id,
      refreshTokenHash,
      ipAddress,
      userAgent,
      deviceIdentifier,
      expiresAt,
    });

    logger.info(`User logged in`, {
      userId: user.id,
      sessionId: session.id,
      ipAddress,
    });

    // Return user data without password hash
    const { passwordHash, ...userSafeData } = user;

    return {
      success: true,
      accessToken,
      refreshToken,
      user: userSafeData,
      sessionId: session.id,
    };
  } catch (error) {
    logger.error(`Login failed`, {
      email,
      phone,
      error: error.message,
    });

    throw error;
  }
}

/**
 * Refresh access token
 * @param {Object} options - Refresh options
 * @param {string} options.refreshToken - Refresh token
 * @param {Object} options.jwtConfig - JWT configuration
 * @returns {Promise<Object>} { success: boolean, accessToken }
 */
export async function refreshAccessToken(options) {
  const { refreshToken, jwtConfig } = options;

  try {
    if (!refreshToken) {
      throw new Error('Refresh token is required');
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken, jwtConfig.refreshSecret);

    // Find user
    const user = await findUserById(decoded.sub);

    if (!user || user.status !== 'ACTIVE') {
      throw new Error('Invalid user or account inactive');
    }

    // Find and validate session
    const refreshTokenHash = hashValue(decoded.sessionToken);
    const session = await findActiveSessionByUserAndToken(user.id, refreshTokenHash);

    if (!session) {
      throw new Error('Invalid or expired session');
    }

    // Update session last used time
    await updateSessionLastUsed(session.id);

    // Generate new access token
    const accessTokenPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles ? user.roles.map((ur) => ur.role.name) : [],
    };

    const newAccessToken = generateAccessToken(
      accessTokenPayload,
      jwtConfig.secret,
      jwtConfig.accessTokenExpiresIn
    );

    logger.info(`Access token refreshed`, {
      userId: user.id,
      sessionId: session.id,
    });

    return {
      success: true,
      accessToken: newAccessToken,
    };
  } catch (error) {
    logger.error(`Token refresh failed`, {
      error: error.message,
    });

    throw error;
  }
}

/**
 * Logout user and revoke session
 * @param {Object} options - Logout options
 * @param {string} options.userId - User ID
 * @param {string} options.sessionId - Session ID
 * @returns {Promise<Object>} { success: boolean, message: string }
 */
export async function logout(options) {
  const { userId, sessionId } = options;

  try {
    if (!userId || !sessionId) {
      throw new Error('User ID and session ID are required');
    }

    // Verify session belongs to user
    const session = await findActiveSessionByUserAndToken(userId, '');
    if (session && session.id !== sessionId) {
      throw new Error('Session mismatch');
    }

    // Revoke session
    await revokeSession(sessionId, 'LOGOUT');

    logger.info(`User logged out`, {
      userId,
      sessionId,
    });

    return {
      success: true,
      message: 'Logged out successfully',
    };
  } catch (error) {
    logger.error(`Logout failed`, {
      userId,
      sessionId,
      error: error.message,
    });

    throw error;
  }
}

/**
 * Logout all sessions for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} { success: boolean, sessionsRevoked: number }
 */
export async function logoutAll(userId) {
  try {
    const result = await revokeAllUserSessions(userId, 'LOGOUT_ALL');

    logger.info(`User logged out from all sessions`, {
      userId,
      sessionsRevoked: result.count,
    });

    return {
      success: true,
      sessionsRevoked: result.count,
    };
  } catch (error) {
    logger.error(`Logout all failed`, {
      userId,
      error: error.message,
    });

    throw error;
  }
}

/**
 * Update password
 * @param {Object} options - Options
 * @param {string} options.userId - User ID
 * @param {string} options.currentPassword - Current password for verification
 * @param {string} options.newPassword - New password
 * @returns {Promise<Object>} { success: boolean, message: string }
 */
export async function changePassword(options) {
  const { userId, currentPassword, newPassword } = options;

  try {
    const user = await findUserById(userId, { includeRoles: false });

    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isPasswordValid = await comparePassword(currentPassword, user.passwordHash);

    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password and revoke all sessions
    await updatePasswordHash(userId, newPasswordHash);
    await revokeAllUserSessions(userId, 'PASSWORD_CHANGED');

    logger.info(`Password changed for user`, {
      userId,
    });

    return {
      success: true,
      message: 'Password changed successfully. Please log in again.',
    };
  } catch (error) {
    logger.error(`Password change failed`, {
      userId,
      error: error.message,
    });

    throw error;
  }
}

/**
 * Reset password (without current password verification)
 * Used after OTP verification
 * @param {Object} options - Options
 * @param {string} options.userId - User ID
 * @param {string} options.newPassword - New password
 * @returns {Promise<Object>} { success: boolean, message: string }
 */
export async function resetPassword(options) {
  const { userId, newPassword } = options;

  try {
    const user = await findUserById(userId, { includeRoles: false });

    if (!user) {
      throw new Error('User not found');
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password and revoke all sessions
    await updatePasswordHash(userId, newPasswordHash);
    await revokeAllUserSessions(userId, 'PASSWORD_RESET');

    logger.info(`Password reset for user`, {
      userId,
    });

    return {
      success: true,
      message: 'Password reset successfully. Please log in with your new password.',
    };
  } catch (error) {
    logger.error(`Password reset failed`, {
      userId,
      error: error.message,
    });

    throw error;
  }
}

export default {
  registerUser,
  createPendingRegistration,
  completePendingRegistration,
  verifyEmail,
  verifyPhone,
  login,
  refreshAccessToken,
  logout,
  logoutAll,
  changePassword,
  resetPassword,
};
