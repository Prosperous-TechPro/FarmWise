/**
 * Farm activity and production service layer.
 */

import { getFarmById } from '../repositories/farmRepository.js';
import {
  createActivity,
  createActivityObservation,
  createActivityTask,
  createActivityType,
  deleteActivity,
  createHarvest,
  createProductionRecord,
  getActivityById,
  listActivitiesByFarm,
  listActivityObservationsByActivity,
  listActivityTasksByActivity,
  listActivityTypesByFarm,
  listHarvestsByFarm,
  listProductionRecordsByFarm,
  updateActivity,
} from '../repositories/activityRepository.js';
import {
  validateCreateActivity,
  validateCreateActivityType,
  validateCreateObservation,
  validateCreateProductionRecord,
  validateCreateTask,
} from '../validators/activityValidator.js';

async function ensureFarmExists(farmId) {
  const farm = await getFarmById(farmId);
  if (!farm) {
    const error = new Error('Farm not found');
    error.statusCode = 404;
    throw error;
  }
  return farm;
}

export async function listFarmActivityTypesService(farmId) {
  await ensureFarmExists(farmId);
  return listActivityTypesByFarm(farmId);
}

export async function createActivityTypeService(farmId, input) {
  await ensureFarmExists(farmId);

  const validation = validateCreateActivityType(input);
  if (!validation.isValid) {
    const error = new Error('Validation failed');
    error.statusCode = 400;
    error.details = validation.errors;
    throw error;
  }

  return createActivityType({
    farmId,
    name: validation.normalizedData.name,
    category: validation.normalizedData.category,
    description: validation.normalizedData.description || null,
    isActive: validation.normalizedData.isActive ?? true,
  });
}

export async function listFarmActivitiesService(farmId, filters = {}) {
  await ensureFarmExists(farmId);
  return listActivitiesByFarm(farmId, filters);
}

export async function getFarmActivityService(farmId, activityId) {
  await ensureFarmExists(farmId);
  const activity = await getActivityById(activityId);
  if (!activity || activity.farmId !== farmId) {
    const error = new Error('Farm activity not found in this farm');
    error.statusCode = 404;
    throw error;
  }
  return activity;
}

export async function createFarmActivityService(farmId, userId, input) {
  await ensureFarmExists(farmId);

  const validation = validateCreateActivity({ ...input, farmId });
  if (!validation.isValid) {
    const error = new Error('Validation failed');
    error.statusCode = 400;
    error.details = validation.errors;
    throw error;
  }

  return createActivity({
    farmId,
    userId,
    activityTypeId: validation.normalizedData.activityTypeId || null,
    assigneeId: validation.normalizedData.assigneeId || null,
    title: validation.normalizedData.title,
    status: validation.normalizedData.status || 'PLANNED',
    priority: validation.normalizedData.priority || 'NORMAL',
    category: validation.normalizedData.category,
    description: validation.normalizedData.description,
    fieldId: validation.normalizedData.fieldId || null,
    livestockId: validation.normalizedData.livestockId || null,
    cropCycleId: validation.normalizedData.cropCycleId || null,
    activityDate: validation.normalizedData.activityDate,
    activityTime: validation.normalizedData.scheduledTime || null,
    scheduledDate: validation.normalizedData.scheduledDate || null,
    scheduledTime: validation.normalizedData.scheduledTime || null,
    quantity: validation.normalizedData.quantity ?? null,
    quantityUnit: validation.normalizedData.quantityUnit || null,
    cost: validation.normalizedData.cost ?? null,
    currency: input.currency || 'GHS',
    notes: validation.normalizedData.notes || null,
    mediaReferences: validation.normalizedData.mediaReferences || null,
  });
}

export async function updateFarmActivityService(farmId, activityId, input) {
  const activity = await getFarmActivityService(farmId, activityId);
  const validation = validateCreateActivity({
    title: input.title ?? activity.title,
    description: input.description ?? activity.description,
    category: input.category ?? activity.category,
    status: input.status ?? activity.status,
    priority: input.priority ?? activity.priority,
    activityDate: input.activityDate ?? activity.activityDate,
    scheduledDate: input.scheduledDate ?? activity.scheduledDate,
    cost: input.cost ?? activity.cost,
    notes: input.notes ?? activity.notes,
  });
  if (!validation.isValid) {
    const error = new Error('Validation failed');
    error.statusCode = 400;
    error.details = validation.errors;
    throw error;
  }

  return updateActivity(activityId, {
    title: validation.normalizedData.title,
    description: validation.normalizedData.description,
    category: validation.normalizedData.category,
    status: validation.normalizedData.status,
    priority: validation.normalizedData.priority,
    activityDate: validation.normalizedData.activityDate,
    scheduledDate: validation.normalizedData.scheduledDate || null,
    cost: validation.normalizedData.cost ?? null,
    notes: validation.normalizedData.notes || null,
  });
}

export async function deleteFarmActivityService(farmId, activityId) {
  await getFarmActivityService(farmId, activityId);
  return deleteActivity(activityId);
}

