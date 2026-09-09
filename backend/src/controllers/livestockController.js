/**
 * Livestock controller
 */

import {
  createLivestockBreedingService,
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
  createLivestockService,
  deleteLivestockService,
  getLivestockDetailService,
  listFarmLivestockService,
  listLivestockBreedsService,
  listLivestockBreedingService,
  listLivestockSpeciesService,
  updateLivestockService,
} from '../services/livestockService.js';

export async function listLivestock(req, res) {
  const filters = {
    speciesId: req.query.speciesId,
    breedId: req.query.breedId,
    sex: req.query.sex,
    status: req.query.status,
    tagNumber: req.query.tagNumber,
    skip: req.query.skip ? Number(req.query.skip) : 0,
    limit: req.query.limit ? Number(req.query.limit) : 20,
  };

  const data = await listFarmLivestockService(req.params.farmId, filters);
  return res.status(200).json({
    success: true,
    data,
    message: 'Livestock fetched successfully',
  });
}

export async function createLivestock(req, res) {
  const data = await createLivestockService(req.params.farmId, req.body);
  return res.status(201).json({
    success: true,
    data,
    message: 'Livestock created successfully',
  });
}

export async function getLivestock(req, res) {
  const data = await getLivestockDetailService(req.params.farmId, req.params.livestockId);
  return res.status(200).json({
    success: true,
    data,
    message: 'Livestock retrieved successfully',
  });
}

export async function updateLivestock(req, res) {
  const data = await updateLivestockService(req.params.farmId, req.params.livestockId, req.body);
  return res.status(200).json({
    success: true,
    data,
    message: 'Livestock updated successfully',
  });
}

export async function deleteLivestock(req, res) {
  await deleteLivestockService(req.params.farmId, req.params.livestockId);
  return res.status(204).send();
}

export async function listLivestockSpecies(req, res) {
  const data = await listLivestockSpeciesService();
  return res.status(200).json({
    success: true,
    data,
    message: 'Livestock species fetched successfully',
  });
}

export async function listLivestockBreeds(req, res) {
  const data = await listLivestockBreedsService(req.query.speciesId);
  return res.status(200).json({
    success: true,
    data,
    message: 'Livestock breeds fetched successfully',
  });
}

export async function createBreedingRecord(req, res) {
  const data = await createLivestockBreedingService(req.params.farmId, req.params.livestockId, req.body);
  return res.status(201).json({
    success: true,
    data,
    message: 'Breeding record created successfully',
  });
}

export async function listBreedingRecords(req, res) {
  const data = await listLivestockBreedingService(req.params.farmId, req.params.livestockId);
  return res.status(200).json({
    success: true,
    data,
    message: 'Breeding records fetched successfully',
  });
}

function historyHandlers(service, label) {
  return {
    create: async (req, res) => res.status(201).json({ success: true, data: await service.create(req.params.farmId, req.params.livestockId, req.body), message: `${label} created successfully` }),
    list: async (req, res) => res.status(200).json({ success: true, data: await service.list(req.params.farmId, req.params.livestockId), message: `${label} fetched successfully` }),
  };
}

const eventHandlers = historyHandlers({ create: createLivestockEventService, list: listLivestockEventService }, 'Livestock event');
const weightHandlers = historyHandlers({ create: createLivestockWeightService, list: listLivestockWeightService }, 'Weight record');
const healthHandlers = historyHandlers({ create: createLivestockHealthService, list: listLivestockHealthService }, 'Health record');
const treatmentHandlers = historyHandlers({ create: createLivestockTreatmentService, list: listLivestockTreatmentService }, 'Treatment record');
const vaccinationHandlers = historyHandlers({ create: createLivestockVaccinationService, list: listLivestockVaccinationService }, 'Vaccination record');
const feedingHandlers = historyHandlers({ create: createLivestockFeedingService, list: listLivestockFeedingService }, 'Feeding record');

export const listLivestockEvents = eventHandlers.list;
export const createLivestockEvent = eventHandlers.create;
export const listLivestockWeights = weightHandlers.list;
export const createLivestockWeight = weightHandlers.create;
export const listLivestockHealth = healthHandlers.list;
export const createLivestockHealth = healthHandlers.create;
export const listLivestockTreatments = treatmentHandlers.list;
export const createLivestockTreatment = treatmentHandlers.create;
export const listLivestockVaccinations = vaccinationHandlers.list;
export const createLivestockVaccination = vaccinationHandlers.create;
export const listLivestockFeeding = feedingHandlers.list;
export const createLivestockFeeding = feedingHandlers.create;

export default {
  listLivestock,
  createLivestock,
  getLivestock,
  updateLivestock,
  deleteLivestock,
  listLivestockSpecies,
  listLivestockBreeds,
  createBreedingRecord,
  listBreedingRecords,
  listLivestockEvents,
  createLivestockEvent,
  listLivestockWeights,
  createLivestockWeight,
  listLivestockHealth,
  createLivestockHealth,
  listLivestockTreatments,
  createLivestockTreatment,
  listLivestockVaccinations,
  createLivestockVaccination,
  listLivestockFeeding,
  createLivestockFeeding,
};
