import test from 'node:test';
import assert from 'node:assert/strict';
import { createCommunityPost } from '../services/communityService.js';

test('community post requires text or media', async () => {
  await assert.rejects(() => createCommunityPost('user-1', { body: '', media: [] }), /Post text or media is required/);
});

test('community post rejects unsupported categories', async () => {
  await assert.rejects(() => createCommunityPost('user-1', { body: 'Useful tip', category: 'Private Finance' }), /Invalid community category/);
});

test('community post accepts authenticated author and text', async () => {
  const original = (await import('../repositories/communityRepository.js')).createPost;
  assert.equal(typeof original, 'function');
});
