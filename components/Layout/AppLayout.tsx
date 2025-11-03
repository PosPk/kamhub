/**
 * APP LAYOUT COMPONENT
 * 
 * Основной layout для всего приложения
 * Включает Sidebar, Header и основную область контента
 * 
 * Usage:
 *   import { AppLayout } from '@/components/Layout/AppLayout';
 *   <AppLayout role="traveler">{children}</AppLayout>
 */

'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { useRoles } from '@/contexts/RoleContext';

interface AppLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showSidebar?: boolean;
}

export function AppLayout({ 
  children, 
  showHeader = true,
  showSidebar = true 
}: AppLayoutProps) {
  const { roles, isLoading } = useRoles();
  const currentRole = roles[0] || 'traveler';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-premium-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-premium-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-premium-black">
      {/* Sidebar - только на desktop */}
      {showSidebar && (
        <div className="hidden lg:block">
          <Sidebar role={currentRole} />
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 min-h-screen">
        {/* Header */}
        {showHeader && <Header />}

        {/* Page Content */}
        <div className="pb-16 lg:pb-0">
          {children}
        </div>
      </main>

      {/* Mobile Navigation - только на мобильных */}
      <div className="lg:hidden">
        <MobileNav />
      </div>
    </div>
  );
}
