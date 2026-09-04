import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticate, authorize, requirePermission, requireRole, requireSuperAdmin } from '../middleware/authMiddleware.js';
import { adminDashboardSummary, getUsers, getWorkers, updateUserStatus, addAdmin, removeAdmin, getFarms, updateFarm, getActivities, updateActivity } from '../controllers/adminDashboardController.js';

const router = express.Router();
router.use(authenticate, authorize);
router.use(requireRole(['ADMIN', 'SUPERADMIN']));

router.get('/admin/dashboard/summary', asyncHandler(adminDashboardSummary));
router.get('/admin/users', asyncHandler(getUsers));
router.get('/admin/workers', asyncHandler(getWorkers));
router.patch('/admin/users/:userId/status', requirePermission('MANAGE_USERS'), asyncHandler(updateUserStatus));
router.post('/admin/users/:userId/admin', requireSuperAdmin, requirePermission('MANAGE_USERS'), asyncHandler(addAdmin));
router.delete('/admin/users/:userId/admin', requireSuperAdmin, requirePermission('MANAGE_USERS'), asyncHandler(removeAdmin));
router.get('/admin/farms', asyncHandler(getFarms));
router.patch('/admin/farms/:farmId', requirePermission('MANAGE_PLATFORM'), asyncHandler(updateFarm));
router.get('/admin/activities', asyncHandler(getActivities));
router.patch('/admin/activities/:activityId', requirePermission('MANAGE_PLATFORM'), asyncHandler(updateActivity));

export default router;