export async function createFarmActivityTaskService(farmId, activityId, userId, input) {
  await ensureFarmExists(farmId);
  const activity = await getFarmActivityService(farmId, activityId);

  const validation = validateCreateTask(input);
  if (!validation.isValid) {
    const error = new Error('Validation failed');
    error.statusCode = 400;
    error.details = validation.errors;
    throw error;
  }

  return createActivityTask(activity.id, {
    title: validation.normalizedData.title,
    description: validation.normalizedData.description || null,
    assigneeId: validation.normalizedData.assigneeId || null,
    status: validation.normalizedData.status || 'TODO',
    priority: validation.normalizedData.priority || 'NORMAL',
    dueDate: validation.normalizedData.dueDate || null,
    completedAt: input.completedAt ? new Date(input.completedAt) : null,
    notes: validation.normalizedData.notes || null,
  });
}

export async function listFarmActivityTasksService(farmId, activityId) {
  await ensureFarmExists(farmId);
  await getFarmActivityService(farmId, activityId);
  return listActivityTasksByActivity(activityId);
}

export async function createFarmActivityObservationService(farmId, activityId, userId, input) {
  await ensureFarmExists(farmId);
  await getFarmActivityService(farmId, activityId);

  const validation = validateCreateObservation({ ...input, observedBy: userId });
  if (!validation.isValid) {
    const error = new Error('Validation failed');
    error.statusCode = 400;
    error.details = validation.errors;
    throw error;
  }

  return createActivityObservation(activityId, {
    observedBy: validation.normalizedData.observedBy || userId || null,
    category: validation.normalizedData.category,
    severity: validation.normalizedData.severity || 'MODERATE',
    description: validation.normalizedData.description,
    observedAt: validation.normalizedData.observedAt || new Date(),
    notes: validation.normalizedData.notes || null,
  });
}

export async function listFarmActivityObservationsService(farmId, activityId) {
  await ensureFarmExists(farmId);
  await getFarmActivityService(farmId, activityId);
  return listActivityObservationsByActivity(activityId);
}

export async function listFarmProductionRecordsService(farmId, filters = {}) {
  await ensureFarmExists(farmId);
  return listProductionRecordsByFarm(farmId, filters);
}

export async function createFarmProductionRecordService(farmId, userId, input) {
  await ensureFarmExists(farmId);

  const validation = validateCreateProductionRecord({ ...input, farmId, recordedBy: userId });
  if (!validation.isValid) {
    const error = new Error('Validation failed');
    error.statusCode = 400;
    error.details = validation.errors;
    throw error;
  }

  return createProductionRecord({
    farmId,
    recordedBy: userId,
    product: validation.normalizedData.product,
    quantity: validation.normalizedData.quantity,
    quantityUnit: validation.normalizedData.quantityUnit,
    grade: validation.normalizedData.grade || null,
    quality: validation.normalizedData.quality || null,
    cropCycleId: validation.normalizedData.cropCycleId || null,
    livestockId: validation.normalizedData.livestockId || null,
    productionDate: validation.normalizedData.productionDate,
    notes: validation.normalizedData.notes || null,
  });
}

export async function listFarmHarvestsService(farmId, filters = {}) {
  await ensureFarmExists(farmId);
  return listHarvestsByFarm(farmId, filters);
}

export async function createFarmHarvestService(farmId, userId, input) {
  await ensureFarmExists(farmId);

  if (!input?.cropCycleId || !String(input.cropCycleId).trim()) {
    const error = new Error('Validation failed');
    error.statusCode = 400;
    error.details = { cropCycleId: 'cropCycleId is required' };
    throw error;
  }

  if (input.quantity === undefined || input.quantity === null || Number(input.quantity) <= 0) {
    const error = new Error('Validation failed');
    error.statusCode = 400;
    error.details = { quantity: 'Harvest quantity is required and must be greater than 0' };
    throw error;
  }

  const harvestDate = input.harvestDate ? new Date(input.harvestDate) : new Date();
  if (Number.isNaN(harvestDate.getTime())) {
    const error = new Error('Validation failed');
    error.statusCode = 400;
    error.details = { harvestDate: 'harvestDate must be a valid date' };
    throw error;
  }

  return createHarvest({
    farmId,
    cropCycleId: input.cropCycleId,
    recordedBy: userId,
    quantity: Number(input.quantity),
    quantityUnit: input.quantityUnit || 'KG',
    grade: input.grade || null,
    damagePercentage: input.damagePercentage !== undefined ? Number(input.damagePercentage) : null,
    harvestDate,
    notes: input.notes || null,
  });
}

export default {
  listFarmActivityTypesService,
  createActivityTypeService,
  listFarmActivitiesService,
  getFarmActivityService,
  createFarmActivityService,
  updateFarmActivityService,
  deleteFarmActivityService,
  createFarmActivityTaskService,
  listFarmActivityTasksService,
  createFarmActivityObservationService,
  listFarmActivityObservationsService,
  listFarmProductionRecordsService,
  createFarmProductionRecordService,
  listFarmHarvestsService,
  createFarmHarvestService,
};
