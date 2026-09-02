/**
 * Farm activity and production controller.
 */

import {
  createActivityTypeService,
  createFarmActivityObservationService,
  createFarmActivityService,
  createFarmActivityTaskService,
  createFarmHarvestService,
  createFarmProductionRecordService,
  getFarmActivityService,
  listFarmActivitiesService,
  listFarmActivityObservationsService,
  listFarmActivityTasksService,
  listFarmActivityTypesService,
  listFarmHarvestsService,
  listFarmProductionRecordsService,
} from '../services/activityService.js';

export async function listActivityTypes(req, res) {
  const data = await listFarmActivityTypesService(req.params.farmId);
  return res.status(200).json({ success: true, data, message: 'Activity types fetched successfully' });
}

export async function createActivityType(req, res) {
  const data = await createActivityTypeService(req.params.farmId, req.body);
  return res.status(201).json({ success: true, data, message: 'Activity type created successfully' });
}

export async function listActivities(req, res) {
  const filters = {
    status: req.query.status,
    category: req.query.category,
    assigneeId: req.query.assigneeId,
    skip: Number(req.query.skip) || 0,
    limit: Number(req.query.limit) || 20,
  };

  const data = await listFarmActivitiesService(req.params.farmId, filters);
  return res.status(200).json({ success: true, data, message: 'Activities fetched successfully' });
}

export async function getActivity(req, res) {
  const data = await getFarmActivityService(req.params.farmId, req.params.activityId);
  return res.status(200).json({ success: true, data, message: 'Activity retrieved successfully' });
}

export async function createActivity(req, res) {
  const data = await createFarmActivityService(req.params.farmId, req.user.id, req.body);
  return res.status(201).json({ success: true, data, message: 'Activity created successfully' });
}

export async function createActivityTask(req, res) {
  const data = await createFarmActivityTaskService(req.params.farmId, req.params.activityId, req.user.id, req.body);
  return res.status(201).json({ success: true, data, message: 'Activity task created successfully' });
}

export async function listActivityTasks(req, res) {
  const data = await listFarmActivityTasksService(req.params.farmId, req.params.activityId);
  return res.status(200).json({ success: true, data, message: 'Activity tasks fetched successfully' });
}

export async function createActivityObservation(req, res) {
  const data = await createFarmActivityObservationService(req.params.farmId, req.params.activityId, req.user.id, req.body);
  return res.status(201).json({ success: true, data, message: 'Observation recorded successfully' });
}

export async function listActivityObservations(req, res) {
  const data = await listFarmActivityObservationsService(req.params.farmId, req.params.activityId);
  return res.status(200).json({ success: true, data, message: 'Observations fetched successfully' });
}

export async function listProductionRecords(req, res) {
  const filters = {
    cropCycleId: req.query.cropCycleId,
    livestockId: req.query.livestockId,
    skip: Number(req.query.skip) || 0,
    limit: Number(req.query.limit) || 20,
  };

  const data = await listFarmProductionRecordsService(req.params.farmId, filters);
  return res.status(200).json({ success: true, data, message: 'Production records fetched successfully' });
}

export async function createProductionRecord(req, res) {
  const data = await createFarmProductionRecordService(req.params.farmId, req.user.id, req.body);
  return res.status(201).json({ success: true, data, message: 'Production record created successfully' });
}

export async function listHarvests(req, res) {
  const filters = {
    cropCycleId: req.query.cropCycleId,
    skip: Number(req.query.skip) || 0,
    limit: Number(req.query.limit) || 20,
  };

  const data = await listFarmHarvestsService(req.params.farmId, filters);
  return res.status(200).json({ success: true, data, message: 'Harvests fetched successfully' });
}

export async function createHarvest(req, res) {
  const data = await createFarmHarvestService(req.params.farmId, req.user.id, req.body);
  return res.status(201).json({ success: true, data, message: 'Harvest recorded successfully' });
}

export default {
  listActivityTypes,
  createActivityType,
  listActivities,
  getActivity,
  createActivity,
  createActivityTask,
  listActivityTasks,
  createActivityObservation,
  listActivityObservations,
  listProductionRecords,
  createProductionRecord,
  listHarvests,
  createHarvest,
};
