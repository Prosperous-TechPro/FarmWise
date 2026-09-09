/**
 * Livestock validation and utility helpers
 */

export const DEFAULT_PIG_GESTATION_DAYS = 114;
export const SUPPORTED_LIVESTOCK_SEXES = ['MALE', 'FEMALE', 'UNKNOWN'];
export const SUPPORTED_LIVESTOCK_STATUSES = ['ACTIVE', 'INACTIVE', 'SOLD', 'DECEASED', 'TRANSFERRED', 'CULLED', 'QUARANTINED'];
export const SUPPORTED_ACQUISITION_TYPES = ['BORN_ON_FARM', 'PURCHASED', 'TRANSFERRED_IN', 'OTHER'];

function normalizeEnumValue(value, allowedValues, fallback) {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  const upper = trimmed.toUpperCase();
  return allowedValues.includes(upper) ? upper : fallback;
}

export function calculateExpectedFarrowingDate(matingDate, gestationDays = DEFAULT_PIG_GESTATION_DAYS) {
  if (!matingDate) {
    throw new Error('Mating date is required');
  }

  const date = new Date(matingDate);
  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid mating date');
  }

  const expectedDate = new Date(date);
  expectedDate.setUTCDate(expectedDate.getUTCDate() + Number(gestationDays));

  return expectedDate;
}

export function validateCreateLivestock(data = {}) {
  const errors = {};

  const speciesId = typeof data.speciesId === 'string' ? data.speciesId.trim() : '';
  const tagNumber = typeof data.tagNumber === 'string' ? data.tagNumber.trim() : '';
  const name = typeof data.name === 'string' ? data.name.trim() : '';
  const sex = normalizeEnumValue(data.sex, SUPPORTED_LIVESTOCK_SEXES, undefined);
  const status = normalizeEnumValue(data.status, SUPPORTED_LIVESTOCK_STATUSES, 'ACTIVE');
  const acquisitionType = normalizeEnumValue(data.acquisitionType, SUPPORTED_ACQUISITION_TYPES, 'BORN_ON_FARM');

  if (!speciesId) {
    errors.speciesId = 'Species is required';
  }

  if (!tagNumber) {
    errors.tagNumber = 'Tag number is required';
  }

  if (typeof data.name !== 'undefined' && typeof data.name !== 'string') {
    errors.name = 'Name must be a string';
  }

  if (data.sex !== undefined && sex === undefined) {
    errors.sex = 'Sex must be MALE, FEMALE, or UNKNOWN';
  }

  if (data.status !== undefined && !SUPPORTED_LIVESTOCK_STATUSES.includes(String(data.status).trim().toUpperCase())) {
    errors.status = 'Status must be a valid livestock status';
  }

  if (data.acquisitionType !== undefined && acquisitionType === undefined) {
    errors.acquisitionType = 'Acquisition type is invalid';
  }

  if (data.acquisitionDate !== undefined && data.acquisitionDate !== null) {
    const date = new Date(data.acquisitionDate);
    if (Number.isNaN(date.getTime())) {
      errors.acquisitionDate = 'Acquisition date is invalid';
    }
  }

  if (data.dateOfBirth !== undefined && data.dateOfBirth !== null) {
    const date = new Date(data.dateOfBirth);
    if (Number.isNaN(date.getTime())) {
      errors.dateOfBirth = 'Date of birth is invalid';
    }
  }

  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: {},
    normalizedData: {
      speciesId,
      breedId: typeof data.breedId === 'string' && data.breedId.trim() ? data.breedId.trim() : undefined,
      tagNumber,
      name: name || undefined,
      sex: sex || undefined,
      status,
      acquisitionType,
      acquisitionDate: data.acquisitionDate ? new Date(data.acquisitionDate) : undefined,
      acquisitionSource: typeof data.acquisitionSource === 'string' ? data.acquisitionSource.trim() || undefined : undefined,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
      currentWeight: data.currentWeight !== undefined && data.currentWeight !== null ? Number(data.currentWeight) : undefined,
      weightUnit: normalizeEnumValue(data.weightUnit, ['KILOGRAM', 'GRAM', 'POUND', 'OUNCE'], 'KILOGRAM'),
      motherId: typeof data.motherId === 'string' && data.motherId.trim() ? data.motherId.trim() : undefined,
      fatherId: typeof data.fatherId === 'string' && data.fatherId.trim() ? data.fatherId.trim() : undefined,
      notes: typeof data.notes === 'string' ? data.notes.trim() || undefined : undefined,
    },
  };
}

