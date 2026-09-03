import { getSystemWideDashboardSummary, getAllUsers, getWorkersList, getAllFarms, updateFarmByAdmin, getAllActivities, updateActivityByAdmin } from '../services/adminDashboardService.js';
import { updateUser } from '../repositories/userRepository.js';

export async function adminDashboardSummary(req, res) {
  const summary = await getSystemWideDashboardSummary();
  return res.json({ success: true, data: summary });
}

export async function getUsers(req, res) {
  const users = await getAllUsers();
  return res.json({ success: true, data: users });
}

export async function getWorkers(req, res) {
  const workers = await getWorkersList();
  const formatted = workers.map((w) => ({
    ...w,
    farmName: w.farmMembers?.[0]?.farm?.name || null,
    role: w.farmMembers?.[0]?.role || 'Unassigned',
  }));
  return res.json({ success: true, data: formatted });
}

export async function updateUserStatus(req, res) {
  const status = req.body.status;
  if (!['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'].includes(status)) return res.status(400).json({ success: false, message: 'Invalid user status' });
  const user = await updateUser(req.params.userId, { status });
  return res.json({ success: true, data: user, message: 'User status updated successfully' });
}

export async function getFarms(req, res) { return res.json({ success: true, data: await getAllFarms() }); }

export async function updateFarm(req, res) {
  const allowed = ['ACTIVE', 'INACTIVE', 'ARCHIVED'];
  if (req.body.status && !allowed.includes(req.body.status)) return res.status(400).json({ success: false, message: 'Invalid farm status' });
  const data = {};
  if (req.body.status) data.status = req.body.status;
  if (typeof req.body.name === 'string' && req.body.name.trim()) data.name = req.body.name.trim();
  if (typeof req.body.description === 'string') data.description = req.body.description;
  return res.json({ success: true, data: await updateFarmByAdmin(req.params.farmId, data), message: 'Farm updated successfully' });
}

export async function getActivities(req, res) { return res.json({ success: true, data: await getAllActivities() }); }

export async function updateActivity(req, res) {
  const data = {};
  if (req.body.status) data.status = req.body.status;
  if (req.body.priority) data.priority = req.body.priority;
  if (!Object.keys(data).length) return res.status(400).json({ success: false, message: 'A valid activity update is required' });
  return res.json({ success: true, data: await updateActivityByAdmin(req.params.activityId, data), message: 'Activity updated successfully' });
}

export default {
  adminDashboardSummary,
  getUsers,
  getWorkers,
  updateUserStatus,
  getFarms,
  updateFarm,
  getActivities,
  updateActivity,
};
