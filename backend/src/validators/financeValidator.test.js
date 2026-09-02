import test from 'node:test';
import assert from 'node:assert/strict';

import {
  validateCreateExpense,
  validateCreateSale,
  validateCreateFinancialLoss,
  validateCreateBudget,
} from './financeValidator.js';

test('validateCreateExpense accepts valid expense payload and normalizes enum values', () => {
  const result = validateCreateExpense({
    category: 'feed',
    description: 'Poultry feed purchase',
    amount: '250.50',
    currency: 'GHS',
    costType: 'direct_cost',
    paymentMethod: 'mobile_money',
    expenseDate: '2025-01-15',
  });

  assert.equal(result.isValid, true);
  assert.equal(result.normalizedData.category, 'FEED');
  assert.equal(result.normalizedData.costType, 'DIRECT_COST');
  assert.equal(result.normalizedData.paymentMethod, 'MOBILE_MONEY');
  assert.equal(result.normalizedData.amount, 250.5);
});

test('validateCreateSale rejects missing sale number or total amount', () => {
  const result = validateCreateSale({
    buyer: 'Farm Market',
    saleDate: '2025-01-15',
  });

  assert.equal(result.isValid, false);
  assert.match(result.errors.saleNumber, /sale number/i);
  assert.match(result.errors.totalAmount, /valid number|greater than 0/i);
});

test('validateCreateFinancialLoss requires a valid category and loss date', () => {
  const result = validateCreateFinancialLoss({
    category: 'unknown',
    description: 'Bird mortality',
  });

  assert.equal(result.isValid, false);
  assert.match(result.errors.category, /category/i);
  assert.match(result.errors.lossDate, /required|valid date/i);
});

test('validateCreateBudget enforces positive budget and correct period', () => {
  const result = validateCreateBudget({
    name: 'January Budget',
    period: 'random',
    startDate: '2025-02-01',
    endDate: '2025-02-28',
    totalBudget: 0,
  });

  assert.equal(result.isValid, false);
  assert.match(result.errors.period, /period/i);
  assert.match(result.errors.totalBudget, /greater than 0/i);
});
