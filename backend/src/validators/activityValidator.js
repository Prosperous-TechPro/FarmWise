const ACTIVITY_STATUS_VALUES = ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'OVERDUE'];
const ACTIVITY_PRIORITY_VALUES = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];
const ACTIVITY_CATEGORY_VALUES = ['PLANTING', 'WEEDING', 'FERTILIZING', 'SPRAYING', 'WATERING', 'HARVESTING', 'FEEDING', 'VACCINATION', 'TREATMENT', 'MAINTENANCE', 'INSPECTION', 'OTHER'];
const OBSERVATION_CATEGORY_VALUES = ['HEALTH', 'CROP', 'LAND', 'WATERING', 'FEEDING', 'SECURITY', 'WEATHER', 'OTHER'];
const OBSERVATION_SEVERITY_VALUES = ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'];
const TASK_STATUS_VALUES = ['TODO', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED', 'CANCELLED'];
const TASK_PRIORITY_VALUES = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];
const QUANTITY_UNIT_VALUES = ['KG', 'GRAM', 'LITER', 'MILLILITER', 'BAG', 'PIECE', 'BUNCH', 'BASKET', 'OTHER'];

function normalizeEnumValue(value, allowedValues, fallback) {
  if (typeof value !== 'string') return fallback;
  const normalized = value.trim().toUpperCase();
  if (!normalized) return fallback;
  return allowedValues.includes(normalized) ? normalized : fallback;
}

function toDecimalNumber(value, fieldName, errors, allowZero = true) {
  if (value === undefined || value === null || value === '') return undefined;
  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) {
    errors[fieldName] = `${fieldName} must be a valid number`;
    return undefined;
  }
  if (!allowZero && numericValue <= 0) {
    errors[fieldName] = `${fieldName} must be greater than 0`;
    return undefined;
  }
  if (numericValue < 0) {
    errors[fieldName] = `${fieldName} cannot be negative`;
    return undefined;
  }
  return numericValue;
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

export function validateCreateActivityType(data = {}) {
  const errors = {};
  const normalizedData = {};

  if (typeof data.name !== 'string' || !data.name.trim()) {
    errors.name = 'Activity type name is required';
  } else {
    normalizedData.name = data.name.trim();
  }

  const category = normalizeEnumValue(data.category, ACTIVITY_CATEGORY_VALUES, undefined);
  if (!category) {
    errors.category = 'Category is required and must be a valid farm activity category';
  } else {
    normalizedData.category = category;
  }

  if (data.description !== undefined) {
    if (typeof data.description !== 'string') {
      errors.description = 'Description must be a string';
    } else {
      normalizedData.description = data.description.trim() || undefined;
    }
  }

  if (data.isActive !== undefined && typeof data.isActive !== 'boolean') {
    errors.isActive = 'isActive must be a boolean';
  } else if (data.isActive !== undefined) {
    normalizedData.isActive = data.isActive;
  }

  return { isValid: Object.keys(errors).length === 0, errors, normalizedData };
}

