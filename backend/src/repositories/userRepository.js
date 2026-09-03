/**
 * User Repository
 * Database access layer for User operations
 */

import prisma from '../lib/prisma.js';
function withRoles(user) {
  if (!user) return user;
  const userRoles = user.userRoles?.map((userRole) => ({
    ...userRole,
    role: userRole.role
      ? { ...userRole.role, permissions: userRole.role.rolePermissions }
      : userRole.role,
  }));
  return { ...user, userRoles, roles: userRoles, farms: user.ownedFarms };
}

/**
 * Find user by email
 * @param {string} email - User email
 * @returns {Promise<Object|null>} User object or null
 */
export async function findUserByEmail(email) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: {
      userRoles: { include: { role: { include: { rolePermissions: { include: { permission: true } } } } } },
    },
  });
  return withRoles(user);
}

/**
 * Find user by phone number
 * @param {string} phone - User phone number (normalized format)
 * @returns {Promise<Object|null>} User object or null
 */
export async function findUserByPhone(phone) {
  const user = await prisma.user.findUnique({
    where: { phone },
    include: {
      userRoles: { include: { role: { include: { rolePermissions: { include: { permission: true } } } } } },
    },
  });
  return withRoles(user);
}

/**
 * Find user by ID
 * @param {string} userId - User ID
 * @param {Object} options - Additional options
 * @param {boolean} options.includeRoles - Include role information
 * @returns {Promise<Object|null>} User object or null
 */
export async function findUserById(userId, options = {}) {
  const { includeRoles = true } = options;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      userRoles: includeRoles
        ? { include: { role: { include: { rolePermissions: { include: { permission: true } } } } } }
        : false,
      ownedFarms: true,
    },
  });
  return withRoles(user);
}

/**
 * Create a new user
 * @param {Object} userData - User data
 * @param {string} userData.email - Email address
 * @param {string} userData.phone - Phone number
 * @param {string} userData.firstName - First name
 * @param {string} userData.lastName - Last name
 * @param {string} userData.passwordHash - Hashed password
 * @param {boolean} userData.emailVerified - Email verification status
 * @param {boolean} userData.phoneVerified - Phone verification status
 * @returns {Promise<Object>} Created user object
 */
export async function createUser(userData) {
  const user = await prisma.user.create({
    data: {
      email: userData.email.toLowerCase(),
      phone: userData.phone,
      firstName: userData.firstName,
      lastName: userData.lastName,
      passwordHash: userData.passwordHash,
      emailVerified: userData.emailVerified || false,
      phoneVerified: userData.phoneVerified || false,
      status: userData.status || 'ACTIVE',
    },
    include: {
      userRoles: { include: { role: true } },
    },
  });
  return withRoles(user);
}

/**
 * Update user
 * @param {string} userId - User ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated user object
 */
export async function updateUser(userId, updateData) {
  // Don't allow direct password hash updates through this method
  const { passwordHash, ...safeData } = updateData;

  const user = await prisma.user.update({
    where: { id: userId },
    data: safeData,
    include: {
      userRoles: { include: { role: { include: { rolePermissions: { include: { permission: true } } } } } },
    },
  });
  return withRoles(user);
}

/**
 * Update password hash
 * @param {string} userId - User ID
 * @param {string} passwordHash - New password hash
 * @returns {Promise<Object>} Updated user object (without password hash)
 */
export async function updatePasswordHash(userId, passwordHash) {
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  // Don't return the password hash
  const { passwordHash: _, ...userWithoutPassword } = updated;
  return userWithoutPassword;
}

/**
 * Check if email exists
 * @param {string} email - Email address
 * @returns {Promise<boolean>} True if email exists
 */
export async function emailExists(email) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true },
  });
  return !!user;
}

/**
 * Check if phone exists
 * @param {string} phone - Phone number (normalized)
 * @returns {Promise<boolean>} True if phone exists
 */
export async function phoneExists(phone) {
  const user = await prisma.user.findUnique({
    where: { phone },
    select: { id: true },
  });
  return !!user;
}

/**
 * Get user's permissions
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of permission codes
 */
export async function getUserPermissions(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      userRoles: {
        include: {
          role: {
            include: {
              rolePermissions: {
                include: {
                  permission: {
                    select: { code: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user) return [];

  // Extract unique permission codes from all user roles
  const permissionSet = new Set();
  user.userRoles.forEach((userRole) => {
    userRole.role.rolePermissions.forEach((rolePermission) => {
      permissionSet.add(rolePermission.permission.code);
    });
  });

  return Array.from(permissionSet);
}

/**
 * Get user's roles
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of role names
 */
export async function getUserRoles(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      userRoles: {
        include: {
          role: {
            select: { name: true },
          },
        },
      },
    },
  });

  if (!user) return [];

  return user.userRoles.map((ur) => ur.role.name);
}

/**
 * Assign role to user
 * @param {string} userId - User ID
 * @param {string} roleId - Role ID
 * @returns {Promise<Object>} Created UserRole relation
 */
export async function assignRoleToUser(userId, roleId) {
  return prisma.userRole.upsert({
    where: { userId_roleId: { userId, roleId } },
    create: { userId, roleId },
    update: {},
    include: {
      role: { include: { rolePermissions: { include: { permission: true } } } },
    },
  });
}

export async function removeRoleFromUser(userId, roleId) {
  return prisma.userRole.delete({ where: { userId_roleId: { userId, roleId } } });
}

export async function ensureRole(name, description) {
  return prisma.role.upsert({
    where: { name },
    update: {},
    create: { name, description },
  });
}

export default {
  findUserByEmail,
  findUserByPhone,
  findUserById,
  createUser,
  updateUser,
  updatePasswordHash,
  emailExists,
  phoneExists,
  getUserPermissions,
  getUserRoles,
  assignRoleToUser,
  removeRoleFromUser,
  ensureRole,
};
