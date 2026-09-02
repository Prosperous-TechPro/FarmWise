const INVENTORY_CATEGORY_VALUES = [
  'FEED',
  'SEEDS',
  'PLANTING_MATERIAL',
  'FERTILIZER',
  'HERBICIDE',
  'PESTICIDE',
  'FUNGICIDE',
  'MEDICATION',
  'VACCINE',
  'VETERINARY_SUPPLIES',
  'FUEL',
  'FARM_CHEMICAL',
  'PACKAGING',
  'CLEANING_SUPPLIES',
  'EQUIPMENT',
  'TOOLS',
  'SPARE_PARTS',
  'BUILDING_MATERIAL',
  'OTHER',
];

const INVENTORY_UNIT_VALUES = [
  'KG',
  'GRAM',
  'LITRE',
  'MILLILITRE',
  'BAG',
  'SACK',
  'BOTTLE',
  'PACK',
  'BOX',
  'PIECE',
  'UNIT',
  'TON',
  'HECTARE',
  'ACRE',
  'DOSE',
  'OTHER',
];

const STOCK_MOVEMENT_TYPES = [
  'RECEIPT',
  'ISSUE',
  'ADJUSTMENT_IN',
  'ADJUSTMENT_OUT',
  'TRANSFER_IN',
  'TRANSFER_OUT',
  'RETURN',
  'WASTE',
  'EXPIRY',
  'LOSS',
];

const STOCK_STATUS_VALUES = [
  'NORMAL',
  'LOW_STOCK',
  'OUT_OF_STOCK',
  'OVERSTOCK',
  'EXPIRING_SOON',
  'EXPIRED',
];

const EXPIRY_ALERT_VALUES = ['30_DAYS', '14_DAYS', '7_DAYS'];

function normalizeEnumValue(value, allowedValues, fallback) {
  if (typeof value !== 'string') return fallback;
  const normalized = value.trim().toUpperCase();
  if (!normalized) return fallback;
  return allowedValues.includes(normalized) ? normalized : fallback;
}

function toDecimalNumber(value, fieldName, errors, allowZero = false, allowNegative = false) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const num = Number(value);
  if (Number.isNaN(num)) {
    errors[fieldName] = `${fieldName} must be a valid number`;
    return undefined;
  }

  if (!allowZero && num <= 0) {
    errors[fieldName] = `${fieldName} must be greater than 0`;
    return undefined;
  }

  if (!allowNegative && num < 0) {
    errors[fieldName] = `${fieldName} cannot be negative`;
    return undefined;
  }

  return num;
}

function validateDateString(value, fieldName, errors, required = true) {
  if ((value === undefined || value === null || value === '') && !required) return undefined;
  if (value === undefined || value === null || value === '') {
    errors[fieldName] = `${fieldName} is required`;
    return undefined;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    errors[fieldName] = `${fieldName} must be a valid date`;
    return undefined;
  }

  return date;
}

export function validateCreateInventoryItem(data = {}) {
  const errors = {};
  const normalizedData = {};

  if (typeof data.name !== 'string' || !data.name.trim()) {
    errors.name = 'Item name is required';
  } else {
    normalizedData.name = data.name.trim();
  }

  if (typeof data.description !== 'undefined') {
    if (typeof data.description !== 'string') {
      errors.description = 'Description must be a string';
    } else {
      normalizedData.description = data.description.trim() || undefined;
    }
  }

  const category = normalizeEnumValue(data.category, INVENTORY_CATEGORY_VALUES, undefined);
  if (!category) {
    errors.category = 'Category is required and must be a valid inventory category';
  } else {
    normalizedData.category = category;
  }

  const unitOfMeasure = normalizeEnumValue(data.unitOfMeasure, INVENTORY_UNIT_VALUES, undefined);
  if (!unitOfMeasure) {
    errors.unitOfMeasure = 'Unit of measure is required and must be a valid inventory unit';
  } else {
    normalizedData.unitOfMeasure = unitOfMeasure;
  }

  if (data.code !== undefined) {
    if (typeof data.code !== 'string') {
      errors.code = 'SKU/code must be a string';
    } else {
      normalizedData.code = data.code.trim() || undefined;
    }
  }

  const minimumStockLevel = toDecimalNumber(data.minimumStockLevel, 'minimumStockLevel', errors, true, true);
  if (minimumStockLevel !== undefined) normalizedData.minimumStockLevel = minimumStockLevel;

  const maximumStockLevel = toDecimalNumber(data.maximumStockLevel, 'maximumStockLevel', errors, true, true);
  if (maximumStockLevel !== undefined) normalizedData.maximumStockLevel = maximumStockLevel;

  const reorderLevel = toDecimalNumber(data.reorderLevel, 'reorderLevel', errors, true, true);
  if (reorderLevel !== undefined) normalizedData.reorderLevel = reorderLevel;

  if (
    normalizedData.minimumStockLevel !== undefined &&
    normalizedData.maximumStockLevel !== undefined &&
    normalizedData.maximumStockLevel < normalizedData.minimumStockLevel
  ) {
    errors.maximumStockLevel = 'Maximum stock level cannot be lower than minimum stock level';
  }

  if (
    normalizedData.reorderLevel !== undefined &&
    normalizedData.maximumStockLevel !== undefined &&
    normalizedData.reorderLevel > normalizedData.maximumStockLevel
  ) {
    errors.reorderLevel = 'Reorder level cannot be above maximum stock level';
  }

  if (data.isActive !== undefined && typeof data.isActive !== 'boolean') {
    errors.isActive = 'isActive must be a boolean';
  } else if (data.isActive !== undefined) {
    normalizedData.isActive = data.isActive;
  }

  if (data.farmId !== undefined && typeof data.farmId !== 'string') {
    errors.farmId = 'Farm ID must be a string';
  }

  if (data.supplierId !== undefined && typeof data.supplierId !== 'string') {
    errors.supplierId = 'Supplier ID must be a string';
  }

  return { isValid: Object.keys(errors).length === 0, errors, normalizedData };
}

