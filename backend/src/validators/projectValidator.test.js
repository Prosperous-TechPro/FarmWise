import assert from 'node:assert/strict';
import test from 'node:test';
import { validateBudgetLine, validateProject } from './projectValidator.js';

test('validateProject normalizes valid dates and rejects reversed ranges', () => {
  const valid = validateProject({ name: 'Irrigation', startDate: '2026-01-01', endDate: '2026-03-01', status: 'active' });
  assert.equal(valid.isValid, true);
  assert.equal(valid.normalizedData.status, 'ACTIVE');
  assert.ok(valid.normalizedData.startDate instanceof Date);

  const invalid = validateProject({ name: 'Irrigation', startDate: '2026-03-01', endDate: '2026-01-01' });
  assert.equal(invalid.isValid, false);
  assert.match(invalid.errors.endDate, /after/);
});

test('validateBudgetLine requires a finite positive planned amount', () => {
  assert.equal(validateBudgetLine({ name: 'Pipes', plannedAmount: '1250.50' }).isValid, true);
  assert.equal(validateBudgetLine({ name: 'Pipes', plannedAmount: 'not-a-number' }).isValid, false);
  assert.equal(validateBudgetLine({ name: 'Pipes', plannedAmount: 0 }).isValid, false);
});