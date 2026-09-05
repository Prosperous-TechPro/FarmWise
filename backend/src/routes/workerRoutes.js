import express from 'express';
import { workerDashboard, workerTasks, updateAssignedTask } from '../controllers/workerController.js';
import { authenticate, authorize, requireRole } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();
router.use('/worker', authenticate, authorize, requireRole(['FARM_WORKER', 'WORKER']));
router.get('/worker/dashboard', asyncHandler(workerDashboard));
router.get('/worker/tasks', asyncHandler(workerTasks));
router.patch('/worker/tasks/:taskId', asyncHandler(updateAssignedTask));

export default router;