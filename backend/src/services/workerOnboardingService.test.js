import test from 'node:test';
import assert from 'node:assert/strict';
import { buildWorkerOnboardingSmsMessage } from './workerOnboardingService.js';

test('worker onboarding SMS includes the convenient setup link and temporary password', () => {
  const message = buildWorkerOnboardingSmsMessage({
    firstName: 'Joe',
    lastName: 'B',
    temporaryPassword: 'abc123',
    onboardingUrl: 'https://frontend.example.com/worker-onboarding/abc123',
  });

  assert.match(message, /Set up your FarmWise account/i);
  assert.match(message, /https:\/\/frontend\.example\.com\/worker-onboarding\/abc123/i);
  assert.match(message, /abc123/i);
  assert.ok(message.length <= 160, 'SMS should fit within a single short message');
});
