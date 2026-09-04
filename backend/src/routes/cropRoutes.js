/**
 * Crop routes
 */

import express from 'express';
import {
  createCrop,
  createCropActivity,
  archiveCropCycle,
  createCropCycle,
  deleteCropCycle,
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
import { authenticate, authorize, requireFarmAccess, requireFarmRole, requirePermission } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

router.use(authenticate, authorize);

router.get('/crops', requirePermission('VIEW_CROP'), asyncHandler(listCrops));
router.post('/crops', requirePermission('MANAGE_FARM'), asyncHandler(createCrop));
router.get('/crops/:cropId/varieties', requirePermission('VIEW_CROP'), asyncHandler(listCropVarieties));
router.post('/crops/:cropId/varieties', requirePermission('MANAGE_FARM'), asyncHandler(createCropVariety));

router.get('/farms/:farmId/crops', requireFarmAccess, requirePermission('VIEW_CROP'), asyncHandler(listFarmCropCycles));
router.post('/farms/:farmId/crops', requireFarmAccess, requirePermission('CREATE_CROP_RECORD'), asyncHandler(createCropCycle));
router.get('/farms/:farmId/crops/:cropCycleId', requireFarmAccess, requirePermission('VIEW_CROP'), asyncHandler(getCropCycle));
router.put('/farms/:farmId/crops/:cropCycleId', requireFarmAccess, requirePermission('UPDATE_CROP_RECORD'), asyncHandler(updateCropCycle));
router.post('/farms/:farmId/crops/:cropCycleId/archive', requireFarmAccess, requirePermission('UPDATE_CROP_RECORD'), asyncHandler(archiveCropCycle));
router.delete('/farms/:farmId/crops/:cropCycleId', requireFarmAccess, requireFarmRole(['OWNER', 'MANAGER', 'WORKER']), asyncHandler(deleteCropCycle));

router.get('/farms/:farmId/crops/:cropCycleId/activities', requireFarmAccess, requirePermission('VIEW_CROP'), asyncHandler(listCropActivities));
router.post('/farms/:farmId/crops/:cropCycleId/activities', requireFarmAccess, requirePermission('RECORD_CROP_ACTIVITY'), asyncHandler(createCropActivity));

router.get('/farms/:farmId/crops/:cropCycleId/inputs', requireFarmAccess, requirePermission('VIEW_CROP'), asyncHandler(listCropInputs));
router.post('/farms/:farmId/crops/:cropCycleId/inputs', requireFarmAccess, requirePermission('CREATE_CROP_RECORD'), asyncHandler(createCropInput));

router.get('/farms/:farmId/crops/:cropCycleId/observations', requireFarmAccess, requirePermission('VIEW_CROP'), asyncHandler(listCropObservations));
router.post('/farms/:farmId/crops/:cropCycleId/observations', requireFarmAccess, requirePermission('RECORD_CROP_ACTIVITY'), asyncHandler(createCropObservation));

router.get('/farms/:farmId/crops/:cropCycleId/growth-records', requireFarmAccess, requirePermission('VIEW_CROP'), asyncHandler(listCropGrowthRecords));
router.post('/farms/:farmId/crops/:cropCycleId/growth-records', requireFarmAccess, requirePermission('RECORD_CROP_ACTIVITY'), asyncHandler(createCropGrowthRecord));

export default router;
