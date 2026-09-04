/**
 * Generic inventory service layer.
 */

import { getFarmById } from '../repositories/farmRepository.js';
import {
  createInventoryAdjustment,
  createInventoryIssue,
  createInventoryItem,
  deleteInventoryItem,
  createInventoryReceipt,
  createInventoryTransfer,
  createStorageLocation,
  getInventoryItemById,
  getInventoryOverview,
  listInventoryAdjustmentsByFarm,
  listInventoryIssuesByFarm,
  listInventoryItemsByFarm,
  listInventoryReceiptsByFarm,
  listInventoryTransfersByFarm,
  listStorageLocationsByFarm,
  updateInventoryItem,
} from '../repositories/inventoryRepository.js';
import {
  validateAdjustInventoryStock,
  validateCreateInventoryItem,
  validateIssueInventoryStock,
  validateReceiveInventoryStock,
  validateTransferInventoryStock,
} from '../validators/inventoryValidator.js';

async function ensureFarmExists(farmId) {
  const farm = await getFarmById(farmId);
  if (!farm) {
    const error = new Error('Farm not found');
    error.statusCode = 404;
    throw error;
  }

  return farm;
}

export async function listFarmInventoryItemsService(farmId, filters = {}) {
  await ensureFarmExists(farmId);
  return listInventoryItemsByFarm(farmId, filters);
}

export async function createInventoryItemService(farmId, input) {
  await ensureFarmExists(farmId);

  const validation = validateCreateInventoryItem(input);
  if (!validation.isValid) {
    const error = new Error('Validation failed');
    error.statusCode = 400;
    error.details = validation.errors;
    throw error;
  }

  return createInventoryItem({
    farmId,
    name: validation.normalizedData.name,
    category: validation.normalizedData.category,
    description: validation.normalizedData.description || null,
    code: validation.normalizedData.code || null,
    unitOfMeasure: validation.normalizedData.unitOfMeasure,
    minimumStockLevel: validation.normalizedData.minimumStockLevel ?? null,
    maximumStockLevel: validation.normalizedData.maximumStockLevel ?? null,
    reorderLevel: validation.normalizedData.reorderLevel ?? null,
    defaultLocationId: input.defaultLocationId || null,
    isActive: validation.normalizedData.isActive ?? true,
  });
}

export async function updateInventoryItemService(farmId, itemId, input) {
  const item = await getInventoryItemById(itemId);
  if (!item) {
    const error = new Error('Inventory item not found');
    error.statusCode = 404;
    throw error;
  }

  if (item.farmId !== farmId) {
    const error = new Error('Inventory item not found in this farm');
    error.statusCode = 404;
    throw error;
  }

  const validation = validateCreateInventoryItem({ ...item, ...input });
  if (!validation.isValid) {
    const error = new Error('Validation failed');
    error.statusCode = 400;
    error.details = validation.errors;
    throw error;
  }

  return updateInventoryItem(itemId, {
    name: validation.normalizedData.name,
    category: validation.normalizedData.category,
    description: validation.normalizedData.description || null,
    code: validation.normalizedData.code || null,
    unitOfMeasure: validation.normalizedData.unitOfMeasure,
    minimumStockLevel: validation.normalizedData.minimumStockLevel ?? null,
    maximumStockLevel: validation.normalizedData.maximumStockLevel ?? null,
    reorderLevel: validation.normalizedData.reorderLevel ?? null,
    defaultLocationId: input.defaultLocationId || null,
    isActive: validation.normalizedData.isActive ?? true,
  });
}

export async function deleteInventoryItemService(farmId, itemId) {
  const item = await getInventoryItemById(itemId);
  if (!item || item.farmId !== farmId) {
    const error = new Error('Inventory item not found in this farm');
    error.statusCode = 404;
    throw error;
  }
  return deleteInventoryItem(itemId);
}

export async function listFarmStorageLocationsService(farmId) {
  await ensureFarmExists(farmId);
  return listStorageLocationsByFarm(farmId);
}

export async function createStorageLocationService(farmId, input) {
  await ensureFarmExists(farmId);

  if (typeof input?.name !== 'string' || !input.name.trim()) {
    const error = new Error('Validation failed');
    error.statusCode = 400;
    error.details = { name: 'Location name is required' };
    throw error;
  }

  return createStorageLocation(farmId, {
    name: input.name.trim(),
    locationType: input.locationType || null,
    description: input.description || null,
    isActive: input.isActive ?? true,
  });
}

export async function listFarmInventoryReceiptsService(farmId, filters = {}) {
  await ensureFarmExists(farmId);
  return listInventoryReceiptsByFarm(farmId, filters);
}

