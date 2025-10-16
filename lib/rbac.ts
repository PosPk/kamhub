// RBAC utilities for server-side checks
// This module intentionally does not import any browser APIs

export type AppRole = 'tourist' | 'operator' | 'guide' | 'transfer' | 'agent' | 'admin' | 'traveler';

export type Permission =
  | 'view_tours'
  | 'book_tours'
  | 'manage_tours'
  | 'manage_slots'
  | 'manage_bookings'
  | 'manage_transfers'
  | 'manage_guides'
  | 'view_analytics'
  | 'manage_users'
  | 'manage_roles'
  | 'manage_notifications'
  | 'payments'
  | 'integrations';

export function normalizeRole(role: AppRole): Exclude<AppRole, 'traveler'> {
  return role === 'traveler' ? 'tourist' : role;
}

export const ROLE_PERMISSIONS: Record<Exclude<AppRole, 'traveler'>, Permission[]> = {
  tourist: ['view_tours', 'book_tours'],
  operator: ['view_analytics', 'manage_tours', 'manage_slots', 'manage_bookings'],
  guide: ['view_tours'],
  transfer: ['manage_transfers', 'view_analytics'],
  agent: ['view_tours', 'book_tours'],
  admin: [
    'view_tours',
    'book_tours',
    'manage_tours',
    'manage_slots',
    'manage_bookings',
    'manage_transfers',
    'manage_guides',
    'view_analytics',
    'manage_users',
    'manage_roles',
    'manage_notifications',
    'payments',
    'integrations',
  ],
};

export function hasPermission(roles: AppRole[] | undefined, permission: Permission): boolean {
  if (!roles || roles.length === 0) return false;
  const normalized = roles.map(normalizeRole);
  if ((normalized as string[]).includes('admin')) return true;
  return normalized.some((role) => ROLE_PERMISSIONS[role as Exclude<AppRole, 'traveler'>]?.includes(permission));
}

export function requirePermission(roles: AppRole[] | undefined, permission: Permission) {
  if (!hasPermission(roles, permission)) {
    const error: any = new Error('Forbidden: insufficient permissions');
    error.statusCode = 403;
    throw error;
  }
}

// Helper to extract roles from request headers for demo purposes
// Expects header: x-roles: "tourist,operator"
export function getRequestRolesFromHeaders(headers: Headers): Exclude<AppRole, 'traveler'>[] {
  const raw = headers.get('x-roles') || headers.get('x-user-roles') || '';
  const parts = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean) as AppRole[];
  if (parts.length === 0) return ['tourist'];
  return parts.map(normalizeRole) as Exclude<AppRole, 'traveler'>[];
}
