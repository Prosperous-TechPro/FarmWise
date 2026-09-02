import test from 'node:test';
import assert from 'node:assert/strict';

import {
  validateCreateActivity,
  validateActivityStatusTransition,
  validateCreateObservation,
} from './activityValidator.js';

test('validateCreateActivity accepts valid farm activity payload', () => {
  const result = validateCreateActivity({
    title: 'Pig feeding',
    description: 'Feed batch PB001 at 07:00',
    category: 'FEEDING',
    activityTypeId: 'atype_123',
    status: 'PLANNED',
    priority: 'HIGH',
    scheduledDate: '2026-09-02',
    scheduledTime: '2026-09-02T07:00:00.000Z',
    fieldId: 'field_1',
  });

  assert.equal(result.isValid, true);
  assert.equal(result.normalizedData.title, 'Pig feeding');
  assert.equal(result.normalizedData.priority, 'HIGH');
});

test('validateCreateActivity rejects invalid status transitions and missing title', () => {
  const result = validateCreateActivity({
    title: '   ',
    description: 'Missing',
    category: 'MAINTENANCE',
    activityTypeId: 'atype_123',
    status: 'BAD_STATUS',
    priority: 'NORMAL',
    scheduledDate: '2026-09-02',
  });

  assert.equal(result.isValid, false);
  assert.match(result.errors.title, /required/i);
  assert.match(result.errors.status, /valid activity status/i);
});

test('validateActivityStatusTransition rejects impossible transitions', () => {
  const result = validateActivityStatusTransition('COMPLETED', 'IN_PROGRESS');

  assert.equal(result.isValid, false);
  assert.match(result.errors.transition, /not allowed/i);
});

test('validateCreateObservation requires category and description', () => {
  const result = validateCreateObservation({
    category: 'HEALTH',
    severity: 'HIGH',
    description: 'Pig not eating',
  });

  assert.equal(result.isValid, true);
  assert.equal(result.normalizedData.category, 'HEALTH');
});
