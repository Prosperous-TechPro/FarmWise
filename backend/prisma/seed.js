import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const roleDefinitions = [
  { name: 'SUPERADMIN', description: 'Platform-wide system administrator with full operational oversight.' },
  { name: 'ADMIN', description: 'Admin with elevated platform management privileges bounded by explicit policy.' },
  { name: 'FARM_OWNER', description: 'Owner of one or more farms with full ownership-level farm access.' },
  { name: 'FARM_WORKER', description: 'Farm worker with access limited to explicitly granted permissions.' },
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
  { code: 'CREATE_ACTIVITY', name: 'Create Activity', description: 'Create structured farm activity records.', category: 'operations' },
  { code: 'UPDATE_ASSIGNED_TASK', name: 'Update Assigned Task', description: 'Update tasks assigned to the worker.', category: 'operations' },
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
  { code: 'MANAGE_FAQS', name: 'Manage FAQs', description: 'Create, publish, and maintain global FAQ content.', category: 'support' },
  { code: 'MANAGE_FEEDBACK', name: 'Manage Feedback', description: 'Review and process user feedback submissions.', category: 'support' },
];

const faqCategories = [
  { name: 'Account & Registration', description: 'Registration, OTP verification, login, and password recovery.', displayOrder: 1 },
  { name: 'Farm Management', description: 'Farms, fields, and farm history.', displayOrder: 2 },
  { name: 'Crop Management', description: 'Crops, activities, inputs, and harvests.', displayOrder: 3 },
  { name: 'Livestock Management', description: 'Animals, feeding, health, breeding, and losses.', displayOrder: 4 },
  { name: 'Worker Management', description: 'Workers, assignments, and permissions.', displayOrder: 5 },
  { name: 'Tasks & Activities', description: 'Tasks and operational activity records.', displayOrder: 6 },
  { name: 'Inventory Management', description: 'Stock, usage, and low-stock alerts.', displayOrder: 7 },
  { name: 'Expenses & Sales', description: 'Financial transactions and profit or loss.', displayOrder: 8 },
  { name: 'Reports & Analytics', description: 'Dashboards, reports, trends, and estimates.', displayOrder: 9 },
  { name: 'Notifications', description: 'Alerts and account notifications.', displayOrder: 10 },
  { name: 'Community', description: 'Community posts, comments, and reports.', displayOrder: 11 },
  { name: 'Private Messaging', description: 'Authorized private conversations.', displayOrder: 12 },
  { name: 'Security & Privacy', description: 'Access control, security, and privacy.', displayOrder: 13 },
  { name: 'FAQ & Feedback', description: 'Help content and user feedback.', displayOrder: 14 },
  { name: 'Admin & Super Admin', description: 'Administrative tools and permissions.', displayOrder: 15 },
];

