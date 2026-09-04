/**
 * Livestock service layer
 */

import {
  createLivestock,
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
} from '../validators/livestockValidator.js';

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

  return listBreedingRecordsForAnimal(livestockId);
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
};
