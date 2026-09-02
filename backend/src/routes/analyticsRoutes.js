import express from 'express';
import {
  expensesAnalytics,
  farmDashboard,
  productionAnalytics,
  reportSummary,
  salesAnalytics,
  trendsAnalytics,
  userDashboardOverview,
} from '../controllers/analyticsController.js';
import { authenticate, authorize, requireFarmAccess } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();
router.use(authenticate, authorize);

router.get('/dashboard/overview', asyncHandler(userDashboardOverview));
router.get('/farms/:farmId/dashboard', requireFarmAccess, asyncHandler(farmDashboard));
router.get('/farms/:farmId/crops/dashboard', requireFarmAccess, asyncHandler(farmDashboard));
router.get('/farms/:farmId/livestock/dashboard', requireFarmAccess, asyncHandler(farmDashboard));
router.get('/farms/:farmId/inventory/dashboard', requireFarmAccess, asyncHandler(farmDashboard));
router.get('/analytics/expenses', asyncHandler(expensesAnalytics));
router.get('/analytics/sales', asyncHandler(salesAnalytics));
router.get('/analytics/production', asyncHandler(productionAnalytics));
router.get('/analytics/trends', asyncHandler(trendsAnalytics));
router.get('/reports/summary', asyncHandler(reportSummary));

export default router;
