/**
 * Pending registration repository
 * Database access layer for registrations awaiting OTP verification.
 */

import prisma from '../lib/prisma.js';

export async function createPendingRegistration(data) {
  return prisma.pendingRegistration.create({
    data: {
      email: data.email.toLowerCase(),
      phone: data.phone,
      firstName: data.firstName,
      lastName: data.lastName,
      passwordHash: data.passwordHash,
      verificationMethod: data.verificationMethod,
    },
  });
}

export async function findPendingRegistrationById(id) {
  return prisma.pendingRegistration.findUnique({ where: { id } });
}

export async function findPendingRegistrationByEmail(email) {
  return prisma.pendingRegistration.findUnique({ where: { email: email.toLowerCase() } });
}

export async function findPendingRegistrationByPhone(phone) {
  return prisma.pendingRegistration.findUnique({ where: { phone } });
}

export async function deletePendingRegistration(id) {
  return prisma.pendingRegistration.delete({ where: { id } });
}

export default {
  createPendingRegistration,
  findPendingRegistrationById,
  findPendingRegistrationByEmail,
  findPendingRegistrationByPhone,
  deletePendingRegistration,
};