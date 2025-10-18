// Центральный RBAC модуль
import { config } from '@/lib/config';

export type AppRole = 'tourist' | 'operator' | 'guide' | 'transfer' | 'agent' | 'admin';

export type Permission =
  | 'view_tours'
  | 'book_tours'
  | 'view_weather'
  | 'use_ai_chat'
  | 'view_reviews'
  | 'manage_profile'
  | 'manage_tours'
  | 'manage_slots'
  | 'manage_guides'
  | 'view_analytics'
  | 'manage_bookings'
  | 'manage_transfers'
  | 'manage_routes'
  | 'manage_vehicles'
  | 'manage_drivers'
  | 'manage_schedules'
  | 'manage_groups'
  | 'manage_vouchers'
  | 'view_commissions'
  | 'manage_partnerships'
  | 'gds_integration'
  | 'manage_users'
  | 'manage_roles'
  | 'system_monitoring'
  | 'weather_management'
  | 'inter_operator_management'
  | 'full_analytics';

export const rolePermissions: Record<AppRole, Permission[]> = {
  tourist: [
    'view_tours',
    'book_tours',
    'view_weather',
    'use_ai_chat',
    'view_reviews',
    'manage_profile',
  ],
  operator: [
    'manage_tours',
    'manage_slots',
    'manage_guides',
    'view_analytics',
    'manage_bookings',
    'weather_management',
    'manage_transfers',
  ],
  guide: [
    'view_weather',
    'manage_groups',
    'view_analytics',
    'manage_profile',
  ],
  transfer: [
    'manage_routes',
    'manage_vehicles',
    'manage_drivers',
    'manage_schedules',
    'view_analytics',
  ],
  agent: [
    'manage_groups',
    'manage_vouchers',
    'view_commissions',
    'manage_partnerships',
    'gds_integration',
    'view_analytics',
  ],
  admin: [
    'manage_users',
    'manage_roles',
    'system_monitoring',
    'weather_management',
    'inter_operator_management',
    'full_analytics',
  ],
};

export function normalizeRole(role: string): AppRole | null {
  const map: Record<string, AppRole> = {
    traveler: 'tourist',
    tourist: 'tourist',
    operator: 'operator',
    guide: 'guide',
    transfer: 'transfer',
    agent: 'agent',
    admin: 'admin',
  };
  return (map[role] as AppRole) || null;
}

export function hasRole(userRoles: string[], required: AppRole | AppRole[]): boolean {
  const requiredList = Array.isArray(required) ? required : [required];
  const normalizedUserRoles = userRoles.map(r => normalizeRole(r)).filter(Boolean) as AppRole[];
  if (normalizedUserRoles.includes('admin')) return true;
  return requiredList.some(req => normalizedUserRoles.includes(req));
}

export function hasPermission(userRoles: string[], permission: Permission): boolean {
  const normalizedUserRoles = userRoles.map(r => normalizeRole(r)).filter(Boolean) as AppRole[];
  if (normalizedUserRoles.includes('admin')) return true;
  return normalizedUserRoles.some(role => rolePermissions[role]?.includes(permission));
}

export function hasAllPermissions(userRoles: string[], permissions: Permission[]): boolean {
  return permissions.every(p => hasPermission(userRoles, p));
}

export function isStrictRBAC(): boolean {
  if (process.env.NODE_ENV === 'test') return false;
  return (config.app.environment === 'production');
}
