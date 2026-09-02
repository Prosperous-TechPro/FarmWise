/**
 * Livestock controller
 */

import {
  createLivestockBreedingService,
  createLivestockService,
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

export default {
  listLivestock,
  createLivestock,
  getLivestock,
  updateLivestock,
  listLivestockSpecies,
  listLivestockBreeds,
  createBreedingRecord,
  listBreedingRecords,
};
