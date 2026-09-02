import { publishDomainEvent, processDomainEvent } from '../services/notificationEventService.js';
import {
  acknowledgeNotificationService,
  dismissNotificationService,
  getAlertsService,
  getDevicesService,
  getNotificationPreferencesService,
  getNotificationsService,
  getUnreadCountService,
  markNotificationReadService,
  patchNotificationPreferencesService,
  registerDeviceService,
  removeDeviceService,
  resolveAlertService,
} from '../services/notificationService.js';
import { validateNotificationFilters } from '../validators/notificationValidator.js';

function filtersFromQuery(query) {
  const validation = validateNotificationFilters(query);
  if (!validation.isValid) {
    const error = new Error('Validation failed');
    error.statusCode = 400;
    error.details = validation.errors;
    throw error;
  }
  return validation.normalizedData;
}

export async function listNotifications(req, res) {
  return res.json({ success: true, ...(await getNotificationsService(req.user.id, filtersFromQuery(req.query))) });
}

export async function unreadCount(req, res) {
  return res.json({ success: true, data: { count: await getUnreadCountService(req.user.id, req.query.farmId) } });
}

export async function markRead(req, res) {
  return res.json({ success: true, data: await markNotificationReadService(req.user.id, req.params.id) });
}

export async function acknowledge(req, res) {
  return res.json({ success: true, data: await acknowledgeNotificationService(req.user.id, req.params.id) });
}

export async function dismiss(req, res) {
  return res.json({ success: true, data: await dismissNotificationService(req.user.id, req.params.id) });
}

export async function listAlerts(req, res) {
  return res.json({ success: true, ...(await getAlertsService(req.user.id, filtersFromQuery(req.query))) });
}

export async function resolveAlert(req, res) {
  return res.json({ success: true, data: await resolveAlertService(req.user.id, req.params.id) });
}

export async function getPreferences(req, res) {
  return res.json({ success: true, data: await getNotificationPreferencesService(req.user.id) });
}

export async function patchPreferences(req, res) {
  return res.json({ success: true, data: await patchNotificationPreferencesService(req.user.id, req.body) });
}

export async function registerDevice(req, res) {
  return res.status(201).json({ success: true, data: await registerDeviceService(req.user.id, req.body) });
}

export async function listDevices(req, res) {
  return res.json({ success: true, data: await getDevicesService(req.user.id) });
}

export async function deleteDevice(req, res) {
  return res.json({ success: true, data: await removeDeviceService(req.user.id, req.params.id) });
}

export async function publishEvent(req, res) {
  const event = await publishDomainEvent(req.body);
  await processDomainEvent(event.id);
  return res.status(202).json({ success: true, data: { eventId: event.id }, message: 'Event accepted' });
}
