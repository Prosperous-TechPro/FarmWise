/**
 * Crop routes
 */

import express from 'express';
import {
  createCrop,
  createCropActivity,
  createCropCycle,
  createCropGrowthRecord,
  createCropInput,
  createCropObservation,
  createCropVariety,
  getCropCycle,
  listCropActivities,
  listCropGrowthRecords,
  listCropInputs,
  listCropObservations,
  listCropVarieties,
  listCrops,
  listFarmCropCycles,
  updateCropCycle,
} from '../controllers/cropController.js';
import { authenticate, authorize, requireFarmAccess, requireFarmRole } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

router.use(authenticate, authorize);

router.get('/crops', asyncHandler(listCrops));
router.post('/crops', requireFarmRole(['OWNER', 'MANAGER']), asyncHandler(createCrop));
router.get('/crops/:cropId/varieties', asyncHandler(listCropVarieties));
router.post('/crops/:cropId/varieties', requireFarmRole(['OWNER', 'MANAGER']), asyncHandler(createCropVariety));

router.get('/farms/:farmId/crops', requireFarmAccess, asyncHandler(listFarmCropCycles));
router.post('/farms/:farmId/crops', requireFarmAccess, requireFarmRole(['OWNER', 'MANAGER']), asyncHandler(createCropCycle));
router.get('/farms/:farmId/crops/:cropCycleId', requireFarmAccess, asyncHandler(getCropCycle));
router.put('/farms/:farmId/crops/:cropCycleId', requireFarmAccess, requireFarmRole(['OWNER', 'MANAGER']), asyncHandler(updateCropCycle));

router.get('/farms/:farmId/crops/:cropCycleId/activities', requireFarmAccess, asyncHandler(listCropActivities));
router.post('/farms/:farmId/crops/:cropCycleId/activities', requireFarmAccess, requireFarmRole(['OWNER', 'MANAGER']), asyncHandler(createCropActivity));

router.get('/farms/:farmId/crops/:cropCycleId/inputs', requireFarmAccess, asyncHandler(listCropInputs));
router.post('/farms/:farmId/crops/:cropCycleId/inputs', requireFarmAccess, requireFarmRole(['OWNER', 'MANAGER']), asyncHandler(createCropInput));

router.get('/farms/:farmId/crops/:cropCycleId/observations', requireFarmAccess, asyncHandler(listCropObservations));
router.post('/farms/:farmId/crops/:cropCycleId/observations', requireFarmAccess, requireFarmRole(['OWNER', 'MANAGER']), asyncHandler(createCropObservation));

router.get('/farms/:farmId/crops/:cropCycleId/growth-records', requireFarmAccess, asyncHandler(listCropGrowthRecords));
router.post('/farms/:farmId/crops/:cropCycleId/growth-records', requireFarmAccess, requireFarmRole(['OWNER', 'MANAGER']), asyncHandler(createCropGrowthRecord));

export default router;