export function validateCreateActivity(data = {}) {
  const errors = {};
  const normalizedData = {};

  if (typeof data.title !== 'string' || !data.title.trim()) {
    errors.title = 'Title is required';
  } else {
    normalizedData.title = data.title.trim();
  }

  if (typeof data.description !== 'string' || !data.description.trim()) {
    errors.description = 'Description is required';
  } else {
    normalizedData.description = data.description.trim();
  }

  const category = normalizeEnumValue(data.category, ACTIVITY_CATEGORY_VALUES, undefined);
  if (!category) {
    errors.category = 'Category is required and must be a valid activity category';
  } else {
    normalizedData.category = category;
  }

  const status = normalizeEnumValue(data.status, ACTIVITY_STATUS_VALUES, undefined);
  if (status === undefined) {
    errors.status = 'Status must be a valid activity status';
  } else {
    normalizedData.status = status;
  }

  const priority = normalizeEnumValue(data.priority, ACTIVITY_PRIORITY_VALUES, 'NORMAL');
  normalizedData.priority = priority;

  const baseActivityDate = data.activityDate ?? data.scheduledDate ?? new Date();
  const activityDate = validateDateString(baseActivityDate, 'activityDate', errors, true);
  if (activityDate) normalizedData.activityDate = activityDate;

  if (data.scheduledDate !== undefined && data.scheduledDate !== null && data.scheduledDate !== '') {
    const scheduledDate = validateDateString(data.scheduledDate, 'scheduledDate', errors, false);
    if (scheduledDate) normalizedData.scheduledDate = scheduledDate;
  }

  if (data.scheduledTime !== undefined && data.scheduledTime !== null && data.scheduledTime !== '') {
    const scheduledTime = new Date(data.scheduledTime);
    if (Number.isNaN(scheduledTime.getTime())) {
      errors.scheduledTime = 'scheduledTime must be a valid date-time';
    } else {
      normalizedData.scheduledTime = scheduledTime;
    }
  }

  if (data.activityTypeId !== undefined && data.activityTypeId !== null && data.activityTypeId !== '') {
    if (typeof data.activityTypeId !== 'string') {
      errors.activityTypeId = 'activityTypeId must be a string';
    } else {
      normalizedData.activityTypeId = data.activityTypeId;
    }
  }

  if (data.assigneeId !== undefined && data.assigneeId !== null && data.assigneeId !== '') {
    if (typeof data.assigneeId !== 'string') {
      errors.assigneeId = 'assigneeId must be a string';
    } else {
      normalizedData.assigneeId = data.assigneeId;
    }
  }

  if (data.fieldId !== undefined && data.fieldId !== null && data.fieldId !== '') {
    if (typeof data.fieldId !== 'string') {
      errors.fieldId = 'fieldId must be a string';
    } else {
      normalizedData.fieldId = data.fieldId;
    }
  }

  if (data.livestockId !== undefined && data.livestockId !== null && data.livestockId !== '') {
    if (typeof data.livestockId !== 'string') {
      errors.livestockId = 'livestockId must be a string';
    } else {
      normalizedData.livestockId = data.livestockId;
    }
  }

  if (data.cropCycleId !== undefined && data.cropCycleId !== null && data.cropCycleId !== '') {
    if (typeof data.cropCycleId !== 'string') {
      errors.cropCycleId = 'cropCycleId must be a string';
    } else {
      normalizedData.cropCycleId = data.cropCycleId;
    }
  }

  const quantity = toDecimalNumber(data.quantity, 'quantity', errors, true);
  if (quantity !== undefined) normalizedData.quantity = quantity;

  const cost = toDecimalNumber(data.cost, 'cost', errors, true);
  if (cost !== undefined) normalizedData.cost = cost;

  const quantityUnit = normalizeEnumValue(data.quantityUnit, QUANTITY_UNIT_VALUES, undefined);
  if (data.quantityUnit !== undefined && data.quantityUnit !== null && data.quantityUnit !== '' && quantityUnit === undefined) {
    errors.quantityUnit = 'quantityUnit must be a valid quantity unit';
  } else if (quantityUnit) {
    normalizedData.quantityUnit = quantityUnit;
  }

  if (data.notes !== undefined) {
    if (typeof data.notes !== 'string') {
      errors.notes = 'Notes must be a string';
    } else {
      normalizedData.notes = data.notes.trim() || undefined;
    }
  }

  if (data.mediaReferences !== undefined) {
    if (typeof data.mediaReferences !== 'string') {
      errors.mediaReferences = 'mediaReferences must be a JSON string or text value';
    } else {
      normalizedData.mediaReferences = data.mediaReferences.trim() || undefined;
    }
  }

  return { isValid: Object.keys(errors).length === 0, errors, normalizedData };
}

