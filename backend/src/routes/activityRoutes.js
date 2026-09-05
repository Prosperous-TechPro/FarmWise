/**
 * Generic farm activity routes.
 */

import express from 'express';
import {
  createActivity,
  createActivityObservation,
  createActivityTask,
  createActivityType,
  deleteActivity,
  createHarvest,
  createProductionRecord,
  getActivity,
  listActivities,
  listActivityObservations,
  listActivityTasks,
  listActivityTypes,
  listHarvests,
  listProductionRecords,
  updateActivity,
} from '../controllers/activityController.js';
import { authenticate, authorize, requireFarmAccess, requireFarmRole, requirePermission } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

router.use(authenticate, authorize);

router.get('/farms/:farmId/activity-types', requireFarmAccess, asyncHandler(listActivityTypes));
router.post('/farms/:farmId/activity-types', requireFarmAccess, requireFarmRole(['OWNER', 'MANAGER']), asyncHandler(createActivityType));

router.get('/farms/:farmId/activities', requireFarmAccess, asyncHandler(listActivities));
router.get('/farms/:farmId/activities/:activityId', requireFarmAccess, asyncHandler(getActivity));
router.post('/farms/:farmId/activities', requireFarmAccess, requireFarmRole(['OWNER', 'MANAGER', 'WORKER']), requirePermission('CREATE_ACTIVITY'), asyncHandler(createActivity));
router.patch('/farms/:farmId/activities/:activityId', requireFarmAccess, requireFarmRole(['OWNER', 'MANAGER', 'WORKER']), asyncHandler(updateActivity));
router.delete('/farms/:farmId/activities/:activityId', requireFarmAccess, requireFarmRole(['OWNER', 'MANAGER', 'WORKER']), asyncHandler(deleteActivity));

router.get('/farms/:farmId/activities/:activityId/tasks', requireFarmAccess, asyncHandler(listActivityTasks));
router.post('/farms/:farmId/activities/:activityId/tasks', requireFarmAccess, requireFarmRole(['OWNER', 'MANAGER']), asyncHandler(createActivityTask));

router.get('/farms/:farmId/activities/:activityId/observations', requireFarmAccess, asyncHandler(listActivityObservations));
router.post('/farms/:farmId/activities/:activityId/observations', requireFarmAccess, requireFarmRole(['OWNER', 'MANAGER']), asyncHandler(createActivityObservation));

router.get('/farms/:farmId/production', requireFarmAccess, asyncHandler(listProductionRecords));
router.post('/farms/:farmId/production', requireFarmAccess, requireFarmRole(['OWNER', 'MANAGER']), asyncHandler(createProductionRecord));

router.get('/farms/:farmId/harvests', requireFarmAccess, asyncHandler(listHarvests));
router.post('/farms/:farmId/harvests', requireFarmAccess, requireFarmRole(['OWNER', 'MANAGER']), asyncHandler(createHarvest));

export default router;
