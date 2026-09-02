import test from 'node:test';
import assert from 'node:assert/strict';

import {
  validateCreateFarm,
  validateUpdateFarm,
  validateCreateField,
  validateUpdateField,
} from './farmValidator.js';

test('validateCreateFarm accepts valid farm payload', () => {
  const result = validateCreateFarm({
    name: 'Green Valley Farm',
    description: 'Mixed crop and poultry farm',
    region: 'Ashanti',
    district: 'Ejisu',
    country: 'Ghana',
    status: 'ACTIVE',
  });

  assert.equal(result.isValid, true);
  assert.equal(result.errors.name, undefined);
  assert.equal(result.normalizedData.name, 'Green Valley Farm');
});

test('validateCreateFarm rejects blank farm names', () => {
  const result = validateCreateFarm({ name: '   ', description: 'Test' });

  assert.equal(result.isValid, false);
  assert.match(result.errors.name, /Farm name/i);
});

test('validateCreateField requires positive area for hectares', () => {
  const result = validateCreateField({
    name: 'North Field',
    area: 0,
    areaUnit: 'HECTARE',
  });

  assert.equal(result.isValid, false);
  assert.match(result.errors.area, /greater than 0/i);
});

test('validateUpdateFarm normalizes status and trims values', () => {
  const result = validateUpdateFarm({
    name: '  Updated Farm  ',
    status: 'archived',
    country: '  Ghana  ',
  });

  assert.equal(result.isValid, true);
  assert.equal(result.normalizedData.name, 'Updated Farm');
  assert.equal(result.normalizedData.status, 'ARCHIVED');
  assert.equal(result.normalizedData.country, 'Ghana');
});
