/**
 * Farm repository
 * Database access layer for farm and field operations.
 */

import prisma from '../lib/prisma.js';

export async function getFarmById(farmId) {
  return prisma.farm.findUnique({
    where: { id: farmId },
    include: {
      owner: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      farmMembers: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      fields: true,
      _count: {
        select: {
          farmMembers: true,
          fields: true,
        },
      },
    },
  });
}

export async function listUserFarms(userId, includeAll = false) {
  return prisma.farm.findMany({
    where: includeAll ? undefined : {
      OR: [{ ownerId: userId }, { farmMembers: { some: { userId, status: 'ACTIVE' } } }],
    },
    include: {
      owner: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      _count: {
        select: {
          farmMembers: true,
          fields: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createFarm(data) {
  return prisma.farm.create({
    data: {
      ownerId: data.ownerId,
      name: data.name,
      description: data.description,
      region: data.region,
      district: data.district,
      country: data.country,
      status: data.status || 'ACTIVE',
      farmMembers: {
        create: {
          userId: data.ownerId,
          role: 'OWNER',
          status: 'ACTIVE',
        },
      },
    },
    include: {
      owner: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      farmMembers: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });
}

export async function updateFarm(farmId, data) {
  return prisma.farm.update({
    where: { id: farmId },
    data,
    include: {
      owner: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      farmMembers: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });
}

export async function deleteFarm(farmId) {
  return prisma.farm.delete({ where: { id: farmId } });
}

export async function getFarmAccess(farmId, userId) {
  return prisma.farmMember.findFirst({
    where: {
      farmId,
      userId,
      status: 'ACTIVE',
    },
    include: {
      farm: true,
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });
}

export async function listFarmWorkers(farmId) {
  return prisma.farmMember.findMany({
    where: { farmId, status: 'ACTIVE', role: { not: 'OWNER' } },
    include: {
      user: { select: { id: true, email: true, firstName: true, lastName: true, status: true } },
      permissionGrants: { include: { permission: { select: { code: true, name: true, category: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function findFarmMember(memberId) {
  return prisma.farmMember.findUnique({ where: { id: memberId } });
}

export async function addFarmWorker(farmId, userId, role = 'WORKER') {
  const member = await prisma.farmMember.upsert({
    where: { userId_farmId: { userId, farmId } },
    create: { farmId, userId, role, status: 'ACTIVE' },
    update: { role, status: 'ACTIVE' },
    include: { user: { select: { id: true, email: true, firstName: true, lastName: true, status: true } } },
  });
  const workerRole = await prisma.role.findFirst({ where: { name: { in: ['FARM_WORKER', 'WORKER'] } }, orderBy: { name: 'asc' } });
  if (workerRole) await prisma.userRole.upsert({ where: { userId_roleId: { userId, roleId: workerRole.id } }, update: {}, create: { userId, roleId: workerRole.id } });
  return member;
}

export async function updateFarmWorker(memberId, data) {
  return prisma.farmMember.update({
    where: { id: memberId },
    data,
    include: { user: { select: { id: true, email: true, firstName: true, lastName: true, status: true } } },
  });
}

export async function findFieldById(fieldId) {
  return prisma.field.findUnique({
    where: { id: fieldId },
    include: {
      farm: true,
    },
  });
}

export async function listFarmFields(farmId) {
  return prisma.field.findMany({
    where: { farmId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createField(farmId, data) {
  return prisma.field.create({
    data: {
      farmId,
      name: data.name,
      description: data.description,
      area: data.area,
      areaUnit: data.areaUnit || 'HECTARE',
      latitude: data.latitude,
      longitude: data.longitude,
      status: data.status || 'ACTIVE',
    },
  });
}

export async function updateField(fieldId, data) {
  return prisma.field.update({
    where: { id: fieldId },
    data,
  });
}

export async function deleteField(fieldId) {
  return prisma.field.delete({ where: { id: fieldId } });
}

export default {
  getFarmById,
  listUserFarms,
  createFarm,
  updateFarm,
  deleteFarm,
  getFarmAccess,
  listFarmWorkers,
  findFarmMember,
  addFarmWorker,
  updateFarmWorker,
  findFieldById,
  listFarmFields,
  createField,
  updateField,
  deleteField,
};
