/**
 * Farm controller
 */

import {
  createFarmService,
  listUserFarmsService,
  getFarmDetailService,
  updateFarmService,
  createFieldService,
  listFieldsService,
  getFieldDetailService,
  updateFieldService,
} from '../services/farmService.js';

export async function listFarms(req, res) {
  const farms = await listUserFarmsService(req.user.id, req.user.roles);
  return res.status(200).json({
    success: true,
    data: farms,
    message: 'Farms fetched successfully',
  });
}

export async function createFarm(req, res) {
  const farm = await createFarmService({
    ownerId: req.user.id,
    ...req.body,
  });

  return res.status(201).json({
    success: true,
    data: farm,
    message: 'Farm created successfully',
  });
}

export async function getFarm(req, res) {
  const farm = await getFarmDetailService(req.params.farmId);
  return res.status(200).json({
    success: true,
    data: farm,
    message: 'Farm retrieved successfully',
  });
}

export async function updateFarm(req, res) {
  const farm = await updateFarmService(req.params.farmId, req.body);
  return res.status(200).json({
    success: true,
    data: farm,
    message: 'Farm updated successfully',
  });
}

export async function listFields(req, res) {
  const fields = await listFieldsService(req.params.farmId);
  return res.status(200).json({
    success: true,
    data: fields,
    message: 'Fields fetched successfully',
  });
}

export async function createField(req, res) {
  const field = await createFieldService(req.params.farmId, req.body);
  return res.status(201).json({
    success: true,
    data: field,
    message: 'Field created successfully',
  });
}

export async function getField(req, res) {
  const field = await getFieldDetailService(req.params.fieldId);
  return res.status(200).json({
    success: true,
    data: field,
    message: 'Field retrieved successfully',
  });
}

export async function updateField(req, res) {
  const field = await updateFieldService(req.params.fieldId, req.body);
  return res.status(200).json({
    success: true,
    data: field,
    message: 'Field updated successfully',
  });
}

export default {
  listFarms,
  createFarm,
  getFarm,
  updateFarm,
  listFields,
  createField,
  getField,
  updateField,
};
