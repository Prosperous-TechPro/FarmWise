/** User-facing notification and alert services. */

import {
  countUnreadNotifications,
  getAlertForUser,
  getNotificationForUser,
  listAlertsForUser,
  listDevices,
  listNotificationsForUser,
  listPreferences,
  removeDevice,
  updateAlert,
  updateNotification,
  upsertDevice,
  upsertPreference,
} from '../repositories/notificationRepository.js';
import { validateDevice, validatePreferencePatch } from '../validators/notificationValidator.js';

function notFound(message) {
  const error = new Error(message);
  error.statusCode = 404;
  return error;
}

export function getNotificationsService(userId, filters) {
  return listNotificationsForUser(userId, filters);
}

export function getUnreadCountService(userId, farmId) {
  return countUnreadNotifications(userId, farmId);
}

async function updateUserNotification(userId, id, status, timestampField) {
  const notification = await getNotificationForUser(userId, id);
  if (!notification) throw notFound('Notification not found');
  return updateNotification(id, { status, [timestampField]: new Date() });
}

export function markNotificationReadService(userId, id) {
  return updateUserNotification(userId, id, 'READ', 'readAt');
}

export function acknowledgeNotificationService(userId, id) {
  return updateUserNotification(userId, id, 'ACKNOWLEDGED', 'acknowledgedAt');
}

export function dismissNotificationService(userId, id) {
  return updateUserNotification(userId, id, 'DISMISSED', 'dismissedAt');
}

export async function getAlertsService(userId, filters) {
  return listAlertsForUser(userId, filters);
}

export async function resolveAlertService(userId, id) {
  const alert = await getAlertForUser(userId, id);
  if (!alert) throw notFound('Alert not found');
  const farmRole = alert.farm?.ownerId === userId ? 'OWNER' : null;
  if (!farmRole) {
    const error = new Error('Only the farm owner can resolve this alert');
    error.statusCode = 403;
    throw error;
  }
  return updateAlert(id, { status: 'RESOLVED', resolvedAt: new Date(), resolvedById: userId });
}

export function getNotificationPreferencesService(userId) {
  return listPreferences(userId);
}

export async function patchNotificationPreferencesService(userId, input) {
  const validation = validatePreferencePatch(input);
  if (!validation.isValid) {
    const error = new Error('Validation failed');
    error.statusCode = 400;
    error.details = validation.errors;
    throw error;
  }
  const operations = [];
  for (const [type, channels] of Object.entries(validation.normalizedData)) {
    for (const [channel, enabled] of Object.entries(channels)) {
      operations.push(upsertPreference(userId, type, channel, enabled));
    }
  }
  return Promise.all(operations);
}

export async function registerDeviceService(userId, input) {
  const validation = validateDevice(input);
  if (!validation.isValid) {
    const error = new Error('Validation failed');
    error.statusCode = 400;
    error.details = validation.errors;
    throw error;
  }
  return upsertDevice(userId, validation.normalizedData);
}

export function getDevicesService(userId) {
  return listDevices(userId);
}

export async function removeDeviceService(userId, id) {
  const result = await removeDevice(userId, id);
  if (!result.count) throw notFound('Device not found');
  return { removed: true };
}
