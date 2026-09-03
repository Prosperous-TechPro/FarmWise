import { getFarmById } from '../repositories/farmRepository.js';
import { createProject, createProjectBudgetLine, deleteProject, deleteProjectBudgetLine, getProjectById, listProjectsByFarm, updateProject, updateProjectBudgetLine } from '../repositories/projectRepository.js';
import { validateBudgetLine, validateProject } from '../validators/projectValidator.js';

function fail(statusCode, message, details) {
  const error = new Error(message);
  error.statusCode = statusCode;
  if (details) error.details = details;
  return error;
}

async function ensureFarm(farmId) {
  if (!(await getFarmById(farmId))) throw fail(404, 'Farm not found');
}

async function ensureProject(projectId, farmId) {
  const project = await getProjectById(projectId);
  if (!project || project.farmId !== farmId) throw fail(404, 'Project not found');
  return project;
}

function validated(result) {
  if (!result.isValid) throw fail(400, 'Validation failed', result.errors);
  return result.normalizedData;
}

export async function listFarmProjectsService(farmId) { await ensureFarm(farmId); return listProjectsByFarm(farmId); }
export async function createFarmProjectService(farmId, userId, input) { await ensureFarm(farmId); return createProject({ farmId, createdBy: userId, ...validated(validateProject(input)) }); }
export async function updateFarmProjectService(farmId, projectId, input) { await ensureProject(projectId, farmId); return updateProject(projectId, validated(validateProject(input, true))); }
export async function deleteFarmProjectService(farmId, projectId) { await ensureProject(projectId, farmId); return deleteProject(projectId); }
export async function addProjectBudgetLineService(farmId, projectId, input) { await ensureProject(projectId, farmId); return createProjectBudgetLine({ projectId, ...validated(validateBudgetLine(input)) }); }
export async function updateProjectBudgetLineService(farmId, projectId, lineId, input) { const project = await ensureProject(projectId, farmId); if (!project.budgetLines.some((line) => line.id === lineId)) throw fail(404, 'Budget line not found'); return updateProjectBudgetLine(lineId, validated(validateBudgetLine(input, true))); }
export async function deleteProjectBudgetLineService(farmId, projectId, lineId) { const project = await ensureProject(projectId, farmId); if (!project.budgetLines.some((line) => line.id === lineId)) throw fail(404, 'Budget line not found'); return deleteProjectBudgetLine(lineId); }

export default { listFarmProjectsService, createFarmProjectService, updateFarmProjectService, deleteFarmProjectService, addProjectBudgetLineService, updateProjectBudgetLineService, deleteProjectBudgetLineService };
