/** Dashboard composition and analytics policy layer. */

import {
  getAccessibleFarmIds,
  getCropDashboardAggregate,
  getExpenseBreakdown,
  getFarmOperationalAggregate,
  getFinancialAggregate,
  getInventoryDashboardAggregate,
  getLivestockDashboardAggregate,
  getProductionAnalytics,
  getSalesAnalytics,
  getTaskDashboardAggregate,
  getTrend,
} from '../repositories/analyticsRepository.js';
import { profitabilityStatus } from '../validators/analyticsValidator.js';

function financialDto(financial) {
  const netProfit = financial.revenue - financial.expenses - financial.losses;
  return { ...financial, netProfit, profitMargin: financial.revenue ? (netProfit / financial.revenue) * 100 : null, status: profitabilityStatus(netProfit, financial.revenue) };
}

function permittedFinancialData(user, farmAccess) {
  return user.roles?.includes('SUPERADMIN') || user.roles?.includes('ADMIN') || ['OWNER', 'MANAGER'].includes(farmAccess?.role);
}

function canViewFarmFinancialData(user, farm) {
  return user.roles?.includes('SUPERADMIN') || user.roles?.includes('ADMIN') || farm.ownerId === user.id || farm.farmMembers?.some((member) => ['OWNER', 'MANAGER'].includes(member.role));
}

export async function getUserOverviewService(userId, user, dates = {}) {
  const farms = await getAccessibleFarmIds(userId);
  if (!farms.length) return { totalFarms: 0, activeFarms: 0, farms: [] };
  const operational = await Promise.all(farms.map((farm) => getFarmOperationalAggregate(farm.id, dates)));
  const financeFarms = farms.filter((farm) => canViewFarmFinancialData(user, farm));
  const financial = financeFarms.length ? financialDto(await getFinancialAggregate(financeFarms.map((farm) => farm.id), dates)) : null;
  const taskCounts = operational.flatMap((item) => item.tasks).filter((row) => ['TODO', 'IN_PROGRESS', 'BLOCKED'].includes(row.status)).reduce((sum, row) => sum + row._count.id, 0);
  const alertCounts = operational.flatMap((item) => item.alerts).filter((row) => ['ACTIVE', 'DETECTED'].includes(row.status)).reduce((sum, row) => sum + row._count.id, 0);
  return { totalFarms: farms.length, activeFarms: farms.filter((farm) => farm.status === 'ACTIVE').length, financial, activeTasks: taskCounts, activeAlerts: alertCounts, farms: farms.map((farm, index) => ({ id: farm.id, name: farm.name, status: farm.status, financial: canViewFarmFinancialData(user, farm) ? financialDto(operational[index].financial) : null })) };
}

export async function getFarmDashboardService(farmId, user, farmAccess, dates = {}) {
  const [aggregate, cropDashboard, livestockDashboard, inventoryDashboard, taskDashboard] = await Promise.all([
    getFarmOperationalAggregate(farmId, dates),
    getCropDashboardAggregate(farmId, dates),
    getLivestockDashboardAggregate(farmId, dates),
    getInventoryDashboardAggregate(farmId),
    getTaskDashboardAggregate(farmId, dates),
  ]);
  const response = {
    financial: permittedFinancialData(user, farmAccess) ? financialDto(aggregate.financial) : null,
    production: aggregate.production,
    crops: cropDashboard,
    livestock: livestockDashboard,
    tasks: taskDashboard,
    alerts: aggregate.alerts,
    inventory: inventoryDashboard,
  };
  return response;
}

export async function getAuthorizedFarmDashboardService(farmId, user, dates = {}) {
  const farms = await getAccessibleFarmIds(user.id);
  const farm = farms.find((item) => item.id === farmId);
  if (!farm) {
    const error = new Error('Farm not found or access denied');
    error.statusCode = 404;
    throw error;
  }
  const farmAccess = farm.ownerId === user.id ? { role: 'OWNER' } : { role: 'MANAGER' };
  return getFarmDashboardService(farmId, user, farmAccess, dates);
}

export async function getExpensesAnalyticsService(userId, user, query) {
  const farms = await getAccessibleFarmIds(userId);
  const financeFarms = farms.filter((farm) => canViewFarmFinancialData(user, farm));
  if (query.farmId && !financeFarms.some((farm) => farm.id === query.farmId)) return [];
  const farmIds = query.farmId ? financeFarms.filter((farm) => farm.id === query.farmId).map((farm) => farm.id) : financeFarms.map((farm) => farm.id);
  return getExpenseBreakdown(farmIds, query, query.category);
}

export async function getSalesAnalyticsService(userId, user, query) {
  const farms = await getAccessibleFarmIds(userId);
  const financeFarms = farms.filter((farm) => canViewFarmFinancialData(user, farm));
  if (query.farmId && !financeFarms.some((farm) => farm.id === query.farmId)) return [];
  const farmIds = query.farmId ? financeFarms.filter((farm) => farm.id === query.farmId).map((farm) => farm.id) : financeFarms.map((farm) => farm.id);
  return getSalesAnalytics(farmIds, query, query.product);
}

export async function getProductionAnalyticsService(userId, query) {
  const farms = await getAccessibleFarmIds(userId);
  if (query.farmId && !farms.some((farm) => farm.id === query.farmId)) return [];
  const farmIds = query.farmId ? farms.filter((farm) => farm.id === query.farmId).map((farm) => farm.id) : farms.map((farm) => farm.id);
  return getProductionAnalytics(farmIds, query);
}

export async function getTrendAnalyticsService(userId, user, query) {
  const farms = await getAccessibleFarmIds(userId);
  const financeFarms = farms.filter((farm) => canViewFarmFinancialData(user, farm));
  const farmIds = query.farmId ? financeFarms.filter((farm) => farm.id === query.farmId).map((farm) => farm.id) : financeFarms.map((farm) => farm.id);
  const trend = await getTrend(farmIds, query);
  return user.roles?.includes('SUPERADMIN') || user.roles?.includes('ADMIN') || financeFarms.length ? trend : trend.map((row) => ({ date: row.date, production: row.production }));
}

export { financialDto, permittedFinancialData };
