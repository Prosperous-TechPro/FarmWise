/**
 * Farm and Field validation utilities
 */

const FARM_STATUS_VALUES = ['ACTIVE', 'INACTIVE', 'ARCHIVED'];
const FIELD_STATUS_VALUES = ['ACTIVE', 'INACTIVE', 'ARCHIVED'];
const AREA_UNITS = ['ACRE', 'HECTARE', 'SQUARE_METER', 'SQUARE_KILOMETER'];

function normalizeEnumValue(value, allowedValues, fallback) {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  const upper = trimmed.toUpperCase();
  return allowedValues.includes(upper) ? upper : fallback;
}

export function validateCreateFarm(data = {}) {
  const errors = {};

  if (Object.prototype.hasOwnProperty.call(data, 'ownerId')) {
    errors.ownerId = 'Farm owner is managed by the system and cannot be set by the client';
  }

  if (Object.prototype.hasOwnProperty.call(data, 'id')) {
    errors.id = 'Farm id is immutable and managed by the system';
  }

  const name = typeof data.name === 'string' ? data.name.trim() : '';
  if (!name) {
    errors.name = 'Farm name is required';
  } else if (name.length > 255) {
    errors.name = 'Farm name must not exceed 255 characters';
  }

  const description = typeof data.description === 'string' ? data.description.trim() : '';
  const region = typeof data.region === 'string' ? data.region.trim() : '';
  const district = typeof data.district === 'string' ? data.district.trim() : '';
  const country = typeof data.country === 'string' ? data.country.trim() : '';
  const status = normalizeEnumValue(data.status, FARM_STATUS_VALUES, 'ACTIVE');

  if (data.description !== undefined && typeof data.description !== 'string') {
    errors.description = 'Description must be a string';
  }

  if (data.region !== undefined && typeof data.region !== 'string') {
    errors.region = 'Region must be a string';
  }

  if (data.district !== undefined && typeof data.district !== 'string') {
    errors.district = 'District must be a string';
  }

  if (data.country !== undefined && typeof data.country !== 'string') {
    errors.country = 'Country must be a string';
  }

  if (data.status !== undefined && !FARM_STATUS_VALUES.includes(String(data.status).trim().toUpperCase())) {
    errors.status = 'Status must be ACTIVE, INACTIVE, or ARCHIVED';
  }

  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: {},
    normalizedData: {
      name,
      description: description || undefined,
      region: region || undefined,
      district: district || undefined,
      country: country || undefined,
      status,
    },
  };
}

export function validateUpdateFarm(data = {}) {
  const errors = {};
  const normalizedData = {};

  if (Object.prototype.hasOwnProperty.call(data, 'ownerId')) {
    errors.ownerId = 'Farm owner is managed by the system and cannot be set by the client';
  }

  if (Object.prototype.hasOwnProperty.call(data, 'id')) {
    errors.id = 'Farm id is immutable and managed by the system';
  }

  if (Object.prototype.hasOwnProperty.call(data, 'createdAt')) {
    errors.createdAt = 'Farm creation timestamp is immutable';
  }

  if (data.name !== undefined) {
    if (typeof data.name !== 'string') {
      errors.name = 'Farm name must be a string';
    } else {
      const name = data.name.trim();
      if (!name) {
        errors.name = 'Farm name is required';
      } else if (name.length > 255) {
        errors.name = 'Farm name must not exceed 255 characters';
      } else {
        normalizedData.name = name;
      }
    }
  }

  if (data.description !== undefined) {
    if (typeof data.description !== 'string') {
      errors.description = 'Description must be a string';
    } else {
      const description = data.description.trim();
      normalizedData.description = description || undefined;
    }
  }

  if (data.region !== undefined) {
    if (typeof data.region !== 'string') {
      errors.region = 'Region must be a string';
    } else {
      normalizedData.region = data.region.trim() || undefined;
    }
  }

  if (data.district !== undefined) {
    if (typeof data.district !== 'string') {
      errors.district = 'District must be a string';
    } else {
      normalizedData.district = data.district.trim() || undefined;
    }
  }

  if (data.country !== undefined) {
    if (typeof data.country !== 'string') {
      errors.country = 'Country must be a string';
    } else {
      normalizedData.country = data.country.trim() || undefined;
    }
  }

  if (data.status !== undefined) {
    const status = normalizeEnumValue(data.status, FARM_STATUS_VALUES, undefined);
    if (status === undefined) {
      errors.status = 'Status must be ACTIVE, INACTIVE, or ARCHIVED';
    } else {
      normalizedData.status = status;
    }
  }

  if (data.latitude !== undefined && (Number.isNaN(Number(data.latitude)) || Number(data.latitude) < -90 || Number(data.latitude) > 90)) {
    errors.latitude = 'Latitude must be a number between -90 and 90';
  } else if (data.latitude !== undefined) {
    normalizedData.latitude = Number(data.latitude);
  }

  if (data.longitude !== undefined && (Number.isNaN(Number(data.longitude)) || Number(data.longitude) < -180 || Number(data.longitude) > 180)) {
    errors.longitude = 'Longitude must be a number between -180 and 180';
  } else if (data.longitude !== undefined) {
    normalizedData.longitude = Number(data.longitude);
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    normalizedData,
  };
}