export async function createInventoryReceiptService(farmId, userId, input) {
  await ensureFarmExists(farmId);

  const validation = validateReceiveInventoryStock(input);
  if (!validation.isValid) {
    const error = new Error('Validation failed');
    error.statusCode = 400;
    error.details = validation.errors;
    throw error;
  }

  return createInventoryReceipt({
    farmId,
    itemId: validation.normalizedData.itemId,
    batchId: input.batchId || null,
    locationId: validation.normalizedData.locationId,
    supplierId: validation.normalizedData.supplierId || null,
    receivedBy: userId,
    receivedDate: validation.normalizedData.receivedDate,
    quantity: validation.normalizedData.quantity,
    unit: validation.normalizedData.unit,
    unitCost: validation.normalizedData.unitCost || null,
    totalCost: validation.normalizedData.totalCost || null,
    batchNumber: validation.normalizedData.batchNumber || null,
    expiryDate: validation.normalizedData.expiryDate || null,
    reference: validation.normalizedData.reference || null,
    notes: validation.normalizedData.notes || null,
  });
}

export async function listFarmInventoryIssuesService(farmId, filters = {}) {
  await ensureFarmExists(farmId);
  return listInventoryIssuesByFarm(farmId, filters);
}

export async function createInventoryIssueService(farmId, userId, input) {
  await ensureFarmExists(farmId);

  const validation = validateIssueInventoryStock(input);
  if (!validation.isValid) {
    const error = new Error('Validation failed');
    error.statusCode = 400;
    error.details = validation.errors;
    throw error;
  }

  return createInventoryIssue({
    farmId,
    itemId: validation.normalizedData.itemId,
    batchId: input.batchId || null,
    locationId: validation.normalizedData.locationId,
    quantity: validation.normalizedData.quantity,
    unit: input.unit || 'UNIT',
    issueDate: validation.normalizedData.issueDate,
    reason: validation.normalizedData.reason || input.reason || null,
    createdBy: userId,
    relatedEntityType: input.relatedEntityType || null,
    relatedEntityId: input.relatedEntityId || null,
    cropCycleId: input.cropCycleId || null,
    livestockId: input.livestockId || null,
    livestockBatchId: input.livestockBatchId || null,
    fieldId: input.fieldId || null,
    farmActivityId: input.farmActivityId || null,
    notes: input.notes || null,
  });
}

export async function listFarmInventoryTransfersService(farmId, filters = {}) {
  await ensureFarmExists(farmId);
  return listInventoryTransfersByFarm(farmId, filters);
}

export async function createInventoryTransferService(farmId, userId, input) {
  await ensureFarmExists(farmId);

  const validation = validateTransferInventoryStock(input);
  if (!validation.isValid) {
    const error = new Error('Validation failed');
    error.statusCode = 400;
    error.details = validation.errors;
    throw error;
  }

  return createInventoryTransfer({
    farmId,
    itemId: validation.normalizedData.itemId,
    batchId: input.batchId || null,
    sourceLocationId: validation.normalizedData.sourceLocationId,
    destinationLocationId: validation.normalizedData.destinationLocationId,
    quantity: validation.normalizedData.quantity,
    unit: input.unit || 'UNIT',
    transferDate: validation.normalizedData.transferDate,
    transferredBy: userId,
    status: input.status || 'PENDING',
    notes: input.notes || null,
  });
}

export async function listFarmInventoryAdjustmentsService(farmId, filters = {}) {
  await ensureFarmExists(farmId);
  return listInventoryAdjustmentsByFarm(farmId, filters);
}

export async function createInventoryAdjustmentService(farmId, userId, input) {
  await ensureFarmExists(farmId);

  const validation = validateAdjustInventoryStock(input);
  if (!validation.isValid) {
    const error = new Error('Validation failed');
    error.statusCode = 400;
    error.details = validation.errors;
    throw error;
  }

  return createInventoryAdjustment({
    farmId,
    itemId: validation.normalizedData.itemId,
    batchId: input.batchId || null,
    locationId: validation.normalizedData.locationId,
    quantity: validation.normalizedData.quantity,
    unit: input.unit || 'UNIT',
    reason: validation.normalizedData.reason,
    adjustmentDate: validation.normalizedData.adjustmentDate,
    adjustedBy: userId,
    notes: input.notes || null,
  });
}

export async function getInventoryOverviewService(farmId) {
  await ensureFarmExists(farmId);
  return getInventoryOverview(farmId);
}

export default {
  listFarmInventoryItemsService,
  createInventoryItemService,
  updateInventoryItemService,
  deleteInventoryItemService,
  listFarmStorageLocationsService,
  createStorageLocationService,
  listFarmInventoryReceiptsService,
  createInventoryReceiptService,
  listFarmInventoryIssuesService,
  createInventoryIssueService,
  listFarmInventoryTransfersService,
  createInventoryTransferService,
  listFarmInventoryAdjustmentsService,
  createInventoryAdjustmentService,
  getInventoryOverviewService,
};
