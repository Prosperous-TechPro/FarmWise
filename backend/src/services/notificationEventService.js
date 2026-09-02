/**
 * Central event -> rule -> alert -> notification processor.
 */

import { createLogger } from '../utils/logger.js';
import {
  createAlertAndNotifications,
  createDomainEvent,
  findDomainEvent,
  getAuthorizedFarmUserIds,
  updateDomainEvent,
} from '../repositories/notificationRepository.js';
import { validateEventPayload } from '../validators/notificationValidator.js';

const logger = createLogger('notification-events');

const EVENT_RULES = {
  TASK_DUE: { type: 'TASK_REMINDER', severity: 'MEDIUM', title: 'Task reminder', message: 'A farm task is due.' },
  TASK_OVERDUE: { type: 'TASK_OVERDUE', severity: 'HIGH', title: 'Overdue task', message: 'A farm task is overdue.' },
  TASK_COMPLETED: { type: 'TASK_COMPLETED', severity: 'INFO', title: 'Task completed', message: 'A farm task was completed.' },
  STOCK_LOW: { type: 'LOW_STOCK', severity: 'MEDIUM', title: 'Low stock', message: 'An inventory item is below its reorder level.' },
  STOCK_EMPTY: { type: 'OUT_OF_STOCK', severity: 'HIGH', title: 'Out of stock', message: 'An inventory item is out of stock.' },
  STOCK_EXPIRING: { type: 'EXPIRING_STOCK', severity: 'MEDIUM', title: 'Stock expiring', message: 'An inventory batch is approaching expiry.' },
  STOCK_EXPIRED: { type: 'EXPIRED_STOCK', severity: 'HIGH', title: 'Stock expired', message: 'An inventory batch has expired.' },
  PREGNANCY_RECORDED: { type: 'PREGNANCY_REMINDER', severity: 'MEDIUM', title: 'Pregnancy recorded', message: 'A livestock pregnancy reminder is scheduled.' },
  FARROWING_APPROACHING: { type: 'EXPECTED_FARROWING', severity: 'HIGH', title: 'Expected farrowing', message: 'Expected farrowing is approaching.' },
  FARROWING_OVERDUE: { type: 'FARROWING_OVERDUE', severity: 'HIGH', title: 'Farrowing overdue', message: 'Expected farrowing has passed. Check the animal and record the actual event.' },
  BIRTH_RECORDED: { type: 'BIRTH_RECORDED', severity: 'INFO', title: 'Birth recorded', message: 'A livestock birth was recorded.' },
  VACCINATION_DUE: { type: 'VACCINATION_DUE', severity: 'HIGH', title: 'Vaccination due', message: 'A recorded vaccination schedule is due.' },
  MEDICATION_DUE: { type: 'MEDICATION_DUE', severity: 'HIGH', title: 'Medication due', message: 'A recorded medication schedule is due.' },
  CROP_ACTIVITY_DUE: { type: 'CROP_ACTIVITY_DUE', severity: 'MEDIUM', title: 'Crop activity due', message: 'A crop activity is due.' },
  HARVEST_APPROACHING: { type: 'HARVEST_DUE', severity: 'MEDIUM', title: 'Harvest approaching', message: 'A crop harvest date is approaching.' },
  CROP_PROBLEM: { type: 'CROP_PROBLEM', severity: 'HIGH', title: 'Crop problem observed', message: 'A high-severity crop observation was recorded.' },
  LOSS_RECORDED: { type: 'PRODUCTION_LOSS', severity: 'HIGH', title: 'Production loss recorded', message: 'A production loss was recorded.' },
  PROFITABILITY_CHANGED: { type: 'LOW_PROFITABILITY', severity: 'HIGH', title: 'Profitability changed', message: 'Farm profitability changed and should be reviewed.' },
  BUDGET_EXCEEDED: { type: 'BUDGET_EXCEEDED', severity: 'HIGH', title: 'Budget exceeded', message: 'A configured farm budget threshold was exceeded.' },
  SECURITY_EVENT: { type: 'SECURITY_ALERT', severity: 'HIGH', title: 'Security event', message: 'An important farm security event occurred.' },
  GENERAL_FARM_EVENT: { type: 'GENERAL_FARM_ALERT', severity: 'INFO', title: 'Farm event', message: 'An important farm event occurred.' },
};

function safeMetadata(metadata) {
  if (!metadata) return {};
  const forbidden = /password|otp|token|secret|api.?key|credential/i;
  return Object.fromEntries(Object.entries(metadata).filter(([key]) => !forbidden.test(key)));
}

export async function publishDomainEvent(input) {
  const validation = validateEventPayload(input);
  if (!validation.isValid) {
    const error = new Error('Validation failed');
    error.statusCode = 400;
    error.details = validation.errors;
    throw error;
  }
  const data = validation.normalizedData;
  const eventId = input.eventId || `evt_${crypto.randomUUID()}`;
  const existingEvent = await findDomainEvent(eventId);
  if (existingEvent) return existingEvent;
  return createDomainEvent({ id: eventId, farmId: data.farmId, eventType: data.eventType, entityType: data.entityType || null, entityId: data.entityId || null, occurredAt: data.occurredAt, metadata: JSON.stringify(safeMetadata(data.metadata)), status: 'RECEIVED' });
}

export async function processDomainEvent(eventId) {
  const event = await findDomainEvent(eventId);
  if (!event) return null;
  if (event.status === 'PROCESSED') return { duplicate: true, event };
  const rule = EVENT_RULES[event.eventType];
  if (!rule) {
    await updateDomainEvent(event.id, { status: 'PROCESSED', processedAt: new Date() });
    return { event, notifications: [] };
  }
  try {
    const userIds = await getAuthorizedFarmUserIds(event.farmId);
    const metadata = event.metadata ? JSON.parse(event.metadata) : {};
    const fingerprint = [event.farmId, rule.type, event.entityType || 'event', event.entityId || event.id, metadata.condition || event.eventType].join(':');
    const result = await createAlertAndNotifications({ event, userIds, type: rule.type, alert: { type: rule.type, title: rule.title, message: metadata.message || rule.message, severity: rule.severity, entityType: event.entityType || null, entityId: event.entityId || null, fingerprint } });
    await updateDomainEvent(event.id, { status: 'PROCESSED', attempts: { increment: 1 }, processedAt: new Date(), lastError: null });
    return { event, ...result };
  } catch (error) {
    await updateDomainEvent(event.id, { status: event.attempts + 1 >= 3 ? 'DEAD_LETTER' : 'FAILED', attempts: { increment: 1 }, lastError: error.message });
    logger.error('Domain event processing failed', { eventId: event.id, error: error.message });
    throw error;
  }
}

export const eventRules = EVENT_RULES;
