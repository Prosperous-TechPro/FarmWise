import {
  getExpensesAnalyticsService,
  getAuthorizedFarmDashboardService,
  getFarmDashboardService,
  getProductionAnalyticsService,
  getSalesAnalyticsService,
  getTrendAnalyticsService,
  getUserOverviewService,
} from '../services/analyticsService.js';
import { validateAnalyticsQuery } from '../validators/analyticsValidator.js';

function queryFilters(query) {
  const validation = validateAnalyticsQuery(query);
  if (!validation.isValid) {
    const error = new Error('Invalid analytics filters');
    error.statusCode = 400;
    error.details = validation.errors;
    throw error;
  }
  return validation.normalizedData;
}

export async function userDashboardOverview(req, res) {
  return res.json({ success: true, data: await getUserOverviewService(req.user.id, req.user, queryFilters(req.query)) });
}

export async function farmDashboard(req, res) {
  const filters = queryFilters(req.query);
  return res.json({ success: true, data: await getFarmDashboardService(req.params.farmId, req.user, req.farmAccess, filters) });
}

export async function expensesAnalytics(req, res) {
  return res.json({ success: true, data: await getExpensesAnalyticsService(req.user.id, req.user, queryFilters(req.query)) });
}

export async function salesAnalytics(req, res) {
  return res.json({ success: true, data: await getSalesAnalyticsService(req.user.id, req.user, queryFilters(req.query)) });
}

export async function productionAnalytics(req, res) {
  return res.json({ success: true, data: await getProductionAnalyticsService(req.user.id, queryFilters(req.query)) });
}

export async function trendsAnalytics(req, res) {
  return res.json({ success: true, data: await getTrendAnalyticsService(req.user.id, req.user, queryFilters(req.query)) });
}

export async function reportSummary(req, res) {
  const filters = queryFilters(req.query);
  const data = filters.farmId ? await getAuthorizedFarmDashboardService(filters.farmId, req.user, filters) : await getUserOverviewService(req.user.id, req.user, filters);
  return res.json({ success: true, data, format: 'JSON', reportType: req.query.reportType || 'FARM_SUMMARY' });
}
