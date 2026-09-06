import prisma from '../lib/prisma.js';

const projectInclude = {
  creator: { select: { id: true, firstName: true, lastName: true, email: true } },
  budgetLines: { orderBy: { createdAt: 'asc' } },
};

function withMetrics(project) {
  const plannedBudget = project.budgetLines.reduce((sum, line) => sum + Number(line.plannedAmount), 0);
  const actualExpenditure = 0;
  const remainingBudget = plannedBudget - actualExpenditure;
  return {
    ...project,
    budgetLines: project.budgetLines.map((line) => ({ ...line, plannedAmount: Number(line.plannedAmount) })),
    plannedBudget,
    actualExpenditure,
    remainingBudget,
    utilizationPercentage: plannedBudget > 0 ? Number(((actualExpenditure / plannedBudget) * 100).toFixed(2)) : 0,
    budgetStatus: actualExpenditure > plannedBudget ? 'OVER_BUDGET' : actualExpenditure >= plannedBudget * 0.8 ? 'WARNING' : 'ON_TRACK',
  };
}

export async function listProjectsByFarm(farmId) {
  const projects = await prisma.project.findMany({ where: { farmId }, include: projectInclude, orderBy: { createdAt: 'desc' } });
  return projects.map(withMetrics);
}

export async function getProjectById(projectId) {
  const project = await prisma.project.findUnique({ where: { id: projectId }, include: projectInclude });
  return project ? withMetrics(project) : null;
}

export async function createProject(data) {
  const project = await prisma.project.create({ data, include: projectInclude });
  return withMetrics(project);
}

export async function updateProject(projectId, data) {
  const project = await prisma.project.update({ where: { id: projectId }, data, include: projectInclude });
  return withMetrics(project);
}

export function deleteProject(projectId) {
  return prisma.project.delete({ where: { id: projectId } });
}

export async function createProjectBudgetLine(data) {
  const line = await prisma.projectBudgetLine.create({ data });
  return { ...line, plannedAmount: Number(line.plannedAmount) };
}

export async function updateProjectBudgetLine(lineId, data) {
  const line = await prisma.projectBudgetLine.update({ where: { id: lineId }, data });
  return { ...line, plannedAmount: Number(line.plannedAmount) };
}

export function deleteProjectBudgetLine(lineId) {
  return prisma.projectBudgetLine.delete({ where: { id: lineId } });
}

export default { listProjectsByFarm, getProjectById, createProject, updateProject, deleteProject, createProjectBudgetLine, updateProjectBudgetLine, deleteProjectBudgetLine };
