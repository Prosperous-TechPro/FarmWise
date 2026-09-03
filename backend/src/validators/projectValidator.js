const PROJECT_STATUS_VALUES = ['PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED'];
const CURRENCY_VALUES = ['GHS', 'USD', 'EUR'];

function requiredString(value, field, errors, maxLength = 255) {
  if (typeof value !== 'string' || !value.trim()) {
    errors[field] = `${field} is required`;
    return undefined;
  }
  const normalized = value.trim();
  if (normalized.length > maxLength) errors[field] = `${field} must be ${maxLength} characters or fewer`;
  return normalized;
}

function optionalString(value, field, errors, maxLength = 2000) {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string') errors[field] = `${field} must be a string`;
  const normalized = String(value).trim();
  if (normalized.length > maxLength) errors[field] = `${field} must be ${maxLength} characters or fewer`;
  return normalized || null;
}

function dateValue(value, field, errors, required = false) {
  if ((value === undefined || value === null || value === '') && !required) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) errors[field] = `${field} must be a valid date`;
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function amountValue(value, field, errors, required = true) {
  if ((value === undefined || value === null || value === '') && !required) return null;
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) errors[field] = `${field} must be a number greater than 0`;
  return Number.isFinite(amount) && amount > 0 ? amount : undefined;
}

function enumValue(value, values, field, errors, fallback) {
  if (value === undefined || value === null || value === '') return fallback;
  const normalized = String(value).trim().toUpperCase();
  if (!values.includes(normalized)) errors[field] = `${field} must be one of ${values.join(', ')}`;
  return values.includes(normalized) ? normalized : undefined;
}

export function validateProject(data = {}, partial = false) {
  const errors = {};
  const normalizedData = {};
  if (!partial || data.name !== undefined) normalizedData.name = requiredString(data.name, 'name', errors);
  if (data.description !== undefined) normalizedData.description = optionalString(data.description, 'description', errors);
  if (!partial || data.startDate !== undefined) normalizedData.startDate = dateValue(data.startDate, 'startDate', errors, true);
  if (data.endDate !== undefined) normalizedData.endDate = dateValue(data.endDate, 'endDate', errors);
  if (normalizedData.startDate && normalizedData.endDate && normalizedData.endDate < normalizedData.startDate) errors.endDate = 'End date must be after or equal to start date';
  if (data.status !== undefined || !partial) normalizedData.status = enumValue(data.status, PROJECT_STATUS_VALUES, 'status', errors, 'PLANNED');
  if (data.currency !== undefined || !partial) normalizedData.currency = enumValue(data.currency, CURRENCY_VALUES, 'currency', errors, 'GHS');
  return { isValid: Object.keys(errors).length === 0, errors, normalizedData };
}

export function validateBudgetLine(data = {}, partial = false) {
  const errors = {};
  const normalizedData = {};
  if (!partial || data.name !== undefined) normalizedData.name = requiredString(data.name, 'name', errors);
  if (data.description !== undefined) normalizedData.description = optionalString(data.description, 'description', errors);
  if (!partial || data.plannedAmount !== undefined) normalizedData.plannedAmount = amountValue(data.plannedAmount, 'plannedAmount', errors);
  return { isValid: Object.keys(errors).length === 0, errors, normalizedData };
}