export function validateCreateField(data = {}) {
  const errors = {};

  const name = typeof data.name === 'string' ? data.name.trim() : '';
  if (!name) {
    errors.name = 'Field name is required';
  } else if (name.length > 255) {
    errors.name = 'Field name must not exceed 255 characters';
  }

  if (data.area === undefined || data.area === null || Number(data.area) <= 0) {
    errors.area = 'Field area is required and must be greater than 0';
  }

  if (data.areaUnit !== undefined && !AREA_UNITS.includes(String(data.areaUnit).trim().toUpperCase())) {
    errors.areaUnit = 'Area unit must be ACRE, HECTARE, SQUARE_METER, or SQUARE_KILOMETER';
  }

  if (data.status !== undefined && !FIELD_STATUS_VALUES.includes(String(data.status).trim().toUpperCase())) {
    errors.status = 'Status must be ACTIVE, INACTIVE, or ARCHIVED';
  }

  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: {},
    normalizedData: {
      name,
      description: typeof data.description === 'string' ? data.description.trim() || undefined : undefined,
      area: Number(data.area),
      areaUnit: normalizeEnumValue(data.areaUnit, AREA_UNITS, 'HECTARE'),
      status: normalizeEnumValue(data.status, FIELD_STATUS_VALUES, 'ACTIVE'),
      latitude: data.latitude !== undefined ? Number(data.latitude) : undefined,
      longitude: data.longitude !== undefined ? Number(data.longitude) : undefined,
    },
  };
}

export function validateUpdateField(data = {}) {
  const errors = {};
  const normalizedData = {};

  if (data.name !== undefined) {
    if (typeof data.name !== 'string') {
      errors.name = 'Field name must be a string';
    } else {
      const name = data.name.trim();
      if (!name) {
        errors.name = 'Field name is required';
      } else if (name.length > 255) {
        errors.name = 'Field name must not exceed 255 characters';
      } else {
        normalizedData.name = name;
      }
    }
  }

  if (data.description !== undefined) {
    if (typeof data.description !== 'string') {
      errors.description = 'Description must be a string';
    } else {
      normalizedData.description = data.description.trim() || undefined;
    }
  }

  if (data.area !== undefined) {
    if (Number(data.area) <= 0 || Number.isNaN(Number(data.area))) {
      errors.area = 'Field area must be greater than 0';
    } else {
      normalizedData.area = Number(data.area);
    }
  }

  if (data.areaUnit !== undefined) {
    const areaUnit = normalizeEnumValue(data.areaUnit, AREA_UNITS, undefined);
    if (areaUnit === undefined) {
      errors.areaUnit = 'Area unit must be ACRE, HECTARE, SQUARE_METER, or SQUARE_KILOMETER';
    } else {
      normalizedData.areaUnit = areaUnit;
    }
  }

  if (data.status !== undefined) {
    const status = normalizeEnumValue(data.status, FIELD_STATUS_VALUES, undefined);
    if (status === undefined) {
      errors.status = 'Status must be ACTIVE, INACTIVE, or ARCHIVED';
    } else {
      normalizedData.status = status;
    }
  }

  if (data.latitude !== undefined) {
    if (Number.isNaN(Number(data.latitude)) || Number(data.latitude) < -90 || Number(data.latitude) > 90) {
      errors.latitude = 'Latitude must be a number between -90 and 90';
    } else {
      normalizedData.latitude = Number(data.latitude);
    }
  }

  if (data.longitude !== undefined) {
    if (Number.isNaN(Number(data.longitude)) || Number(data.longitude) < -180 || Number(data.longitude) > 180) {
      errors.longitude = 'Longitude must be a number between -180 and 180';
    } else {
      normalizedData.longitude = Number(data.longitude);
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    normalizedData,
  };
}

export default {
  validateCreateFarm,
  validateUpdateFarm,
  validateCreateField,
  validateUpdateField,
};
