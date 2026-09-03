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
import { findUserByEmail } from '../repositories/userRepository.js';
import { addFarmWorker, findFarmMember, listFarmWorkers, updateFarmWorker } from '../repositories/farmRepository.js';

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

export async function listWorkers(req, res) {
  const workers = await listFarmWorkers(req.params.farmId);
  return res.status(200).json({ success: true, data: workers, message: 'Farm workers fetched successfully' });
}

export async function addWorker(req, res) {
  const { email, role = 'WORKER' } = req.body;
  if (!email || !['WORKER', 'MANAGER'].includes(role)) {
    return res.status(400).json({ success: false, message: 'A valid email and worker role are required' });
  }
  const user = await findUserByEmail(email.trim().toLowerCase());
  if (!user) return res.status(404).json({ success: false, message: 'No registered user found with that email' });
  if (user.id === req.user.id) return res.status(400).json({ success: false, message: 'The farm owner cannot be added as a worker' });
  const member = await addFarmWorker(req.params.farmId, user.id, role);
  return res.status(201).json({ success: true, data: member, message: 'Worker added to farm successfully' });
}

export async function updateWorker(req, res) {
  const member = await findFarmMember(req.params.memberId);
  if (member?.farmId !== req.params.farmId) return res.status(404).json({ success: false, message: 'Worker not found' });
  if (!member || member.role === 'OWNER') return res.status(404).json({ success: false, message: 'Worker not found' });
  const role = req.body.role;
  const status = req.body.status;
  if (role && !['WORKER', 'MANAGER'].includes(role)) return res.status(400).json({ success: false, message: 'Invalid worker role' });
  const updated = await updateFarmWorker(member.id, { ...(role ? { role } : {}), ...(status ? { status } : {}) });
  return res.status(200).json({ success: true, data: updated, message: 'Worker updated successfully' });
}

export async function removeWorker(req, res) {
  const member = await findFarmMember(req.params.memberId);
  if (member?.farmId !== req.params.farmId) return res.status(404).json({ success: false, message: 'Worker not found' });
  if (!member || member.role === 'OWNER') return res.status(404).json({ success: false, message: 'Worker not found' });
  await updateFarmWorker(member.id, { status: 'INACTIVE' });
  return res.status(200).json({ success: true, message: 'Worker removed from farm successfully' });
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
  listWorkers,
  addWorker,
  updateWorker,
  removeWorker,
  listFields,
  createField,
  getField,
  updateField,
};