export function validateReceiveInventoryStock(data = {}) {
  const errors = {};
  const normalizedData = {};

  if (!data.itemId || typeof data.itemId !== 'string') {
    errors.itemId = 'Item ID is required';
  } else {
    normalizedData.itemId = data.itemId;
  }

  if (!data.locationId || typeof data.locationId !== 'string') {
    errors.locationId = 'Location ID is required';
  } else {
    normalizedData.locationId = data.locationId;
  }

  const quantity = toDecimalNumber(data.quantity, 'quantity', errors, false, false);
  if (quantity !== undefined) normalizedData.quantity = quantity;

  const unitCost = toDecimalNumber(data.unitCost, 'unitCost', errors, true, false);
  if (unitCost !== undefined) normalizedData.unitCost = unitCost;

  const totalCost = toDecimalNumber(data.totalCost, 'totalCost', errors, true, false);
  if (totalCost !== undefined) normalizedData.totalCost = totalCost;

  if (normalizedData.quantity !== undefined && normalizedData.unitCost !== undefined && normalizedData.totalCost !== undefined) {
    const expectedTotal = Number((normalizedData.quantity * normalizedData.unitCost).toFixed(10));
    if (Math.abs(expectedTotal - normalizedData.totalCost) > 0.01) {
      errors.totalCost = 'Total cost should equal quantity multiplied by unit cost';
    }
  }

  if (data.supplierId !== undefined && typeof data.supplierId !== 'string') {
    errors.supplierId = 'Supplier ID must be a string';
  } else if (data.supplierId) {
    normalizedData.supplierId = data.supplierId;
  }

  if (data.batchNumber !== undefined) {
    if (typeof data.batchNumber !== 'string') {
      errors.batchNumber = 'Batch number must be a string';
    } else {
      normalizedData.batchNumber = data.batchNumber.trim() || undefined;
    }
  }

  const receivedDate = validateDateString(data.receivedDate || data.receiptDate, 'receivedDate', errors);
  if (receivedDate) normalizedData.receivedDate = receivedDate;

  if (data.expiryDate !== undefined && data.expiryDate !== null && data.expiryDate !== '') {
    const expiryDate = validateDateString(data.expiryDate, 'expiryDate', errors);
    if (expiryDate) {
      normalizedData.expiryDate = expiryDate;
      if (normalizedData.receivedDate && expiryDate < normalizedData.receivedDate) {
        errors.expiryDate = 'Expiry date cannot be earlier than receive date';
      }
    }
  }

  if (data.reference !== undefined) {
    if (typeof data.reference !== 'string') {
      errors.reference = 'Reference must be a string';
    } else {
      normalizedData.reference = data.reference.trim() || undefined;
    }
  }

  if (data.notes !== undefined) {
    if (typeof data.notes !== 'string') {
      errors.notes = 'Notes must be a string';
    } else {
      normalizedData.notes = data.notes.trim() || undefined;
    }
  }

  return { isValid: Object.keys(errors).length === 0, errors, normalizedData };
}

