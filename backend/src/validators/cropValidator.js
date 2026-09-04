const CROP_CYCLE_STATUS_VALUES = [
  'PLANNED',
  'LAND_PREPARATION',
  'PLANTED',
  'GROWING',
  'HARVESTING',
  'HARVESTED',
  'COMPLETED',
  'ABANDONED',
  'CANCELLED',
  'ARCHIVED',
];

const CROP_ACTIVITY_TYPES = [
  'LAND_PREPARATION',
  'PLANTING',
  'WEEDING',
  'FERTILIZATION',
  'IRRIGATION',
  'PEST_CONTROL',
  'DISEASE_CONTROL',
  'PRUNING',
  'THINNING',
  'MULCHING',
  'EARTHING_UP',
  'RIDGING',
  'HARVESTING',
  'OTHER',
];

const INPUT_CATEGORIES = [
  'SEED',
  'PLANTING_MATERIAL',
  'FERTILIZER',
  'HERBICIDE',
  'PESTICIDE',
  'FUNGICIDE',
  'MANURE',
  'COMPOST',
  'OTHER',
];

const OBSERVATION_SEVERITY = ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'];
const AREA_UNITS = ['ACRE', 'HECTARE', 'SQUARE_METER', 'SQUARE_KILOMETER'];
const QUANTITY_UNITS = ['KG', 'GRAM', 'LITER', 'MILLILITER', 'BAG', 'PIECE', 'BUNCH', 'BASKET', 'OTHER'];
const HARVEST_UNITS = ['KG', 'GRAM', 'BAG', 'BUNCH', 'PIECE', 'OTHER'];

function normalizeEnumValue(value, allowedValues, fallback) {
  if (typeof value !== 'string') return fallback;
  const normalized = value.trim().toUpperCase();
  if (!normalized) return fallback;
  return allowedValues.includes(normalized) ? normalized : fallback;
}

function toDecimalNumber(value, fieldName, errors) {
  const num = Number(value);
  if (Number.isNaN(num)) {
    errors[fieldName] = `${fieldName} must be a valid number`;
    return undefined;
  }
  return num;
}

function validateDateString(dateValue, fieldName, errors, allowNull = false) {
  if (dateValue === undefined || dateValue === null || dateValue === '') {
    if (allowNull) return undefined;
    errors[fieldName] = `${fieldName} is required`;
    return undefined;
  }

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    errors[fieldName] = `${fieldName} must be a valid date`;
    return undefined;
  }

  return date;
}

export function validateCreateCropCycle(data = {}) {
  const errors = {};
  const normalizedData = {};

  if (!data.fieldId) errors.fieldId = 'Field ID is required';
  if (!data.cropId) errors.cropId = 'Crop ID is required';

  if (data.cycleName !== undefined) {
    if (typeof data.cycleName !== 'string') errors.cycleName = 'Cycle name must be a string';
    else {
      const cycleName = data.cycleName.trim();
      if (!cycleName) errors.cycleName = 'Cycle name is required';
      else normalizedData.cycleName = cycleName;
    }
  }

  const season = normalizeEnumValue(data.season, ['MAIN', 'OFF_SEASON', 'SECONDARY', 'OTHER'], 'OTHER');
  if (data.season !== undefined && season === 'OTHER' && data.season && String(data.season).trim().toUpperCase() !== 'OTHER') {
    errors.season = 'Season must be MAIN, OFF_SEASON, SECONDARY, or OTHER';
  } else if (data.season !== undefined) {
    normalizedData.season = season;
  }

  if (data.area !== undefined) {
    const areaValue = toDecimalNumber(data.area, 'area', errors);
    if (areaValue !== undefined && areaValue <= 0) errors.area = 'Area must be greater than 0';
    else if (areaValue !== undefined) normalizedData.area = areaValue;
  } else {
    errors.area = 'Area is required';
  }

  if (data.areaUnit !== undefined) {
    const areaUnit = normalizeEnumValue(data.areaUnit, AREA_UNITS, undefined);
    if (areaUnit === undefined) errors.areaUnit = 'Area unit must be one of ACRE, HECTARE, SQUARE_METER, or SQUARE_KILOMETER';
    else normalizedData.areaUnit = areaUnit;
  } else {
    normalizedData.areaUnit = 'HECTARE';
  }

  const status = normalizeEnumValue(data.status, CROP_CYCLE_STATUS_VALUES, 'PLANNED');
  if (data.status !== undefined && status === 'PLANNED' && String(data.status).trim().toUpperCase() !== 'PLANNED') {
    errors.status = 'Status must be one of PLANNED, LAND_PREPARATION, PLANTED, GROWING, HARVESTING, COMPLETED, ABANDONED, or CANCELLED';
  } else if (data.status !== undefined || !('status' in data)) {
    normalizedData.status = status;
  }

  const plantingDate = validateDateString(data.plantingDate, 'plantingDate', errors, false);
  if (plantingDate) normalizedData.plantingDate = plantingDate;

  if (data.expectedHarvestDate !== undefined && data.expectedHarvestDate !== null && data.expectedHarvestDate !== '') {
    const expectedDate = validateDateString(data.expectedHarvestDate, 'expectedHarvestDate', errors, true);
    if (expectedDate) normalizedData.expectedHarvestDate = expectedDate;
  }

  if (data.actualHarvestDate !== undefined && data.actualHarvestDate !== null && data.actualHarvestDate !== '') {
    const actualDate = validateDateString(data.actualHarvestDate, 'actualHarvestDate', errors, true);
    if (actualDate) normalizedData.actualHarvestDate = actualDate;
  }

  if (normalizedData.expectedHarvestDate && normalizedData.plantingDate && normalizedData.expectedHarvestDate < normalizedData.plantingDate) {
    errors.expectedHarvestDate = 'Expected harvest date cannot be before planting date';
  }

  if (normalizedData.actualHarvestDate && normalizedData.plantingDate && normalizedData.actualHarvestDate < normalizedData.plantingDate) {
    errors.actualHarvestDate = 'Actual harvest date cannot be before planting date';
  }

  if (data.notes !== undefined && typeof data.notes !== 'string') {
    errors.notes = 'Notes must be a string';
  } else if (typeof data.notes === 'string') {
    normalizedData.notes = data.notes.trim() || undefined;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    normalizedData,
  };
}

