import { createAuditLog } from '../repositories/auditRepository.js';
import {
  createFAQ,
  createFAQCategory,
  createFeedback,
  createFeedbackNote,
  createFeedbackResponse,
  createGlobalNotification,
  getAdminFeedback,
  getMyFeedback,
  getPublishedFAQ,
  getUserIdForFeedback,
  listAdminFeedback,
  listAdminFAQs,
  listAdminIds,
  listFAQCategories,
  listMyFeedback,
  listPublishedFAQs,
  updateFAQ,
  updateFAQCategory,
  updateFeedback,
  upsertFAQFeedback,
} from '../repositories/supportRepository.js';
import { validateAdminFeedbackPatch, validateFAQCategoryInput, validateFAQInput, validateFeedbackInput } from '../validators/supportValidator.js';

function invalid(validation) {
  if (validation.isValid) return;
  const error = new Error('Validation failed');
  error.statusCode = 400;
  error.details = validation.errors;
  throw error;
}

function pageFilters(query = {}) {
  return { page: Math.max(1, Number(query.page) || 1), limit: Math.min(100, Math.max(1, Number(query.limit) || 20)) };
}

async function audit(action, entityType, entityId, userId, req, oldValues, newValues) {
  await createAuditLog({ farmId: null, userId, action, entityType, entityId, oldValues, newValues, req });
}

export function getFAQCategories(includeInactive = false) { return listFAQCategories(includeInactive); }
export function getFAQs(query) { return listPublishedFAQs({ ...pageFilters(query), search: typeof query.search === 'string' ? query.search.trim() : undefined, categoryId: query.categoryId }); }

export async function getFAQ(id) {
  const faq = await getPublishedFAQ(id);
  if (!faq) { const error = new Error('FAQ not found'); error.statusCode = 404; throw error; }
  return faq;
}

export async function rateFAQ(faqId, userId, helpful, req) {
  if (typeof helpful !== 'boolean') { const error = new Error('helpful must be a boolean'); error.statusCode = 400; throw error; }
  await getFAQ(faqId);
  const result = await upsertFAQFeedback(faqId, userId, helpful);
  await audit('FAQ_HELPFULNESS_RECORDED', 'FAQ', faqId, userId, req, undefined, { helpful });
  return result;
}

