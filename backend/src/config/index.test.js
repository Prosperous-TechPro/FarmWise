import test from 'node:test';
import assert from 'node:assert/strict';

test('Hubtel configuration supports deployed SMS environment variable names', async () => {
  const previous = {
    clientId: process.env.HUBTEL_SMS_CLIENT_ID,
    secret: process.env.HUBTEL_SMS_CLIENT_SECRET,
    baseUrl: process.env.HUBTEL_SMS_BASE_URL,
  };
  process.env.HUBTEL_SMS_CLIENT_ID = 'client-id';
  process.env.HUBTEL_SMS_CLIENT_SECRET = 'client-secret';
  process.env.HUBTEL_SMS_BASE_URL = 'https://sms.example.test/send';
  const moduleUrl = `./index.js?test=${Date.now()}`;
  const { default: config } = await import(moduleUrl);
  assert.equal(config.sms.clientId, 'client-id');
  assert.equal(config.sms.apiKey, 'client-secret');
  assert.equal(config.sms.baseUrl, 'https://sms.example.test/send');
  if (previous.clientId === undefined) delete process.env.HUBTEL_SMS_CLIENT_ID; else process.env.HUBTEL_SMS_CLIENT_ID = previous.clientId;
  if (previous.secret === undefined) delete process.env.HUBTEL_SMS_CLIENT_SECRET; else process.env.HUBTEL_SMS_CLIENT_SECRET = previous.secret;
  if (previous.baseUrl === undefined) delete process.env.HUBTEL_SMS_BASE_URL; else process.env.HUBTEL_SMS_BASE_URL = previous.baseUrl;
});