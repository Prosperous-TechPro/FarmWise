import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateCreateCropCycle,
  validateCreateCropActivity,
  validateCreateCropInput,
  validateCreateCropObservation,
  validateCreateHarvest,
} from './cropValidator.js';
import { buildCropCycleSummary } from '../services/cropService.js';

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

test('validateCreateCropCycle rejects harvest dates before planting', () => {
  const result = validateCreateCropCycle({
    fieldId: 'field-1',
    cropId: 'crop-1',
    area: 2,
    plantingDate: '2026-05-01',
    expectedHarvestDate: '2026-04-30',
    actualHarvestDate: '2026-04-29',
  });

  assert.equal(result.isValid, false);
  assert.match(result.errors.expectedHarvestDate, /before planting/i);
  assert.match(result.errors.actualHarvestDate, /before planting/i);
});

test('validateCreateCropCycle accepts harvested and archived statuses', () => {
  for (const status of ['HARVESTED', 'ARCHIVED']) {
    const result = validateCreateCropCycle({
      fieldId: 'field-1',
      cropId: 'crop-1',
      area: 2,
      plantingDate: '2026-05-01',
      status,
    });

    assert.equal(result.isValid, true);
    assert.equal(result.normalizedData.status, status);
  }
});

test('buildCropCycleSummary calculates production totals and timeline', () => {
  const summary = buildCropCycleSummary({
    activities: [
      { activityType: 'PLANTING', activityDate: '2026-05-10T00:00:00.000Z', description: 'Planted maize' },
      { activityType: 'IRRIGATION', activityDate: '2026-06-04T00:00:00.000Z', description: 'Irrigation applied' },
    ],
    inputs: [
      { inputName: 'NPK', quantity: 40, unit: 'KG', applicationDate: '2026-05-12T00:00:00.000Z' },
      { inputName: 'Seed', quantity: 50, unit: 'KG', applicationDate: '2026-05-10T00:00:00.000Z' },
    ],
    observations: [
      { observation: 'Good emergence', severity: 'LOW', observationDate: '2026-05-20T00:00:00.000Z' },
    ],
    harvests: [
      { quantity: 800, quantityUnit: 'KG', harvestDate: '2026-08-30T00:00:00.000Z' },
    ],
    produce: [
      { quantity: 750, unit: 'KG', status: 'HARVESTED', produceDate: '2026-08-30T00:00:00.000Z' },
    ],
    sales: [
      { totalAmount: 12000, saleDate: '2026-09-02T00:00:00.000Z' },
      { totalAmount: 3500, saleDate: '2026-09-05T00:00:00.000Z' },
    ],
    expenses: [
      { amount: 3000, expenseDate: '2026-05-11T00:00:00.000Z' },
      { amount: 1250, expenseDate: '2026-06-01T00:00:00.000Z' },
    ],
    expectedYield: 900,
    actualYield: 800,
    yieldUnit: 'KG',
  });

  assert.equal(summary.totalActivities, 2);
  assert.equal(summary.totalInputs, 2);
  assert.equal(summary.totalObservations, 1);
  assert.equal(summary.totalHarvest, 800);
  assert.equal(summary.totalRevenue, 15500);
  assert.equal(summary.totalExpenses, 4250);
  assert.equal(summary.netProfit, 11250);
  assert.equal(summary.timeline[0].label, 'PLANTING');
});
