/**
 * Generic inventory management routes.
 */

import express from 'express';
import {
  createInventoryAdjustment,
  createInventoryIssue,
  createInventoryItem,
  deleteInventoryItem,
  createInventoryReceipt,
  createInventoryTransfer,
  createStorageLocation,
  getInventoryOverview,
  listInventoryAdjustments,
  listInventoryIssues,
  listInventoryItems,
  listInventoryReceipts,
  listInventoryTransfers,
  listStorageLocations,
  updateInventoryItem,
} from '../controllers/inventoryController.js';
import { authenticate, authorize, requireFarmAccess, requireFarmRole } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

router.use(authenticate, authorize);

router.get('/farms/:farmId/inventory/summary', requireFarmAccess, asyncHandler(getInventoryOverview));

router.get('/farms/:farmId/inventory/items', requireFarmAccess, asyncHandler(listInventoryItems));
router.post('/farms/:farmId/inventory/items', requireFarmAccess, requireFarmRole(['OWNER', 'MANAGER', 'WORKER']), asyncHandler(createInventoryItem));
router.put('/farms/:farmId/inventory/items/:itemId', requireFarmAccess, requireFarmRole(['OWNER', 'MANAGER', 'WORKER']), asyncHandler(updateInventoryItem));
router.delete('/farms/:farmId/inventory/items/:itemId', requireFarmAccess, requireFarmRole(['OWNER', 'MANAGER', 'WORKER']), asyncHandler(deleteInventoryItem));

router.get('/farms/:farmId/inventory/locations', requireFarmAccess, asyncHandler(listStorageLocations));
router.post('/farms/:farmId/inventory/locations', requireFarmAccess, requireFarmRole(['OWNER', 'MANAGER', 'WORKER']), asyncHandler(createStorageLocation));

router.get('/farms/:farmId/inventory/receipts', requireFarmAccess, asyncHandler(listInventoryReceipts));
router.post('/farms/:farmId/inventory/receipts', requireFarmAccess, requireFarmRole(['OWNER', 'MANAGER']), asyncHandler(createInventoryReceipt));

router.get('/farms/:farmId/inventory/issues', requireFarmAccess, asyncHandler(listInventoryIssues));
router.post('/farms/:farmId/inventory/issues', requireFarmAccess, requireFarmRole(['OWNER', 'MANAGER']), asyncHandler(createInventoryIssue));

router.get('/farms/:farmId/inventory/transfers', requireFarmAccess, asyncHandler(listInventoryTransfers));
router.post('/farms/:farmId/inventory/transfers', requireFarmAccess, requireFarmRole(['OWNER', 'MANAGER']), asyncHandler(createInventoryTransfer));

router.get('/farms/:farmId/inventory/adjustments', requireFarmAccess, asyncHandler(listInventoryAdjustments));
router.post('/farms/:farmId/inventory/adjustments', requireFarmAccess, requireFarmRole(['OWNER', 'MANAGER']), asyncHandler(createInventoryAdjustment));

export default router;