const faqDefinitions = [
  ['Account & Registration', 'How do I create a FarmWise account?', 'Select Create Account, enter the required information, choose a verification method, and complete OTP verification.'],
  ['Account & Registration', 'What happens if I do not receive my OTP?', 'Confirm your email or phone number, check your email spam folder, and request another OTP when permitted.'],
  ['Account & Registration', 'I forgot my password. What should I do?', 'Use Forgot Password and follow the verification and password-reset instructions.'],
  ['Farm Management', 'How do I add a farm?', 'Open Farm Management, select Add Farm, enter the required farm information, and save the farm.'],
  ['Farm Management', 'Can I manage more than one farm?', 'Yes, when your account and permissions allow access to multiple farms.'],
  ['Crop Management', 'What crop activities can I record?', 'Depending on your permissions, you can record activities such as planting, weeding, inputs, observations, irrigation, pest control, and harvesting.'],
  ['Livestock Management', 'Can I record vaccinations?', 'Authorized users can record vaccination details such as date, vaccine type, animal or group, and related information.'],
  ['Worker Management', 'Can I control what a worker can do?', 'Yes. Farm Owners can grant or revoke appropriate worker permissions.'],
  ['Tasks & Activities', 'Can I assign tasks to workers?', 'Authorized users can assign tasks to workers and workers can update assigned tasks according to their permissions.'],
  ['Inventory Management', 'What can I track in inventory?', 'Users can track farm inputs such as seeds, fertilizer, pesticides, feed, vaccines, medicines, equipment, and other supported items.'],
  ['Expenses & Sales', 'Can FarmWise calculate profit or loss?', 'Yes. Financial summaries are derived from recorded authoritative expenses and sales.'],
  ['Reports & Analytics', 'What reports can FarmWise provide?', 'Depending on enabled modules, reports can include production, livestock, expenses, sales, inventory, activities, and project expenditure.'],
  ['Notifications', 'What notifications can I receive?', 'Notifications may include tasks, farm alerts, inventory alerts, security events, feedback responses, and other account events.'],
  ['Community', 'Can I report inappropriate content?', 'Yes. Use the available reporting functionality to notify authorized administrators.'],
  ['Security & Privacy', 'Is my farm information protected?', 'FarmWise uses authentication, authorization, and role-based access controls to restrict access to farm information.'],
  ['FAQ & Feedback', 'Where can I find help?', 'Click the FAQ & Help button available throughout the application.'],
  ['FAQ & Feedback', 'Can I track my feedback?', 'Yes. Open FAQ & Help, choose View my feedback, and select a submission to see its status and public responses.'],
];

const rolePermissions = {
  SUPERADMIN: permissionDefinitions.map(({ code }) => code),
  ADMIN: [
    'VIEW_FARM', 'VIEW_CROP', 'VIEW_LIVESTOCK', 'VIEW_INVENTORY', 'VIEW_EXPENSES', 'VIEW_REVENUE', 'VIEW_PROFIT',
    'MANAGE_WORKERS', 'MANAGE_FAQS', 'MANAGE_FEEDBACK', 'CREATE_POST', 'COMMENT_POST', 'LIKE_POST', 'VIEW_SYSTEM_REPORTS', 'MANAGE_USERS', 'VIEW_AUDIT_LOGS', 'MANAGE_PLATFORM',
  ],
  FARM_OWNER: [
    'VIEW_FARM', 'MANAGE_FARM', 'VIEW_CROP', 'CREATE_CROP_RECORD', 'UPDATE_CROP_RECORD', 'RECORD_CROP_ACTIVITY', 'RECORD_HARVEST', 'VIEW_LIVESTOCK', 'CREATE_LIVESTOCK_RECORD', 'UPDATE_LIVESTOCK_RECORD',
    'VIEW_INVENTORY', 'CREATE_INVENTORY_RECORD', 'UPDATE_INVENTORY_RECORD', 'RECORD_FEEDING', 'RECORD_VACCINATION', 'VIEW_EXPENSES', 'VIEW_REVENUE', 'VIEW_PROFIT',
    'MANAGE_WORKERS', 'CREATE_ACTIVITY', 'CREATE_POST', 'COMMENT_POST', 'LIKE_POST',
  ],
  FARM_WORKER: [
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

  for (const category of faqCategories) {
    await prisma.fAQCategory.upsert({ where: { name: category.name }, update: category, create: category });
  }

  const faqAuthor = await prisma.user.findFirst({ where: { userRoles: { some: { role: { name: { in: ['ADMIN', 'SUPERADMIN'] } } } } }, select: { id: true } });
  if (faqAuthor) {
    for (const [categoryName, question, answer] of faqDefinitions) {
      const category = await prisma.fAQCategory.findUnique({ where: { name: categoryName }, select: { id: true } });
      const existing = await prisma.fAQ.findFirst({ where: { question, categoryId: category.id } });
      if (!existing) await prisma.fAQ.create({ data: { question, answer, categoryId: category.id, status: 'PUBLISHED', createdById: faqAuthor.id, updatedById: faqAuthor.id } });
    }
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
