import test from 'node:test';
import assert from 'node:assert/strict';

import {
  normalizeRoleName,
  requireRole,
  requirePermission,
} from './authMiddleware.js';

test('normalizeRoleName supports the FarmWise role aliases', () => {
  assert.equal(normalizeRoleName('SUPER_ADMIN'), 'SUPERADMIN');
  assert.equal(normalizeRoleName('SUPERADMIN'), 'SUPERADMIN');
  assert.equal(normalizeRoleName('FARM_WORKER'), 'WORKER');
  assert.equal(normalizeRoleName('WORKER'), 'WORKER');
  assert.equal(normalizeRoleName('FARM_OWNER'), 'FARM_OWNER');
  assert.equal(normalizeRoleName('ADMIN'), 'ADMIN');
});

test('requireRole accepts the canonical and legacy role names', () => {
  let nextCalled = false;
  const req = { user: { roles: ['SUPER_ADMIN'] } };
  const res = {
    status(code) {
      throw new Error(`unexpected status ${code}`);
    },
    json() {
      throw new Error('unexpected json response');
    },
  };

  requireRole(['SUPERADMIN'])(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
});

test('requirePermission allows system admins and rejects unauthorized users', async () => {
  let nextCalled = false;
  const req = { user: { id: 'u-1', roles: ['ADMIN'] }, path: '/api/v1/admin' };
  const res = {
    status(code) {
      this.code = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    },
  };

  await requirePermission('VIEW_FARM')(req, res, () => {
    nextCalled = true;
  });
  assert.equal(nextCalled, true);

  const workerReq = { user: { id: 'u-2', roles: ['WORKER'] }, path: '/api/v1/farms/123' };
  let workerNext = false;
  const workerRes = {
    status(code) {
      this.code = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    },
  };

  await requirePermission('MANAGE_FARM')(workerReq, workerRes, () => {
    workerNext = true;
  });
  assert.equal(workerNext, false);
  assert.equal(workerRes.code, 403);
});
