import express from 'express';
import {
  acknowledge,
  deleteDevice,
  dismiss,
  getPreferences,
  listAlerts,
  listDevices,
  listNotifications,
  markRead,
  patchPreferences,
  publishEvent,
  registerDevice,
  resolveAlert,
  unreadCount,
} from '../controllers/notificationController.js';
import { authenticate, authorize, requireRole } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();
router.use(authenticate, authorize);

router.get('/notifications/unread-count', asyncHandler(unreadCount));
router.get('/notifications', asyncHandler(listNotifications));
router.patch('/notifications/:id/read', asyncHandler(markRead));
router.patch('/notifications/:id/acknowledge', asyncHandler(acknowledge));
router.patch('/notifications/:id/dismiss', asyncHandler(dismiss));

router.get('/alerts', asyncHandler(listAlerts));
router.get('/alerts/active', asyncHandler((req, res, next) => { req.query.status = 'ACTIVE'; return listAlerts(req, res, next); }));
router.get('/alerts/unresolved', asyncHandler((req, res, next) => { req.query.status = 'ACTIVE'; return listAlerts(req, res, next); }));
router.patch('/alerts/:id/resolve', asyncHandler(resolveAlert));

router.get('/notification-preferences', asyncHandler(getPreferences));
router.patch('/notification-preferences', asyncHandler(patchPreferences));
router.post('/devices', asyncHandler(registerDevice));
router.get('/devices', asyncHandler(listDevices));
router.delete('/devices/:id', asyncHandler(deleteDevice));

// Internal event publishing endpoint; production deployments should protect this route with service authentication.
router.post('/events', requireRole(['ADMIN', 'SUPERADMIN']), asyncHandler(publishEvent));

export default router;
