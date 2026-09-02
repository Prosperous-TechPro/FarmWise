/**
 * Email Provider Interface and Nodemailer Implementation
 * Abstraction layer for email delivery
 */

import nodemailer from 'nodemailer';
import logger from './logger.js';

/**
 * Base Email Provider Interface
 */
export class EmailProvider {
  async send(to, subject, html, text) {
    throw new Error('send() method must be implemented by subclass');
  }

  async sendBatch(recipients) {
    throw new Error('sendBatch() method must be implemented by subclass');
  }
}

/**
 * Nodemailer-based Email Provider Implementation
 */
export class NodemailerProvider extends EmailProvider {
  constructor(config) {
    super();
    this.config = config;
    this.transporter = this.createTransport();
  }

  createTransport() {
    if (this.config.env === 'test') {
      // Use test account for testing
      return nodemailer.createTestAccount().then((testAccount) => {
        return nodemailer.createTransport({
          host: testAccount.smtp.host,
          port: testAccount.smtp.port,
          secure: testAccount.smtp.secure,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
      });
    }

    // Production/development configuration
    return nodemailer.createTransport({
      host: this.config.email.host,
      port: this.config.email.port,
      secure: this.config.email.port === 465, // TLS for 587, SSL for 465
      auth: {
        user: this.config.email.user,
        pass: this.config.email.password,
      },
    });
  }

  /**
   * Send a single email
   * @param {string} to - Recipient email address
   * @param {string} subject - Email subject
   * @param {string} html - HTML email body
   * @param {string} text - Plain text email body (optional)
   * @returns {Promise<Object>} Send result { messageId, response }
   */
  async send(to, subject, html, text = null) {
    try {
      const transporter = await this.transporter;

      const mailOptions = {
        from: this.config.email.from,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML tags if no text provided
      };

      const info = await transporter.sendMail(mailOptions);

      // Log successful send (no sensitive data)
      logger.info(`Email sent`, {
        messageId: info.messageId,
        to,
        subject,
      });

      return {
        success: true,
        messageId: info.messageId,
        response: info.response,
      };
    } catch (error) {
      logger.error(`Email send failed`, {
        to,
        subject,
        error: error.message,
      });

      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Send batch emails
   * @param {Array<Object>} recipients - Array of { to, subject, html, text }
   * @returns {Promise<Array<Object>>} Array of send results
   */
  async sendBatch(recipients) {
    const results = [];

    for (const recipient of recipients) {
      try {
        const result = await this.send(
          recipient.to,
          recipient.subject,
          recipient.html,
          recipient.text
        );
        results.push({ success: true, to: recipient.to, ...result });
      } catch (error) {
        results.push({
          success: false,
          to: recipient.to,
          error: error.message,
        });
      }
    }

    return results;
  }

  /**
   * Verify transporter connection (health check)
   * @returns {Promise<boolean>} True if connection is valid
   */
  async verify() {
    try {
      const transporter = await this.transporter;
      await transporter.verify();
      return true;
    } catch (error) {
      logger.error(`Email provider verification failed`, {
        error: error.message,
      });
      return false;
    }
  }
}

/**
 * Factory function to create email provider instance
 * @param {Object} config - Configuration object
 * @returns {EmailProvider} Configured email provider instance
 */
export function createEmailProvider(config) {
  if (config.env === 'test' || config.email.service === 'nodemailer') {
    return new NodemailerProvider(config);
  }

  // Default to Nodemailer
  return new NodemailerProvider(config);
}

export default {
  EmailProvider,
  NodemailerProvider,
  createEmailProvider,
};
