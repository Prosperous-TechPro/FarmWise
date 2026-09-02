/**
 * Crop service layer
 */

import {
  createCrop,
  createCropActivity,
  createCropCycle,
  createCropGrowthRecord,
  createCropInput,
  createCropObservation,
  createCropVariety,
  getCropCycleById,
  getCropById,
  listCropActivities,
  listCropCyclesForFarm,
  listCropGrowthRecords,
  listCropInputs,
  listCropObservations,
  listCropVarieties,
  listCrops,
  updateCropCycle,
} from '../repositories/cropRepository.js';
import { getFarmById } from '../repositories/farmRepository.js';
import { findFieldById } from '../repositories/farmRepository.js';
import {
  validateCreateCropActivity,
  validateCreateCropCycle,
  validateCreateCropInput,
  validateCreateCropObservation,
} from '../validators/cropValidator.js';

export async function listCropsService(filters = {}) {
  return listCrops(filters);
}

export async function createCropService(input) {
  if (!input?.name || !String(input.name).trim()) {
    const error = new Error('Validation failed');
    error.statusCode = 400;
    error.details = { name: 'Crop name is required' };
    throw error;
  }

  return createCrop({
    name: String(input.name).trim(),
    description: input.description || null,
    averageGrowingDays: input.averageGrowingDays ? Number(input.averageGrowingDays) : null,
  });
}

export async function listCropVarietiesService(cropId) {
  const crop = await getCropById(cropId);
  if (!crop) {
    const error = new Error('Crop not found');
    error.statusCode = 404;
    throw error;
  }

  return listCropVarieties(cropId);
}

export async function createCropVarietyService(cropId, input) {
  const crop = await getCropById(cropId);
  if (!crop) {
    const error = new Error('Crop not found');
    error.statusCode = 404;
    throw error;
  }

  if (!input?.name || !String(input.name).trim()) {
    const error = new Error('Validation failed');
    error.statusCode = 400;
    error.details = { name: 'Variety name is required' };
    throw error;
  }

  return createCropVariety({
    cropId,
    name: String(input.name).trim(),
    description: input.description || null,
    maturityDays: input.maturityDays ? Number(input.maturityDays) : null,
    notes: input.notes || null,
  });
}

export async function listFarmCropCyclesService(farmId, filters = {}) {
  const farm = await getFarmById(farmId);
  if (!farm) {
    const error = new Error('Farm not found');
    error.statusCode = 404;
    throw error;
  }

  return listCropCyclesForFarm(farmId, filters);
}

export async function createCropCycleService(farmId, input) {
  const farm = await getFarmById(farmId);
  if (!farm) {
    const error = new Error('Farm not found');
    error.statusCode = 404;
    throw error;
  }

  const field = await findFieldById(input.fieldId);
  if (!field || field.farmId !== farmId) {
    const error = new Error('Field not found in this farm');
    error.statusCode = 404;
    throw error;
  }

  const crop = await getCropById(input.cropId);
  if (!crop) {
    const error = new Error('Crop not found');
    error.statusCode = 404;
    throw error;
  }

  if (input.varietyId) {
    const variety = await listCropVarieties(input.cropId);
    const hasVariety = variety.some((item) => item.id === input.varietyId);
    if (!hasVariety) {
      const error = new Error('Crop variety not found for this crop');
      error.statusCode = 404;
      throw error;
    }
  }

  const validation = validateCreateCropCycle({
    ...input,
    farmId,
  });

  if (!validation.isValid) {
    const error = new Error('Validation failed');
    error.statusCode = 400;
    error.details = validation.errors;
    throw error;
  }

  return createCropCycle({
    farmId,
    fieldId: validation.normalizedData.fieldId || input.fieldId,
    cropId: validation.normalizedData.cropId || input.cropId,
    varietyId: validation.normalizedData.varietyId || input.varietyId || null,
    cycleName: validation.normalizedData.cycleName || input.cycleName || null,
    season: validation.normalizedData.season || input.season || null,
    status: validation.normalizedData.status || input.status || 'PLANNED',
    plantedArea: validation.normalizedData.area !== undefined ? validation.normalizedData.area : input.area,
    areaUnit: validation.normalizedData.areaUnit || input.areaUnit || 'HECTARE',
    plantingDate: validation.normalizedData.plantingDate || input.plantingDate || new Date(),
    expectedHarvestDate: validation.normalizedData.expectedHarvestDate || input.expectedHarvestDate || null,
    actualHarvestDate: validation.normalizedData.actualHarvestDate || input.actualHarvestDate || null,
    expectedYield: input.expectedYield ?? null,
    actualYield: input.actualYield ?? null,
    yieldUnit: input.yieldUnit || 'KILOGRAM',
    notes: input.notes || null,
  });
}

export async function getCropCycleDetailService(farmId, cropCycleId) {
  const cycle = await getCropCycleById(cropCycleId);
  if (!cycle) {
    const error = new Error('Crop cycle not found');
    error.statusCode = 404;
    throw error;
  }

  if (cycle.farmId !== farmId) {
    const error = new Error('Crop cycle not found in this farm');
    error.statusCode = 404;
    throw error;
  }

  return cycle;
}

