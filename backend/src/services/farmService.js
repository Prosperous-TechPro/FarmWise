/**
 * Farm service layer
 */

import {
  createFarm,
  createField,
  getFarmById,
  listUserFarms,
  updateFarm,
  deleteFarm,
  listFarmFields,
  findFieldById,
  updateField,
  deleteField,
} from '../repositories/farmRepository.js';
import {
  validateCreateFarm,
  validateUpdateFarm,
  validateCreateField,
  validateUpdateField,
} from '../validators/farmValidator.js';

export async function createFarmService(input) {
  const validation = validateCreateFarm(input);
  if (!validation.isValid) {
    const error = new Error('Validation failed');
    error.statusCode = 400;
    error.details = validation.errors;
    throw error;
  }

  return createFarm({
    ...validation.normalizedData,
    ownerId: input.ownerId,
  });
}

export async function listUserFarmsService(userId, roles = []) {
  return listUserFarms(userId, roles.some((role) => ['ADMIN', 'SUPERADMIN'].includes(role)));
}

export async function getFarmDetailService(farmId) {
  const farm = await getFarmById(farmId);
  if (!farm) {
    const error = new Error('Farm not found');
    error.statusCode = 404;
    throw error;
  }
  return farm;
}

export async function updateFarmService(farmId, input) {
  const validation = validateUpdateFarm(input);
  if (!validation.isValid) {
    const error = new Error('Validation failed');
    error.statusCode = 400;
    error.details = validation.errors;
    throw error;
  }

  const farm = await getFarmById(farmId);
  if (!farm) {
    const error = new Error('Farm not found');
    error.statusCode = 404;
    throw error;
  }

  return updateFarm(farmId, validation.normalizedData);
}

export async function deleteFarmService(farmId) {
  const farm = await getFarmById(farmId);
  if (!farm) {
    const error = new Error('Farm not found');
    error.statusCode = 404;
    throw error;
  }
  return deleteFarm(farmId);
}

export async function createFieldService(farmId, input) {
  const validation = validateCreateField(input);
  if (!validation.isValid) {
    const error = new Error('Validation failed');
    error.statusCode = 400;
    error.details = validation.errors;
    throw error;
  }

  const farm = await getFarmById(farmId);
  if (!farm) {
    const error = new Error('Farm not found');
    error.statusCode = 404;
    throw error;
  }

  return createField(farmId, validation.normalizedData);
}

export async function listFieldsService(farmId) {
  const farm = await getFarmById(farmId);
  if (!farm) {
    const error = new Error('Farm not found');
    error.statusCode = 404;
    throw error;
  }

  return listFarmFields(farmId);
}

export async function getFieldDetailService(fieldId) {
  const field = await findFieldById(fieldId);
  if (!field) {
    const error = new Error('Field not found');
    error.statusCode = 404;
    throw error;
  }
  return field;
}

export async function updateFieldService(fieldId, input) {
  const validation = validateUpdateField(input);
  if (!validation.isValid) {
    const error = new Error('Validation failed');
    error.statusCode = 400;
    error.details = validation.errors;
    throw error;
  }

  const field = await findFieldById(fieldId);
  if (!field) {
    const error = new Error('Field not found');
    error.statusCode = 404;
    throw error;
  }

  return updateField(fieldId, validation.normalizedData);
}

export async function deleteFieldService(fieldId) {
  const field = await findFieldById(fieldId);
  if (!field) {
    const error = new Error('Field not found');
    error.statusCode = 404;
    throw error;
  }
  return deleteField(fieldId);
}

export default {
  createFarmService,
  listUserFarmsService,
  getFarmDetailService,
  updateFarmService,
  deleteFarmService,
  createFieldService,
  listFieldsService,
  getFieldDetailService,
  updateFieldService,
  deleteFieldService,
};