export async function submitFeedback(userId, input, req) {
  const validation = validateFeedbackInput(input);
  invalid(validation);
  const reference = `FW-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const feedback = await createFeedback({ ...validation.normalizedData, reference, userId, status: 'NEW', farmId: null });
  await audit('FEEDBACK_SUBMITTED', 'Feedback', feedback.id, userId, req, undefined, { reference, category: feedback.category, priority: feedback.priority });
  const admins = await listAdminIds();
  await Promise.all(admins.filter(({ id }) => id !== userId).map(({ id }) => createGlobalNotification({ userId: id, type: 'NEW_FEEDBACK', title: 'New user feedback received', message: `${feedback.reference}: ${feedback.subject}`, relatedEntityType: 'FEEDBACK', relatedEntityId: feedback.id })));
  return feedback;
}

export function getMyFeedbackHistory(userId, query) { const { page, limit } = pageFilters(query); return listMyFeedback(userId, page, limit); }

export async function getOwnedFeedback(userId, id) {
  const feedback = await getMyFeedback(userId, id);
  if (!feedback) { const error = new Error('Feedback not found'); error.statusCode = 404; throw error; }
  return feedback;
}

export async function createFAQService(userId, input, req) {
  const validation = validateFAQInput(input); invalid(validation);
  const faq = await createFAQ({ ...validation.normalizedData, createdById: userId, updatedById: userId });
  await audit('FAQ_CREATED', 'FAQ', faq.id, userId, req, undefined, { question: faq.question, categoryId: faq.categoryId });
  return faq;
}

export async function editFAQService(userId, id, input, req) {
  const validation = validateFAQInput(input); invalid(validation);
  const faq = await updateFAQ(id, { ...validation.normalizedData, updatedById: userId });
  await audit('FAQ_UPDATED', 'FAQ', id, userId, req);
  return faq;
}

export async function setFAQStatus(userId, id, status, req) {
  if (!['PUBLISHED', 'ARCHIVED', 'DRAFT'].includes(status)) { const error = new Error('Invalid FAQ status'); error.statusCode = 400; throw error; }
  const faq = await updateFAQ(id, { status, updatedById: userId });
  await audit(`FAQ_${status}`, 'FAQ', id, userId, req);
  return faq;
}

export async function createFAQCategoryService(userId, input, req) {
  const validation = validateFAQCategoryInput(input); invalid(validation);
  const category = await createFAQCategory(validation.normalizedData);
  await audit('FAQ_CATEGORY_CREATED', 'FAQCategory', category.id, userId, req);
  return category;
}

export async function editFAQCategoryService(userId, id, input, req) {
  const validation = validateFAQCategoryInput(input); invalid(validation);
  const category = await updateFAQCategory(id, validation.normalizedData);
  await audit('FAQ_CATEGORY_UPDATED', 'FAQCategory', id, userId, req);
  return category;
}

export function getAdminFAQList(query) { return listAdminFAQs({ ...pageFilters(query), search: query.search?.trim(), status: query.status, categoryId: query.categoryId }); }
export function getAdminFeedbackList(query) { return listAdminFeedback({ ...pageFilters(query), search: query.search?.trim(), status: query.status, category: query.category, priority: query.priority, assignedToId: query.assignedToId }); }

export async function getAdminFeedbackDetail(id) {
  const feedback = await getAdminFeedback(id);
  if (!feedback) { const error = new Error('Feedback not found'); error.statusCode = 404; throw error; }
  return feedback;
}

export async function patchAdminFeedback(userId, id, input, req) {
  const validation = validateAdminFeedbackPatch(input); invalid(validation);
  const before = await getAdminFeedbackDetail(id);
  if (validation.normalizedData.assignedToId) {
    const admins = await listAdminIds();
    if (!admins.some(({ id: adminId }) => adminId === validation.normalizedData.assignedToId)) { const error = new Error('Feedback can only be assigned to an administrator'); error.statusCode = 400; throw error; }
  }
  const data = { ...validation.normalizedData };
  if (data.status === 'RESOLVED') data.resolvedAt = new Date();
  if (data.status === 'CLOSED') data.closedAt = new Date();
  const feedback = await updateFeedback(id, data);
  await audit('FEEDBACK_UPDATED', 'Feedback', id, userId, req, { status: before.status, priority: before.priority, assignedToId: before.assignedToId }, data);
  if (before.user?.id && before.status !== feedback.status) await createGlobalNotification({ userId: before.user.id, type: 'FEEDBACK_STATUS_CHANGED', title: 'Feedback status updated', message: `${feedback.reference} is now ${feedback.status.replaceAll('_', ' ').toLowerCase()}.`, relatedEntityType: 'FEEDBACK', relatedEntityId: id });
  return feedback;
}

export async function respondToFeedback(userId, id, message, req, isInternal = false) {
  if (typeof message !== 'string' || !message.trim() || message.trim().length > 10000) { const error = new Error('A response message is required'); error.statusCode = 400; throw error; }
  const feedback = await getAdminFeedbackDetail(id);
  const response = await createFeedbackResponse({ feedbackId: id, authorId: userId, message: message.trim(), isInternal });
  await audit(isInternal ? 'FEEDBACK_INTERNAL_NOTE_CREATED' : 'FEEDBACK_RESPONSE_CREATED', 'Feedback', id, userId, req);
  if (!isInternal) await createGlobalNotification({ userId: feedback.user.id, type: 'FEEDBACK_RESPONSE', title: 'A response was added to your feedback', message: `${feedback.reference} has a new response.`, relatedEntityType: 'FEEDBACK', relatedEntityId: id });
  return response;
}

export async function addInternalNote(userId, id, note, req) {
  if (typeof note !== 'string' || !note.trim() || note.trim().length > 10000) { const error = new Error('An internal note is required'); error.statusCode = 400; throw error; }
  await getAdminFeedbackDetail(id);
  const result = await createFeedbackNote({ feedbackId: id, authorId: userId, note: note.trim() });
  await audit('FEEDBACK_INTERNAL_NOTE_CREATED', 'Feedback', id, userId, req);
  return result;
}