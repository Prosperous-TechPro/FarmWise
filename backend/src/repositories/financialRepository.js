/**
 * Generic financial repository for expense, sale, loss, and budget records.
 */

import prisma from '../lib/prisma.js';

export async function listExpensesByFarm(farmId, filters = {}) {
  return prisma.expense.findMany({
    where: {
      farmId,
      ...(filters.category ? { category: filters.category } : {}),
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.currency ? { currency: filters.currency } : {}),
    },
    include: {
      recordedByUser: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
    orderBy: { expenseDate: 'desc' },
    skip: filters.skip || 0,
    take: filters.limit || 20,
  });
}

export async function createExpense(data) {
  return prisma.expense.create({
    data,
    include: {
      recordedByUser: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  });
}

export async function deleteExpense(expenseId) {
  return prisma.expense.delete({ where: { id: expenseId } });
}

export async function getExpenseById(expenseId) {
  return prisma.expense.findUnique({ where: { id: expenseId }, select: { id: true, farmId: true } });
}

export async function listSalesByFarm(farmId, filters = {}) {
  return prisma.sale.findMany({
    where: {
      farmId,
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.currency ? { currency: filters.currency } : {}),
    },
    include: {
      recordedByUser: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      saleItems: true,
    },
    orderBy: { saleDate: 'desc' },
    skip: filters.skip || 0,
    take: filters.limit || 20,
  });
}

export async function createSale(data) {
  return prisma.sale.create({
    data,
    include: {
      recordedByUser: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      saleItems: true,
    },
  });
}

export async function listLossesByFarm(farmId, filters = {}) {
  return prisma.financialLoss.findMany({
    where: {
      farmId,
      ...(filters.category ? { category: filters.category } : {}),
      ...(filters.status ? { status: filters.status } : {}),
    },
    include: {
      recordedByUser: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
    orderBy: { lossDate: 'desc' },
    skip: filters.skip || 0,
    take: filters.limit || 20,
  });
}

export async function createFinancialLoss(data) {
  return prisma.financialLoss.create({
    data,
    include: {
      recordedByUser: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  });
}

export async function listBudgetsByFarm(farmId, filters = {}) {
  return prisma.budget.findMany({
    where: {
      farmId,
      ...(filters.period ? { period: filters.period } : {}),
      ...(filters.status ? { status: filters.status } : {}),
    },
    include: {
      createdByUser: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      items: true,
    },
    orderBy: { startDate: 'desc' },
    skip: filters.skip || 0,
    take: filters.limit || 20,
  });
}

export async function createBudget(data) {
  return prisma.budget.create({
    data,
    include: {
      createdByUser: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      items: true,
    },
  });
}

export async function getFarmFinancialSummary(farmId) {
  const [expenses, sales, losses, budgets] = await Promise.all([
    prisma.expense.aggregate({
      where: { farmId },
      _sum: { amount: true },
      _count: { id: true },
    }),
    prisma.sale.aggregate({
      where: { farmId },
      _sum: { totalAmount: true },
      _count: { id: true },
    }),
    prisma.financialLoss.aggregate({
      where: { farmId },
      _sum: { estimatedValue: true },
      _count: { id: true },
    }),
    prisma.budget.aggregate({
      where: { farmId },
      _sum: { totalBudget: true },
      _count: { id: true },
    }),
  ]);

  const totalExpenses = Number(expenses._sum.amount ?? 0);
  const totalRevenue = Number(sales._sum.totalAmount ?? 0);
  const totalLosses = Number(losses._sum.estimatedValue ?? 0);
  const totalBudget = Number(budgets._sum.totalBudget ?? 0);

  return {
    totalRevenue,
    totalExpenses,
    totalLosses,
    totalBudget,
    netProfit: totalRevenue - totalExpenses - totalLosses,
    expenseCount: expenses._count.id,
    saleCount: sales._count.id,
    lossCount: losses._count.id,
    budgetCount: budgets._count.id,
  };
}

export default {
  listExpensesByFarm,
  createExpense,
  deleteExpense,
  getExpenseById,
  listSalesByFarm,
  createSale,
  listLossesByFarm,
  createFinancialLoss,
  listBudgetsByFarm,
  createBudget,
  getFarmFinancialSummary,
};
