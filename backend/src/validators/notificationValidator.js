const NOTIFICATION_TYPES = [
  'TASK_REMINDER', 'TASK_OVERDUE', 'TASK_COMPLETED', 'LOW_STOCK', 'OUT_OF_STOCK',
  'EXPIRING_STOCK', 'EXPIRED_STOCK', 'ANIMAL_HEALTH_ALERT', 'ANIMAL_MORTALITY',
  'PREGNANCY_REMINDER', 'EXPECTED_FARROWING', 'FARROWING_OVERDUE', 'BIRTH_RECORDED',
  'VACCINATION_DUE', 'MEDICATION_DUE', 'CROP_ACTIVITY_DUE', 'HARVEST_DUE',
  'CROP_PROBLEM', 'PRODUCTION_LOSS', 'FINANCIAL_LOSS', 'LOW_PROFITABILITY',
  'BUDGET_EXCEEDED', 'SYSTEM_ALERT', 'SECURITY_ALERT', 'GENERAL_FARM_ALERT',
];
const SEVERITIES = ['INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const NOTIFICATION_STATUSES = ['UNREAD', 'READ', 'ACKNOWLEDGED', 'RESOLVED', 'DISMISSED'];
const ALERT_STATUSES = ['DETECTED', 'ACTIVE', 'ACKNOWLEDGED', 'RESOLVED', 'DISMISSED'];
const CHANNELS = ['IN_APP', 'PUSH', 'EMAIL', 'SMS'];
const PLATFORMS = ['ANDROID', 'IOS', 'WEB'];
const EVENT_TYPES = [
  'TASK_CREATED', 'TASK_DUE', 'TASK_OVERDUE', 'TASK_COMPLETED', 'STOCK_LOW', 'STOCK_EMPTY',
  'STOCK_EXPIRING', 'STOCK_EXPIRED', 'PREGNANCY_RECORDED', 'FARROWING_APPROACHING',
  'FARROWING_OVERDUE', 'BIRTH_RECORDED', 'VACCINATION_DUE', 'MEDICATION_DUE',
  'CROP_ACTIVITY_DUE', 'HARVEST_APPROACHING', 'CROP_PROBLEM', 'LOSS_RECORDED',
  'PROFITABILITY_CHANGED', 'BUDGET_EXCEEDED', 'SECURITY_EVENT', 'GENERAL_FARM_EVENT',
];

function enumValue(value, values, fallback) {
  if (typeof value !== 'string') return fallback;
  const normalized = value.trim().toUpperCase();
  return values.includes(normalized) ? normalized : fallback;
}

function optionalString(value, field, errors, maxLength = 255) {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string' || value.trim().length > maxLength) {
    errors[field] = `${field} must be a string of at most ${maxLength} characters`;
    return undefined;
  }
  return value.trim();
}

export function validateNotificationFilters(query = {}) {
  const errors = {};
  const normalizedData = {};
  for (const field of ['type', 'status', 'severity', 'farmId']) {
    const value = optionalString(query[field], field, errors);
    if (value) normalizedData[field] = value;
  }
  if (normalizedData.type && !NOTIFICATION_TYPES.includes(normalizedData.type.toUpperCase())) errors.type = 'Invalid notification type';
  if (normalizedData.status && ![...NOTIFICATION_STATUSES, ...ALERT_STATUSES].includes(normalizedData.status.toUpperCase())) errors.status = 'Invalid notification or alert status';
  if (normalizedData.severity && !SEVERITIES.includes(normalizedData.severity.toUpperCase())) errors.severity = 'Invalid notification severity';

  for (const field of ['dateFrom', 'dateTo']) {
    if (query[field]) {
      const date = new Date(query[field]);
      if (Number.isNaN(date.getTime())) errors[field] = `${field} must be a valid date`;
      else normalizedData[field] = date;
    }
  }
  normalizedData.page = Math.max(1, Number(query.page) || 1);
  normalizedData.limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  return { isValid: Object.keys(errors).length === 0, errors, normalizedData };
}

export function validateEventPayload(data = {}) {
  const errors = {};
  const normalizedData = {};
  const eventType = enumValue(data.eventType, EVENT_TYPES, undefined);
  if (!eventType) errors.eventType = 'A valid eventType is required';
  else normalizedData.eventType = eventType;
  if (typeof data.farmId !== 'string' || !data.farmId.trim()) errors.farmId = 'farmId is required';
  else normalizedData.farmId = data.farmId.trim();
  const entityType = optionalString(data.entityType, 'entityType', errors, 100);
  const entityId = optionalString(data.entityId, 'entityId', errors);
  if (entityType) normalizedData.entityType = entityType;
  if (entityId) normalizedData.entityId = entityId;
  const occurredAt = data.occurredAt ? new Date(data.occurredAt) : new Date();
  if (Number.isNaN(occurredAt.getTime())) errors.occurredAt = 'occurredAt must be a valid date';
  else normalizedData.occurredAt = occurredAt;
  if (data.metadata !== undefined) {
    if (!data.metadata || typeof data.metadata !== 'object' || Array.isArray(data.metadata)) errors.metadata = 'metadata must be a JSON object';
    else if (JSON.stringify(data.metadata).length > 10000) errors.metadata = 'metadata is too large';
    else normalizedData.metadata = data.metadata;
  }
  return { isValid: Object.keys(errors).length === 0, errors, normalizedData };
}

export function validateDevice(data = {}) {
  const errors = {};
  const normalizedData = {};
  const deviceId = optionalString(data.deviceId, 'deviceId', errors);
  const pushToken = optionalString(data.pushToken, 'pushToken', errors, 2048);
  const platform = enumValue(data.platform, PLATFORMS, undefined);
  if (!deviceId) errors.deviceId = 'deviceId is required'; else normalizedData.deviceId = deviceId;
  if (!pushToken) errors.pushToken = 'pushToken is required'; else normalizedData.pushToken = pushToken;
  if (!platform) errors.platform = 'platform must be ANDROID, IOS, or WEB'; else normalizedData.platform = platform;
  return { isValid: Object.keys(errors).length === 0, errors, normalizedData };
}

export function validatePreferencePatch(data = {}) {
  const errors = {};
  const normalizedData = {};
  if (!data || typeof data !== 'object' || Array.isArray(data)) return { isValid: false, errors: { preferences: 'Preferences must be an object' }, normalizedData };
  for (const [type, channels] of Object.entries(data)) {
    if (!NOTIFICATION_TYPES.includes(type.toUpperCase()) || !channels || typeof channels !== 'object') {
      errors[type] = 'Use a valid notification type and channel map';
      continue;
    }
    normalizedData[type.toUpperCase()] = {};
    for (const [channel, enabled] of Object.entries(channels)) {
      if (!CHANNELS.includes(channel.toUpperCase()) || typeof enabled !== 'boolean') errors[`${type}.${channel}`] = 'Channel must be valid and enabled must be boolean';
      else normalizedData[type.toUpperCase()][channel.toUpperCase()] = enabled;
    }
  }
  return { isValid: Object.keys(errors).length === 0, errors, normalizedData };
}

export { CHANNELS, NOTIFICATION_TYPES, NOTIFICATION_STATUSES, SEVERITIES };
