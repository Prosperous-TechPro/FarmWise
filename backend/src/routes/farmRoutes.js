/**
 * Farm routes
 */

import express from 'express';
import {
  listFarms,
  createFarm,
  getFarm,
  updateFarm,
  listFields,
  createField,
  getField,
  updateField,
} from '../controllers/farmController.js';
import { authenticate, authorize, requireFarmAccess, requireFarmRole } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

router.use(authenticate, authorize);

router.get('/', asyncHandler(listFarms));
router.post('/', asyncHandler(createFarm));

router.get('/:farmId', requireFarmAccess, asyncHandler(getFarm));
router.put('/:farmId', requireFarmAccess, requireFarmRole(['OWNER', 'MANAGER']), asyncHandler(updateFarm));

router.get('/:farmId/fields', requireFarmAccess, asyncHandler(listFields));
router.post('/:farmId/fields', requireFarmAccess, requireFarmRole(['OWNER', 'MANAGER']), asyncHandler(createField));

router.get('/:farmId/fields/:fieldId', requireFarmAccess, asyncHandler(getField));
router.put('/:farmId/fields/:fieldId', requireFarmAccess, requireFarmRole(['OWNER', 'MANAGER']), asyncHandler(updateField));

export default router;
