import prisma from '../lib/prisma.js';

const faqInclude = { category: true, _count: { select: { feedback: true } } };
const userSelect = { id: true, firstName: true, lastName: true, email: true };

export function listFAQCategories(includeInactive = false) {
  return prisma.fAQCategory.findMany({ where: includeInactive ? undefined : { isActive: true }, orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }] });
}

export async function listPublishedFAQs({ search, categoryId, page, limit }) {
  const where = { status: 'PUBLISHED', ...(categoryId ? { categoryId } : {}), ...(search ? { OR: [{ question: { contains: search, mode: 'insensitive' } }, { answer: { contains: search, mode: 'insensitive' } }, { category: { name: { contains: search, mode: 'insensitive' } } }] } : {}) };
  const [data, total] = await Promise.all([
    prisma.fAQ.findMany({ where, include: faqInclude, orderBy: [{ displayOrder: 'asc' }, { updatedAt: 'desc' }], skip: (page - 1) * limit, take: limit }),
    prisma.fAQ.count({ where }),
  ]);
  return { data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

export function getPublishedFAQ(id) {
  return prisma.fAQ.findFirst({ where: { id, status: 'PUBLISHED' }, include: faqInclude });
}

export function upsertFAQFeedback(faqId, userId, helpful) {
  return prisma.fAQFeedback.upsert({ where: { faqId_userId: { faqId, userId } }, update: { helpful }, create: { faqId, userId, helpful } });
}

export function createFAQ(data) { return prisma.fAQ.create({ data, include: faqInclude }); }
export function updateFAQ(id, data) { return prisma.fAQ.update({ where: { id }, data, include: faqInclude }); }
export function listAdminFAQs({ search, status, categoryId, page, limit }) {
  const where = { ...(status ? { status } : {}), ...(categoryId ? { categoryId } : {}), ...(search ? { OR: [{ question: { contains: search, mode: 'insensitive' } }, { answer: { contains: search, mode: 'insensitive' } }] } : {}) };
  return Promise.all([prisma.fAQ.findMany({ where, include: faqInclude, orderBy: [{ displayOrder: 'asc' }, { updatedAt: 'desc' }], skip: (page - 1) * limit, take: limit }), prisma.fAQ.count({ where })]).then(([data, total]) => ({ data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } }));
}
export function createFAQCategory(data) { return prisma.fAQCategory.create({ data }); }
export function updateFAQCategory(id, data) { return prisma.fAQCategory.update({ where: { id }, data }); }

const feedbackInclude = { user: { select: userSelect }, assignedTo: { select: userSelect }, attachments: { include: { mediaFile: { select: { id: true, fileName: true, mimeType: true, size: true, storagePath: true } } } } };
const feedbackDetailInclude = { ...feedbackInclude, responses: { where: { isInternal: false }, include: { author: { select: userSelect } }, orderBy: { createdAt: 'asc' } }, notes: { include: { author: { select: userSelect } }, orderBy: { createdAt: 'asc' } } };

export function createFeedback(data) { return prisma.feedback.create({ data, include: feedbackInclude }); }
export function listMyFeedback(userId, page, limit) { const where = { userId }; return Promise.all([prisma.feedback.findMany({ where, include: feedbackInclude, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }), prisma.feedback.count({ where })]).then(([data, total]) => ({ data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } })); }
export function getMyFeedback(userId, id) { return prisma.feedback.findFirst({ where: { id, userId }, include: { ...feedbackDetailInclude, responses: { where: { isInternal: false }, include: { author: { select: userSelect } }, orderBy: { createdAt: 'asc' } }, notes: false } }); }
export function listAdminFeedback(filters) { const where = { ...(filters.status ? { status: filters.status } : {}), ...(filters.category ? { category: filters.category } : {}), ...(filters.priority ? { priority: filters.priority } : {}), ...(filters.assignedToId ? { assignedToId: filters.assignedToId } : {}), ...(filters.search ? { OR: [{ reference: { contains: filters.search, mode: 'insensitive' } }, { subject: { contains: filters.search, mode: 'insensitive' } }, { description: { contains: filters.search, mode: 'insensitive' } }] } : {}) }; return Promise.all([prisma.feedback.findMany({ where, include: feedbackInclude, orderBy: { createdAt: 'desc' }, skip: (filters.page - 1) * filters.limit, take: filters.limit }), prisma.feedback.count({ where })]).then(([data, total]) => ({ data, pagination: { page: filters.page, limit: filters.limit, total, pages: Math.ceil(total / filters.limit) } })); }
export function getAdminFeedback(id) { return prisma.feedback.findUnique({ where: { id }, include: feedbackDetailInclude }); }
export function updateFeedback(id, data) { return prisma.feedback.update({ where: { id }, data, include: feedbackInclude }); }
export function createFeedbackResponse(data) { return prisma.feedbackResponse.create({ data, include: { author: { select: userSelect } } }); }
export function createFeedbackNote(data) { return prisma.feedbackInternalNote.create({ data, include: { author: { select: userSelect } } }); }
export function listAdminIds() { return prisma.user.findMany({ where: { status: 'ACTIVE', userRoles: { some: { role: { name: { in: ['ADMIN', 'SUPERADMIN'] } } } } }, select: { id: true } }); }
export function getUserIdForFeedback(id) { return prisma.feedback.findUnique({ where: { id }, select: { userId: true } }); }
export function createGlobalNotification(data) { return prisma.notification.create({ data: { ...data, farmId: null, channel: 'IN_APP', severity: 'INFO' } }); }