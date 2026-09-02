import test from 'node:test';
import assert from 'node:assert/strict';

import {
  validateCreateInventoryItem,
  validateReceiveInventoryStock,
  validateIssueInventoryStock,
  validateTransferInventoryStock,
  validateAdjustInventoryStock,
} from './inventoryValidator.js';

test('validateCreateInventoryItem accepts valid item payload and normalizes category/unit', () => {
  const result = validateCreateInventoryItem({
    name: 'Pig Feed',
    category: 'FEED',
    unitOfMeasure: 'KG',
    minimumStockLevel: 20,
    reorderLevel: 30,
    supplierId: 'supplier-1',
  });

  assert.equal(result.isValid, true);
  assert.equal(result.normalizedData.category, 'FEED');
  assert.equal(result.normalizedData.unitOfMeasure, 'KG');
  assert.equal(result.normalizedData.name, 'Pig Feed');
});

test('validateCreateInventoryItem rejects invalid category and blank item name', () => {
  const result = validateCreateInventoryItem({
    name: '   ',
    category: 'INVALID',
    unitOfMeasure: 'KG',
  });

  assert.equal(result.isValid, false);
  assert.match(result.errors.name, /required|blank/i);
  assert.match(result.errors.category, /valid inventory category/i);
});

test('validateReceiveInventoryStock requires positive quantity and valid batch metadata', () => {
  const result = validateReceiveInventoryStock({
    itemId: 'item-1',
    locationId: 'loc-1',
    quantity: 25,
    unitCost: 12.5,
    supplierId: 'supplier-1',
    receivedDate: '2026-09-01',
    batchNumber: 'B-001',
    expiryDate: '2026-12-01',
  });

  assert.equal(result.isValid, true);
  assert.equal(result.normalizedData.quantity, 25);
  assert.equal(result.normalizedData.unitCost, 12.5);
});

test('validateIssueInventoryStock rejects issuing more than available stock and missing allocation target', () => {
  const result = validateIssueInventoryStock({
    itemId: 'item-1',
    locationId: 'loc-1',
    quantity: 15,
    availableQuantity: 12,
    issueDate: '2026-09-01',
    farmActivityId: '',
  });

  assert.equal(result.isValid, false);
  assert.match(result.errors.quantity, /cannot exceed available stock|available stock/i);
  assert.match(result.errors.farmActivityId || result.errors.allocation, /required|allocation/i);
});

test('validateTransferInventoryStock requires source and destination location to be different', () => {
  const result = validateTransferInventoryStock({
    itemId: 'item-1',
    sourceLocationId: 'loc-1',
    destinationLocationId: 'loc-1',
    quantity: 5,
    transferDate: '2026-09-02',
  });

  assert.equal(result.isValid, false);
  assert.match(result.errors.destinationLocationId, /different|source/i);
});

test('validateAdjustInventoryStock requires a reason and non-zero quantity', () => {
  const result = validateAdjustInventoryStock({
    itemId: 'item-1',
    locationId: 'loc-1',
    quantity: 0,
    reason: '',
    adjustmentDate: '2026-09-02',
  });

  assert.equal(result.isValid, false);
  assert.match(result.errors.quantity, /greater than 0|non-zero/i);
  assert.match(result.errors.reason, /required/i);
});
