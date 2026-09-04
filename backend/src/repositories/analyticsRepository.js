/** Read-only, aggregate analytics queries over authoritative domain records. */

import prisma from '../lib/prisma.js';
function range(field, dateFrom, dateTo) {
  return dateFrom || dateTo ? { [field]: { ...(dateFrom ? { gte: dateFrom } : {}), ...(dateTo ? { lte: dateTo } : {}) } } : {};
}

export async function getAccessibleFarmIds(userId) {
  const farms = await prisma.farm.findMany({ where: { OR: [{ ownerId: userId }, { farmMembers: { some: { userId, status: 'ACTIVE' } } }] }, select: { id: true, name: true, status: true, ownerId: true, farmMembers: { where: { userId, status: 'ACTIVE' }, select: { role: true } } } });
  return farms;
}

export async function getFinancialAggregate(farmIds, dates = {}) {
  const [sales, expenses, losses] = await Promise.all([
    prisma.sale.aggregate({ where: { farmId: { in: farmIds }, ...range('saleDate', dates.dateFrom, dates.dateTo) }, _sum: { totalAmount: true }, _count: { id: true } }),
    prisma.expense.aggregate({ where: { farmId: { in: farmIds }, ...range('expenseDate', dates.dateFrom, dates.dateTo) }, _sum: { amount: true }, _count: { id: true } }),
    prisma.financialLoss.aggregate({ where: { farmId: { in: farmIds }, ...range('lossDate', dates.dateFrom, dates.dateTo) }, _sum: { estimatedValue: true }, _count: { id: true } }),
  ]);
  return { revenue: Number(sales._sum.totalAmount ?? 0), expenses: Number(expenses._sum.amount ?? 0), losses: Number(losses._sum.estimatedValue ?? 0), sales: sales._count.id, expenseCount: expenses._count.id, lossCount: losses._count.id };
}

export async function getFarmOperationalAggregate(farmId, dates = {}) {
  const productionRange = range('productionDate', dates.dateFrom, dates.dateTo);
  const [financial, production, productionByUnit, crops, livestock, tasks, alerts, inventory, workers] = await Promise.all([
    getFinancialAggregate([farmId], dates),
    prisma.productionRecord.aggregate({ where: { farmId, ...productionRange }, _sum: { quantity: true }, _count: { id: true } }),
    prisma.productionRecord.groupBy({ by: ['product', 'quantityUnit'], where: { farmId, ...productionRange }, _sum: { quantity: true }, _count: { id: true } }),
    prisma.cropCycle.groupBy({ by: ['status'], where: { farmId }, _count: { id: true }, _sum: { plantedArea: true } }),
    prisma.livestock.groupBy({ by: ['status', 'sex'], where: { farmId }, _count: { id: true } }),
    prisma.farmActivityTask.groupBy({ by: ['status'], where: { activity: { farmId }, ...range('dueDate', dates.dateFrom, dates.dateTo) }, _count: { id: true } }),
    prisma.farmAlert.groupBy({ by: ['status', 'severity'], where: { farmId }, _count: { id: true } }),
    prisma.inventoryStockBalance.groupBy({ by: ['stockStatus'], where: { farmId }, _sum: { currentQuantity: true }, _count: { id: true } }),
    prisma.farmMember.count({ where: { farmId, status: 'ACTIVE', role: { not: 'OWNER' } } }),
  ]);
  const byUnit = productionByUnit.map((row) => ({ product: row.product, unit: row.quantityUnit, quantity: Number(row._sum.quantity ?? 0), records: row._count.id }));
  const totalsByUnit = Object.fromEntries(byUnit.reduce((totals, row) => totals.set(row.unit, (totals.get(row.unit) || 0) + row.quantity), new Map()));
  return { financial, production: { recordCount: production._count.id, totalsByUnit, byUnit }, crops, livestock, tasks, alerts, inventory, workers: { active: workers } };
}

