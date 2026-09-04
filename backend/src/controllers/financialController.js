/**
 * Financial controller layer.
 */

import {
  createBudgetService,
  createExpenseService,
  deleteExpenseService,
  createFinancialLossService,
  createSaleService,
  getFarmProfitabilityService,
  listFarmBudgetsService,
  listFarmExpensesService,
  listFarmLossesService,
  listFarmSalesService,
} from '../services/financialService.js';

export async function listFarmExpenses(req, res) {
  const expenses = await listFarmExpensesService(req.params.farmId, {
    category: req.query.category,
    status: req.query.status,
    currency: req.query.currency,
    skip: Number(req.query.skip || 0),
    limit: Number(req.query.limit || 20),
  });
  return res.status(200).json({ success: true, data: expenses, message: 'Expenses fetched successfully' });
}

export async function createExpense(req, res) {
  const expense = await createExpenseService(req.params.farmId, req.user.id, req.body);
  return res.status(201).json({ success: true, data: expense, message: 'Expense created successfully' });
}

export async function deleteExpense(req, res) {
  await deleteExpenseService(req.params.farmId, req.params.expenseId);
  return res.status(204).send();
}

export async function listFarmSales(req, res) {
  const sales = await listFarmSalesService(req.params.farmId, {
    status: req.query.status,
    currency: req.query.currency,
    skip: Number(req.query.skip || 0),
    limit: Number(req.query.limit || 20),
  });
  return res.status(200).json({ success: true, data: sales, message: 'Sales fetched successfully' });
}

export async function createSale(req, res) {
  const sale = await createSaleService(req.params.farmId, req.user.id, req.body);
  return res.status(201).json({ success: true, data: sale, message: 'Sale created successfully' });
}

export async function listFarmLosses(req, res) {
  const losses = await listFarmLossesService(req.params.farmId, {
    category: req.query.category,
    status: req.query.status,
    skip: Number(req.query.skip || 0),
    limit: Number(req.query.limit || 20),
  });
  return res.status(200).json({ success: true, data: losses, message: 'Loss records fetched successfully' });
}

export async function createFinancialLoss(req, res) {
  const loss = await createFinancialLossService(req.params.farmId, req.user.id, req.body);
  return res.status(201).json({ success: true, data: loss, message: 'Loss record created successfully' });
}

export async function listFarmBudgets(req, res) {
  const budgets = await listFarmBudgetsService(req.params.farmId, {
    period: req.query.period,
    status: req.query.status,
    skip: Number(req.query.skip || 0),
    limit: Number(req.query.limit || 20),
  });
  return res.status(200).json({ success: true, data: budgets, message: 'Budgets fetched successfully' });
}

export async function createBudget(req, res) {
  const budget = await createBudgetService(req.params.farmId, req.user.id, req.body);
  return res.status(201).json({ success: true, data: budget, message: 'Budget created successfully' });
}

export async function getFarmProfitability(req, res) {
  const report = await getFarmProfitabilityService(req.params.farmId);
  return res.status(200).json({ success: true, data: report, message: 'Profitability report generated successfully' });
}

export default {
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
};
