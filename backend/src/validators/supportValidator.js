const CATEGORIES = ['BUG_REPORT', 'FEATURE_REQUEST', 'SUGGESTION', 'COMPLAINT', 'USABILITY', 'PERFORMANCE', 'ACCOUNT_PROBLEM', 'FARM_MANAGEMENT', 'CROP_MANAGEMENT', 'LIVESTOCK_MANAGEMENT', 'INVENTORY', 'FINANCIAL_MANAGEMENT', 'OTHER'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const STATUSES = ['NEW', 'IN_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

function text(value, field, errors, max) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > max) {
    errors[field] = `${field} is required and must be at most ${max} characters`;
    return undefined;
  }
  return value.trim();
}

export function validateFeedbackInput(input = {}) {
  const errors = {};
  const normalizedData = {
    subject: text(input.subject, 'subject', errors, 200),
    description: text(input.description, 'description', errors, 10000),
    pageUrl: input.pageUrl === undefined || input.pageUrl === '' ? null : text(input.pageUrl, 'pageUrl', errors, 500),
    category: typeof input.category === 'string' ? input.category.trim().toUpperCase() : '',
    priority: typeof input.priority === 'string' ? input.priority.trim().toUpperCase() : 'MEDIUM',
  };
  if (!CATEGORIES.includes(normalizedData.category)) errors.category = 'Invalid feedback category';
  if (!PRIORITIES.includes(normalizedData.priority)) errors.priority = 'Invalid feedback priority';
  return { isValid: Object.keys(errors).length === 0, errors, normalizedData };
}

export function validateFAQInput(input = {}) {
  const errors = {};
  const normalizedData = {
    question: text(input.question, 'question', errors, 500),
    answer: text(input.answer, 'answer', errors, 30000),
    categoryId: text(input.categoryId, 'categoryId', errors, 100),
    displayOrder: input.displayOrder === undefined ? 0 : Number(input.displayOrder),
  };
  if (!Number.isInteger(normalizedData.displayOrder) || normalizedData.displayOrder < 0) errors.displayOrder = 'displayOrder must be a non-negative integer';
  return { isValid: Object.keys(errors).length === 0, errors, normalizedData };
}

export function validateFAQCategoryInput(input = {}) {
  const errors = {};
  const normalizedData = {
    name: text(input.name, 'name', errors, 120),
    description: input.description ? text(input.description, 'description', errors, 2000) : null,
    displayOrder: input.displayOrder === undefined ? 0 : Number(input.displayOrder),
  };
  if (!Number.isInteger(normalizedData.displayOrder) || normalizedData.displayOrder < 0) errors.displayOrder = 'displayOrder must be a non-negative integer';
  return { isValid: Object.keys(errors).length === 0, errors, normalizedData };
}

export function validateAdminFeedbackPatch(input = {}) {
  const errors = {};
  const normalizedData = {};
  if (input.status !== undefined) {
    normalizedData.status = String(input.status).trim().toUpperCase();
    if (!STATUSES.includes(normalizedData.status)) errors.status = 'Invalid feedback status';
  }
  if (input.priority !== undefined) {
    normalizedData.priority = String(input.priority).trim().toUpperCase();
    if (!PRIORITIES.includes(normalizedData.priority)) errors.priority = 'Invalid feedback priority';
  }
  if (input.assignedToId !== undefined && input.assignedToId !== null && typeof input.assignedToId !== 'string') errors.assignedToId = 'assignedToId must be a string or null';
  if (input.assignedToId !== undefined) normalizedData.assignedToId = input.assignedToId || null;
  return { isValid: Object.keys(errors).length === 0, errors, normalizedData };
}