/**
 * OTP Service
 * Handles OTP generation, delivery, and verification
 */

import {
  createOtpVerification,
  findLatestOtpByUserAndPurpose,
  findOtpByUserPurposeChannel,
  findOtpByPendingRegistrationPurposeChannel,
  findOtpById,
  incrementOtpAttempts,
  markOtpAsUsed,
  getUnexpiredOtpsForUser,
  getUnexpiredOtpsForPendingRegistration,
  getRecentOtpsForPendingRegistration,
  hasActiveOtp,
  hasActivePendingRegistrationOtp,
} from '../repositories/otpRepository.js';
import { hashValue, generateOtp } from '../utils/crypto.js';
import logger from '../utils/logger.js';

/**
 * Generate and send OTP
 * @param {Object} options - Options
 * @param {string} options.userId - User ID
 * @param {string} options.pendingRegistrationId - Pending registration ID
 * @param {string} options.purpose - OTP purpose (enum)
 * @param {string} options.channel - Delivery channel (EMAIL or SMS)
 * @param {string} options.destination - Email or phone number
 * @param {Object} options.emailProvider - Email provider instance
 * @param {Object} options.smsProvider - SMS provider instance
 * @param {number} options.expiryMinutes - OTP expiry in minutes (default 10)
 * @param {number} options.length - OTP length (default 6)
 * @returns {Promise<Object>} { success: boolean, otpId: string, expiresIn: number }
 */
export async function generateAndSendOtp(options) {
  const {
    userId,
    pendingRegistrationId,
    purpose,
    channel,
    destination,
    emailProvider,
    smsProvider,
    expiryMinutes = 10,
    length = 6,
  } = options;

  try {
    // Validate required parameters
    if ((!userId && !pendingRegistrationId) || (userId && pendingRegistrationId) || !purpose || !channel || !destination) {
      throw new Error('Missing required parameters for OTP generation');
    }

    // Check if user already has active OTP (prevent spam)
    const hasActive = pendingRegistrationId
      ? await hasActivePendingRegistrationOtp(pendingRegistrationId, purpose)
      : await hasActiveOtp(userId, purpose);
    if (hasActive) {
      throw new Error('An OTP has already been sent. Please wait before requesting another.');
    }

    // Generate OTP code
    const otpCode = generateOtp(length);
    const otpHash = hashValue(otpCode);

    // Calculate expiration time
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + expiryMinutes);

    // Create OTP verification record
    const otpRecord = await createOtpVerification({
      userId,
      pendingRegistrationId,
      purpose,
      channel,
      codeHash: otpHash,
      expiresAt,
    });

    // Send OTP via appropriate channel
    let sendResult;
    if (channel === 'EMAIL') {
      if (!emailProvider) {
        throw new Error('Email provider not configured');
      }

      const emailSubject = getOtpEmailSubject(purpose);
      const { html, text } = getOtpEmailBody(otpCode, purpose, expiryMinutes);

      sendResult = await emailProvider.send(destination, emailSubject, html, text);
    } else if (channel === 'SMS') {
      if (!smsProvider) {
        throw new Error('SMS provider not configured');
      }

      const smsMessage = getOtpSmsMessage(otpCode, purpose, expiryMinutes);
      sendResult = await smsProvider.send(destination, smsMessage);
    } else {
      throw new Error(`Invalid delivery channel: ${channel}`);
    }

    if (!sendResult.success) {
      await markOtpAsUsed(otpRecord.id);
      logger.error(`OTP delivery failed`, {
        userId,
        pendingRegistrationId,
        purpose,
        channel,
        destination,
      });

      throw new Error(`Failed to send OTP via ${channel}`);
    }

    logger.info(`OTP generated and sent`, {
      userId,
      pendingRegistrationId,
      purpose,
      channel,
      otpId: otpRecord.id,
    });

    return {
      success: true,
      otpId: otpRecord.id,
      expiresIn: expiryMinutes * 60, // Return in seconds
    };
  } catch (error) {
    logger.error(`OTP generation failed`, {
      userId,
      purpose,
      channel,
      error: error.message,
    });

    throw error;
  }
}

