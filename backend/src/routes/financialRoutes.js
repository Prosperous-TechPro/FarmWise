/**
 * Generic financial management routes
 */

import express from 'express';
import {
  listFarmExpenses,
  createExpense,
  deleteExpense,
  listFarmSales,
  createSale,
  listFarmLosses,
  createFinancialLoss,
  listFarmBudgets,
  createBudget,
  getFarmProfitability,
} from '../controllers/financialController.js';
import { authenticate, authorize, requireFarmAccess, requireFarmRole } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

router.use(authenticate, authorize);

router.get('/farms/:farmId/expenses', requireFarmAccess, requireFarmRole(['OWNER', 'MANAGER', 'WORKER']), asyncHandler(listFarmExpenses));
router.post('/farms/:farmId/expenses', requireFarmAccess, requireFarmRole(['OWNER', 'MANAGER', 'WORKER']), asyncHandler(createExpense));
router.delete('/farms/:farmId/expenses/:expenseId', requireFarmAccess, requireFarmRole(['OWNER', 'MANAGER', 'WORKER']), asyncHandler(deleteExpense));

router.get('/farms/:farmId/sales', requireFarmAccess, requireFarmRole(['OWNER', 'MANAGER', 'WORKER']), asyncHandler(listFarmSales));
router.post('/farms/:farmId/sales', requireFarmAccess, requireFarmRole(['OWNER', 'MANAGER', 'WORKER']), asyncHandler(createSale));

router.get('/farms/:farmId/losses', requireFarmAccess, requireFarmRole(['OWNER', 'MANAGER']), asyncHandler(listFarmLosses));
router.post('/farms/:farmId/losses', requireFarmAccess, requireFarmRole(['OWNER', 'MANAGER']), asyncHandler(createFinancialLoss));

router.get('/farms/:farmId/budgets', requireFarmAccess, requireFarmRole(['OWNER', 'MANAGER']), asyncHandler(listFarmBudgets));
router.post('/farms/:farmId/budgets', requireFarmAccess, requireFarmRole(['OWNER', 'MANAGER']), asyncHandler(createBudget));

router.get('/farms/:farmId/profitability', requireFarmAccess, requireFarmRole(['OWNER', 'MANAGER', 'WORKER']), asyncHandler(getFarmProfitability));

export default router;