export function validateCreateCropActivity(data = {}) {
  const errors = {};
  const normalizedData = {};

  if (!data.cropCycleId) errors.cropCycleId = 'Crop cycle ID is required';
  if (!data.activityDate) errors.activityDate = 'Activity date is required';

  const activityType = normalizeEnumValue(data.activityType, CROP_ACTIVITY_TYPES, undefined);
  if (activityType === undefined) {
    errors.activityType = 'Activity type must be one of LAND_PREPARATION, PLANTING, WEEDING, FERTILIZATION, IRRIGATION, PEST_CONTROL, DISEASE_CONTROL, PRUNING, THINNING, MULCHING, EARTHING_UP, RIDGING, HARVESTING, or OTHER';
  } else {
    normalizedData.activityType = activityType;
  }

  if (data.description !== undefined) {
    if (typeof data.description !== 'string') errors.description = 'Description must be a string';
    else {
      const description = data.description.trim();
      if (!description) errors.description = 'Description is required';
      else normalizedData.description = description;
    }
  }

  const activityDate = validateDateString(data.activityDate, 'activityDate', errors, false);
  if (activityDate) normalizedData.activityDate = activityDate;

  if (data.activityTime !== undefined && data.activityTime !== null && data.activityTime !== '') {
    const timeValue = new Date(data.activityTime);
    if (Number.isNaN(timeValue.getTime())) errors.activityTime = 'Activity time must be a valid date-time value';
    else normalizedData.activityTime = timeValue;
  }

  if (data.quantity !== undefined) {
    const quantityValue = toDecimalNumber(data.quantity, 'quantity', errors);
    if (quantityValue !== undefined && quantityValue <= 0) errors.quantity = 'Quantity must be greater than 0';
    else if (quantityValue !== undefined) normalizedData.quantity = quantityValue;
  }

  if (data.unit !== undefined) {
    const unit = normalizeEnumValue(data.unit, QUANTITY_UNITS, undefined);
    if (unit === undefined) errors.unit = 'Unit must be one of KG, GRAM, LITER, MILLILITER, BAG, PIECE, BUNCH, BASKET, or OTHER';
    else normalizedData.unit = unit;
  }

  return { isValid: Object.keys(errors).length === 0, errors, normalizedData };
}

