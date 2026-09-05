import test from 'node:test';
import assert from 'node:assert/strict';
import { validateAdminFeedbackPatch, validateFAQInput, validateFeedbackInput } from './supportValidator.js';

test('feedback validation normalizes supported category and priority', () => {
  const result = validateFeedbackInput({ subject: ' Slow page ', description: ' The dashboard takes too long. ', category: 'performance', priority: 'high' });
  assert.equal(result.isValid, true);
  assert.equal(result.normalizedData.subject, 'Slow page');
  assert.equal(result.normalizedData.category, 'PERFORMANCE');
  assert.equal(result.normalizedData.priority, 'HIGH');
});

test('feedback validation rejects unsafe or unsupported input', () => {
  const result = validateFeedbackInput({ subject: '', description: 'x', category: 'ROLE_ESCALATION', priority: 'ROOT' });
  assert.equal(result.isValid, false);
  assert.ok(result.errors.subject);
  assert.ok(result.errors.category);
  assert.ok(result.errors.priority);
});

test('FAQ validation requires normalized content and category', () => {
  const result = validateFAQInput({ question: ' How do I sign in? ', answer: ' Use your verified account. ', categoryId: 'cat-1' });
  assert.equal(result.isValid, true);
  assert.equal(result.normalizedData.question, 'How do I sign in?');
  assert.equal(result.normalizedData.answer, 'Use your verified account.');
});

test('admin feedback patch accepts lifecycle fields but rejects invalid values', () => {
  assert.equal(validateAdminFeedbackPatch({ status: 'resolved', priority: 'urgent', assignedToId: 'admin-1' }).isValid, true);
  assert.equal(validateAdminFeedbackPatch({ status: 'deleted' }).isValid, false);
});