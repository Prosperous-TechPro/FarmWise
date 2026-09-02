/**
 * Authentication Routes
 * API endpoints for authentication operations
 */

import express from 'express';
import {
  register,
  verifyOtpEndpoint,
  resendOtpEndpoint,
  loginEndpoint,
  refreshTokenEndpoint,
  logoutEndpoint,
  logoutAllEndpoint,
  changePasswordEndpoint,
  resetPasswordEndpoint,
  getCurrentUser,
} from '../controllers/authController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

/**
 * Public endpoints
 */

// Register new user
// POST /api/v1/auth/register
router.post('/register', asyncHandler(register));

// Verify OTP and complete registration
// POST /api/v1/auth/verify-otp
router.post('/verify-otp', asyncHandler(verifyOtpEndpoint));

// Resend OTP code
// POST /api/v1/auth/resend-otp
router.post('/resend-otp', asyncHandler(resendOtpEndpoint));

// Login
// POST /api/v1/auth/login
router.post('/login', asyncHandler(loginEndpoint));

// Refresh access token
// POST /api/v1/auth/refresh
router.post('/refresh', asyncHandler(refreshTokenEndpoint));

/**
 * Protected endpoints (require authentication)
 */

// Get current user info
// GET /api/v1/auth/me
router.get('/me', authenticate, authorize, asyncHandler(getCurrentUser));

// Change password
// POST /api/v1/auth/change-password
router.post('/change-password', authenticate, authorize, asyncHandler(changePasswordEndpoint));

// Reset password (after OTP verification)
// POST /api/v1/auth/reset-password
router.post('/reset-password', asyncHandler(resetPasswordEndpoint));

// Logout (revoke current session)
// POST /api/v1/auth/logout
router.post('/logout', authenticate, authorize, asyncHandler(logoutEndpoint));

// Logout all sessions
// POST /api/v1/auth/logout-all
router.post('/logout-all', authenticate, authorize, asyncHandler(logoutAllEndpoint));

export default router;
