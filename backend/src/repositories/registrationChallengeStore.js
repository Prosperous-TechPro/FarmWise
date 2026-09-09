import crypto from 'crypto';
import Redis from 'ioredis';
import { hashValue } from '../utils/crypto.js';

const KEY_PREFIX = 'farmwise:registration-challenge:';
const defaultTtlSeconds = () => Number.parseInt(process.env.REGISTRATION_CHALLENGE_TTL_SECONDS || '900', 10);

let redisClient;

function getRedisClient() {
  if (!redisClient) {
    if (!process.env.REDIS_URL) {
      throw new Error('REDIS_URL is required for registration challenges');
    }
    redisClient = new Redis(process.env.REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 1 });
  }
  return redisClient;
}

function challengeKey(challengeId) {
  return `${KEY_PREFIX}${hashValue(challengeId)}`;
}

function createRegistrationChallengeStore(client = getRedisClient()) {
  return {
    async create(data, ttlSeconds = defaultTtlSeconds()) {
      const challengeId = crypto.randomBytes(32).toString('hex');
      const key = challengeKey(challengeId);
      const challenge = {
        ...data,
        attempts: data.attempts || 0,
        resendCount: data.resendCount || 0,
        createdAt: data.createdAt || new Date().toISOString(),
        lastSentAt: data.lastSentAt || new Date().toISOString(),
      };
      await client.set(key, JSON.stringify(challenge), 'EX', ttlSeconds);
      return { challengeId, ...challenge };
    },

    async get(challengeId) {
      const value = await client.get(challengeKey(challengeId));
      return value ? JSON.parse(value) : null;
    },

    async update(challengeId, changes, ttlSeconds = null) {
      const existing = await this.get(challengeId);
      if (!existing) return null;
      const updated = { ...existing, ...changes };
      const key = challengeKey(challengeId);
      if (ttlSeconds === null) {
        const ttl = await client.ttl(key);
        await client.set(key, JSON.stringify(updated), 'EX', ttl > 0 ? ttl : defaultTtlSeconds());
      } else {
        await client.set(key, JSON.stringify(updated), 'EX', ttlSeconds);
      }
      return updated;
    },

    async delete(challengeId) {
      return client.del(challengeKey(challengeId));
    },

    keyFor(challengeId) {
      return challengeKey(challengeId);
    },
  };
}

const registrationChallengeStore = {
  create(...args) {
    return createRegistrationChallengeStore().create(...args);
  },
  get(...args) {
    return createRegistrationChallengeStore().get(...args);
  },
  update(...args) {
    return createRegistrationChallengeStore().update(...args);
  },
  delete(...args) {
    return createRegistrationChallengeStore().delete(...args);
  },
  keyFor(...args) {
    return createRegistrationChallengeStore().keyFor(...args);
  },
};

export { createRegistrationChallengeStore, registrationChallengeStore };
export default registrationChallengeStore;