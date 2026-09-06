import test from 'node:test';
import assert from 'node:assert/strict';
import { validateWorkerRegistration } from './workerOnboardingValidator.js';

test('worker registration normalizes valid Ghana phone and optional email', () => {
  const result = validateWorkerRegistration({ fullName: ' Ama Mensah ', phone: '050 123 4567', email: 'AMA@example.com' });
  assert.equal(result.isValid, true);
  assert.equal(result.normalizedData.firstName, 'Ama');
  assert.equal(result.normalizedData.lastName, 'Mensah');
  assert.equal(result.normalizedData.email, 'ama@example.com');
  assert.match(result.normalizedData.phone, /^233/);
});

test('worker registration accepts initials and periods in names', () => {
  const result = validateWorkerRegistration({ fullName: 'Joe B.', phone: '0592673941', email: '' });
  assert.equal(result.isValid, true);
  assert.equal(result.normalizedData.firstName, 'Joe');
  assert.equal(result.normalizedData.lastName, 'B.');
});

test('worker registration rejects invalid identity data', () => {
  assert.equal(validateWorkerRegistration({ fullName: 'A', phone: 'bad', email: 'bad' }).isValid, false);
});
