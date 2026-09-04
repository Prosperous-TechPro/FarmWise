/**
 * Livestock routes
 */

import express from 'express';
import {
  createBreedingRecord,
  createLivestock,
  deleteLivestock,
  getLivestock,
  listBreedingRecords,
  listLivestock,
  listLivestockBreeds,
  listLivestockSpecies,
  updateLivestock,
} from '../controllers/livestockController.js';
import { authenticate, authorize, requireFarmAccess, requireFarmRole } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

router.use(authenticate, authorize);

router.get('/farms/:farmId/livestock', requireFarmAccess, asyncHandler(listLivestock));
router.post('/farms/:farmId/livestock', requireFarmAccess, requireFarmRole(['OWNER', 'MANAGER', 'WORKER']), asyncHandler(createLivestock));
router.get('/farms/:farmId/livestock/:livestockId', requireFarmAccess, asyncHandler(getLivestock));
router.put('/farms/:farmId/livestock/:livestockId', requireFarmAccess, requireFarmRole(['OWNER', 'MANAGER', 'WORKER']), asyncHandler(updateLivestock));
router.delete('/farms/:farmId/livestock/:livestockId', requireFarmAccess, requireFarmRole(['OWNER', 'MANAGER', 'WORKER']), asyncHandler(deleteLivestock));
router.get('/farms/:farmId/livestock/:livestockId/breeding', requireFarmAccess, asyncHandler(listBreedingRecords));
router.post('/farms/:farmId/livestock/:livestockId/breeding', requireFarmAccess, requireFarmRole(['OWNER', 'MANAGER']), asyncHandler(createBreedingRecord));

router.get('/livestock/species', asyncHandler(listLivestockSpecies));
router.get('/livestock/breeds', asyncHandler(listLivestockBreeds));

export default router;