export function validateCreateCropInput(data = {}) {
  const errors = {};
  const normalizedData = {};

  if (!data.cropCycleId) errors.cropCycleId = 'Crop cycle ID is required';
  if (!data.inputType) errors.inputType = 'Input type is required';
  if (!data.inputName) errors.inputName = 'Input name is required';

  const inputType = normalizeEnumValue(data.inputType, INPUT_CATEGORIES, undefined);
  if (inputType === undefined) {
    errors.inputType = 'Input type must be one of SEED, PLANTING_MATERIAL, FERTILIZER, HERBICIDE, PESTICIDE, FUNGICIDE, MANURE, COMPOST, or OTHER';
  } else {
    normalizedData.inputType = inputType;
  }

  if (typeof data.inputName === 'string') normalizedData.inputName = data.inputName.trim();
  else errors.inputName = 'Input name must be a string';

  if (data.quantity !== undefined) {
    const quantityValue = toDecimalNumber(data.quantity, 'quantity', errors);
    if (quantityValue !== undefined && quantityValue <= 0) errors.quantity = 'Quantity must be greater than 0';
    else if (quantityValue !== undefined) normalizedData.quantity = quantityValue;
  } else {
    errors.quantity = 'Quantity is required';
  }

  if (data.unit !== undefined) {
    const unit = normalizeEnumValue(data.unit, QUANTITY_UNITS, undefined);
    if (unit === undefined) errors.unit = 'Unit must be one of KG, GRAM, LITER, MILLILITER, BAG, PIECE, BUNCH, BASKET, or OTHER';
    else normalizedData.unit = unit;
  } else {
    errors.unit = 'Unit is required';
  }

  const applicationDate = validateDateString(data.applicationDate, 'applicationDate', errors, false);
  if (applicationDate) normalizedData.applicationDate = applicationDate;

  if (data.applicationTime !== undefined && data.applicationTime !== null && data.applicationTime !== '') {
    const timeValue = new Date(data.applicationTime);
    if (Number.isNaN(timeValue.getTime())) errors.applicationTime = 'Application time must be a valid date-time value';
    else normalizedData.applicationTime = timeValue;
  }

  return { isValid: Object.keys(errors).length === 0, errors, normalizedData };
}

export function validateCreateCropObservation(data = {}) {
  const errors = {};
  const normalizedData = {};

  if (!data.cropCycleId) errors.cropCycleId = 'Crop cycle ID is required';
  const observationDate = validateDateString(data.observationDate, 'observationDate', errors, false);
  if (observationDate) normalizedData.observationDate = observationDate;

  if (data.observation !== undefined) {
    if (typeof data.observation !== 'string') errors.observation = 'Observation must be a string';
    else {
      const observation = data.observation.trim();
      if (!observation) errors.observation = 'Observation is required';
      else normalizedData.observation = observation;
    }
  } else {
    errors.observation = 'Observation is required';
  }

  const severity = normalizeEnumValue(data.severity, OBSERVATION_SEVERITY, undefined);
  if (severity === undefined) {
    errors.severity = 'Severity must be LOW, MODERATE, HIGH, or CRITICAL';
  } else {
    normalizedData.severity = severity;
  }

  if (data.notes !== undefined && typeof data.notes !== 'string') errors.notes = 'Notes must be a string';
  else if (typeof data.notes === 'string') normalizedData.notes = data.notes.trim() || undefined;

  return { isValid: Object.keys(errors).length === 0, errors, normalizedData };
}

export function validateCreateHarvest(data = {}) {
  const errors = {};
  const normalizedData = {};

  if (!data.cropCycleId) errors.cropCycleId = 'Crop cycle ID is required';

  const harvestDate = validateDateString(data.harvestDate, 'harvestDate', errors, false);
  if (harvestDate) normalizedData.harvestDate = harvestDate;

  if (data.quantity !== undefined) {
    const quantityValue = toDecimalNumber(data.quantity, 'quantity', errors);
    if (quantityValue !== undefined && quantityValue <= 0) errors.quantity = 'Quantity must be greater than 0';
    else if (quantityValue !== undefined) normalizedData.quantity = quantityValue;
  } else {
    errors.quantity = 'Quantity is required';
  }

  if (data.unit !== undefined) {
    const unit = normalizeEnumValue(data.unit, HARVEST_UNITS, undefined);
    if (unit === undefined) errors.unit = 'Unit must be one of KG, GRAM, BAG, BUNCH, PIECE, or OTHER';
    else normalizedData.unit = unit;
  } else {
    errors.unit = 'Unit is required';
  }

  if (data.plantingDate) {
    const plantingDate = new Date(data.plantingDate);
    const harvestDateValue = normalizedData.harvestDate;
    if (harvestDateValue && plantingDate && harvestDateValue < plantingDate) {
      errors.harvestDate = 'Harvest date must be after planting date';
    }
  }

  return { isValid: Object.keys(errors).length === 0, errors, normalizedData };
}

export default {
  validateCreateCropCycle,
  validateCreateCropActivity,
  validateCreateCropInput,
  validateCreateCropObservation,
  validateCreateHarvest,
};
