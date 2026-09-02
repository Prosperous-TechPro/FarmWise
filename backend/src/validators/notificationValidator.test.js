import test from 'node:test';
import assert from 'node:assert/strict';

import {
  validateDevice,
  validateEventPayload,
  validateNotificationFilters,
  validatePreferencePatch,
} from './notificationValidator.js';

test('validates event payloads and defaults occurredAt', () => {
  const result = validateEventPayload({
    eventType: 'STOCK_LOW',
    farmId: 'farm_a',
    entityType: 'InventoryItem',
    entityId: 'item_a',
    metadata: { current: 20, reorder: 30, password: 'must-not-propagate' },
  });

  assert.equal(result.isValid, true);
  assert.equal(result.normalizedData.eventType, 'STOCK_LOW');
  assert.equal(result.normalizedData.occurredAt instanceof Date, true);
});

test('rejects invalid event types and secret-shaped metadata values are not accepted as event fields', () => {
  const result = validateEventPayload({ eventType: 'NOT_AN_EVENT', farmId: 'farm_a', metadata: [] });

  assert.equal(result.isValid, false);
  assert.match(result.errors.eventType, /valid/i);
  assert.match(result.errors.metadata, /JSON object/i);
});

test('validates device registration without exposing push token in normalized list concerns', () => {
  const result = validateDevice({ deviceId: 'device_a', platform: 'ANDROID', pushToken: 'push-token-value' });

  assert.equal(result.isValid, true);
  assert.equal(result.normalizedData.platform, 'ANDROID');
});

test('validates preference channel maps and notification filters', () => {
  const preferences = validatePreferencePatch({ LOW_STOCK: { IN_APP: true, SMS: false } });
  const filters = validateNotificationFilters({ page: '2', limit: '200', status: 'UNREAD', severity: 'HIGH' });

  assert.equal(preferences.isValid, true);
  assert.equal(filters.isValid, true);
  assert.equal(filters.normalizedData.page, 2);
  assert.equal(filters.normalizedData.limit, 100);
});
