/**
 * FarmWise Frontend - Constants
 * 
 * Application-wide constants
 */

// Design tokens - Colors
export const COLORS = {
  primary: '#22c55e', // Green
  white: '#ffffff',
  black: '#000000',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  gray: {
    light: '#f3f4f6',
    medium: '#d1d5db',
    dark: '#374151',
  },
};

// User roles
export const USER_ROLES = {
  SUPERADMIN: 'SUPERADMIN',
  ADMIN: 'ADMIN',
  FARM_OWNER: 'FARM_OWNER',
  WORKER: 'WORKER',
};

// Application routes
export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  dashboard: '/dashboard',
  farms: '/farms',
  livestock: '/livestock',
  crops: '/crops',
  activities: '/activities',
  finance: '/finance',
  reports: '/reports',
  settings: '/settings',
};

export default {
  COLORS,
  USER_ROLES,
  ROUTES,
};
