import { getWorkerDashboard, listWorkerTasks, updateWorkerTask } from '../repositories/workerRepository.js';

export async function workerDashboard(req, res) {
  return res.json({ success: true, data: await getWorkerDashboard(req.user.id) });
}

export async function workerTasks(req, res) {
  const tasks = req.query.farmId ? await listWorkerTasks(req.user.id, req.query.farmId) : (await getWorkerDashboard(req.user.id)).tasks;
  return res.json({ success: true, data: tasks });
}

export async function updateAssignedTask(req, res) {
  const { status, notes } = req.body;
  if (status && !['TODO', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED', 'CANCELLED'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid task status' });
  }
  const task = await updateWorkerTask(req.user.id, req.params.taskId, {
    ...(status ? { status, ...(status === 'COMPLETED' ? { completedAt: new Date() } : {}) } : {}),
    ...(notes !== undefined ? { notes: String(notes).trim() || null } : {}),
  });
  if (!task) return res.status(403).json({ success: false, message: 'Task is not assigned to this worker' });
  return res.json({ success: true, data: task });
}