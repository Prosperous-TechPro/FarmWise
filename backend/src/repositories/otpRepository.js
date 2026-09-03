/**
 * OTP Verification Repository
 * Database access layer for OTP operations
 */

import prisma from '../lib/prisma.js';
/**
 * Create OTP verification record
 * @param {Object} otpData - OTP data
 * @param {string} otpData.userId - User ID
 * @param {string} otpData.purpose - OTP purpose (enum)
 * @param {string} otpData.channel - Delivery channel (EMAIL or SMS)
 * @param {string} otpData.codeHash - Hashed OTP code
 * @param {number} otpData.maxAttempts - Maximum attempts allowed
 * @param {Date} otpData.expiresAt - Expiration time
 * @returns {Promise<Object>} Created OTP verification record
 */
export async function createOtpVerification(otpData) {
  return prisma.otpVerification.create({
    data: {
      userId: otpData.userId || null,
      pendingRegistrationId: otpData.pendingRegistrationId || null,
      purpose: otpData.purpose,
      channel: otpData.channel,
      codeHash: otpData.codeHash,
      maxAttempts: otpData.maxAttempts || 5,
      attempts: 0,
      isUsed: false,
      expiresAt: otpData.expiresAt,
    },
  });
}

/**
 * Find OTP verification by ID
 * @param {string} otpId - OTP verification ID
 * @returns {Promise<Object|null>} OTP verification record or null
 */
export async function findOtpById(otpId) {
  return prisma.otpVerification.findUnique({
    where: { id: otpId },
    include: {
      user: { select: { id: true, email: true, phone: true } },
      pendingRegistration: { select: { id: true, email: true, phone: true } },
    },
  });
}

/**
 * Find latest pending OTP for user
 * @param {string} userId - User ID
 * @param {string} purpose - OTP purpose
 * @returns {Promise<Object|null>} Latest OTP verification record or null
 */
export async function findLatestOtpByUserAndPurpose(userId, purpose) {
  return prisma.otpVerification.findFirst({
    where: {
      userId,
      purpose,
      isUsed: false,
      expiresAt: {
        gt: new Date(), // Not expired
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Find OTP by user, purpose, and channel
 * @param {string} userId - User ID
 * @param {string} purpose - OTP purpose
 * @param {string} channel - Delivery channel
 * @returns {Promise<Object|null>} OTP verification record or null
 */
export async function findOtpByUserPurposeChannel(userId, purpose, channel) {
  return prisma.otpVerification.findFirst({
    where: {
      userId,
      purpose,
      channel,
      isUsed: false,
      expiresAt: {
        gt: new Date(),
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function findOtpByPendingRegistrationPurposeChannel(
  pendingRegistrationId,
  purpose,
  channel
) {
  return prisma.otpVerification.findFirst({
    where: {
      pendingRegistrationId,
      purpose,
      channel,
      isUsed: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Increment OTP attempt counter
 * @param {string} otpId - OTP verification ID
 * @returns {Promise<Object>} Updated OTP record
 */
export async function incrementOtpAttempts(otpId) {
  return prisma.otpVerification.update({
    where: { id: otpId },
    data: {
      attempts: {
        increment: 1,
      },
    },
  });
}

/**
 * Mark OTP as verified/used
 * @param {string} otpId - OTP verification ID
 * @returns {Promise<Object>} Updated OTP record
 */
export async function markOtpAsUsed(otpId) {
  return prisma.otpVerification.update({
    where: { id: otpId },
    data: {
      isUsed: true,
      verifiedAt: new Date(),
    },
  });
}

/**
 * Get unexpired OTPs for user
 * @param {string} userId - User ID
 * @param {string} purpose - Optional purpose filter
 * @returns {Promise<Array>} Array of OTP records
 */
export async function getUnexpiredOtpsForUser(userId, purpose = null) {
  return prisma.otpVerification.findMany({
    where: {
      userId,
      isUsed: false,
      expiresAt: {
        gt: new Date(),
      },
      ...(purpose && { purpose }),
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getUnexpiredOtpsForPendingRegistration(
  pendingRegistrationId,
  purpose = null
) {
  return prisma.otpVerification.findMany({
    where: {
      pendingRegistrationId,
      isUsed: false,
      expiresAt: { gt: new Date() },
      ...(purpose && { purpose }),
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getRecentOtpsForPendingRegistration(pendingRegistrationId, purpose, since) {
  return prisma.otpVerification.findMany({
    where: {
      pendingRegistrationId,
      purpose,
      createdAt: { gte: since },
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Check if user has active OTP for purpose
 * @param {string} userId - User ID
 * @param {string} purpose - OTP purpose
 * @returns {Promise<boolean>} True if active OTP exists
 */
export async function hasActiveOtp(userId, purpose) {
  const otp = await prisma.otpVerification.findFirst({
    where: {
      userId,
      purpose,
      isUsed: false,
      expiresAt: {
        gt: new Date(),
      },
    },
    select: { id: true },
  });

  return !!otp;
}

export async function hasActivePendingRegistrationOtp(pendingRegistrationId, purpose) {
  const otp = await prisma.otpVerification.findFirst({
    where: {
      pendingRegistrationId,
      purpose,
      isUsed: false,
      expiresAt: { gt: new Date() },
    },
    select: { id: true },
  });

  return !!otp;
}

/**
 * Clean up expired OTPs
 * @param {number} olderThanDays - Delete OTPs older than N days
 * @returns {Promise<Object>} Deletion result { count: number }
 */
export async function cleanupExpiredOtps(olderThanDays = 7) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

  return prisma.otpVerification.deleteMany({
    where: {
      isUsed: true,
      createdAt: {
        lt: cutoffDate,
      },
    },
  });
}

/**
 * Get OTP usage stats for user
 * @param {string} userId - User ID
 * @param {string} purpose - OTP purpose
 * @returns {Promise<Object>} Stats { total, used, pending }
 */
export async function getOtpUsageStats(userId, purpose) {
  const [total, used, pending] = await Promise.all([
    prisma.otpVerification.count({
      where: { userId, purpose },
    }),
    prisma.otpVerification.count({
      where: { userId, purpose, isUsed: true },
    }),
    prisma.otpVerification.count({
      where: {
        userId,
        purpose,
        isUsed: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    }),
  ]);

  return { total, used, pending };
}

export default {
  createOtpVerification,
  findOtpById,
  findLatestOtpByUserAndPurpose,
  findOtpByUserPurposeChannel,
  findOtpByPendingRegistrationPurposeChannel,
  incrementOtpAttempts,
  markOtpAsUsed,
  getUnexpiredOtpsForUser,
  getUnexpiredOtpsForPendingRegistration,
  hasActiveOtp,
  hasActivePendingRegistrationOtp,
  cleanupExpiredOtps,
  getOtpUsageStats,
};