export function validateActivityStatusTransition(currentStatus, nextStatus) {
  const errors = {};
  const allowed = {
    PLANNED: ['IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
    IN_PROGRESS: ['COMPLETED', 'CANCELLED', 'OVERDUE'],
    COMPLETED: ['COMPLETED'],
    CANCELLED: ['CANCELLED'],
    OVERDUE: ['IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
  };

  const current = normalizeEnumValue(currentStatus, ACTIVITY_STATUS_VALUES, undefined);
  const next = normalizeEnumValue(nextStatus, ACTIVITY_STATUS_VALUES, undefined);

  if (!current || !next) {
    errors.transition = 'Current and next activity status must be valid values';
    return { isValid: false, errors };
  }

  if (!allowed[current]?.includes(next)) {
    errors.transition = `Status transition from ${current} to ${next} is not allowed`;
    return { isValid: false, errors };
  }

  return { isValid: true, errors: {}, normalizedData: { currentStatus: current, nextStatus: next } };
}

export function validateCreateObservation(data = {}) {
  const errors = {};
  const normalizedData = {};

  const category = normalizeEnumValue(data.category, OBSERVATION_CATEGORY_VALUES, undefined);
  if (!category) {
    errors.category = 'Observation category is required';
  } else {
    normalizedData.category = category;
  }

  const severity = normalizeEnumValue(data.severity, OBSERVATION_SEVERITY_VALUES, 'MODERATE');
  normalizedData.severity = severity;

  if (typeof data.description !== 'string' || !data.description.trim()) {
    errors.description = 'Description is required';
  } else {
    normalizedData.description = data.description.trim();
  }

  if (data.observedBy !== undefined && data.observedBy !== null && data.observedBy !== '') {
    if (typeof data.observedBy !== 'string') {
      errors.observedBy = 'observedBy must be a string';
    } else {
      normalizedData.observedBy = data.observedBy;
    }
  }

  if (data.observedAt !== undefined && data.observedAt !== null && data.observedAt !== '') {
    const observedAt = validateDateString(data.observedAt, 'observedAt', errors, false);
    if (observedAt) normalizedData.observedAt = observedAt;
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

export function validateCreateTask(data = {}) {
  const errors = {};
  const normalizedData = {};

  if (typeof data.title !== 'string' || !data.title.trim()) {
    errors.title = 'Task title is required';
  } else {
    normalizedData.title = data.title.trim();
  }

  if (data.description !== undefined) {
    if (typeof data.description !== 'string') {
      errors.description = 'Description must be a string';
    } else {
      normalizedData.description = data.description.trim() || undefined;
    }
  }

  const status = normalizeEnumValue(data.status, TASK_STATUS_VALUES, 'TODO');
  normalizedData.status = status;

  const priority = normalizeEnumValue(data.priority, TASK_PRIORITY_VALUES, 'NORMAL');
  normalizedData.priority = priority;

  if (data.assigneeId !== undefined && data.assigneeId !== null && data.assigneeId !== '') {
    if (typeof data.assigneeId !== 'string') {
      errors.assigneeId = 'assigneeId must be a string';
    } else {
      normalizedData.assigneeId = data.assigneeId;
    }
  }

  if (data.dueDate !== undefined && data.dueDate !== null && data.dueDate !== '') {
    const dueDate = validateDateString(data.dueDate, 'dueDate', errors, false);
    if (dueDate) normalizedData.dueDate = dueDate;
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

export function validateCreateProductionRecord(data = {}) {
  const errors = {};
  const normalizedData = {};

  if (typeof data.product !== 'string' || !data.product.trim()) {
    errors.product = 'Product is required';
  } else {
    normalizedData.product = data.product.trim();
  }

  const quantity = toDecimalNumber(data.quantity, 'quantity', errors, false);
  if (quantity !== undefined) normalizedData.quantity = quantity;

  const unit = normalizeEnumValue(data.quantityUnit, QUANTITY_UNIT_VALUES, undefined);
  if (!unit) {
    errors.quantityUnit = 'quantityUnit is required and must be a valid unit';
  } else {
    normalizedData.quantityUnit = unit;
  }

  const productionDate = validateDateString(data.productionDate, 'productionDate', errors, true);
  if (productionDate) normalizedData.productionDate = productionDate;

  if (data.cropCycleId !== undefined && data.cropCycleId !== null && data.cropCycleId !== '') {
    if (typeof data.cropCycleId !== 'string') {
      errors.cropCycleId = 'cropCycleId must be a string';
    } else {
      normalizedData.cropCycleId = data.cropCycleId;
    }
  }

  if (data.livestockId !== undefined && data.livestockId !== null && data.livestockId !== '') {
    if (typeof data.livestockId !== 'string') {
      errors.livestockId = 'livestockId must be a string';
    } else {
      normalizedData.livestockId = data.livestockId;
    }
  }

  if (data.grade !== undefined) {
    if (typeof data.grade !== 'string') {
      errors.grade = 'grade must be a string';
    } else {
      normalizedData.grade = data.grade.trim() || undefined;
    }
  }

  if (data.quality !== undefined) {
    if (typeof data.quality !== 'string') {
      errors.quality = 'quality must be a string';
    } else {
      normalizedData.quality = data.quality.trim() || undefined;
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

export default {
  validateCreateActivityType,
  validateCreateActivity,
  validateActivityStatusTransition,
  validateCreateObservation,
  validateCreateTask,
  validateCreateProductionRecord,
};
