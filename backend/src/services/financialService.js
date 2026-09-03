/**
 * Generic financial service layer.
 */

import {
  createBudget,
  createExpense,
  createFinancialLoss,
  createSale,
  getFarmFinancialSummary,
  listBudgetsByFarm,
  listExpensesByFarm,
  listLossesByFarm,
  listSalesByFarm,
} from '../repositories/financialRepository.js';
import { getProjectById } from '../repositories/projectRepository.js';
import { getFarmById } from '../repositories/farmRepository.js';
import {
  validateCreateBudget,
  validateCreateExpense,
  validateCreateFinancialLoss,
  validateCreateSale,
} from '../validators/financeValidator.js';

export async function listFarmExpensesService(farmId, filters = {}) {
  const farm = await getFarmById(farmId);
  if (!farm) {
    const error = new Error('Farm not found');
    error.statusCode = 404;
    throw error;
  }

  return listExpensesByFarm(farmId, filters);
}

export async function createExpenseService(farmId, userId, input) {
  const farm = await getFarmById(farmId);
  if (!farm) {
    const error = new Error('Farm not found');
    error.statusCode = 404;
    throw error;
  }

  const validation = validateCreateExpense(input);
  if (!validation.isValid) {
    const error = new Error('Validation failed');
    error.statusCode = 400;
    error.details = validation.errors;
    throw error;
  }

  if (validation.normalizedData.projectId) {
    const project = await getProjectById(validation.normalizedData.projectId);
    if (!project || project.farmId !== farmId) {
      const error = new Error('Project not found for this farm');
      error.statusCode = 400;
      throw error;
    }
  }

  return createExpense({
    farmId,
    recordedBy: userId,
    category: validation.normalizedData.category,
    description: validation.normalizedData.description,
    amount: validation.normalizedData.amount,
    currency: validation.normalizedData.currency,
    costType: validation.normalizedData.costType,
    paymentMethod: validation.normalizedData.paymentMethod,
    status: validation.normalizedData.status,
    expenseDate: validation.normalizedData.expenseDate,
    expenseTime: validation.normalizedData.expenseTime || null,
    projectId: validation.normalizedData.projectId || null,
    notes: input.notes || null,
  });
}

export async function listFarmSalesService(farmId, filters = {}) {
  const farm = await getFarmById(farmId);
  if (!farm) {
    const error = new Error('Farm not found');
    error.statusCode = 404;
    throw error;
  }

  return listSalesByFarm(farmId, filters);
}

export async function createSaleService(farmId, userId, input) {
  const farm = await getFarmById(farmId);
  if (!farm) {
    const error = new Error('Farm not found');
    error.statusCode = 404;
    throw error;
  }

  const validation = validateCreateSale(input);
  if (!validation.isValid) {
    const error = new Error('Validation failed');
    error.statusCode = 400;
    error.details = validation.errors;
    throw error;
  }

  return createSale({
    farmId,
    recordedBy: userId,
    saleNumber: validation.normalizedData.saleNumber,
    totalAmount: validation.normalizedData.totalAmount,
    currency: validation.normalizedData.currency,
    paymentMethod: validation.normalizedData.paymentMethod,
    status: validation.normalizedData.status,
    buyer: validation.normalizedData.buyer || null,
    saleDate: validation.normalizedData.saleDate,
    saleTime: input.saleTime || null,
    reference: input.reference || null,
    notes: validation.normalizedData.notes || null,
  });
}

export async function listFarmLossesService(farmId, filters = {}) {
  const farm = await getFarmById(farmId);
  if (!farm) {
    const error = new Error('Farm not found');
    error.statusCode = 404;
    throw error;
  }

  return listLossesByFarm(farmId, filters);
}

export async function createFinancialLossService(farmId, userId, input) {
  const farm = await getFarmById(farmId);
  if (!farm) {
    const error = new Error('Farm not found');
    error.statusCode = 404;
    throw error;
  }

  const validation = validateCreateFinancialLoss(input);
  if (!validation.isValid) {
    const error = new Error('Validation failed');
    error.statusCode = 400;
    error.details = validation.errors;
    throw error;
  }

  return createFinancialLoss({
    farmId,
    recordedBy: userId,
    category: validation.normalizedData.category,
    description: validation.normalizedData.description,
    quantity: input.quantity !== undefined ? Number(input.quantity) : null,
    unit: input.unit || null,
    estimatedValue: validation.normalizedData.estimatedValue || null,
    currency: validation.normalizedData.currency,
    lossDate: validation.normalizedData.lossDate,
    status: validation.normalizedData.status,
    notes: input.notes || null,
  });
}

export async function listFarmBudgetsService(farmId, filters = {}) {
  const farm = await getFarmById(farmId);
  if (!farm) {
    const error = new Error('Farm not found');
    error.statusCode = 404;
    throw error;
  }

  return listBudgetsByFarm(farmId, filters);
}

export async function createBudgetService(farmId, userId, input) {
  const farm = await getFarmById(farmId);
  if (!farm) {
    const error = new Error('Farm not found');
    error.statusCode = 404;
    throw error;
  }

  const validation = validateCreateBudget(input);
  if (!validation.isValid) {
    const error = new Error('Validation failed');
    error.statusCode = 400;
    error.details = validation.errors;
    throw error;
  }

  return createBudget({
    farmId,
    createdBy: userId,
    name: validation.normalizedData.name,
    period: validation.normalizedData.period,
    startDate: validation.normalizedData.startDate,
    endDate: validation.normalizedData.endDate,
    currency: validation.normalizedData.currency,
    totalBudget: validation.normalizedData.totalBudget,
    status: validation.normalizedData.status,
    notes: input.notes || null,
  });
}

export async function getFarmProfitabilityService(farmId) {
  const farm = await getFarmById(farmId);
  if (!farm) {
    const error = new Error('Farm not found');
    error.statusCode = 404;
    throw error;
  }

  return getFarmFinancialSummary(farmId);
}

export default {
  listFarmExpensesService,
  createExpenseService,
  listFarmSalesService,
  createSaleService,
  listFarmLossesService,
  createFinancialLossService,
  listFarmBudgetsService,
  createBudgetService,
  getFarmProfitabilityService,
};
