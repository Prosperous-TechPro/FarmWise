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

export default {
  DEFAULT_PIG_GESTATION_DAYS,
  SUPPORTED_LIVESTOCK_SEXES,
  SUPPORTED_LIVESTOCK_STATUSES,
  SUPPORTED_ACQUISITION_TYPES,
  calculateExpectedFarrowingDate,
  validateCreateLivestock,
  validateMatingInput,
};
