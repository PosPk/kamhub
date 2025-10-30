'use client';

import React from 'react';
import { useRoles } from '@/contexts/RoleContext';

interface ProtectedProps {
  children: React.ReactNode;
  roles: string[];
  fallback?: React.ReactNode;
}

export const Protected: React.FC<ProtectedProps> = ({ 
  children, 
  roles, 
  fallback = <div className="text-center p-8 text-gray-500">Нет доступа</div> 
}) => {
  const { hasRole } = useRoles();
  
  const hasAccess = roles.some(role => hasRole(role as any));
  
  if (!hasAccess) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};
