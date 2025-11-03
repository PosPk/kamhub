/**
 * SIDEBAR NAVIGATION COMPONENT
 * 
 * Боковая навигация для приложения
 * Показывает разные пункты меню в зависимости от роли пользователя
 */

'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useRoles, AppRole } from '@/contexts/RoleContext';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  badge?: number;
  children?: NavItem[];
}

const getNavigationForRole = (role: AppRole): NavItem[] => {
  const base: NavItem[] = [
    {
      id: 'home',
      label: 'Главная',
      icon: '🏠',
      href: '/',
    },
    {
      id: 'tours',
      label: 'Туры',
      icon: '🏔️',
      href: '/tours',
      children: [
        { id: 'tours-catalog', label: 'Каталог', href: '/tours', icon: '📋' },
        { id: 'tours-bookings', label: 'Мои бронирования', href: '/tours/bookings', icon: '📅' },
        { id: 'tours-favorites', label: 'Избранное', href: '/tours/favorites', icon: '❤️' },
      ],
    },
    {
      id: 'transfers',
      label: 'Трансферы',
      icon: '🚌',
      href: '/transfers',
      children: [
        { id: 'transfers-search', label: 'Поиск', href: '/transfers', icon: '🔍' },
        { id: 'transfers-orders', label: 'Мои заказы', href: '/transfers/orders', icon: '🎫' },
        { id: 'transfers-history', label: 'История', href: '/transfers/history', icon: '📜' },
      ],
    },
    {
      id: 'ai',
      label: 'AI-помощник',
      icon: '🤖',
      href: '/ai-chat',
    },
    {
      id: 'weather',
      label: 'Погода',
      icon: '🌤️',
      href: '/weather',
    },
  ];

  if (role === 'operator') {
    return [
      ...base,
      {
        id: 'operator',
        label: 'CRM',
        icon: '📊',
        href: '/operator',
        children: [
          { id: 'operator-dashboard', label: 'Дашборд', href: '/operator/dashboard', icon: '📈' },
          { id: 'operator-tours', label: 'Туры', href: '/operator/tours', icon: '🏔️' },
          { id: 'operator-bookings', label: 'Бронирования', href: '/operator/bookings', icon: '📅' },
          { id: 'operator-analytics', label: 'Аналитика', href: '/operator/analytics', icon: '📊' },
        ],
      },
    ];
  }

  if (role === 'transfer') {
    return [
      ...base,
      {
        id: 'transfer-operator',
        label: 'Трансферы',
        icon: '🚗',
        href: '/operator/transfer',
        children: [
          { id: 'transfer-dashboard', label: 'Дашборд', href: '/operator/transfer', icon: '📊' },
          { id: 'transfer-drivers', label: 'Водители', href: '/operator/transfer/drivers', icon: '👨‍✈️' },
          { id: 'transfer-vehicles', label: 'Транспорт', href: '/operator/transfer/vehicles', icon: '🚐' },
          { id: 'transfer-schedule', label: 'Расписание', href: '/operator/transfer/schedule', icon: '📅' },
        ],
      },
    ];
  }

  return base;
};

export function Sidebar({ role }: { role: AppRole }) {
  let pathname = '/';
  try {
    pathname = usePathname();
  } catch (error) {
    if (typeof window !== 'undefined') {
      pathname = window.location.pathname;
    }
  }
  
  const navigation = getNavigationForRole(role);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-premium-black border-r border-premium-gold/20 z-40">
      {/* Logo */}
      <div className="p-4 border-b border-premium-gold/20">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-gold-gradient flex items-center justify-center">
            <span className="text-premium-black font-bold text-lg">🏔️</span>
          </div>
          <span className="font-bold text-premium-gold text-lg">Kamchatour</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-80px)] custom-scrollbar">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const isExpanded = expandedItems.includes(item.id);
          const hasActiveChild = item.children?.some(
            (child) => pathname === child.href
          );

          if (item.children) {
            return (
              <div key={item.id}>
                <button
                  onClick={() => toggleExpand(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
                    isActive || hasActiveChild
                      ? 'bg-premium-gold/20 text-premium-gold'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <span
                    className={`text-xs transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  >
                    ▼
                  </span>
                </button>
                {isExpanded && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.children.map((child) => {
                      const isChildActive = pathname === child.href;
                      return (
                        <Link
                          key={child.id}
                          href={child.href}
                          className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                            isChildActive
                              ? 'text-premium-gold bg-premium-gold/10'
                              : 'text-white/60 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <span className="mr-2">{child.icon}</span>
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? 'bg-premium-gold/20 text-premium-gold'
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
              {item.badge && (
                <span className="ml-auto px-2 py-0.5 bg-premium-gold text-premium-black text-xs rounded-full font-bold">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
