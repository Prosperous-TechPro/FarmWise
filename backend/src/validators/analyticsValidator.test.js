import test from 'node:test';
import assert from 'node:assert/strict';

import { getDateRangePreset, percentageChange, profitabilityStatus, validateAnalyticsQuery } from './analyticsValidator.js';

test('validates analytics date ranges and caps pagination', () => {
  const result = validateAnalyticsQuery({ dateFrom: '2026-08-01', dateTo: '2026-08-31', groupBy: 'WEEK', limit: '500' });

  assert.equal(result.isValid, true);
  assert.equal(result.normalizedData.groupBy, 'WEEK');
  assert.equal(result.normalizedData.limit, 100);
});

test('rejects reversed or invalid analytics date ranges', () => {
  const reversed = validateAnalyticsQuery({ dateFrom: '2026-09-02', dateTo: '2026-09-01' });
  const invalid = validateAnalyticsQuery({ dateFrom: 'not-a-date' });

  assert.equal(reversed.isValid, false);
  assert.match(reversed.errors.dateRange, /before/i);
  assert.equal(invalid.isValid, false);
  assert.match(invalid.errors.dateFrom, /valid date/i);
});

test('calculates date presets, safe percentage changes, and profitability states', () => {
  const preset = getDateRangePreset('yesterday', new Date('2026-09-02T12:00:00.000Z'));

  assert.equal(preset.dateFrom.toISOString().slice(0, 10), '2026-09-01');
  assert.equal(validateAnalyticsQuery({ preset: 'month' }).isValid, true);
  assert.equal(percentageChange(10, 0), null);
  assert.equal(percentageChange(0, 0), 0);
  assert.equal(profitabilityStatus(-1, 100), 'LOSS');
  assert.equal(profitabilityStatus(5, 100), 'MANAGEABLE');
  assert.equal(profitabilityStatus(50, 100), 'PROFIT');
});
