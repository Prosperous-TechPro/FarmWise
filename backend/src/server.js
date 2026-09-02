/**
 * FarmWise Backend Server Startup
 * Handles server initialization and startup
 */

import config, { validateConfig } from './config/index.js';
import { createApp } from './app.js';
import { createLogger } from './utils/logger.js';
import { startNotificationJobs } from './services/notificationJobService.js';
import { pathToFileURL } from 'url';

// Create server logger
const logger = createLogger('server');

/**
 * Start the server
 */
function startServer() {
  // Validate configuration
  try {
    validateConfig();
    logger.info('Configuration validated successfully');
  } catch (err) {
    logger.error('Configuration validation failed', { error: err.message });
    process.exit(1);
  }

  // Create Express app
  const app = createApp();

  // Start listening
  const server = app.listen(config.port, () => {
    startNotificationJobs();
    logger.info('FarmWise Backend Server Started', {
      port: config.port,
      environment: config.env,
      apiBase: `http://localhost:${config.port}/api/v1`,
    });

    // Log startup information (prettier format for user)
    console.log(`
╔════════════════════════════════════════╗
║         FarmWise Backend Server        ║
╚════════════════════════════════════════╝

Environment: ${config.env}
Port: ${config.port}
API Base URL: http://localhost:${config.port}/api/v1

Status: ✓ Server running successfully

Frontend should connect to:
http://localhost:${config.port}/api/v1

Documentation: See backend/README.md
    `);
  });

  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    logger.info('SIGINT signal received: closing HTTP server');
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception', { error: err.message, stack: err.stack });
    process.exit(1);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection', { reason, promise });
  });

  return server;
}

// Start server if this is the main module
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  startServer();
}

export default startServer;
