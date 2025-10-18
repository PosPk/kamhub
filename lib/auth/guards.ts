import { NextRequest, NextResponse } from 'next/server';
import { hasRole, hasAllPermissions, Permission, AppRole, isStrictRBAC } from '@/lib/auth/rbac';

export function ensureRole(request: NextRequest, roles: AppRole[]) {
  const headers = request.headers;
  const rawRoles = headers.get('x-user-roles') || 'tourist';
  const userRoles = rawRoles.split(',').map(r => r.trim());
  const ok = hasRole(userRoles, roles);
  if (!ok) {
    if (isStrictRBAC()) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    // Мягкий режим — пропускаем
    return null;
  }
  return null;
}

export function ensurePermissions(request: NextRequest, permissions: Permission[]) {
  const headers = request.headers;
  const rawRoles = headers.get('x-user-roles') || 'tourist';
  const userRoles = rawRoles.split(',').map(r => r.trim());
  const ok = hasAllPermissions(userRoles, permissions);
  if (!ok) {
    if (isStrictRBAC()) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    return null;
  }
  return null;
}