export function validateMatingInput(data = {}) {
  const errors = {};

  if (!data.femaleAnimalId) {
    errors.femaleAnimalId = 'Female animal is required';
  }

  if (!data.maleAnimalId) {
    errors.maleAnimalId = 'Male animal is required';
  }

  if (data.femaleSex && !SUPPORTED_LIVESTOCK_SEXES.includes(String(data.femaleSex).toUpperCase())) {
    errors.femaleSex = 'Female sex must be MALE, FEMALE, or UNKNOWN';
  }

  if (data.maleSex && !SUPPORTED_LIVESTOCK_SEXES.includes(String(data.maleSex).toUpperCase())) {
    errors.maleSex = 'Male sex must be MALE, FEMALE, or UNKNOWN';
  }

  if (String(data.femaleSex || '').toUpperCase() !== 'FEMALE') {
    errors.femaleSex = errors.femaleSex || 'The female animal must be marked as FEMALE';
  }

  if (String(data.maleSex || '').toUpperCase() !== 'MALE') {
    errors.maleSex = errors.maleSex || 'The male animal must be marked as MALE';
  }

  if (!data.matingDate) {
    errors.matingDate = 'Mating date is required';
  } else {
    const date = new Date(data.matingDate);
    if (Number.isNaN(date.getTime())) {
      errors.matingDate = 'Mating date is invalid';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    normalizedData: {
      femaleAnimalId: data.femaleAnimalId,
      maleAnimalId: data.maleAnimalId,
      femaleSex: String(data.femaleSex || '').toUpperCase(),
      maleSex: String(data.maleSex || '').toUpperCase(),
      matingDate: data.matingDate,
      expectedFarrowingDate: data.matingDate ? calculateExpectedFarrowingDate(data.matingDate) : null,
    },
  };
}

function validateRequiredDate(value, fieldName, errors, allowFuture = true) {
  if (!value) {
    errors[fieldName] = `${fieldName} is required`;
    return undefined;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    errors[fieldName] = `${fieldName} is invalid`;
    return undefined;
  }
  if (!allowFuture && date > new Date()) errors[fieldName] = `${fieldName} cannot be in the future`;
  return date;
}

function validateOptionalDate(value, fieldName, errors) {
  if (value === undefined || value === null || value === '') return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) errors[fieldName] = `${fieldName} is invalid`;
  return date;
}

function validatePositiveNumber(value, fieldName, errors, required = true) {
  if (value === undefined || value === null || value === '') {
    if (required) errors[fieldName] = `${fieldName} is required`;
    return undefined;
  }
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) errors[fieldName] = `${fieldName} must be greater than 0`;
  return number;
}

function validateText(value, fieldName, errors, required = true) {
  if (value === undefined || value === null || value === '') {
    if (required) errors[fieldName] = `${fieldName} is required`;
    return undefined;
  }
  if (typeof value !== 'string' || !value.trim()) errors[fieldName] = `${fieldName} must be a non-empty string`;
  return typeof value === 'string' ? value.trim() : undefined;
}

export function validateLivestockEvent(data = {}) {
  const errors = {};
  const eventTypes = ['BIRTH', 'ACQUISITION', 'WEIGHT_MEASUREMENT', 'FEEDING', 'VACCINATION', 'MEDICATION', 'TREATMENT', 'MATING', 'PREGNANCY', 'FARROWING', 'MORTALITY', 'SALE', 'TRANSFER', 'OTHER'];
  const eventType = String(data.eventType || '').trim().toUpperCase();
  const eventDate = validateRequiredDate(data.eventDate, 'eventDate', errors, false);
  if (!eventTypes.includes(eventType)) errors.eventType = 'eventType is invalid';
  const description = validateText(data.description, 'description', errors, false);
  return { isValid: Object.keys(errors).length === 0, errors, normalizedData: { eventType, eventDate, description, details: data.details === undefined ? undefined : JSON.stringify(data.details) } };
}

export function validateLivestockWeight(data = {}) {
  const errors = {};
  const measurementDate = validateRequiredDate(data.measurementDate, 'measurementDate', errors, false);
  const weight = validatePositiveNumber(data.weight, 'weight', errors);
  const units = ['KILOGRAM', 'GRAM', 'POUND', 'OUNCE'];
  const unit = String(data.unit || 'KILOGRAM').trim().toUpperCase();
  if (!units.includes(unit)) errors.unit = 'unit is invalid';
  return { isValid: Object.keys(errors).length === 0, errors, normalizedData: { weight, unit, measurementDate, measurementTime: validateOptionalDate(data.measurementTime, 'measurementTime', errors), recordedBy: validateText(data.recordedBy, 'recordedBy', errors, false), notes: validateText(data.notes, 'notes', errors, false) } };
}