/**
 * Verify OTP code
 * @param {Object} options - Options
 * @param {string} options.userId - User ID
 * @param {string} options.purpose - OTP purpose
 * @param {string} options.channel - Delivery channel
 * @param {string} options.code - OTP code to verify
 * @returns {Promise<Object>} { success: boolean, message: string }
 */
export async function verifyOtp(options) {
  const { userId, pendingRegistrationId, purpose, channel, code } = options;

  try {
    if ((!userId && !pendingRegistrationId) || (userId && pendingRegistrationId) || !purpose || !channel || !code) {
      throw new Error('Missing required parameters for OTP verification');
    }

    // Find the latest OTP
    const otpRecord = pendingRegistrationId
      ? await findOtpByPendingRegistrationPurposeChannel(pendingRegistrationId, purpose, channel)
      : await findOtpByUserPurposeChannel(userId, purpose, channel);

    if (!otpRecord) {
      throw new Error('No OTP found. Please request a new one.');
    }

    // Check if OTP is expired
    if (otpRecord.expiresAt < new Date()) {
      throw new Error('OTP has expired. Please request a new one.');
    }

    // Check if already used
    if (otpRecord.isUsed) {
      throw new Error('OTP has already been used.');
    }

    // Check max attempts
    if (otpRecord.attempts >= otpRecord.maxAttempts) {
      throw new Error(
        `Maximum OTP verification attempts exceeded. Please request a new OTP.`
      );
    }

    // Verify OTP code
    const codeHash = hashValue(code);

    if (codeHash !== otpRecord.codeHash) {
      // Increment attempts
      await incrementOtpAttempts(otpRecord.id);

      const remainingAttempts = otpRecord.maxAttempts - otpRecord.attempts - 1;
      throw new Error(
        `Invalid OTP. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.`
      );
    }

    // Mark OTP as used
    await markOtpAsUsed(otpRecord.id);

    logger.info(`OTP verified successfully`, {
      userId,
      pendingRegistrationId,
      purpose,
      channel,
      otpId: otpRecord.id,
    });

    return {
      success: true,
      message: 'OTP verified successfully',
    };
  } catch (error) {
    logger.error(`OTP verification failed`, {
      userId,
      purpose,
      channel,
      error: error.message,
    });

    throw error;
  }
}

/**
 * Resend OTP
 * @param {Object} options - Options
 * @param {string} options.userId - User ID
 * @param {string} options.purpose - OTP purpose
 * @param {string} options.channel - Delivery channel
 * @param {string} options.destination - Email or phone
 * @param {Object} options.emailProvider - Email provider
 * @param {Object} options.smsProvider - SMS provider
 * @returns {Promise<Object>} { success: boolean, otpId: string, expiresIn: number }
 */
export async function resendOtp(options) {
  const { userId, pendingRegistrationId, purpose, channel, destination, emailProvider, smsProvider } = options;

  try {
    if (pendingRegistrationId) {
      const cooldownSeconds = Number.parseInt(process.env.OTP_PENDING_RESEND_COOLDOWN_SECONDS || '60', 10);
      const windowSeconds = Number.parseInt(process.env.OTP_PENDING_RESEND_WINDOW_SECONDS || '3600', 10);
      const maxResends = Number.parseInt(process.env.OTP_PENDING_RESEND_MAX_ATTEMPTS || '5', 10);
      const now = Date.now();
      const windowStart = new Date(now - windowSeconds * 1000);
      const recentOtps = await getRecentOtpsForPendingRegistration(pendingRegistrationId, purpose, windowStart);
      const latestOtp = recentOtps[0];
      const cooldownRemaining = latestOtp
        ? Math.ceil((latestOtp.createdAt.getTime() + cooldownSeconds * 1000 - now) / 1000)
        : 0;
      if (cooldownRemaining > 0) {
        const error = new Error('Please wait before requesting another verification code.');
        error.statusCode = 429;
        error.retryAfter = cooldownRemaining;
        throw error;
      }
      if (recentOtps.length >= maxResends) {
        const retryAfter = Math.max(1, Math.ceil((recentOtps[recentOtps.length - 1].createdAt.getTime() + windowSeconds * 1000 - now) / 1000));
        const error = new Error('Too many verification code requests. Please try again later.');
        error.statusCode = 429;
        error.retryAfter = retryAfter;
        throw error;
      }

      const activeOtps = await getUnexpiredOtpsForPendingRegistration(pendingRegistrationId, purpose);
      await Promise.all(activeOtps.map((otp) => markOtpAsUsed(otp.id)));
    }

    const result = await generateAndSendOtp({
      userId,
      pendingRegistrationId,
      purpose,
      channel,
      destination,
      emailProvider,
      smsProvider,
    });
    return {
      ...result,
      cooldownSeconds: pendingRegistrationId
        ? Number.parseInt(process.env.OTP_PENDING_RESEND_COOLDOWN_SECONDS || '60', 10)
        : undefined,
    };
  } catch (error) {
    logger.error(`OTP resend failed`, {
      userId,
      purpose,
      channel,
      error: error.message,
    });

    throw error;
  }
}

