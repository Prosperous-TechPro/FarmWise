import { getSystemWideDashboardSummary, getAllUsers, getWorkersList } from '../services/adminDashboardService.js';

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

export default {
  adminDashboardSummary,
  getUsers,
  getWorkers,
};
