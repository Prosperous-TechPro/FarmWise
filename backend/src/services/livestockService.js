/**
 * Livestock service layer
 */

import {
  createLivestock,
  createLivestockEvent,
  listLivestockEventsForAnimal,
  createWeightRecord,
  listWeightRecordsForAnimal,
  createHealthRecord,
  listHealthRecordsForAnimal,
  createTreatmentRecord,
  listTreatmentRecordsForAnimal,
  createVaccinationRecord,
  listVaccinationRecordsForAnimal,
  createFeedingRecord,
  listFeedingRecordsForAnimal,
  createBreedingRecord,
  deleteLivestock,
  ensureDefaultLivestockSpecies,
  getLivestockById,
  listBreedingRecordsForAnimal,
  listLivestockBreeds,
  listLivestockForFarm,
  listLivestockSpecies,
  updateLivestock,
} from '../repositories/livestockRepository.js';
import { getFarmById } from '../repositories/farmRepository.js';
import {
  validateCreateLivestock,
  validateMatingInput,
  validateLivestockEvent,
  validateLivestockWeight,
  validateLivestockHealth,
  validateLivestockTreatment,
  validateLivestockVaccination,
  validateLivestockFeeding,
} from '../validators/livestockValidator.js';

function validationError(validation) {
  const error = new Error('Validation failed');
  error.statusCode = 400;
  error.details = validation.errors;
  return error;
}

async function getFarmAnimal(farmId, livestockId) {
  const animal = await getLivestockById(livestockId);
  if (!animal || animal.farmId !== farmId) {
    const error = new Error('Livestock not found in this farm');
    error.statusCode = 404;
    throw error;
  }
  return animal;
}

export async function listFarmLivestockService(farmId, filters = {}) {
  const farm = await getFarmById(farmId);
  if (!farm) {
    const error = new Error('Farm not found');
    error.statusCode = 404;
    throw error;
  }

  return listLivestockForFarm(farmId, filters);
}

export async function createLivestockService(farmId, input) {
  const validation = validateCreateLivestock(input);
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

  return createLivestock({
    farmId,
    ...validation.normalizedData,
  });
}

export async function getLivestockDetailService(farmId, livestockId) {
  const animal = await getLivestockById(livestockId);
  if (!animal) {
    const error = new Error('Livestock not found');
    error.statusCode = 404;
    throw error;
  }

  if (animal.farmId !== farmId) {
    const error = new Error('Livestock not found in this farm');
    error.statusCode = 404;
    throw error;
  }

  return animal;
}

export async function updateLivestockService(farmId, livestockId, input) {
  const animal = await getLivestockById(livestockId);
  if (!animal) {
    const error = new Error('Livestock not found');
    error.statusCode = 404;
    throw error;
  }

  if (animal.farmId !== farmId) {
    const error = new Error('Livestock not found in this farm');
    error.statusCode = 404;
    throw error;
  }

  const validation = validateCreateLivestock({ ...animal, ...input });
  if (!validation.isValid) {
    const error = new Error('Validation failed');
    error.statusCode = 400;
    error.details = validation.errors;
    throw error;
  }

  return updateLivestock(livestockId, validation.normalizedData);
}

export async function deleteLivestockService(farmId, livestockId) {
  const animal = await getLivestockById(livestockId);
  if (!animal || animal.farmId !== farmId) {
    const error = new Error('Livestock not found in this farm');
    error.statusCode = 404;
    throw error;
  }
  return deleteLivestock(livestockId);
}

export async function listLivestockSpeciesService() {
  await ensureDefaultLivestockSpecies();
  return listLivestockSpecies();
}

export async function listLivestockBreedsService(speciesId) {
  return listLivestockBreeds(speciesId);
}