export function validateLivestockHealth(data = {}) {
  const errors = {};
  const recordTypes = ['OBSERVATION', 'VACCINATION', 'MEDICATION', 'TREATMENT', 'DIAGNOSIS', 'SYMPTOM'];
  const recordType = String(data.recordType || '').trim().toUpperCase();
  const title = validateText(data.title, 'title', errors);
  const eventDate = validateRequiredDate(data.eventDate, 'eventDate', errors, false);
  if (!recordTypes.includes(recordType)) errors.recordType = 'recordType is invalid';
  return { isValid: Object.keys(errors).length === 0, errors, normalizedData: { recordType, title, description: validateText(data.description, 'description', errors, false), veterinarian: validateText(data.veterinarian, 'veterinarian', errors, false), medication: validateText(data.medication, 'medication', errors, false), dosage: validateText(data.dosage, 'dosage', errors, false), followUpDate: validateOptionalDate(data.followUpDate, 'followUpDate', errors), eventDate } };
}

export function validateLivestockTreatment(data = {}) {
  const errors = {};
  const treatmentName = validateText(data.treatmentName, 'treatmentName', errors);
  const startDate = validateOptionalDate(data.startDate, 'startDate', errors);
  const endDate = validateOptionalDate(data.endDate, 'endDate', errors);
  if (startDate && endDate && endDate < startDate) errors.endDate = 'endDate cannot be before startDate';
  return { isValid: Object.keys(errors).length === 0, errors, normalizedData: { treatmentName, reason: validateText(data.reason, 'reason', errors, false), startDate, endDate, dosage: validateText(data.dosage, 'dosage', errors, false), unit: validateText(data.unit, 'unit', errors, false), administeredBy: validateText(data.administeredBy, 'administeredBy', errors, false), followUpDate: validateOptionalDate(data.followUpDate, 'followUpDate', errors), notes: validateText(data.notes, 'notes', errors, false) } };
}

export function validateLivestockVaccination(data = {}) {
  const errors = {};
  const vaccineName = validateText(data.vaccineName, 'vaccineName', errors);
  const dateAdministered = validateRequiredDate(data.dateAdministered, 'dateAdministered', errors, false);
  const nextDueDate = validateOptionalDate(data.nextDueDate, 'nextDueDate', errors);
  if (dateAdministered && nextDueDate && nextDueDate < dateAdministered) errors.nextDueDate = 'nextDueDate cannot be before dateAdministered';
  return { isValid: Object.keys(errors).length === 0, errors, normalizedData: { vaccineName, dateAdministered, dose: validateText(data.dose, 'dose', errors, false), route: validateText(data.route, 'route', errors, false), nextDueDate, administeredBy: validateText(data.administeredBy, 'administeredBy', errors, false), notes: validateText(data.notes, 'notes', errors, false) } };
}

export function validateLivestockFeeding(data = {}) {
  const errors = {};
  const feedType = validateText(data.feedType, 'feedType', errors);
  const feedingDate = validateRequiredDate(data.feedingDate, 'feedingDate', errors, false);
  const quantity = validatePositiveNumber(data.quantity, 'quantity', errors);
  const units = ['KILOGRAM', 'GRAM', 'LITER', 'MILLILITER', 'BAG', 'PIECE', 'BUNCH', 'BASKET', 'OTHER'];
  const quantityUnit = String(data.quantityUnit || '').trim().toUpperCase();
  if (!units.includes(quantityUnit)) errors.quantityUnit = 'quantityUnit is invalid';
  const cost = data.cost === undefined || data.cost === null || data.cost === '' ? undefined : Number(data.cost);
  if (cost !== undefined && (!Number.isFinite(cost) || cost < 0)) errors.cost = 'cost cannot be negative';
  const currencies = ['GHS', 'USD', 'EUR'];
  const currency = String(data.currency || 'GHS').trim().toUpperCase();
  if (!currencies.includes(currency)) errors.currency = 'currency is invalid';
  return { isValid: Object.keys(errors).length === 0, errors, normalizedData: { feedType, quantity, quantityUnit, feedingDate, feedingTime: validateOptionalDate(data.feedingTime, 'feedingTime', errors), cost, currency, recordedBy: validateText(data.recordedBy, 'recordedBy', errors, false), notes: validateText(data.notes, 'notes', errors, false) } };
}

export default {
  DEFAULT_PIG_GESTATION_DAYS,
  SUPPORTED_LIVESTOCK_SEXES,
  SUPPORTED_LIVESTOCK_STATUSES,
  SUPPORTED_ACQUISITION_TYPES,
  calculateExpectedFarrowingDate,
  validateCreateLivestock,
  validateMatingInput,
  validateLivestockEvent,
  validateLivestockWeight,
  validateLivestockHealth,
  validateLivestockTreatment,
  validateLivestockVaccination,
  validateLivestockFeeding,
};
