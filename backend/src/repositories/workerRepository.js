import prisma from '../lib/prisma.js';

export async function listWorkerFarmPermissions(farmId, userId) {
  const member = await prisma.farmMember.findFirst({
    where: { farmId, userId, status: 'ACTIVE', role: { in: ['WORKER', 'FARM_WORKER'] } },
    include: { permissionGrants: { include: { permission: true }, orderBy: { createdAt: 'asc' } } },
  });
  return member?.permissionGrants || [];
}

export async function listPermissionDefinitions() {
  return prisma.permission.findMany({ orderBy: [{ category: 'asc' }, { name: 'asc' }] });
}

export async function replaceWorkerFarmPermissions(farmId, memberId, permissionCodes, grantedById) {
  const member = await prisma.farmMember.findFirst({
    where: { id: memberId, farmId, role: { in: ['WORKER', 'FARM_WORKER'] } },
    select: { id: true },
  });
  if (!member) return null;

  const permissions = await prisma.permission.findMany({
    where: { code: { in: permissionCodes } },
    select: { id: true, code: true },
  });
  if (permissions.length !== permissionCodes.length) {
    const error = new Error('One or more permission codes are invalid');
    error.statusCode = 400;
    throw error;
  }

  return prisma.$transaction(async (transaction) => {
    await transaction.workerFarmPermission.deleteMany({ where: { farmMemberId: memberId } });
    if (permissions.length) {
      await transaction.workerFarmPermission.createMany({
        data: permissions.map((permission) => ({ farmMemberId: memberId, permissionId: permission.id, grantedById })),
      });
    }
    return transaction.workerFarmPermission.findMany({
      where: { farmMemberId: memberId },
      include: { permission: true },
      orderBy: { createdAt: 'asc' },
    });
  });
}

export async function getWorkerDashboard(userId) {
  const farms = await prisma.farm.findMany({
    where: { farmMembers: { some: { userId, status: 'ACTIVE', role: { in: ['WORKER', 'FARM_WORKER'] } } } },
    select: { id: true, name: true, region: true, status: true },
    orderBy: { name: 'asc' },
  });
  const farmIds = farms.map((farm) => farm.id);
  if (!farmIds.length) return { farms: [], tasks: [], activities: [], alerts: [] };

  const [tasks, activities, alerts] = await Promise.all([
    prisma.farmActivityTask.findMany({
      where: { assigneeId: userId, activity: { farmId: { in: farmIds } }, status: { notIn: ['COMPLETED', 'CANCELLED'] } },
      include: { activity: { select: { farmId: true, title: true } } },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }], take: 50,
    }),
    prisma.farmActivity.findMany({ where: { farmId: { in: farmIds }, OR: [{ userId }, { assigneeId: userId }] }, orderBy: { createdAt: 'desc' }, take: 20 }),
    prisma.farmAlert.findMany({ where: { farmId: { in: farmIds }, status: { in: ['ACTIVE', 'DETECTED'] } }, orderBy: { createdAt: 'desc' }, take: 20 }),
  ]);

  return { farms, tasks, activities, alerts };
}

export async function listWorkerTasks(userId, farmId) {
  return prisma.farmActivityTask.findMany({
    where: { assigneeId: userId, activity: { farmId } },
    include: { activity: { select: { id: true, farmId: true, title: true } } },
    orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
  });
}

export async function updateWorkerTask(userId, taskId, data) {
  const task = await prisma.farmActivityTask.findFirst({
    where: { id: taskId, assigneeId: userId },
    include: { activity: { select: { farmId: true } } },
  });
  if (!task) return null;
  const grant = await prisma.workerFarmPermission.findFirst({
    where: { farmMember: { farmId: task.activity.farmId, userId, status: 'ACTIVE', role: { in: ['WORKER', 'FARM_WORKER'] } }, permission: { code: 'UPDATE_ASSIGNED_TASK' } },
    select: { id: true },
  });
  if (!grant) return null;
  return prisma.farmActivityTask.update({ where: { id: taskId }, data, include: { activity: true } });
}

export async function getMemberPermissions(farmId, memberId) {
  return prisma.workerFarmPermission.findMany({
    where: { farmMemberId: memberId, farmMember: { farmId } },
    include: { permission: true },
    orderBy: { createdAt: 'asc' },
  });
}