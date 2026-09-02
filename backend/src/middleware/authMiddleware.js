/**
 * Authentication Middleware
 * Handle JWT verification, authorization, and role/permission checking
 */

import { verifyAccessToken } from '../utils/jwt.js';
import { findUserById, getUserPermissions, getUserRoles } from '../repositories/userRepository.js';
import { getFarmAccess, getFarmById } from '../repositories/farmRepository.js';
import { isSessionValid } from '../repositories/authSessionRepository.js';
import logger from '../utils/logger.js';
import config from '../config/index.js';

function isSystemAdmin(user) {
  return user?.roles?.some((role) => ['ADMIN', 'SUPERADMIN'].includes(role));
}

/**
 * Middleware to authenticate requests using JWT
 * Extracts user from token and attaches to req.user
 */
export async function authenticate(req, res, next) {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided',
        errors: { authentication: 'Missing authorization header' },
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    let decoded;
    try {
      if (!config.jwt.secret) {
        return res.status(503).json({ success: false, message: 'Authentication service is not configured' });
      }
      decoded = verifyAccessToken(token, config.jwt.secret);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired authentication token',
        errors: { token: error.message },
      });
    }

    // Find user
    const user = await findUserById(decoded.sub, { includeRoles: true });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
        errors: { user: 'User associated with token does not exist' },
      });
    }

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'User account is not active',
        errors: { user: `Account status: ${user.status}` },
      });
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      status: user.status,
      roles: user.roles ? user.roles.map((ur) => ur.role.name) : [],
    };

    next();
  } catch (error) {
    logger.error(`Authentication middleware error`, {
      error: error.message,
      path: req.path,
    });

    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      errors: { server: 'An error occurred during authentication' },
    });
  }
}

/**
 * Middleware to check if user is authenticated
 * Must be used after authenticate middleware
 */
export function authorize(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      errors: { authentication: 'You must be logged in to access this resource' },
    });
  }

  next();
}

/**
 * Middleware to check if user has required role
 * @param {string|string[]} roles - Role name(s) to check for
 * @returns {Function} Middleware function
 */
export function requireRole(roles) {
  const requiredRoles = Array.isArray(roles) ? roles : [roles];

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        errors: { authentication: 'You must be logged in' },
      });
    }

    const userRoles = req.user.roles || [];
    if (isSystemAdmin(req.user)) return next();
    const hasRole = requiredRoles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      logger.warn(`Unauthorized role access attempt`, {
        userId: req.user.id,
        requiredRoles,
        userRoles,
        path: req.path,
      });

      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        errors: {
          authorization: `You must have one of these roles: ${requiredRoles.join(', ')}`,
        },
      });
    }

    next();
  };
}

/**
 * Middleware to check if user has required permission
 * @param {string|string[]} permissions - Permission code(s) to check for
 * @returns {Function} Middleware function
 */
export function requirePermission(permissions) {
  const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];

  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          errors: { authentication: 'You must be logged in' },
        });
      }

      if (isSystemAdmin(req.user)) return next();

      // Get user permissions from database
      const userPermissions = await getUserPermissions(req.user.id);

      const hasPermission = requiredPermissions.some((perm) => userPermissions.includes(perm));

      if (!hasPermission) {
        logger.warn(`Unauthorized permission access attempt`, {
          userId: req.user.id,
          requiredPermissions,
          userPermissions,
          path: req.path,
        });

        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
          errors: {
            authorization: `You don't have permission to perform this action`,
          },
        });
      }

      next();
    } catch (error) {
      logger.error(`Permission check error`, {
        userId: req.user.id,
        error: error.message,
      });

      return res.status(500).json({
        success: false,
        message: 'Permission check failed',
        errors: { server: 'An error occurred during authorization' },
      });
    }
  };
}

/**
 * Middleware to check if user is superadmin
 */
