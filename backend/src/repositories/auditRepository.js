import prisma from '../lib/prisma.js';

export async function createAuditLog({ farmId, userId, action, entityType, entityId, oldValues, newValues, req }) {
  return prisma.auditLog.create({
    data: {
      farmId,
      userId,
      action,
      entityType,
      entityId,
      oldValues: oldValues === undefined ? null : JSON.stringify(oldValues),
      newValues: newValues === undefined ? null : JSON.stringify(newValues),
      correlationId: req?.id || req?.headers?.['x-correlation-id'] || null,
      ipAddress: req?.ip || null,
      userAgent: req?.get?.('user-agent') || null,
    },
  });
}

export default { createAuditLog };
