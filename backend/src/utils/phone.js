/**
 * Phone Number Normalization Utilities
 * Normalize phone numbers for Ghana and prepare for international formats
 */

/**
 * Normalize a Ghanaian phone number
 * Supports formats:
 * - 0551234567 (local format)
 * - 0551234567 (with leading 0)
 * - +233551234567 (international)
 * - 233551234567 (international without +)
 * 
 * @param {string} phoneNumber - Raw phone number
 * @returns {Object} { isValid: boolean, normalizedNumber: string, error?: string }
 */
export function normalizePhoneNumber(phoneNumber) {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return {
      isValid: false,
      normalizedNumber: null,
      error: 'Phone number must be a non-empty string',
    };
  }

  // Remove all non-digit and non-+ characters
  const cleaned = phoneNumber.replace(/[^\d+]/g, '');

  // Handle different formats
  let normalized;

  if (cleaned.startsWith('+233')) {
    // International format: +233551234567
    normalized = cleaned.substring(1); // Remove +, becomes 233551234567
  } else if (cleaned.startsWith('233')) {
    // International without +: 233551234567
    normalized = cleaned;
  } else if (cleaned.startsWith('0')) {
    // Local format: 0551234567 -> 233551234567
    normalized = '233' + cleaned.substring(1);
  } else if (/^\d{9}$/.test(cleaned)) {
    // 9 digits without prefix: 551234567 -> 233551234567
    normalized = '233' + cleaned;
  } else {
    return {
      isValid: false,
      normalizedNumber: null,
      error: 'Invalid phone number format. Expected Ghanaian number.',
    };
  }

  // Validate Ghanaian format: 233XXXXXXXXX (12 digits total, starts with 233)
  if (!/^233\d{9}$/.test(normalized)) {
    return {
      isValid: false,
      normalizedNumber: null,
      error: 'Invalid Ghanaian phone number format',
    };
  }

  return {
    isValid: true,
    normalizedNumber: normalized,
  };
}

/**
 * Format normalized phone number for display
 * @param {string} normalizedNumber - Normalized number (233XXXXXXXXX)
 * @returns {string} Formatted number (+233 551 234 567)
 */
export function formatPhoneNumberForDisplay(normalizedNumber) {
  if (!/^233\d{9}$/.test(normalizedNumber)) {
    return normalizedNumber; // Return as-is if not normalized format
  }

  // Format as: +233 551 234 567
  return `+${normalizedNumber.substring(0, 3)} ${normalizedNumber.substring(3, 6)} ${normalizedNumber.substring(6, 9)} ${normalizedNumber.substring(9)}`;
}

/**
 * Convert normalized number to local display format
 * @param {string} normalizedNumber - Normalized number (233XXXXXXXXX)
 * @returns {string} Local format (0551234567)
 */
export function convertToLocalFormat(normalizedNumber) {
  if (!/^233\d{9}$/.test(normalizedNumber)) {
    return normalizedNumber;
  }

  return '0' + normalizedNumber.substring(3);
}

export default {
  normalizePhoneNumber,
  formatPhoneNumberForDisplay,
  convertToLocalFormat,
};
