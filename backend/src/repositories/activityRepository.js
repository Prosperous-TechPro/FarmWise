/**
 * Generic farm activity repository.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function listActivityTypesByFarm(farmId) {
  return prisma.farmActivityType.findMany({
    where: { farmId },
    orderBy: { name: 'asc' },
  });
}

export async function createActivityType(data) {
  return prisma.farmActivityType.create({ data });
}

export async function listActivitiesByFarm(farmId, filters = {}) {
  return prisma.farmActivity.findMany({
    where: {
      farmId,
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.category ? { category: filters.category } : {}),
      ...(filters.assigneeId ? { assigneeId: filters.assigneeId } : {}),
    },
    include: {
      activityType: true,
      assignee: true,
      tasks: { orderBy: { dueDate: 'asc' } },
      observations: { orderBy: { observedAt: 'desc' } },
    },
    orderBy: { activityDate: 'desc' },
    skip: Number(filters.skip) || 0,
    take: Number(filters.limit) || 20,
  });
}

export async function getActivityById(activityId) {
  return prisma.farmActivity.findUnique({
    where: { id: activityId },
    include: {
      activityType: true,
      assignee: true,
      tasks: { orderBy: { dueDate: 'asc' } },
      observations: { orderBy: { observedAt: 'desc' } },
    },
  });
}

export async function createActivity(data) {
  return prisma.farmActivity.create({
    data,
    include: {
      activityType: true,
      assignee: true,
      tasks: true,
      observations: true,
    },
  });
}

export async function updateActivity(activityId, data) {
  return prisma.farmActivity.update({
    where: { id: activityId },
    data,
    include: {
      activityType: true,
      assignee: true,
      tasks: true,
      observations: true,
    },
  });
}

export async function createActivityTask(activityId, data) {
  return prisma.farmActivityTask.create({
    data: { activityId, ...data },
    include: { assignee: true },
  });
}

export async function listActivityTasksByActivity(activityId) {
  return prisma.farmActivityTask.findMany({
    where: { activityId },
    include: { assignee: true },
    orderBy: { dueDate: 'asc' },
  });
}

export async function createActivityObservation(activityId, data) {
  return prisma.farmActivityObservation.create({
    data: { activityId, ...data },
    include: { observedByUser: true },
  });
}

export async function listActivityObservationsByActivity(activityId) {
  return prisma.farmActivityObservation.findMany({
    where: { activityId },
    include: { observedByUser: true },
    orderBy: { observedAt: 'desc' },
  });
}

export async function listProductionRecordsByFarm(farmId, filters = {}) {
  return prisma.productionRecord.findMany({
    where: {
      farmId,
      ...(filters.cropCycleId ? { cropCycleId: filters.cropCycleId } : {}),
      ...(filters.livestockId ? { livestockId: filters.livestockId } : {}),
    },
    include: {
      recordedByUser: true,
      cropCycle: true,
      livestock: true,
    },
    orderBy: { productionDate: 'desc' },
    skip: Number(filters.skip) || 0,
    take: Number(filters.limit) || 20,
  });
}

export async function createProductionRecord(data) {
  return prisma.productionRecord.create({
    data,
    include: {
      recordedByUser: true,
      cropCycle: true,
      livestock: true,
    },
  });
}

export async function listHarvestsByFarm(farmId, filters = {}) {
  return prisma.harvest.findMany({
    where: {
      farmId,
      ...(filters.cropCycleId ? { cropCycleId: filters.cropCycleId } : {}),
    },
    include: {
      cropCycle: true,
      recordedByUser: true,
      produce: true,
    },
    orderBy: { harvestDate: 'desc' },
    skip: Number(filters.skip) || 0,
    take: Number(filters.limit) || 20,
  });
}

export async function createHarvest(data) {
  return prisma.harvest.create({
    data,
    include: {
      cropCycle: true,
      recordedByUser: true,
      produce: true,
    },
  });
}

export default {
  listActivityTypesByFarm,
  createActivityType,
  listActivitiesByFarm,
  getActivityById,
  createActivity,
  updateActivity,
  createActivityTask,
  listActivityTasksByActivity,
  createActivityObservation,
  listActivityObservationsByActivity,
  listProductionRecordsByFarm,
  createProductionRecord,
  listHarvestsByFarm,
  createHarvest,
};