export async function getExpenseBreakdown(farmIds, dates = {}, category) {
  const rows = await prisma.expense.groupBy({ by: ['category'], where: { farmId: { in: farmIds }, ...range('expenseDate', dates.dateFrom, dates.dateTo), ...(category ? { category } : {}) }, _sum: { amount: true }, _count: { id: true } });
  return rows.map((row) => ({ category: row.category, amount: Number(row._sum.amount ?? 0), records: row._count.id }));
}

export async function getSalesAnalytics(farmIds, dates = {}, product) {
  const sales = await prisma.sale.findMany({ where: { farmId: { in: farmIds }, ...range('saleDate', dates.dateFrom, dates.dateTo), ...(product ? { saleItems: { some: { itemName: { contains: product, mode: 'insensitive' } } } } : {}) }, select: { totalAmount: true, saleDate: true, saleItems: { select: { itemName: true, itemType: true, quantity: true, unit: true, subtotal: true } } }, orderBy: { saleDate: 'asc' } });
  const byProduct = new Map();
  for (const sale of sales) for (const item of sale.saleItems) {
    const current = byProduct.get(item.itemName) || { product: item.itemName, category: item.itemType, revenue: 0, quantity: 0, unit: item.unit };
    current.revenue += Number(item.subtotal); current.quantity += Number(item.quantity); byProduct.set(item.itemName, current);
  }
  return { totalRevenue: sales.reduce((sum, sale) => sum + Number(sale.totalAmount), 0), saleCount: sales.length, byProduct: [...byProduct.values()].map((row) => ({ ...row, averageSellingPrice: row.quantity ? row.revenue / row.quantity : null })) };
}

export async function getProductionAnalytics(farmIds, dates = {}) {
  const rows = await prisma.productionRecord.groupBy({ by: ['product', 'quantityUnit'], where: { farmId: { in: farmIds }, ...range('productionDate', dates.dateFrom, dates.dateTo) }, _sum: { quantity: true }, _count: { id: true } });
  return rows.map((row) => ({ product: row.product, unit: row.quantityUnit, quantity: Number(row._sum.quantity ?? 0), records: row._count.id }));
}

export async function getCropDashboardAggregate(farmId, dates = {}) {
  const productionRange = range('productionDate', dates.dateFrom, dates.dateTo);
  const [cycles, production, expenses, sales, activities] = await Promise.all([
    prisma.cropCycle.findMany({
      where: { farmId },
      select: {
        id: true, cycleName: true, status: true, plantingDate: true, expectedHarvestDate: true,
        actualHarvestDate: true, plantedArea: true, areaUnit: true,
        crop: { select: { id: true, name: true } },
        field: { select: { id: true, name: true } },
      },
      orderBy: { expectedHarvestDate: 'asc' },
    }),
    prisma.productionRecord.groupBy({ by: ['cropCycleId', 'quantityUnit'], where: { farmId, cropCycleId: { not: null }, ...productionRange }, _sum: { quantity: true } }),
    prisma.expense.groupBy({ by: ['cropCycleId'], where: { farmId, cropCycleId: { not: null }, ...range('expenseDate', dates.dateFrom, dates.dateTo) }, _sum: { amount: true } }),
    prisma.sale.groupBy({ by: ['cropCycleId'], where: { farmId, cropCycleId: { not: null }, ...range('saleDate', dates.dateFrom, dates.dateTo) }, _sum: { totalAmount: true } }),
    prisma.farmActivity.count({ where: { farmId, cropCycleId: { not: null }, status: { in: ['PLANNED', 'IN_PROGRESS', 'OVERDUE'] }, ...range('activityDate', dates.dateFrom, dates.dateTo) } }),
  ]);
  const productionByCycle = new Map(production.map((row) => [row.cropCycleId, { quantity: Number(row._sum.quantity ?? 0), unit: row.quantityUnit }]));
  const expensesByCycle = new Map(expenses.map((row) => [row.cropCycleId, Number(row._sum.amount ?? 0)]));
  const salesByCycle = new Map(sales.map((row) => [row.cropCycleId, Number(row._sum.totalAmount ?? 0)]));
  return {
    activeCycles: cycles.filter((cycle) => !['COMPLETED', 'ABANDONED', 'CANCELLED'].includes(cycle.status)).length,
    areaUnderCultivation: cycles.reduce((sum, cycle) => sum + Number(cycle.plantedArea ?? 0), 0),
    upcomingActivities: activities,
    cycles: cycles.map((cycle) => {
      const result = productionByCycle.get(cycle.id);
      const revenue = salesByCycle.get(cycle.id) ?? 0;
      const expense = expensesByCycle.get(cycle.id) ?? 0;
      const yieldValue = result && cycle.plantedArea && ['ACRE', 'HECTARE'].includes(cycle.areaUnit) && result.unit === 'KILOGRAM' ? result.quantity / Number(cycle.plantedArea) : null;
      return { ...cycle, production: result ? { quantity: result.quantity, unit: result.unit } : null, expenses: expense, revenue, netResult: revenue - expense, yield: yieldValue === null ? null : { quantity: yieldValue, unit: `KILOGRAM_PER_${cycle.areaUnit}` } };
    }),
  };
}

