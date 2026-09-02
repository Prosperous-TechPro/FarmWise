/**
 * Auth Session Repository
 * Database access layer for authentication session operations
 */

import prisma from '../lib/prisma.js';
/**
 * Create authentication session
 * @param {Object} sessionData - Session data
 * @param {string} sessionData.userId - User ID
 * @param {string} sessionData.refreshTokenHash - Hashed refresh token
 * @param {string} sessionData.ipAddress - Client IP address
 * @param {string} sessionData.userAgent - Client user agent
 * @param {string} sessionData.deviceIdentifier - Device identifier
 * @param {Date} sessionData.expiresAt - Session expiration time
 * @returns {Promise<Object>} Created session record
 */
export async function createAuthSession(sessionData) {
  return prisma.authSession.create({
    data: {
      userId: sessionData.userId,
      refreshTokenHash: sessionData.refreshTokenHash,
      ipAddress: sessionData.ipAddress,
      userAgent: sessionData.userAgent,
      deviceIdentifier: sessionData.deviceIdentifier,
      isRevoked: false,
      expiresAt: sessionData.expiresAt,
      lastUsedAt: new Date(),
    },
  });
}

/**
 * Find session by ID
 * @param {string} sessionId - Session ID
 * @returns {Promise<Object|null>} Session record or null
 */
export async function findSessionById(sessionId) {
  return prisma.authSession.findUnique({
    where: { id: sessionId },
    include: { user: { select: { id: true, email: true, status: true } } },
  });
}

/**
 * Find active session by user and refresh token hash
 * @param {string} userId - User ID
 * @param {string} refreshTokenHash - Hashed refresh token
 * @returns {Promise<Object|null>} Session record or null
 */
export async function findActiveSessionByUserAndToken(userId, refreshTokenHash) {
  return prisma.authSession.findFirst({
    where: {
      userId,
      refreshTokenHash,
      isRevoked: false,
      expiresAt: {
        gt: new Date(), // Not expired
      },
    },
  });
}

/**
 * Get all active sessions for user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of active session records
 */
export async function getActiveSessionsForUser(userId) {
  return prisma.authSession.findMany({
    where: {
      userId,
      isRevoked: false,
      expiresAt: {
        gt: new Date(),
      },
    },
    orderBy: { lastUsedAt: 'desc' },
  });
}

/**
 * Update session last used time
 * @param {string} sessionId - Session ID
 * @returns {Promise<Object>} Updated session record
 */
export async function updateSessionLastUsed(sessionId) {
  return prisma.authSession.update({
    where: { id: sessionId },
    data: {
      lastUsedAt: new Date(),
    },
  });
}

/**
 * Revoke session
 * @param {string} sessionId - Session ID
 * @param {string} reason - Revocation reason (optional)
 * @returns {Promise<Object>} Updated session record
 */
export async function revokeSession(sessionId, reason = null) {
  return prisma.authSession.update({
    where: { id: sessionId },
    data: {
      isRevoked: true,
      revokedAt: new Date(),
      revokedReason: reason,
    },
  });
}

/**
 * Revoke all user sessions
 * @param {string} userId - User ID
 * @param {string} reason - Revocation reason (e.g., "LOGOUT_ALL", "PASSWORD_CHANGED")
 * @returns {Promise<Object>} Update result { count: number }
 */
export async function revokeAllUserSessions(userId, reason = null) {
  return prisma.authSession.updateMany({
    where: {
      userId,
      isRevoked: false,
    },
    data: {
      isRevoked: true,
      revokedAt: new Date(),
      revokedReason: reason,
    },
  });
}

/**
 * Revoke all sessions except current
 * @param {string} userId - User ID
 * @param {string} currentSessionId - Current session ID (to exclude from revocation)
 * @param {string} reason - Revocation reason
 * @returns {Promise<Object>} Update result { count: number }
 */
export async function revokeAllOtherSessions(userId, currentSessionId, reason = null) {
  return prisma.authSession.updateMany({
    where: {
      userId,
      id: {
        not: currentSessionId,
      },
      isRevoked: false,
    },
    data: {
      isRevoked: true,
      revokedAt: new Date(),
      revokedReason: reason,
    },
  });
}

/**
 * Check if session is valid (active and not expired/revoked)
 * @param {string} sessionId - Session ID
 * @returns {Promise<boolean>} True if session is valid
 */
export async function isSessionValid(sessionId) {
  const session = await prisma.authSession.findUnique({
    where: { id: sessionId },
    select: { isRevoked: true, expiresAt: true },
  });

  if (!session) return false;

  return !session.isRevoked && session.expiresAt > new Date();
}

/**
 * Find sessions by device identifier
 * @param {string} userId - User ID
 * @param {string} deviceIdentifier - Device identifier
 * @returns {Promise<Array>} Array of session records
 */
export async function findSessionsByDevice(userId, deviceIdentifier) {
  return prisma.authSession.findMany({
    where: {
      userId,
      deviceIdentifier,
      isRevoked: false,
      expiresAt: {
        gt: new Date(),
      },
    },
  });
}

/**
 * Clean up expired sessions
 * @param {number} olderThanDays - Delete sessions older than N days
 * @returns {Promise<Object>} Deletion result { count: number }
 */
export async function cleanupExpiredSessions(olderThanDays = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

  return prisma.authSession.deleteMany({
    where: {
      expiresAt: {
        lt: cutoffDate,
      },
      isRevoked: true, // Only delete revoked sessions
    },
  });
}

/**
 * Get session statistics for user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Stats { active, revoked, total }
 */
export async function getSessionStats(userId) {
  const [active, total] = await Promise.all([
    prisma.authSession.count({
      where: {
        userId,
        isRevoked: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    }),
    prisma.authSession.count({
      where: { userId },
    }),
  ]);

  return {
    active,
    revoked: total - active,
    total,
  };
}

export default {
  createAuthSession,
  findSessionById,
  findActiveSessionByUserAndToken,
  getActiveSessionsForUser,
  updateSessionLastUsed,
  revokeSession,
  revokeAllUserSessions,
  revokeAllOtherSessions,
  isSessionValid,
  findSessionsByDevice,
  cleanupExpiredSessions,
  getSessionStats,
};
