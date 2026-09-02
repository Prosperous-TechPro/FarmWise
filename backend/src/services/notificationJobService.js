/** Retry-safe background processing boundary for durable notification events. */

import { createLogger } from '../utils/logger.js';
import { processDomainEvent } from './notificationEventService.js';
import prisma from '../lib/prisma.js';
const logger = createLogger('notification-jobs');

export async function processPendingNotificationEvents(limit = 50) {
  const events = await prisma.domainEvent.findMany({
    where: { status: { in: ['RECEIVED', 'FAILED'] }, attempts: { lt: 3 } },
    orderBy: { createdAt: 'asc' },
    take: limit,
    select: { id: true },
  });

  const results = [];
  for (const event of events) {
    try {
      results.push(await processDomainEvent(event.id));
    } catch (error) {
      logger.error('Notification event retry failed', { eventId: event.id, error: error.message });
    }
  }
  return results;
}

export function startNotificationJobs(intervalMs = Number(process.env.NOTIFICATION_JOB_INTERVAL_MS) || 60000) {
  const timer = setInterval(() => {
    processPendingNotificationEvents().catch((error) => logger.error('Notification job failed', { error: error.message }));
  }, intervalMs);
  timer.unref?.();
  return () => clearInterval(timer);
}