export async function getLivestockDashboardAggregate(farmId, dates = {}) {
  const eventRange = range('eventDate', dates.dateFrom, dates.dateTo);
  const [animals, events, breeding, health, production] = await Promise.all([
    prisma.livestock.groupBy({ by: ['status', 'sex'], where: { farmId }, _count: { id: true } }),
    prisma.livestockEvent.groupBy({ by: ['eventType'], where: { livestock: { farmId }, ...eventRange }, _count: { id: true } }),
    prisma.breedingRecord.findMany({ where: { female: { farmId } }, select: { id: true, status: true, expectedFarrowingDate: true, actualFarrowingDate: true, female: { select: { id: true, tagNumber: true, name: true } } }, orderBy: { expectedFarrowingDate: 'asc' } }),
    prisma.healthRecord.groupBy({ by: ['recordType'], where: { livestock: { farmId }, ...eventRange }, _count: { id: true } }),
    prisma.productionRecord.groupBy({ by: ['product', 'quantityUnit'], where: { farmId, livestockId: { not: null }, ...range('productionDate', dates.dateFrom, dates.dateTo) }, _sum: { quantity: true } }),
  ]);
  const eventCount = (type) => events.find((row) => row.eventType === type)?._count.id ?? 0;
  return {
    animals: animals.map((row) => ({ status: row.status, sex: row.sex, count: row._count.id })),
    totalAnimals: animals.reduce((sum, row) => sum + row._count.id, 0),
    births: eventCount('BIRTH'),
    deaths: eventCount('MORTALITY'),
    sold: eventCount('SALE'),
    breeding: {
      totalMatingRecords: breeding.length,
      pregnancies: breeding.filter((row) => row.status === 'PREGNANCY_CONFIRMED').length,
      completedFarrowings: breeding.filter((row) => row.status === 'FARROWING_COMPLETED' || row.actualFarrowingDate).length,
      upcomingFarrowings: breeding.filter((row) => row.expectedFarrowingDate && !row.actualFarrowingDate && row.expectedFarrowingDate >= new Date()).map((row) => row),
      overdueFarrowings: breeding.filter((row) => row.expectedFarrowingDate && !row.actualFarrowingDate && row.expectedFarrowingDate < new Date()).map((row) => row),
    },
    health: health.map((row) => ({ type: row.recordType, count: row._count.id })),
    production: production.map((row) => ({ product: row.product, unit: row.quantityUnit, quantity: Number(row._sum.quantity ?? 0) })),
  };
}

