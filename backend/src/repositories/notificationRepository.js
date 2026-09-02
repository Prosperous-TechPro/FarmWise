/**
 * Notification, alert, device, preference, and domain event data access.
 */

import prisma from '../lib/prisma.js';

export async function getAuthorizedFarmUserIds(farmId) {
  const farm = await prisma.farm.findUnique({
    where: { id: farmId },
    select: {
      ownerId: true,
      farmMembers: { where: { status: 'ACTIVE' }, select: { userId: true, role: true } },
    },
  });
  if (!farm) return [];
  return [farm.ownerId, ...farm.farmMembers.filter((member) => ['OWNER', 'MANAGER'].includes(member.role)).map((member) => member.userId)];
}

export async function listNotificationsForUser(userId, filters = {}) {
  const where = {
    userId,
    ...(filters.farmId ? { farmId: filters.farmId } : {}),
    ...(filters.type ? { type: filters.type } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.severity ? { severity: filters.severity } : {}),
    ...(filters.dateFrom || filters.dateTo ? { createdAt: { ...(filters.dateFrom ? { gte: filters.dateFrom } : {}), ...(filters.dateTo ? { lte: filters.dateTo } : {}) } } : {}),
  };
  const [data, total] = await Promise.all([
    prisma.notification.findMany({ where, include: { farm: { select: { id: true, name: true } } }, orderBy: { createdAt: 'desc' }, skip: (filters.page - 1) * filters.limit, take: filters.limit }),
    prisma.notification.count({ where }),
  ]);
  return { data, pagination: { page: filters.page, limit: filters.limit, total, pages: Math.ceil(total / filters.limit) } };
}

export function countUnreadNotifications(userId, farmId) {
  return prisma.notification.count({ where: { userId, ...(farmId ? { farmId } : {}), status: 'UNREAD' } });
}

export function getNotificationForUser(userId, id) {
  return prisma.notification.findFirst({ where: { id, userId } });
}

export function updateNotification(id, data) {
  return prisma.notification.update({ where: { id }, data });
}

export async function listAlertsForUser(userId, filters = {}) {
  const farmIds = await prisma.farm.findMany({ where: { OR: [{ ownerId: userId }, { farmMembers: { some: { userId, status: 'ACTIVE' } } }] }, select: { id: true } });
  const where = { farmId: { in: farmIds.map((farm) => farm.id) }, ...(filters.status ? { status: filters.status } : {}) };
  const [data, total] = await Promise.all([
    prisma.farmAlert.findMany({ where, orderBy: { detectedAt: 'desc' }, skip: (filters.page - 1) * filters.limit, take: filters.limit }),
    prisma.farmAlert.count({ where }),
  ]);
  return { data, pagination: { page: filters.page, limit: filters.limit, total, pages: Math.ceil(total / filters.limit) } };
}

export function getAlertForUser(userId, id) {
  return prisma.farmAlert.findFirst({
    where: { id, farm: { OR: [{ ownerId: userId }, { farmMembers: { some: { userId, status: 'ACTIVE' } } }] } },
    include: { farm: { select: { ownerId: true } } },
  });
}

export function updateAlert(id, data) {
  return prisma.farmAlert.update({ where: { id }, data });
}

export function listPreferences(userId) {
  return prisma.notificationPreference.findMany({ where: { userId }, orderBy: [{ type: 'asc' }, { channel: 'asc' }] });
}

export function upsertPreference(userId, type, channel, enabled) {
  return prisma.notificationPreference.upsert({ where: { userId_type_channel: { userId, type, channel } }, update: { enabled }, create: { userId, type, channel, enabled } });
}

export function upsertDevice(userId, data) {
  return prisma.notificationDevice.upsert({ where: { userId_deviceId: { userId, deviceId: data.deviceId } }, update: { ...data, isActive: true, lastSeenAt: new Date() }, create: { userId, ...data } });
}

export function listDevices(userId) {
  return prisma.notificationDevice.findMany({ where: { userId, isActive: true }, select: { id: true, deviceId: true, platform: true, isActive: true, lastSeenAt: true, createdAt: true, updatedAt: true }, orderBy: { lastSeenAt: 'desc' } });
}

export function removeDevice(userId, id) {
  return prisma.notificationDevice.updateMany({ where: { id, userId }, data: { isActive: false } });
}

export function createDomainEvent(data) {
  return prisma.domainEvent.create({ data });
}

export function findDomainEvent(id) {
  return prisma.domainEvent.findUnique({ where: { id } });
}

export function updateDomainEvent(id, data) {
  return prisma.domainEvent.update({ where: { id }, data });
}

export async function createAlertAndNotifications({ event, alert, userIds, type, channel = 'IN_APP' }) {
  return prisma.$transaction(async (transaction) => {
    const createdAlert = await transaction.farmAlert.upsert({ where: { fingerprint: alert.fingerprint }, update: {}, create: { ...alert, farmId: event.farmId } });
    const notifications = [];
    for (const userId of userIds) {
      const preference = await transaction.notificationPreference.findUnique({ where: { userId_type_channel: { userId, type, channel } } });
      if (preference?.enabled === false) continue;
      const notification = await transaction.notification.upsert({
        where: { userId_eventId_channel: { userId, eventId: event.id, channel } },
        update: {},
        create: { userId, farmId: event.farmId, alertId: createdAlert.id, eventId: event.id, type, title: alert.title, message: alert.message, severity: alert.severity, channel, relatedEntityType: event.entityType || null, relatedEntityId: event.entityId || null, deliveries: { create: { userId, channel, status: channel === 'IN_APP' ? 'DELIVERED' : 'PENDING', attempts: channel === 'IN_APP' ? 1 : 0, deliveredAt: channel === 'IN_APP' ? new Date() : null } } },
      });
      notifications.push(notification);
    }
    return { alert: createdAlert, notifications };
  });
}

export default { listNotificationsForUser, countUnreadNotifications, getNotificationForUser, updateNotification, listAlertsForUser, getAlertForUser, updateAlert, listPreferences, upsertPreference, upsertDevice, listDevices, removeDevice, createDomainEvent, findDomainEvent, updateDomainEvent, createAlertAndNotifications, getAuthorizedFarmUserIds };