export function validateIssueInventoryStock(data = {}) {
  const errors = {};
  const normalizedData = {};

  if (!data.itemId || typeof data.itemId !== 'string') {
    errors.itemId = 'Item ID is required';
  } else {
    normalizedData.itemId = data.itemId;
  }

  if (!data.locationId || typeof data.locationId !== 'string') {
    errors.locationId = 'Location ID is required';
  } else {
    normalizedData.locationId = data.locationId;
  }

  const quantity = toDecimalNumber(data.quantity, 'quantity', errors, false, false);
  if (quantity !== undefined) normalizedData.quantity = quantity;

  if (data.availableQuantity !== undefined) {
    const availableQuantity = toDecimalNumber(data.availableQuantity, 'availableQuantity', errors, true, false);
    if (availableQuantity !== undefined && normalizedData.quantity !== undefined && normalizedData.quantity > availableQuantity) {
      errors.quantity = 'Issue quantity cannot exceed available stock';
    }
  }

  const issueDate = validateDateString(data.issueDate || data.transactionDate, 'issueDate', errors);
  if (issueDate) normalizedData.issueDate = issueDate;

  const allocationFields = ['farmActivityId', 'cropCycleId', 'livestockId', 'livestockBatchId', 'fieldId'];
  const allocationProvided = allocationFields.some((field) => !!data[field]);
  if (!allocationProvided) {
    errors.farmActivityId = 'At least one allocation target is required';
  } else {
    normalizedData.allocation = {};
    allocationFields.forEach((field) => {
      if (data[field]) normalizedData.allocation[field] = data[field];
    });
  }

  if (data.reason !== undefined) {
    if (typeof data.reason !== 'string') {
      errors.reason = 'Reason must be a string';
    } else {
      normalizedData.reason = data.reason.trim() || undefined;
    }
  }

  return { isValid: Object.keys(errors).length === 0, errors, normalizedData };
}

export function validateTransferInventoryStock(data = {}) {
  const errors = {};
  const normalizedData = {};

  if (!data.itemId || typeof data.itemId !== 'string') {
    errors.itemId = 'Item ID is required';
  } else {
    normalizedData.itemId = data.itemId;
  }

  if (!data.sourceLocationId || typeof data.sourceLocationId !== 'string') {
    errors.sourceLocationId = 'Source location ID is required';
  } else {
    normalizedData.sourceLocationId = data.sourceLocationId;
  }

  if (!data.destinationLocationId || typeof data.destinationLocationId !== 'string') {
    errors.destinationLocationId = 'Destination location ID is required';
  } else if (data.destinationLocationId === data.sourceLocationId) {
    errors.destinationLocationId = 'Destination location must be different from source location';
  } else {
    normalizedData.destinationLocationId = data.destinationLocationId;
  }

  const quantity = toDecimalNumber(data.quantity, 'quantity', errors, false, false);
  if (quantity !== undefined) normalizedData.quantity = quantity;

  const transferDate = validateDateString(data.transferDate || data.transactionDate, 'transferDate', errors);
  if (transferDate) normalizedData.transferDate = transferDate;

  return { isValid: Object.keys(errors).length === 0, errors, normalizedData };
}

export function validateAdjustInventoryStock(data = {}) {
  const errors = {};
  const normalizedData = {};

  if (!data.itemId || typeof data.itemId !== 'string') {
    errors.itemId = 'Item ID is required';
  } else {
    normalizedData.itemId = data.itemId;
  }

  if (!data.locationId || typeof data.locationId !== 'string') {
    errors.locationId = 'Location ID is required';
  } else {
    normalizedData.locationId = data.locationId;
  }

  const quantity = toDecimalNumber(data.quantity, 'quantity', errors, false, false);
  if (quantity !== undefined) {
    if (quantity === 0) {
      errors.quantity = 'Adjustment quantity must be greater than 0';
    } else {
      normalizedData.quantity = quantity;
    }
  }

  if (typeof data.reason !== 'string' || !data.reason.trim()) {
    errors.reason = 'Adjustment reason is required';
  } else {
    normalizedData.reason = data.reason.trim();
  }

  const adjustmentDate = validateDateString(data.adjustmentDate || data.transactionDate, 'adjustmentDate', errors);
  if (adjustmentDate) normalizedData.adjustmentDate = adjustmentDate;

  return { isValid: Object.keys(errors).length === 0, errors, normalizedData };
}

export function validateInventoryStatus(data = {}) {
  const errors = {};
  const normalizedData = {};

  const status = normalizeEnumValue(data.status, STOCK_STATUS_VALUES, undefined);
  if (!status) {
    errors.status = 'Status is required and must be a valid inventory status';
  } else {
    normalizedData.status = status;
  }

  return { isValid: Object.keys(errors).length === 0, errors, normalizedData };
}

export function validateExpiryThreshold(data = {}) {
  const errors = {};
  const normalizedData = {};

  const threshold = normalizeEnumValue(data.threshold, EXPIRY_ALERT_VALUES, undefined);
  if (!threshold) {
    errors.threshold = 'Threshold is required and must be one of 30_DAYS, 14_DAYS, or 7_DAYS';
  } else {
    normalizedData.threshold = threshold;
  }

  return { isValid: Object.keys(errors).length === 0, errors, normalizedData };
}

export default {
  validateCreateInventoryItem,
  validateReceiveInventoryStock,
  validateIssueInventoryStock,
  validateTransferInventoryStock,
  validateAdjustInventoryStock,
  validateInventoryStatus,
  validateExpiryThreshold,
};
