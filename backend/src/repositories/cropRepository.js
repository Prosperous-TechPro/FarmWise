/**
 * Crop repository
 */

import prisma from '../lib/prisma.js';

export async function listCrops(filters = {}) {
  return prisma.crop.findMany({
    where: {
      ...(filters.name ? { name: { contains: filters.name, mode: 'insensitive' } } : {}),
    },
    include: {
      cropVarieties: true,
    },
    orderBy: { name: 'asc' },
    skip: filters.skip || 0,
    take: filters.limit || 20,
  });
}

export async function getCropById(cropId) {
  return prisma.crop.findUnique({
    where: { id: cropId },
    include: {
      cropVarieties: true,
    },
  });
}

export async function createCrop(data) {
  return prisma.crop.create({
    data,
  });
}

export async function listCropVarieties(cropId) {
  return prisma.cropVariety.findMany({
    where: cropId ? { cropId } : undefined,
    orderBy: { name: 'asc' },
  });
}

export async function createCropVariety(data) {
  return prisma.cropVariety.create({ data });
}

export async function listCropCyclesForFarm(farmId, filters = {}) {
  return prisma.cropCycle.findMany({
    where: {
      farmId,
      ...(filters.cropId ? { cropId: filters.cropId } : {}),
      ...(filters.fieldId ? { fieldId: filters.fieldId } : {}),
      ...(filters.status ? { status: filters.status } : {}),
    },
    include: {
      crop: true,
      variety: true,
      field: true,
    },
    orderBy: { createdAt: 'desc' },
    skip: filters.skip || 0,
    take: filters.limit || 20,
  });
}

export async function getCropCycleById(cropCycleId) {
  return prisma.cropCycle.findUnique({
    where: { id: cropCycleId },
    include: {
      crop: true,
      variety: true,
      field: true,
      activities: { orderBy: { activityDate: 'desc' } },
      inputs: { orderBy: { applicationDate: 'desc' } },
      observations: { orderBy: { observationDate: 'desc' } },
      growthRecords: { orderBy: { observationDate: 'desc' } },
      produce: { orderBy: { produceDate: 'desc' } },
    },
  });
}

export async function createCropCycle(data) {
  return prisma.cropCycle.create({
    data,
    include: {
      crop: true,
      variety: true,
      field: true,
    },
  });
}

export async function updateCropCycle(cropCycleId, data) {
  return prisma.cropCycle.update({
    where: { id: cropCycleId },
    data,
    include: {
      crop: true,
      variety: true,
      field: true,
    },
  });
}

export async function listCropActivities(cropCycleId) {
  return prisma.cropCycleActivity.findMany({
    where: { cropCycleId },
    orderBy: { activityDate: 'desc' },
  });
}

export async function createCropActivity(data) {
  return prisma.cropCycleActivity.create({ data });
}

export async function listCropInputs(cropCycleId) {
  return prisma.cropCycleInput.findMany({
    where: { cropCycleId },
    orderBy: { applicationDate: 'desc' },
  });
}

export async function createCropInput(data) {
  return prisma.cropCycleInput.create({ data });
}

export async function listCropObservations(cropCycleId) {
  return prisma.cropObservation.findMany({
    where: { cropCycleId },
    orderBy: { observationDate: 'desc' },
  });
}

export async function createCropObservation(data) {
  return prisma.cropObservation.create({ data });
}

export async function listCropGrowthRecords(cropCycleId) {
  return prisma.cropGrowthRecord.findMany({
    where: { cropCycleId },
    orderBy: { observationDate: 'desc' },
  });
}

export async function createCropGrowthRecord(data) {
  return prisma.cropGrowthRecord.create({ data });
}

export default {
  listCrops,
  getCropById,
  createCrop,
  listCropVarieties,
  createCropVariety,
  listCropCyclesForFarm,
  getCropCycleById,
  createCropCycle,
  updateCropCycle,
  listCropActivities,
  createCropActivity,
  listCropInputs,
  createCropInput,
  listCropObservations,
  createCropObservation,
  listCropGrowthRecords,
  createCropGrowthRecord,
};
