/**
 * Livestock routes
 */

import express from 'express';
import {
  createBreedingRecord,
  createLivestockEvent,
  listLivestockEvents,
  createLivestockWeight,
  listLivestockWeights,
  createLivestockHealth,
  listLivestockHealth,
  createLivestockTreatment,
  listLivestockTreatments,
  createLivestockVaccination,
  listLivestockVaccinations,
  createLivestockFeeding,
  listLivestockFeeding,
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

const livestockHistoryRoutes = [
  ['events', listLivestockEvents, createLivestockEvent],
  ['weights', listLivestockWeights, createLivestockWeight],
  ['health', listLivestockHealth, createLivestockHealth],
  ['treatments', listLivestockTreatments, createLivestockTreatment],
  ['vaccinations', listLivestockVaccinations, createLivestockVaccination],
  ['feeding', listLivestockFeeding, createLivestockFeeding],
];

for (const [path, listHandler, createHandler] of livestockHistoryRoutes) {
  router.get(`/farms/:farmId/livestock/:livestockId/${path}`, requireFarmAccess, asyncHandler(listHandler));
  router.post(`/farms/:farmId/livestock/:livestockId/${path}`, requireFarmAccess, requireFarmRole(['OWNER', 'MANAGER', 'WORKER']), asyncHandler(createHandler));
}

router.get('/livestock/species', asyncHandler(listLivestockSpecies));
router.get('/livestock/breeds', asyncHandler(listLivestockBreeds));

export default router;