/**
 * Get OTP email subject based on purpose
 * @param {string} purpose - OTP purpose
 * @returns {string} Email subject
 */
function getOtpEmailSubject(purpose) {
  const subjects = {
    ACCOUNT_VERIFICATION: 'Verify Your FarmWise Account',
    PASSWORD_RESET: 'Reset Your FarmWise Password',
    LOGIN_2FA: 'Two-Factor Authentication Code',
    CHANGE_EMAIL: 'Verify Your New Email Address',
    CHANGE_PHONE: 'Verify Your New Phone Number',
  };

  return subjects[purpose] || 'FarmWise Verification Code';
}

/**
 * Get OTP email body based on purpose
 * @param {string} otpCode - OTP code
 * @param {string} purpose - OTP purpose
 * @param {number} expiryMinutes - Expiry in minutes
 * @returns {Object} { html, text }
 */
function getOtpEmailBody(otpCode, purpose, expiryMinutes) {
  const messages = {
    ACCOUNT_VERIFICATION:
      'Complete your FarmWise account registration by entering this verification code:',
    PASSWORD_RESET: 'Use this code to reset your FarmWise password:',
    LOGIN_2FA: 'Enter this code to verify your login:',
    CHANGE_EMAIL: 'Verify your new email address with this code:',
    CHANGE_PHONE: 'Verify your new phone number with this code:',
  };

  const message = messages[purpose] || 'Enter this verification code:';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 500px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2d5016; color: white; padding: 20px; text-align: center; border-radius: 5px; }
          .content { padding: 20px; border: 1px solid #ddd; border-radius: 5px; margin-top: 20px; }
          .code { font-size: 32px; font-weight: bold; color: #2d5016; text-align: center; padding: 20px; background-color: #f5f5f5; border-radius: 5px; letter-spacing: 5px; }
          .footer { font-size: 12px; color: #999; margin-top: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>FarmWise</h1>
          </div>
          <div class="content">
            <p>${message}</p>
            <div class="code">${otpCode}</div>
            <p>This code expires in <strong>${expiryMinutes} minutes</strong>.</p>
            <p>If you didn't request this code, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 FarmWise. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `${message}\n\n${otpCode}\n\nThis code expires in ${expiryMinutes} minutes.\n\nIf you didn't request this code, please ignore this email.`;

  return { html, text };
}

/**
 * Get OTP SMS message
 * @param {string} otpCode - OTP code
 * @param {string} purpose - OTP purpose
 * @param {number} expiryMinutes - Expiry in minutes
 * @returns {string} SMS message
 */
function getOtpSmsMessage(otpCode, purpose, expiryMinutes) {
  const purposes = {
    ACCOUNT_VERIFICATION: 'account verification',
    PASSWORD_RESET: 'password reset',
    LOGIN_2FA: 'login verification',
    CHANGE_EMAIL: 'email change',
    CHANGE_PHONE: 'phone number change',
  };

  const purposeText = purposes[purpose] || 'verification';

  return `Your FarmWise ${purposeText} code is: ${otpCode}. Expires in ${expiryMinutes} minutes. Do not share this code.`;
}

export default {
  generateAndSendOtp,
  verifyOtp,
  resendOtp,
};
