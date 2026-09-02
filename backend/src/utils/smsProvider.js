/**
 * SMS Provider Interface and Hubtel Implementation
 * Abstraction layer for SMS delivery in Ghana
 */

import axios from 'axios';
import logger from './logger.js';

/**
 * Base SMS Provider Interface
 */
export class SmsProvider {
  async send(phoneNumber, message) {
    throw new Error('send() method must be implemented by subclass');
  }

  async sendBatch(recipients) {
    throw new Error('sendBatch() method must be implemented by subclass');
  }
}

/**
 * Hubtel SMS Provider Implementation
 * Hubtel is a leading SMS provider in Ghana
 */
export class HubtelProvider extends SmsProvider {
  constructor(config) {
    super();
    this.config = config;
    this.baseUrl = 'https://api.hubtel.com/v1/sms/send';
  }

  /**
   * Send a single SMS
   * @param {string} phoneNumber - Recipient phone number (normalized format: 233XXXXXXXXX)
   * @param {string} message - SMS message content (max 160 chars for single SMS)
   * @returns {Promise<Object>} Send result { success, messageId, error }
   */
  async send(phoneNumber, message) {
    try {
      if (!phoneNumber || !message) {
        throw new Error('Phone number and message are required');
      }

      if (message.length > 160) {
        logger.warn(`SMS message exceeds 160 characters`, {
          phoneNumber,
          length: message.length,
        });
      }

      const payload = {
        To: phoneNumber, // Hubtel expects international format
        From: this.config.sms.from || 'FarmWise',
        Content: message,
        ClientReference: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };

      const response = await axios.post(this.baseUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${this.config.sms.clientId}:${this.config.sms.apiKey}`).toString('base64')}`,
        },
        timeout: 10000,
      });

      // Log successful send (no sensitive data like API keys)
      logger.info(`SMS sent via Hubtel`, {
        phoneNumber,
        messageId: response.data.data?.MessageId,
        status: response.data.status,
      });

      return {
        success: response.data.status === 0 || response.data.status === '0',
        messageId: response.data.data?.MessageId,
        response: response.data,
      };
    } catch (error) {
      logger.error(`SMS send failed via Hubtel`, {
        phoneNumber,
        error: error.message,
        status: error.response?.status,
      });

      throw new Error(`Failed to send SMS: ${error.message}`);
    }
  }

  /**
   * Send batch SMS messages
   * @param {Array<Object>} recipients - Array of { phoneNumber, message }
   * @returns {Promise<Array<Object>>} Array of send results
   */
  async sendBatch(recipients) {
    const results = [];

    for (const recipient of recipients) {
      try {
        const result = await this.send(
          recipient.phoneNumber,
          recipient.message
        );
        results.push({
          success: true,
          phoneNumber: recipient.phoneNumber,
          ...result,
        });
      } catch (error) {
        results.push({
          success: false,
          phoneNumber: recipient.phoneNumber,
          error: error.message,
        });
      }
    }

    return results;
  }

  /**
   * Check SMS balance/credits
   * @returns {Promise<Object>} Account balance information
   */
  async checkBalance() {
    try {
      const response = await axios.get(`${this.baseUrl}/balance`, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.config.sms.clientId}:${this.config.sms.apiKey}`).toString('base64')}`,
        },
        timeout: 10000,
      });

      return {
        balance: response.data.data?.Balance,
        currency: response.data.data?.Currency || 'GHS',
      };
    } catch (error) {
      logger.error(`Failed to check SMS balance`, {
        error: error.message,
      });

      throw new Error(`Failed to check SMS balance: ${error.message}`);
    }
  }
}

/**
 * Mock SMS Provider for testing
 * Logs SMS messages instead of sending them
 */
export class MockSmsProvider extends SmsProvider {
  constructor(config) {
    super();
    this.config = config;
    this.sentMessages = []; // Store for testing
  }

  async send(phoneNumber, message) {
    this.sentMessages.push({ phoneNumber, message, timestamp: new Date() });

    logger.info(`[MOCK SMS] Sent to ${phoneNumber}`, {
      message: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
    });

    return {
      success: true,
      messageId: `mock-${Date.now()}`,
      response: { status: 0 },
    };
  }

  async sendBatch(recipients) {
    return Promise.all(
      recipients.map((r) => this.send(r.phoneNumber, r.message))
    );
  }

  getSentMessages() {
    return this.sentMessages;
  }

  clearSentMessages() {
    this.sentMessages = [];
  }
}

/**
 * Factory function to create SMS provider instance
 * @param {Object} config - Configuration object
 * @returns {SmsProvider} Configured SMS provider instance
 */
export function createSmsProvider(config) {
  if (config.env === 'test') {
    return new MockSmsProvider(config);
  }

  if (config.sms?.apiKey && config.sms?.clientId) {
    return new HubtelProvider(config);
  }

  logger.warn('SMS provider not configured, using mock provider');
  return new MockSmsProvider(config);
}

export default {
  SmsProvider,
  HubtelProvider,
  MockSmsProvider,
  createSmsProvider,
};
