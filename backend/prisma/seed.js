import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const roleDefinitions = [
  { name: 'SUPERADMIN', description: 'Platform-wide system administrator with full operational oversight.' },
  { name: 'ADMIN', description: 'Admin with elevated platform management privileges bounded by explicit policy.' },
  { name: 'FARM_OWNER', description: 'Owner of one or more farms with full ownership-level farm access.' },
  { name: 'WORKER', description: 'Farm worker with access limited to explicitly granted permissions.' },
];

const permissionDefinitions = [
  { code: 'VIEW_FARM', name: 'View Farm', description: 'View farm details and membership information.', category: 'farm' },
  { code: 'MANAGE_FARM', name: 'Manage Farm', description: 'Manage farm settings and ownership-level actions.', category: 'farm' },
  { code: 'VIEW_CROP', name: 'View Crop', description: 'Read crop-related records and crop activity.', category: 'crop' },
  { code: 'CREATE_CROP_RECORD', name: 'Create Crop Record', description: 'Create crop activity records.', category: 'crop' },
  { code: 'UPDATE_CROP_RECORD', name: 'Update Crop Record', description: 'Modify existing crop records.', category: 'crop' },
  { code: 'RECORD_CROP_ACTIVITY', name: 'Record Crop Activity', description: 'Record crop activities, observations, and growth updates.', category: 'crop' },
  { code: 'RECORD_HARVEST', name: 'Record Harvest', description: 'Record harvests linked to crop production.', category: 'crop' },
  { code: 'VIEW_LIVESTOCK', name: 'View Livestock', description: 'Read livestock details and health records.', category: 'livestock' },
  { code: 'CREATE_LIVESTOCK_RECORD', name: 'Create Livestock Record', description: 'Create livestock activities or health records.', category: 'livestock' },
  { code: 'UPDATE_LIVESTOCK_RECORD', name: 'Update Livestock Record', description: 'Modify livestock records.', category: 'livestock' },
  { code: 'VIEW_INVENTORY', name: 'View Inventory', description: 'Read inventory and stock movement records.', category: 'inventory' },
  { code: 'CREATE_INVENTORY_RECORD', name: 'Create Inventory Record', description: 'Create inventory adjustments or stock entries.', category: 'inventory' },
  { code: 'UPDATE_INVENTORY_RECORD', name: 'Update Inventory Record', description: 'Modify inventory records.', category: 'inventory' },
  { code: 'RECORD_FEEDING', name: 'Record Feeding', description: 'Record feeding operations for a farm.', category: 'operations' },
  { code: 'RECORD_VACCINATION', name: 'Record Vaccination', description: 'Log vaccination events.', category: 'operations' },
  { code: 'VIEW_EXPENSES', name: 'View Expenses', description: 'Read expense records for a farm.', category: 'finance' },
  { code: 'VIEW_REVENUE', name: 'View Revenue', description: 'Read revenue records for a farm.', category: 'finance' },
  { code: 'VIEW_PROFIT', name: 'View Profit', description: 'Access profit-related financial reporting.', category: 'finance' },
  { code: 'MANAGE_WORKERS', name: 'Manage Workers', description: 'Add, remove, or change worker memberships.', category: 'people' },
  { code: 'CREATE_POST', name: 'Create Post', description: 'Create community posts.', category: 'community' },
  { code: 'COMMENT_POST', name: 'Comment Post', description: 'Comment on community posts.', category: 'community' },
  { code: 'LIKE_POST', name: 'Like Post', description: 'Like community posts.', category: 'community' },
  { code: 'MANAGE_PLATFORM', name: 'Manage Platform', description: 'Manage platform-level settings and moderation.', category: 'admin' },
  { code: 'VIEW_SYSTEM_REPORTS', name: 'View System Reports', description: 'Read administrator reports and summaries.', category: 'admin' },
  { code: 'MANAGE_USERS', name: 'Manage Users', description: 'Manage user accounts and role assignments.', category: 'admin' },
  { code: 'VIEW_AUDIT_LOGS', name: 'View Audit Logs', description: 'Read audit history for privileged actions.', category: 'admin' },
];

const rolePermissions = {
  SUPERADMIN: permissionDefinitions.map(({ code }) => code),
  ADMIN: [
    'VIEW_FARM', 'VIEW_CROP', 'VIEW_LIVESTOCK', 'VIEW_INVENTORY', 'VIEW_EXPENSES', 'VIEW_REVENUE', 'VIEW_PROFIT',
    'MANAGE_WORKERS', 'CREATE_POST', 'COMMENT_POST', 'LIKE_POST', 'VIEW_SYSTEM_REPORTS', 'MANAGE_USERS', 'VIEW_AUDIT_LOGS', 'MANAGE_PLATFORM',
  ],
  FARM_OWNER: [
    'VIEW_FARM', 'MANAGE_FARM', 'VIEW_CROP', 'CREATE_CROP_RECORD', 'UPDATE_CROP_RECORD', 'RECORD_CROP_ACTIVITY', 'RECORD_HARVEST', 'VIEW_LIVESTOCK', 'CREATE_LIVESTOCK_RECORD', 'UPDATE_LIVESTOCK_RECORD',
    'VIEW_INVENTORY', 'CREATE_INVENTORY_RECORD', 'UPDATE_INVENTORY_RECORD', 'RECORD_FEEDING', 'RECORD_VACCINATION', 'VIEW_EXPENSES', 'VIEW_REVENUE', 'VIEW_PROFIT',
    'MANAGE_WORKERS', 'CREATE_POST', 'COMMENT_POST', 'LIKE_POST',
  ],
  WORKER: [
    'VIEW_FARM', 'VIEW_CROP', 'CREATE_CROP_RECORD', 'UPDATE_CROP_RECORD', 'RECORD_CROP_ACTIVITY', 'VIEW_LIVESTOCK', 'CREATE_LIVESTOCK_RECORD', 'UPDATE_LIVESTOCK_RECORD',
    'VIEW_INVENTORY', 'CREATE_INVENTORY_RECORD', 'UPDATE_INVENTORY_RECORD', 'RECORD_FEEDING', 'RECORD_VACCINATION', 'CREATE_POST', 'COMMENT_POST', 'LIKE_POST',
  ],
};

async function main() {
  console.log('Seeding FarmWise roles and permissions...');

  for (const role of roleDefinitions) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: role,
    });
  }

  for (const permission of permissionDefinitions) {
    await prisma.permission.upsert({
      where: { code: permission.code },
      update: { name: permission.name, description: permission.description, category: permission.category },
      create: permission,
    });
  }

  for (const [roleName, permissionCodes] of Object.entries(rolePermissions)) {
    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) continue;

    const permissions = await prisma.permission.findMany({
      where: { code: { in: permissionCodes } },
      select: { id: true, code: true },
    });

    for (const permission of permissions) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
        update: {},
        create: { roleId: role.id, permissionId: permission.id },
      });
    }
  }

  console.log('FarmWise RBAC seed complete.');
}

main()
  .catch((error) => {
    console.error('RBAC seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
