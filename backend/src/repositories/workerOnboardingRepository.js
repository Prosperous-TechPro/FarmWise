import prisma from '../lib/prisma.js';

const userSelect = { id: true, email: true, phone: true, firstName: true, lastName: true, status: true, phoneVerified: true };

export function findActiveOnboardingByUser(userId) {
  return prisma.workerOnboarding.findFirst({ where: { userId, status: { in: ['PHONE_VERIFICATION_REQUIRED', 'PASSWORD_SETUP_REQUIRED'] }, expiresAt: { gt: new Date() } }, include: { farm: { select: { id: true, name: true } }, user: { select: userSelect } } });
}

export function findOnboardingByToken(tokenHash) {
  return prisma.workerOnboarding.findFirst({ where: { tokenHash, status: { in: ['PHONE_VERIFICATION_REQUIRED', 'PASSWORD_SETUP_REQUIRED'] }, expiresAt: { gt: new Date() } }, include: { farm: { select: { id: true, name: true } }, user: { select: userSelect } } });
}

export function createWorkerOnboarding(data) {
  return prisma.workerOnboarding.create({ data, include: { farm: { select: { id: true, name: true } }, user: { select: userSelect } } });
}

export function updateWorkerOnboarding(id, data) {
  return prisma.workerOnboarding.update({ where: { id }, data, include: { farm: { select: { id: true, name: true } }, user: { select: userSelect } } });
}

export async function rotateWorkerOnboardingToken(id, tokenHash) {
  return prisma.workerOnboarding.update({ where: { id }, data: { tokenHash } });
}

export function findUserByPhone(phone) { return prisma.user.findUnique({ where: { phone }, select: { id: true, email: true } }); }
export function findUserByEmail(email) { return prisma.user.findUnique({ where: { email }, select: { id: true } }); }

export async function createWorkerAccount({ user, farmId, createdById, tokenHash }) {
  return prisma.$transaction(async (transaction) => {
    const workerRole = await transaction.role.findFirst({ where: { name: { in: ['FARM_WORKER', 'WORKER'] } }, orderBy: { name: 'asc' } });
    if (!workerRole) throw new Error('Worker role is not configured');
    const createdUser = await transaction.user.create({ data: { ...user, userRoles: { create: { roleId: workerRole.id } } }, include: { userRoles: { include: { role: true } } } });
    const member = await transaction.farmMember.create({ data: { userId: createdUser.id, farmId, role: 'WORKER', status: 'ACTIVE' } });
    const onboarding = await transaction.workerOnboarding.create({ data: { userId: createdUser.id, farmId, createdById, tokenHash, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) }, include: { farm: { select: { id: true, name: true } }, user: { select: userSelect } } });
    return { user: createdUser, member, onboarding };
  });
}
