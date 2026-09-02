import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticate, authorize, requireRole } from '../middleware/authMiddleware.js';
import { adminDashboardSummary, getUsers, getWorkers } from '../controllers/adminDashboardController.js';

const router = express.Router();
router.use(authenticate, authorize);
router.use(requireRole(['ADMIN', 'SUPERADMIN']));

router.get('/admin/dashboard/summary', asyncHandler(adminDashboardSummary));
router.get('/admin/users', asyncHandler(getUsers));
router.get('/admin/workers', asyncHandler(getWorkers));

export default router;
