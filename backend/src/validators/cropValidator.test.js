import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateCreateCropCycle,
  validateCreateCropActivity,
  validateCreateCropInput,
  validateCreateCropObservation,
  validateCreateHarvest,
} from './cropValidator.js';

test('validateCreateCropCycle accepts valid cycle data', () => {
  const result = validateCreateCropCycle({
    farmId: 'farm-1',
    fieldId: 'field-1',
    cropId: 'crop-1',
    varietyId: 'variety-1',
    cycleName: 'Main Season',
    season: 'MAIN',
    area: 2,
    areaUnit: 'ACRE',
    plantingDate: '2026-05-01',
    status: 'PLANNED',
  });

  assert.equal(result.isValid, true);
  assert.equal(result.normalizedData.cycleName, 'Main Season');
  assert.equal(result.normalizedData.season, 'MAIN');
});

test('validateCreateCropActivity rejects invalid activity type', () => {
  const result = validateCreateCropActivity({
    cropCycleId: 'cycle-1',
    activityDate: '2026-05-02',
    activityType: 'NOT_REAL',
    description: 'Weeding',
  });

  assert.equal(result.isValid, false);
  assert.match(result.errors.activityType, /must be one of/i);
});

test('validateCreateCropInput requires positive quantity', () => {
  const result = validateCreateCropInput({
    cropCycleId: 'cycle-1',
    inputType: 'FERTILIZER',
    inputName: 'NPK',
    quantity: 0,
    unit: 'KG',
    applicationDate: '2026-05-04',
  });

  assert.equal(result.isValid, false);
  assert.match(result.errors.quantity, /greater than 0/i);
});

test('validateCreateCropObservation allows valid severity', () => {
  const result = validateCreateCropObservation({
    cropCycleId: 'cycle-1',
    observationDate: '2026-06-01',
    observation: 'Leaves yellowing',
    severity: 'MODERATE',
  });

  assert.equal(result.isValid, true);
  assert.equal(result.normalizedData.severity, 'MODERATE');
});

test('validateCreateHarvest requires harvest date after planting', () => {
  const result = validateCreateHarvest({
    cropCycleId: 'cycle-1',
    harvestDate: '2026-01-01',
    quantity: 100,
    unit: 'KG',
    plantingDate: '2026-05-01',
  });

  assert.equal(result.isValid, false);
  assert.match(result.errors.harvestDate, /after planting/i);
});
