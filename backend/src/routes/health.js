/**
 * Health check endpoint for FarmWise API
 * Provides system status information
 */

import express from 'express';

const router = express.Router();

/**
 * GET /api/v1/health
 * Check backend health status
 */
router.get('/', (req, res) => {
  const healthStatus = {
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '0.0.1',
    api: {
      version: 'v1',
      baseUrl: `http://localhost:${process.env.PORT || 3000}/api/v1`,
    },
    services: {
      database: 'pending', // Will be updated in Sprint 1
      cache: 'not-configured',
      storage: 'not-configured',
    },
    message: 'FarmWise backend is running',
  };

  res.status(200).json(healthStatus);
});

/**
 * GET /api/v1/health/detailed
 * More detailed system health information (for monitoring)
 */
router.get('/detailed', (req, res) => {
  const healthStatus = {
    success: true,
    timestamp: new Date().toISOString(),
    system: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development',
    },
    api: {
      version: 'v1',
      status: 'operational',
    },
    features: {
      authentication: 'not-implemented',
      database: 'not-implemented',
      notifications: 'not-implemented',
      ai: 'not-implemented',
      sync: 'not-implemented',
    },
  };

  res.status(200).json(healthStatus);
});

export default router;
