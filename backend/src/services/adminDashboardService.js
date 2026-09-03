import prisma from '../lib/prisma.js';
function toNumber(value) {
  
}

function safeMetric(query, fallback = 0) {
  return query.catch((error) => {
    if (error.code === 'P2021') return fallback;
    throw error;
  });
}

export function buildAdminDashboardSummary(metrics = {}) {
  const totalUsers = toNumber(metrics.userCount ?? metrics.totalUsers ?? 0);
  const activeUsers = toNumber(metrics.activeUsers ?? 0);
  const inactiveUsers = toNumber(metrics.inactiveUsers ?? 0);
  const suspendedUsers = toNumber(metrics.suspendedUsers ?? 0);
  const totalFarmOwners = toNumber(metrics.farmOwnerCount ?? metrics.totalFarmOwners ?? 0);
  const totalFarms = toNumber(metrics.farmCount ?? metrics.totalFarms ?? 0);
  const activeFarms = toNumber(metrics.activeFarmCount ?? metrics.activeFarms ?? 0);
  const totalWorkers = toNumber(metrics.workerCount ?? metrics.totalWorkers ?? 0);
  const totalCrops = toNumber(metrics.cropCount ?? metrics.totalCrops ?? 0);
  const totalLivestock = toNumber(metrics.livestockCount ?? metrics.totalLivestock ?? 0);
  const totalProduction = toNumber(metrics.productionCount ?? metrics.totalProduction ?? 0);
  const totalHarvest = toNumber(metrics.harvestCount ?? metrics.totalHarvest ?? 0);
  const totalSales = toNumber(metrics.salesCount ?? metrics.totalSales ?? 0);
  const totalExpensesValue = toNumber(metrics.expenseCount ?? metrics.totalExpensesValue ?? 0);
  const totalRevenue = toNumber(metrics.totalRevenue ?? 0);
  const totalExpenses = toNumber(metrics.totalExpenses ?? 0);
  const netProfit = toNumber(metrics.netProfit ?? totalRevenue - totalExpenses);
  const alertCount = toNumber(metrics.alertCount ?? 0);
  const recentActivityCount = toNumber(metrics.recentActivityCount ?? 0);

  return {
    totalUsers,
    activeUsers,
    inactiveUsers,
    suspendedUsers,
    totalFarmOwners,
    totalFarms,
    activeFarms,
    totalWorkers,
    totalCrops,
    totalLivestock,
    totalProduction,
    totalHarvest,
    totalSales,
    totalExpensesValue,
    totalRevenue,
    totalExpenses,
    netProfit,
    alertCount,
    recentActivityCount,
    status: 'OK',
  };
}

export async function getSystemWideDashboardSummary() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [usersByStatus, farmsByStatus, roles, salesAggregate, expenseAggregate] = await Promise.all([
    safeMetric(prisma.user.groupBy({ by: ['status'], _count: { id: true } }), []),
    safeMetric(prisma.farm.groupBy({ by: ['status'], _count: { id: true } }), []),
    safeMetric(prisma.role.findMany({ where: { name: { in: ['FARM_OWNER', 'WORKER'] } }, select: { name: true, _count: { select: { userRoles: true } } } }), []),
    safeMetric(prisma.sale.aggregate({ _sum: { totalAmount: true }, _count: { id: true } }), {}),
    safeMetric(prisma.expense.aggregate({ _sum: { amount: true } }), {}),
  ]);

  const userCount = usersByStatus.reduce((sum, row) => sum + row._count.id, 0);
  const activeUsers = usersByStatus.find((row) => row.status === 'ACTIVE')?._count.id || 0;
  const inactiveUsers = usersByStatus.find((row) => row.status === 'INACTIVE')?._count.id || 0;
  const suspendedUsers = usersByStatus.find((row) => row.status === 'SUSPENDED')?._count.id || 0;
  const farmCount = farmsByStatus.reduce((sum, row) => sum + row._count.id, 0);
  const activeFarmCount = farmsByStatus.find((row) => row.status === 'ACTIVE')?._count.id || 0;
  const farmOwnerCount = roles.find((row) => row.name === 'FARM_OWNER')?._count.userRoles || 0;
  const workerCount = roles.find((row) => row.name === 'WORKER')?._count.userRoles || 0;
  const cropCount = 0;
  const livestockCount = 0;
  const productionCount = 0;
  const harvestCount = 0;
  const salesCount = salesAggregate?._count?.id || 0;
  const alertCount = 0;
  const recentActivityCount = 0;

  const totalRevenue = toNumber(salesAggregate?._sum?.totalAmount ?? 0);
  const totalExpenses = toNumber(expenseAggregate?._sum?.amount ?? 0);

  return buildAdminDashboardSummary({
    userCount,
    activeUsers,
    inactiveUsers,
    suspendedUsers,
    farmOwnerCount,
    farmCount,
    activeFarmCount,
    workerCount,
    cropCount,
    livestockCount,
    productionCount,
    harvestCount,
    salesCount,
    totalRevenue,
    totalExpenses,
    netProfit: totalRevenue - totalExpenses,
    alertCount,
    recentActivityCount,
  });
}

export async function getAllUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      profilePictureUrl: true,
      status: true,
      emailVerified: true,
      phoneVerified: true,
      createdAt: true,
      userRoles: {
        select: {
          role: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getWorkersList() {
  return prisma.user.findMany({
    where: {
      userRoles: {
        some: {
          role: {
            name: 'WORKER',
          },
        },
      },
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      profilePictureUrl: true,
      status: true,
      createdAt: true,
      farmMembers: {
        select: {
          farm: {
            select: {
              id: true,
              name: true,
            },
          },
          role: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getAllFarms() {
  return prisma.farm.findMany({
    include: {
      owner: { select: { id: true, email: true, firstName: true, lastName: true } },
      _count: { select: { farmMembers: true, fields: true, farmActivities: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function updateFarmByAdmin(farmId, data) {
  return prisma.farm.update({
    where: { id: farmId },
    data,
    include: { owner: { select: { id: true, email: true, firstName: true, lastName: true } } },
  });
}

export async function getAllActivities() {
  return prisma.farmActivity.findMany({
    take: 100,
    include: {
      farm: { select: { id: true, name: true } },
      user: { select: { id: true, firstName: true, lastName: true, email: true } },
      assignee: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
    orderBy: { activityDate: 'desc' },
  });
}

export async function updateActivityByAdmin(activityId, data) {
  return prisma.farmActivity.update({ where: { id: activityId }, data });
}

export default {
  buildAdminDashboardSummary,
  getSystemWideDashboardSummary,
  getAllUsers,
  getWorkersList,
  getAllFarms,
  updateFarmByAdmin,
  getAllActivities,
  updateActivityByAdmin,
};
