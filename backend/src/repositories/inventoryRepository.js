/**
 * Generic inventory repository for stock, item catalog, and movement records.
 */

import prisma from '../lib/prisma.js';

export async function listInventoryItemsByFarm(farmId, filters = {}) {
  return prisma.inventoryItem.findMany({
    where: {
      farmId,
      ...(filters.category ? { category: filters.category } : {}),
      ...(filters.isActive !== undefined ? { isActive: filters.isActive === true || filters.isActive === 'true' } : {}),
      ...(filters.search ? { name: { contains: filters.search, mode: 'insensitive' } } : {}),
    },
    orderBy: { createdAt: 'desc' },
    skip: Number(filters.skip) || 0,
    take: Number(filters.limit) || 20,
  });
}

export async function getInventoryItemById(itemId) {
  return prisma.inventoryItem.findUnique({
    where: { id: itemId },
  });
}

export async function createInventoryItem(data) {
  return prisma.inventoryItem.create({
    data,
  });
}

export async function updateInventoryItem(itemId, data) {
  return prisma.inventoryItem.update({
    where: { id: itemId },
    data,
  });
}

export async function deleteInventoryItem(itemId) {
  return prisma.inventoryItem.delete({ where: { id: itemId } });
}

export async function listStorageLocationsByFarm(farmId) {
  return prisma.storageLocation.findMany({
    where: { farmId },
    orderBy: { name: 'asc' },
  });
}

export async function createStorageLocation(farmId, data) {
  return prisma.storageLocation.create({
    data: {
      farmId,
      ...data,
    },
  });
}

export async function listInventoryReceiptsByFarm(farmId, filters = {}) {
  return prisma.inventoryReceipt.findMany({
    where: {
      farmId,
      ...(filters.itemId ? { itemId: filters.itemId } : {}),
      ...(filters.locationId ? { locationId: filters.locationId } : {}),
    },
    orderBy: { receivedDate: 'desc' },
    skip: Number(filters.skip) || 0,
    take: Number(filters.limit) || 20,
  });
}

export async function createInventoryReceipt(data) {
  return prisma.inventoryReceipt.create({
    data,
  });
}

export async function listInventoryIssuesByFarm(farmId, filters = {}) {
  return prisma.inventoryIssue.findMany({
    where: {
      farmId,
      ...(filters.itemId ? { itemId: filters.itemId } : {}),
      ...(filters.locationId ? { locationId: filters.locationId } : {}),
    },
    orderBy: { issueDate: 'desc' },
    skip: Number(filters.skip) || 0,
    take: Number(filters.limit) || 20,
  });
}

export async function createInventoryIssue(data) {
  return prisma.inventoryIssue.create({
    data,
  });
}

export async function listInventoryTransfersByFarm(farmId, filters = {}) {
  return prisma.inventoryTransfer.findMany({
    where: {
      farmId,
      ...(filters.itemId ? { itemId: filters.itemId } : {}),
      ...(filters.status ? { status: filters.status } : {}),
    },
    orderBy: { transferDate: 'desc' },
    skip: Number(filters.skip) || 0,
    take: Number(filters.limit) || 20,
  });
}

export async function createInventoryTransfer(data) {
  return prisma.inventoryTransfer.create({
    data,
  });
}

export async function listInventoryAdjustmentsByFarm(farmId, filters = {}) {
  return prisma.inventoryAdjustment.findMany({
    where: {
      farmId,
      ...(filters.itemId ? { itemId: filters.itemId } : {}),
      ...(filters.locationId ? { locationId: filters.locationId } : {}),
    },
    orderBy: { adjustmentDate: 'desc' },
    skip: Number(filters.skip) || 0,
    take: Number(filters.limit) || 20,
  });
}

export async function createInventoryAdjustment(data) {
  return prisma.inventoryAdjustment.create({
    data,
  });
}

export async function getInventoryOverview(farmId) {
  const [items, stockBalances, receipts, issues] = await Promise.all([
    prisma.inventoryItem.count({ where: { farmId } }),
    prisma.inventoryStockBalance.aggregate({
      where: { farmId },
      _sum: { currentQuantity: true },
      _count: { id: true },
    }),
    prisma.inventoryReceipt.aggregate({
      where: { farmId },
      _sum: { quantity: true },
      _count: { id: true },
    }),
    prisma.inventoryIssue.aggregate({
      where: { farmId },
      _sum: { quantity: true },
      _count: { id: true },
    }),
  ]);

  return {
    totalItems: items,
    totalStockOnHand: Number(stockBalances._sum.currentQuantity ?? 0),
    stockBalanceRecords: stockBalances._count.id,
    totalReceipts: receipts._count.id,
    totalReceiptQuantity: Number(receipts._sum.quantity ?? 0),
    totalIssues: issues._count.id,
    totalIssueQuantity: Number(issues._sum.quantity ?? 0),
  };
}

export default {
  listInventoryItemsByFarm,
  getInventoryItemById,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  listStorageLocationsByFarm,
  createStorageLocation,
  listInventoryReceiptsByFarm,
  createInventoryReceipt,
  listInventoryIssuesByFarm,
  createInventoryIssue,
  listInventoryTransfersByFarm,
  createInventoryTransfer,
  listInventoryAdjustmentsByFarm,
  createInventoryAdjustment,
  getInventoryOverview,
};
