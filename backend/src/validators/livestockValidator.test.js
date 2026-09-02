import test from 'node:test';
import assert from 'node:assert/strict';

import {
  calculateExpectedFarrowingDate,
  validateCreateLivestock,
  validateMatingInput,
} from './livestockValidator.js';

test('calculateExpectedFarrowingDate handles normal pig gestation', () => {
  const result = calculateExpectedFarrowingDate(new Date('2026-01-01T00:00:00Z'), 114);
  assert.equal(result.toISOString().slice(0, 10), '2026-04-25');
});

test('calculateExpectedFarrowingDate handles month boundaries', () => {
  const result = calculateExpectedFarrowingDate(new Date('2026-01-31T12:00:00Z'), 114);
  assert.equal(result.toISOString().slice(0, 10), '2026-05-25');
});

test('calculateExpectedFarrowingDate handles leap year logic', () => {
  const result = calculateExpectedFarrowingDate(new Date('2024-02-29T00:00:00Z'), 114);
  assert.equal(result.toISOString().slice(0, 10), '2024-06-22');
});

test('calculateExpectedFarrowingDate rejects invalid dates', () => {
  assert.throws(() => calculateExpectedFarrowingDate('not-a-date', 114));
});

test('validateMatingInput accepts female + male pig pairing', () => {
  const result = validateMatingInput({
    femaleSex: 'FEMALE',
    maleSex: 'MALE',
    femaleAnimalId: 'female-1',
    maleAnimalId: 'male-1',
    matingDate: '2026-01-01T08:30:00Z',
  });

  assert.equal(result.isValid, true);
  assert.equal(result.errors.femaleSex, undefined);
});

test('validateMatingInput rejects male as female', () => {
  const result = validateMatingInput({
    femaleSex: 'MALE',
    maleSex: 'MALE',
    femaleAnimalId: 'male-1',
    maleAnimalId: 'male-2',
    matingDate: '2026-01-01T08:30:00Z',
  });

  assert.equal(result.isValid, false);
  assert.match(result.errors.femaleSex, /female/i);
});

test('validateCreateLivestock accepts valid generic livestock data', () => {
  const result = validateCreateLivestock({
    speciesId: 'species-1',
    breedId: 'breed-1',
    tagNumber: 'PIG-001',
    name: 'Luna',
    sex: 'FEMALE',
    status: 'ACTIVE',
    acquisitionType: 'BORN_ON_FARM',
    acquisitionDate: '2026-01-15T00:00:00Z',
    dateOfBirth: '2025-06-15T00:00:00Z',
  });

  assert.equal(result.isValid, true);
  assert.equal(result.normalizedData.tagNumber, 'PIG-001');
  assert.equal(result.normalizedData.sex, 'FEMALE');
});