export async function createLivestockBreedingService(farmId, livestockId, input) {
  const animal = await getLivestockById(livestockId);
  if (!animal) {
    const error = new Error('Livestock not found');
    error.statusCode = 404;
    throw error;
  }

  if (animal.farmId !== farmId) {
    const error = new Error('Livestock not found in this farm');
    error.statusCode = 404;
    throw error;
  }

  const validation = validateMatingInput({
    femaleAnimalId: livestockId,
    maleAnimalId: input.maleAnimalId,
    femaleSex: animal.sex,
    maleSex: input.maleSex,
    matingDate: input.matingDate,
  });

  if (!validation.isValid) {
    const error = new Error('Validation failed');
    error.statusCode = 400;
    error.details = validation.errors;
    throw error;
  }

  const record = await createBreedingRecord({
    femaleId: livestockId,
    maleId: input.maleAnimalId || null,
    status: input.status || 'PLANNED',
    matingDate: new Date(input.matingDate),
    expectedFarrowingDate: validation.normalizedData.expectedFarrowingDate,
    notes: input.notes,
    numberOfPiglets: input.numberOfPiglets,
    maleCount: input.maleCount,
    femaleCount: input.femaleCount,
    stillbornCount: input.stillbornCount,
    actualFarrowingDate: input.actualFarrowingDate ? new Date(input.actualFarrowingDate) : null,
  });

  return record;
}

export async function listLivestockBreedingService(farmId, livestockId) {
  await getFarmAnimal(farmId, livestockId);
  return listBreedingRecordsForAnimal(livestockId);
}

async function createHistoryRecord(farmId, livestockId, input, validator, repositoryCreate) {
  await getFarmAnimal(farmId, livestockId);
  const validation = validator(input);
  if (!validation.isValid) throw validationError(validation);
  return repositoryCreate({ livestockId, ...validation.normalizedData });
}

async function listHistoryRecords(farmId, livestockId, repositoryList) {
  await getFarmAnimal(farmId, livestockId);
  return repositoryList(livestockId);
}

export function createLivestockEventService(farmId, livestockId, input) {
  return createHistoryRecord(farmId, livestockId, input, validateLivestockEvent, createLivestockEvent);
}

export function listLivestockEventService(farmId, livestockId) {
  return listHistoryRecords(farmId, livestockId, listLivestockEventsForAnimal);
}

export function createLivestockWeightService(farmId, livestockId, input) {
  return createHistoryRecord(farmId, livestockId, input, validateLivestockWeight, createWeightRecord);
}

export function listLivestockWeightService(farmId, livestockId) {
  return listHistoryRecords(farmId, livestockId, listWeightRecordsForAnimal);
}

export function createLivestockHealthService(farmId, livestockId, input) {
  return createHistoryRecord(farmId, livestockId, input, validateLivestockHealth, createHealthRecord);
}

export function listLivestockHealthService(farmId, livestockId) {
  return listHistoryRecords(farmId, livestockId, listHealthRecordsForAnimal);
}

export function createLivestockTreatmentService(farmId, livestockId, input) {
  return createHistoryRecord(farmId, livestockId, input, validateLivestockTreatment, createTreatmentRecord);
}

export function listLivestockTreatmentService(farmId, livestockId) {
  return listHistoryRecords(farmId, livestockId, listTreatmentRecordsForAnimal);
}

export function createLivestockVaccinationService(farmId, livestockId, input) {
  return createHistoryRecord(farmId, livestockId, input, validateLivestockVaccination, createVaccinationRecord);
}

export function listLivestockVaccinationService(farmId, livestockId) {
  return listHistoryRecords(farmId, livestockId, listVaccinationRecordsForAnimal);
}

export function createLivestockFeedingService(farmId, livestockId, input) {
  return createHistoryRecord(farmId, livestockId, input, validateLivestockFeeding, createFeedingRecord);
}

export function listLivestockFeedingService(farmId, livestockId) {
  return listHistoryRecords(farmId, livestockId, listFeedingRecordsForAnimal);
}

export default {
  listFarmLivestockService,
  createLivestockService,
  getLivestockDetailService,
  updateLivestockService,
  deleteLivestockService,
  listLivestockSpeciesService,
  listLivestockBreedsService,
  createLivestockBreedingService,
  listLivestockBreedingService,
  createLivestockEventService,
  listLivestockEventService,
  createLivestockWeightService,
  listLivestockWeightService,
  createLivestockHealthService,
  listLivestockHealthService,
  createLivestockTreatmentService,
  listLivestockTreatmentService,
  createLivestockVaccinationService,
  listLivestockVaccinationService,
  createLivestockFeedingService,
  listLivestockFeedingService,
};