export async function getInventoryDashboardAggregate(farmId) {
  const [items, statuses] = await Promise.all([
    prisma.inventoryItem.count({ where: { farmId, isActive: true } }),
    prisma.inventoryStockBalance.groupBy({ by: ['stockStatus'], where: { farmId }, _count: { id: true }, _sum: { currentQuantity: true } }),
  ]);
  const byStatus = (stockStatus) => statuses.find((row) => row.stockStatus === stockStatus)?._count.id ?? 0;
  return { totalItems: items, lowStockItems: byStatus('LOW_STOCK'), outOfStockItems: byStatus('OUT_OF_STOCK'), expiringItems: byStatus('EXPIRING_SOON'), expiredItems: byStatus('EXPIRED'), inventoryValue: null, inventoryValueReason: 'VALUATION_METHOD_NOT_CONFIGURED' };
}

export async function getTaskDashboardAggregate(farmId, dates = {}) {
  const now = new Date();
  const startToday = new Date(now); startToday.setHours(0, 0, 0, 0);
  const endToday = new Date(startToday); endToday.setDate(endToday.getDate() + 1);
  const endWeek = new Date(startToday); endWeek.setDate(endWeek.getDate() + 7);
  const where = { activity: { farmId }, ...(dates.dateFrom || dates.dateTo ? range('dueDate', dates.dateFrom, dates.dateTo) : {}) };
  const [total, completed, pending, overdue, dueToday, dueThisWeek] = await Promise.all([
    prisma.farmActivityTask.count({ where }),
    prisma.farmActivityTask.count({ where: { ...where, status: 'COMPLETED' } }),
    prisma.farmActivityTask.count({ where: { ...where, status: { in: ['TODO', 'IN_PROGRESS', 'BLOCKED'] } } }),
    prisma.farmActivityTask.count({ where: { ...where, status: { notIn: ['COMPLETED', 'CANCELLED'] }, dueDate: { lt: now } } }),
    prisma.farmActivityTask.count({ where: { ...where, status: { notIn: ['COMPLETED', 'CANCELLED'] }, dueDate: { gte: startToday, lt: endToday } } }),
    prisma.farmActivityTask.count({ where: { ...where, status: { notIn: ['COMPLETED', 'CANCELLED'] }, dueDate: { gte: startToday, lt: endWeek } } }),
  ]);
  return { total, completed, pending, overdue, dueToday, dueThisWeek };
}

export async function getTrend(farmIds, dates = {}) {
  const [sales, expenses, production] = await Promise.all([
    prisma.sale.findMany({ where: { farmId: { in: farmIds }, ...range('saleDate', dates.dateFrom, dates.dateTo) }, select: { saleDate: true, totalAmount: true } }),
    prisma.expense.findMany({ where: { farmId: { in: farmIds }, ...range('expenseDate', dates.dateFrom, dates.dateTo) }, select: { expenseDate: true, amount: true } }),
    prisma.productionRecord.findMany({ where: { farmId: { in: farmIds }, ...range('productionDate', dates.dateFrom, dates.dateTo) }, select: { productionDate: true, quantity: true, quantityUnit: true } }),
  ]);
  const trend = new Map();
  for (const sale of sales) { const key = sale.saleDate.toISOString().slice(0, 10); const row = trend.get(key) || { date: key, revenue: 0, expenses: 0, production: [] }; row.revenue += Number(sale.totalAmount); trend.set(key, row); }
  for (const expense of expenses) { const key = expense.expenseDate.toISOString().slice(0, 10); const row = trend.get(key) || { date: key, revenue: 0, expenses: 0, production: [] }; row.expenses += Number(expense.amount); trend.set(key, row); }
  for (const item of production) { const key = item.productionDate.toISOString().slice(0, 10); const row = trend.get(key) || { date: key, revenue: 0, expenses: 0, production: [] }; row.production.push({ unit: item.quantityUnit, quantity: Number(item.quantity) }); trend.set(key, row); }
  return [...trend.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export default { getAccessibleFarmIds, getFinancialAggregate, getFarmOperationalAggregate, getExpenseBreakdown, getSalesAnalytics, getProductionAnalytics, getTrend, getCropDashboardAggregate, getLivestockDashboardAggregate, getInventoryDashboardAggregate, getTaskDashboardAggregate };
