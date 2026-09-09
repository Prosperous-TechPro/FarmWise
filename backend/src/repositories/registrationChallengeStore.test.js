import test from 'node:test';
import assert from 'node:assert/strict';
import { createRegistrationChallengeStore } from './registrationChallengeStore.js';

class FakeRedis {
  constructor() {
    this.values = new Map();
    this.expirations = new Map();
  }

  async set(key, value, mode, ttl) {
    assert.equal(mode, 'EX');
    this.values.set(key, value);
    this.expirations.set(key, Number(ttl));
    return 'OK';
  }

  async get(key) {
    return this.values.get(key) || null;
  }

  async ttl(key) {
    return this.values.has(key) ? this.expirations.get(key) : -2;
  }

  async del(key) {
    return this.values.delete(key) ? 1 : 0;
  }
}

test('registration challenge store hashes keys, stores challenge data, and preserves TTL', async () => {
  const redis = new FakeRedis();
  const store = createRegistrationChallengeStore(redis);
  const challenge = await store.create({
    email: 'farmer@example.com',
    passwordHash: 'bcrypt-hash',
    otpHash: 'otp-hash',
    otpExpiresAt: new Date(Date.now() + 600000).toISOString(),
  }, 600);

  assert.match(challenge.challengeId, /^[a-f0-9]{64}$/);
  assert.equal((await store.get(challenge.challengeId)).passwordHash, 'bcrypt-hash');
  assert.equal(redis.values.has(store.keyFor(challenge.challengeId)), true);
  assert.equal(redis.values.has(`farmwise:registration-challenge:${challenge.challengeId}`), false);

  const updated = await store.update(challenge.challengeId, { attempts: 1 });
  assert.equal(updated.attempts, 1);
  assert.equal(await redis.ttl(store.keyFor(challenge.challengeId)), 600);
  await store.delete(challenge.challengeId);
  assert.equal(await store.get(challenge.challengeId), null);
});