export async function updateCropCycleService(farmId, cropCycleId, input) {
  const cycle = await getCropCycleById(cropCycleId);
  if (!cycle) {
    const error = new Error('Crop cycle not found');
    error.statusCode = 404;
    throw error;
  }

  if (cycle.farmId !== farmId) {
    const error = new Error('Crop cycle not found in this farm');
    error.statusCode = 404;
    throw error;
  }

  const validation = validateCreateCropCycle({ ...cycle, ...input });
  if (!validation.isValid) {
    const error = new Error('Validation failed');
    error.statusCode = 400;
    error.details = validation.errors;
    throw error;
  }

  return updateCropCycle(cropCycleId, {
    cycleName: validation.normalizedData.cycleName || cycle.cycleName,
    season: validation.normalizedData.season || cycle.season,
    status: validation.normalizedData.status || cycle.status,
    plantedArea: validation.normalizedData.area ?? cycle.plantedArea,
    areaUnit: validation.normalizedData.areaUnit || cycle.areaUnit,
    plantingDate: validation.normalizedData.plantingDate || cycle.plantingDate,
    expectedHarvestDate: validation.normalizedData.expectedHarvestDate || cycle.expectedHarvestDate,
    actualHarvestDate: validation.normalizedData.actualHarvestDate || cycle.actualHarvestDate,
    notes: validation.normalizedData.notes || cycle.notes,
  });
}

export async function listCropActivitiesService(farmId, cropCycleId) {
  const cycle = await getCropCycleDetailService(farmId, cropCycleId);
  return listCropActivities(cycle.id);
}

export async function createCropActivityService(farmId, cropCycleId, input) {
  const cycle = await getCropCycleDetailService(farmId, cropCycleId);
  const validation = validateCreateCropActivity({ ...input, cropCycleId: cycle.id });

  if (!validation.isValid) {
    const error = new Error('Validation failed');
    error.statusCode = 400;
    error.details = validation.errors;
    throw error;
  }

  return createCropActivity({
    cropCycleId: cycle.id,
    userId: input.userId || null,
    activityType: validation.normalizedData.activityType,
    description: validation.normalizedData.description,
    activityDate: validation.normalizedData.activityDate,
    activityTime: validation.normalizedData.activityTime || null,
    quantity: validation.normalizedData.quantity ?? null,
    unit: validation.normalizedData.unit || null,
    notes: input.notes || null,
    mediaUrl: input.mediaUrl || null,
    costReference: input.costReference || null,
  });
}

export async function listCropInputsService(farmId, cropCycleId) {
  const cycle = await getCropCycleDetailService(farmId, cropCycleId);
  return listCropInputs(cycle.id);
}

export async function createCropInputService(farmId, cropCycleId, input) {
  const cycle = await getCropCycleDetailService(farmId, cropCycleId);
  const validation = validateCreateCropInput({ ...input, cropCycleId: cycle.id });

  if (!validation.isValid) {
    const error = new Error('Validation failed');
    error.statusCode = 400;
    error.details = validation.errors;
    throw error;
  }

  return createCropInput({
    cropCycleId: cycle.id,
    inputType: validation.normalizedData.inputType,
    inputName: validation.normalizedData.inputName,
    quantity: validation.normalizedData.quantity,
    unit: validation.normalizedData.unit,
    applicationDate: validation.normalizedData.applicationDate,
    applicationTime: validation.normalizedData.applicationTime || null,
    appliedBy: input.appliedBy || null,
    supplier: input.supplier || null,
    batchLot: input.batchLot || null,
    notes: input.notes || null,
    costReference: input.costReference || null,
  });
}

export async function listCropObservationsService(farmId, cropCycleId) {
  const cycle = await getCropCycleDetailService(farmId, cropCycleId);
  return listCropObservations(cycle.id);
}

export async function createCropObservationService(farmId, cropCycleId, input) {
  const cycle = await getCropCycleDetailService(farmId, cropCycleId);
  const validation = validateCreateCropObservation({ ...input, cropCycleId: cycle.id });

  if (!validation.isValid) {
    const error = new Error('Validation failed');
    error.statusCode = 400;
    error.details = validation.errors;
    throw error;
  }

  return createCropObservation({
    cropCycleId: cycle.id,
    observationDate: validation.normalizedData.observationDate,
    observation: validation.normalizedData.observation,
    severity: validation.normalizedData.severity,
    workerId: input.workerId || null,
    notes: validation.normalizedData.notes || null,
    mediaUrl: input.mediaUrl || null,
  });
}

export async function listCropGrowthRecordsService(farmId, cropCycleId) {
  const cycle = await getCropCycleDetailService(farmId, cropCycleId);
  return listCropGrowthRecords(cycle.id);
}

export async function createCropGrowthRecordService(farmId, cropCycleId, input) {
  const cycle = await getCropCycleDetailService(farmId, cropCycleId);

  if (!input?.observationDate) {
    const error = new Error('Validation failed');
    error.statusCode = 400;
    error.details = { observationDate: 'Observation date is required' };
    throw error;
  }

  return createCropGrowthRecord({
    cropCycleId: cycle.id,
    observationDate: new Date(input.observationDate),
    growthStage: input.growthStage || null,
    plantHeight: input.plantHeight ? Number(input.plantHeight) : null,
    plantCount: input.plantCount ? Number(input.plantCount) : null,
    generalCondition: input.generalCondition || null,
    notes: input.notes || null,
    mediaUrl: input.mediaUrl || null,
  });
}

export default {
  listCropsService,
  createCropService,
  listCropVarietiesService,
  createCropVarietyService,
  listFarmCropCyclesService,
  createCropCycleService,
  getCropCycleDetailService,
  updateCropCycleService,
  listCropActivitiesService,
  createCropActivityService,
  listCropInputsService,
  createCropInputService,
  listCropObservationsService,
  createCropObservationService,
  listCropGrowthRecordsService,
  createCropGrowthRecordService,
};