export function requireSuperAdmin(req, res, next) {
  return requireRole(['ADMIN', 'SUPERADMIN'])(req, res, next);
}

/**
 * Check whether the authenticated user can access a specific farm.
 * Users must either own the farm or be an active farm member.
 */
export async function requireFarmAccess(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        errors: { authentication: 'You must be logged in to access this resource' },
      });
    }

    const farmId = req.params?.farmId || req.body?.farmId;
    if (!farmId) {
      return res.status(400).json({
        success: false,
        message: 'Farm ID is required',
        errors: { farmId: 'farmId is required for this request' },
      });
    }

    const farm = await getFarmById(farmId);

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found',
        errors: { farmId: 'No farm exists with this ID' },
      });
    }

    if (isSystemAdmin(req.user)) {
      req.farm = farm;
      req.farmAccess = { role: 'OWNER', status: 'ACTIVE' };
      return next();
    }

    const access = await getFarmAccess(farmId, req.user.id);
    const isOwner = farm.ownerId === req.user.id;

    if (!isOwner && !access) {
      logger.warn(`Unauthorized farm access attempt`, {
        userId: req.user.id,
        farmId,
        path: req.path,
      });

      return res.status(403).json({
        success: false,
        message: 'Farm access denied',
        errors: { authorization: 'You are not a member of this farm' },
      });
    }

    req.farm = farm;
    req.farmAccess = access || { role: 'OWNER', status: 'ACTIVE' };
    next();
  } catch (error) {
    logger.error('Farm access middleware error', {
      userId: req.user?.id,
      farmId: req.params?.farmId,
      error: error.message,
    });

    return res.status(500).json({
      success: false,
      message: 'Farm access check failed',
      errors: { server: 'An error occurred while validating farm access' },
    });
  }
}

/**
 * Restrict a farm-scoped route to the farm roles allowed for the action.
 * Accepts OWNER/MANAGER/WORKER membership roles, or SUPERADMIN.
 */
export function requireFarmRole(roles = ['OWNER', 'MANAGER']) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        errors: { authentication: 'You must be logged in' },
      });
    }

    const userRoles = req.user.roles || [];
    const hasSystemAdmin = isSystemAdmin(req.user);
    const farmRole = req.farmAccess?.role || 'WORKER';
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (hasSystemAdmin || (farmRole && allowedRoles.includes(farmRole))) {
      return next();
    }

    if (req.farm?.ownerId === req.user.id) {
      return next();
    }

    logger.warn(`Unauthorized farm role access attempt`, {
      userId: req.user.id,
      farmId: req.farm?.id,
      requiredRoles: allowedRoles,
      farmRole,
      path: req.path,
    });

    return res.status(403).json({
      success: false,
      message: 'Insufficient farm permissions',
      errors: {
        authorization: `You must have one of these farm roles: ${allowedRoles.join(', ')}`,
      },
    });
  };
}

/**
 * Optional authentication middleware
 * Authenticates if token is provided, but doesn't fail if not
 */
export async function optionalAuthenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);

    try {
      if (!config.jwt.secret) return next();
      const decoded = verifyAccessToken(token, config.jwt.secret);
      const user = await findUserById(decoded.sub, { includeRoles: true });

      if (user && user.status === 'ACTIVE') {
        req.user = {
          id: user.id,
          email: user.email,
          phone: user.phone,
          firstName: user.firstName,
          lastName: user.lastName,
          status: user.status,
          roles: user.roles ? user.roles.map((ur) => ur.role.name) : [],
        };
      }
    } catch (error) {
      // Silently ignore token errors for optional auth
      logger.debug(`Optional authentication failed`, {
        error: error.message,
      });
    }

    next();
  } catch (error) {
    logger.error(`Optional authentication middleware error`, {
      error: error.message,
    });
    next();
  }
}

export default {
  authenticate,
  authorize,
  requireRole,
  requirePermission,
  requireSuperAdmin,
  optionalAuthenticate,
};
