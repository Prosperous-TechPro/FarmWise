import test from 'node:test';
import assert from 'node:assert/strict';
import { FAQ_CATEGORY_TITLES } from './faqCategories.js';

test('FAQ category titles match the project taxonomy', () => {
  assert.deepEqual(FAQ_CATEGORY_TITLES, [
    'All',
    'Account & Authentication',
    'Farm Management',
    'Crop Management',
    'Livestock Management',
    'Workers',
    'Finance & Reports',
    'Tasks & Activities',
    'Inventory Management',
    'Expenses & Sales',
    'Reports & Analytics',
    'Notifications',
    'Community',
    'Private Messaging',
    'Security & Privacy',
    'FAQ & Feedback',
    'Admin & Super Admin',
  ]);
});
