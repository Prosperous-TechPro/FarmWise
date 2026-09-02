import test from 'node:test';
import assert from 'node:assert/strict';

import { buildAdminDashboardSummary } from '../services/adminDashboardService.js';

test('buildAdminDashboardSummary aggregates system-wide metrics', () => {
  const result = buildAdminDashboardSummary({
    userCount: 1250,
    activeUsers: 980,
    inactiveUsers: 220,
    suspendedUsers: 50,
    farmOwnerCount: 420,
    farmCount: 420,
    activeFarmCount: 360,
    workerCount: 890,
    cropCount: 1500,
    livestockCount: 3250,
    productionCount: 7200,
    harvestCount: 1450,
    salesCount: 870,
    expenseCount: 560,
    totalRevenue: 245000,
    totalExpenses: 180000,
    netProfit: 65000,
    alertCount: 12,
    recentActivityCount: 54,
  });

  assert.equal(result.totalUsers, 1250);
  assert.equal(result.activeUsers, 980);
  assert.equal(result.totalFarms, 420);
  assert.equal(result.totalWorkers, 890);
  assert.equal(result.totalLivestock, 3250);
  assert.equal(result.totalRevenue, 245000);
  assert.equal(result.netProfit, 65000);
  assert.equal(result.alertCount, 12);
  assert.equal(result.status, 'OK');
});
