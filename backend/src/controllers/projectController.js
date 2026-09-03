import { addProjectBudgetLineService, createFarmProjectService, deleteFarmProjectService, deleteProjectBudgetLineService, listFarmProjectsService, updateFarmProjectService, updateProjectBudgetLineService } from '../services/projectService.js';

export async function listProjects(req, res) { return res.json({ success: true, data: await listFarmProjectsService(req.params.farmId) }); }
export async function createProjectController(req, res) { return res.status(201).json({ success: true, data: await createFarmProjectService(req.params.farmId, req.user.id, req.body) }); }
export async function updateProjectController(req, res) { return res.json({ success: true, data: await updateFarmProjectService(req.params.farmId, req.params.projectId, req.body) }); }
export async function deleteProjectController(req, res) { await deleteFarmProjectService(req.params.farmId, req.params.projectId); return res.status(204).send(); }
export async function addBudgetLine(req, res) { return res.status(201).json({ success: true, data: await addProjectBudgetLineService(req.params.farmId, req.params.projectId, req.body) }); }
export async function updateBudgetLine(req, res) { return res.json({ success: true, data: await updateProjectBudgetLineService(req.params.farmId, req.params.projectId, req.params.lineId, req.body) }); }
export async function deleteBudgetLine(req, res) { await deleteProjectBudgetLineService(req.params.farmId, req.params.projectId, req.params.lineId); return res.status(204).send(); }
