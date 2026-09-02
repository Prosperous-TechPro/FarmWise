/**
 * Generic inventory controller.
 */

import {
  createInventoryAdjustmentService,
  createInventoryIssueService,
  createInventoryItemService,
  createInventoryReceiptService,
  createInventoryTransferService,
  createStorageLocationService,
  getInventoryOverviewService,
  listFarmInventoryAdjustmentsService,
  listFarmInventoryIssuesService,
  listFarmInventoryItemsService,
  listFarmInventoryReceiptsService,
  listFarmInventoryTransfersService,
  listFarmStorageLocationsService,
  updateInventoryItemService,
} from '../services/inventoryService.js';

export async function listInventoryItems(req, res) {
  const filters = {
    category: req.query.category,
    isActive: req.query.isActive,
    search: req.query.search,
    skip: Number(req.query.skip) || 0,
    limit: Number(req.query.limit) || 20,
  };

  const data = await listFarmInventoryItemsService(req.params.farmId, filters);
  return res.status(200).json({
    success: true,
    data,
    message: 'Inventory items fetched successfully',
  });
}

export async function createInventoryItem(req, res) {
  const data = await createInventoryItemService(req.params.farmId, req.body);
  return res.status(201).json({
    success: true,
    data,
    message: 'Inventory item created successfully',
  });
}

export async function updateInventoryItem(req, res) {
  const data = await updateInventoryItemService(req.params.farmId, req.params.itemId, req.body);
  return res.status(200).json({
    success: true,
    data,
    message: 'Inventory item updated successfully',
  });
}

export async function listStorageLocations(req, res) {
  const data = await listFarmStorageLocationsService(req.params.farmId);
  return res.status(200).json({
    success: true,
    data,
    message: 'Storage locations fetched successfully',
  });
}

export async function createStorageLocation(req, res) {
  const data = await createStorageLocationService(req.params.farmId, req.body);
  return res.status(201).json({
    success: true,
    data,
    message: 'Storage location created successfully',
  });
}

export async function listInventoryReceipts(req, res) {
  const filters = {
    itemId: req.query.itemId,
    locationId: req.query.locationId,
    skip: Number(req.query.skip) || 0,
    limit: Number(req.query.limit) || 20,
  };

  const data = await listFarmInventoryReceiptsService(req.params.farmId, filters);
  return res.status(200).json({
    success: true,
    data,
    message: 'Inventory receipts fetched successfully',
  });
}

export async function createInventoryReceipt(req, res) {
  const data = await createInventoryReceiptService(req.params.farmId, req.user.id, req.body);
  return res.status(201).json({
    success: true,
    data,
    message: 'Inventory receipt recorded successfully',
  });
}

export async function listInventoryIssues(req, res) {
  const filters = {
    itemId: req.query.itemId,
    locationId: req.query.locationId,
    skip: Number(req.query.skip) || 0,
    limit: Number(req.query.limit) || 20,
  };

  const data = await listFarmInventoryIssuesService(req.params.farmId, filters);
  return res.status(200).json({
    success: true,
    data,
    message: 'Inventory issues fetched successfully',
  });
}

export async function createInventoryIssue(req, res) {
  const data = await createInventoryIssueService(req.params.farmId, req.user.id, req.body);
  return res.status(201).json({
    success: true,
    data,
    message: 'Inventory issue recorded successfully',
  });
}

export async function listInventoryTransfers(req, res) {
  const filters = {
    itemId: req.query.itemId,
    status: req.query.status,
    skip: Number(req.query.skip) || 0,
    limit: Number(req.query.limit) || 20,
  };

  const data = await listFarmInventoryTransfersService(req.params.farmId, filters);
  return res.status(200).json({
    success: true,
    data,
    message: 'Inventory transfers fetched successfully',
  });
}

export async function createInventoryTransfer(req, res) {
  const data = await createInventoryTransferService(req.params.farmId, req.user.id, req.body);
  return res.status(201).json({
    success: true,
    data,
    message: 'Inventory transfer created successfully',
  });
}

export async function listInventoryAdjustments(req, res) {
  const filters = {
    itemId: req.query.itemId,
    locationId: req.query.locationId,
    skip: Number(req.query.skip) || 0,
    limit: Number(req.query.limit) || 20,
  };

  const data = await listFarmInventoryAdjustmentsService(req.params.farmId, filters);
  return res.status(200).json({
    success: true,
    data,
    message: 'Inventory adjustments fetched successfully',
  });
}

export async function createInventoryAdjustment(req, res) {
  const data = await createInventoryAdjustmentService(req.params.farmId, req.user.id, req.body);
  return res.status(201).json({
    success: true,
    data,
    message: 'Inventory adjustment recorded successfully',
  });
}

export async function getInventoryOverview(req, res) {
  const data = await getInventoryOverviewService(req.params.farmId);
  return res.status(200).json({
    success: true,
    data,
    message: 'Inventory overview fetched successfully',
  });
}

export default {
  listInventoryItems,
  createInventoryItem,
  updateInventoryItem,
  listStorageLocations,
  createStorageLocation,
  listInventoryReceipts,
  createInventoryReceipt,
  listInventoryIssues,
  createInventoryIssue,
  listInventoryTransfers,
  createInventoryTransfer,
  listInventoryAdjustments,
  createInventoryAdjustment,
  getInventoryOverview,
};
