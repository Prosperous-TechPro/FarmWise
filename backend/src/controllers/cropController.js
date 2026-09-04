/**
 * Crop controller
 */

import {
  createCropActivityService,
  archiveCropCycleService,
  createCropCycleService,
    deleteCropCycleService,
  createCropGrowthRecordService,
  createCropInputService,
  createCropObservationService,
  createCropService,
  createCropVarietyService,
  getCropCycleDetailService,
  listCropActivitiesService,
  listCropGrowthRecordsService,
  listCropInputsService,
  listCropObservationsService,
  listCropVarietiesService,
  listCropsService,
  listFarmCropCyclesService,
  updateCropCycleService,
} from '../services/cropService.js';

export async function listCrops(req, res) {
  const crops = await listCropsService({ name: req.query.name, skip: Number(req.query.skip || 0), limit: Number(req.query.limit || 20) });
  return res.status(200).json({ success: true, data: crops, message: 'Crops fetched successfully' });
}

export async function createCrop(req, res) {
  const crop = await createCropService(req.body);
  return res.status(201).json({ success: true, data: crop, message: 'Crop created successfully' });
}

export async function listCropVarieties(req, res) {
  const cropId = req.params.cropId || req.query.cropId;
  const varieties = await listCropVarietiesService(cropId);
  return res.status(200).json({ success: true, data: varieties, message: 'Crop varieties fetched successfully' });
}

export async function createCropVariety(req, res) {
  const cropId = req.params.cropId || req.query.cropId;
  const variety = await createCropVarietyService(cropId, req.body);
  return res.status(201).json({ success: true, data: variety, message: 'Crop variety created successfully' });
}

export async function listFarmCropCycles(req, res) {
  const cycles = await listFarmCropCyclesService(req.params.farmId, {
    cropId: req.query.cropId,
    fieldId: req.query.fieldId,
    status: req.query.status,
    search: req.query.search,
    plantingFrom: req.query.plantingFrom ? new Date(req.query.plantingFrom) : undefined,
    plantingTo: req.query.plantingTo ? new Date(req.query.plantingTo) : undefined,
    harvestFrom: req.query.harvestFrom ? new Date(req.query.harvestFrom) : undefined,
    harvestTo: req.query.harvestTo ? new Date(req.query.harvestTo) : undefined,
    skip: Number(req.query.skip || 0),
    limit: Number(req.query.limit || 20),
  });
  return res.status(200).json({ success: true, data: cycles, message: 'Crop cycles fetched successfully' });
}

export async function createCropCycle(req, res) {
  const cycle = await createCropCycleService(req.params.farmId, req.body, { userId: req.user.id, req });
  return res.status(201).json({ success: true, data: cycle, message: 'Crop cycle created successfully' });
}

export async function getCropCycle(req, res) {
  const cycle = await getCropCycleDetailService(req.params.farmId, req.params.cropCycleId);
  return res.status(200).json({ success: true, data: cycle, message: 'Crop cycle retrieved successfully' });
}

export async function updateCropCycle(req, res) {
  const cycle = await updateCropCycleService(req.params.farmId, req.params.cropCycleId, req.body, { userId: req.user.id, req });
  return res.status(200).json({ success: true, data: cycle, message: 'Crop cycle updated successfully' });
}

export async function archiveCropCycle(req, res) {
  const cycle = await archiveCropCycleService(req.params.farmId, req.params.cropCycleId, { userId: req.user.id, req });
  return res.status(200).json({ success: true, data: cycle, message: 'Crop production record archived successfully' });
}

export async function deleteCropCycle(req, res) {
  await deleteCropCycleService(req.params.farmId, req.params.cropCycleId);
  return res.status(204).send();
}

export async function listCropActivities(req, res) {
  const activities = await listCropActivitiesService(req.params.farmId, req.params.cropCycleId);
  return res.status(200).json({ success: true, data: activities, message: 'Crop activities fetched successfully' });
}

export async function createCropActivity(req, res) {
  const activity = await createCropActivityService(req.params.farmId, req.params.cropCycleId, req.body, { userId: req.user.id, req });
  return res.status(201).json({ success: true, data: activity, message: 'Crop activity created successfully' });
}

export async function listCropInputs(req, res) {
  const inputs = await listCropInputsService(req.params.farmId, req.params.cropCycleId);
  return res.status(200).json({ success: true, data: inputs, message: 'Crop inputs fetched successfully' });
}

export async function createCropInput(req, res) {
  const input = await createCropInputService(req.params.farmId, req.params.cropCycleId, req.body);
  return res.status(201).json({ success: true, data: input, message: 'Crop input recorded successfully' });
}

export async function listCropObservations(req, res) {
  const observations = await listCropObservationsService(req.params.farmId, req.params.cropCycleId);
  return res.status(200).json({ success: true, data: observations, message: 'Crop observations fetched successfully' });
}

export async function createCropObservation(req, res) {
  const observation = await createCropObservationService(req.params.farmId, req.params.cropCycleId, req.body, { userId: req.user.id, req });
  return res.status(201).json({ success: true, data: observation, message: 'Crop observation recorded successfully' });
}

export async function listCropGrowthRecords(req, res) {
  const records = await listCropGrowthRecordsService(req.params.farmId, req.params.cropCycleId);
  return res.status(200).json({ success: true, data: records, message: 'Crop growth records fetched successfully' });
}

export async function createCropGrowthRecord(req, res) {
  const record = await createCropGrowthRecordService(req.params.farmId, req.params.cropCycleId, req.body);
  return res.status(201).json({ success: true, data: record, message: 'Crop growth record created successfully' });
}

export default {
  listCrops,
  createCrop,
  listCropVarieties,
  createCropVariety,
  listFarmCropCycles,
  createCropCycle,
  getCropCycle,
  updateCropCycle,
  archiveCropCycle,
    deleteCropCycle,
  listCropActivities,
  createCropActivity,
  listCropInputs,
  createCropInput,
  listCropObservations,
  createCropObservation,
  listCropGrowthRecords,
  createCropGrowthRecord,
};
