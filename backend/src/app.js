/**
 * FarmWise Express Application Setup
 * Separated from server startup for modularity and testing
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import config from './config/index.js';
import { createLogger } from './utils/logger.js';
import { requestIdMiddleware } from './middleware/requestId.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/logger.js';
import authRoutes from './routes/authRoutes.js';
import farmRoutes from './routes/farmRoutes.js';
import livestockRoutes from './routes/livestockRoutes.js';
import cropRoutes from './routes/cropRoutes.js';
import financialRoutes from './routes/financialRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import adminDashboardRoutes from './routes/adminDashboardRoutes.js';
import workerRoutes from './routes/workerRoutes.js';
import supportRoutes from './routes/supportRoutes.js';
import communityRoutes from './routes/communityRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import { createEmailProvider } from './utils/emailProvider.js';
import { createSmsProvider } from './utils/smsProvider.js';

// Create app logger
const logger = createLogger('app');

export function createApp() {
  const app = express();

  // ============================================
  // INITIALIZE PROVIDERS
  // ============================================

  // Initialize email and SMS providers
  const emailProvider = createEmailProvider(config);
  const smsProvider = createSmsProvider(config);

  // Store providers in app for use in routes
  app.set('emailProvider', emailProvider);
  app.set('smsProvider', smsProvider);

  // ============================================
  // MIDDLEWARE - Security & Parsing
  // ============================================

  // Security headers
  app.use(helmet());

  // Request ID middleware (must be early)
  app.use(requestIdMiddleware);

  // CORS configuration
  app.use(cors({
    origin: config.corsOrigin,
    credentials: true,
    optionsSuccessStatus: 200,
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', limiter);

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // Request logging middleware
  app.use(requestLogger);

  // ============================================
  // ROUTES
  // ============================================

  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      success: true,
      message: 'FarmWise API is running',
      version: 'v1',
      health: '/api/v1/health',
      api: '/api/v1',
    });
  });

  // Health check
  app.get('/api/v1/health', (req, res) => {
    res.json({
      success: true,
      message: 'FarmWise API is running',
      version: 'v1',
      timestamp: new Date().toISOString(),
      environment: config.env,
    });
  });

  // API v1 base endpoint
  app.get('/api/v1', (req, res) => {
    res.json({
      success: true,
      message: 'FarmWise API v1',
      version: 'v1',
      documentation: 'See /docs/api/',
      endpoints: {
        health: '/api/v1/health',
        auth: '/api/v1/auth',
      },
    });
  });

  // Authentication routes
  app.use('/api/v1/auth', authRoutes);

  // Farm management routes
  app.use('/api/v1/farms', farmRoutes);

  // Livestock management routes
  app.use('/api/v1', livestockRoutes);

  // Crop management routes
  app.use('/api/v1', cropRoutes);

  // Financial management routes
  app.use('/api/v1', financialRoutes);
  app.use('/api/v1', projectRoutes);

  // Inventory management routes
  app.use('/api/v1', inventoryRoutes);

  // Farm activity and production routes
  app.use('/api/v1', activityRoutes);

  // Centralized notifications, alerts, devices, preferences, and events
  app.use('/api/v1', notificationRoutes);

  // Dashboard and analytics routes
  app.use('/api/v1', analyticsRoutes);
  app.use('/api/v1', adminDashboardRoutes);
  app.use('/api/v1', workerRoutes);
  app.use('/api/v1', supportRoutes);
  app.use('/api/v1/community', communityRoutes);

  // ============================================
  // ERROR HANDLING
  // ============================================

  // 404 handler (must be last route)
  app.use(notFoundHandler);

  // Global error handler (must be last middleware)
  app.use(errorHandler);

  return app;
}

export default createApp;
