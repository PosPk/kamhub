'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, User, Menu, Briefcase, MapPin } from 'lucide-react';

export function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { 
      href: '/', 
      icon: Home, 
      label: 'Главная',
      active: pathname === '/'
    },
    { 
      href: '/hub/tourist', 
      icon: Search, 
      label: 'Поиск',
      active: pathname.startsWith('/hub/tourist')
    },
    { 
      href: '/hub/operator', 
      icon: Briefcase, 
      label: 'Бизнес',
      active: pathname.startsWith('/hub/operator')
    },
    { 
      href: '/auth/login', 
      icon: User, 
      label: 'Профиль',
      active: pathname.startsWith('/auth')
    },
    { 
      href: '/hub', 
      icon: Menu, 
      label: 'Ещё',
      active: pathname === '/hub'
    }
  ];

  return (
    <>
      {/* Нижняя навигация - показывается только на мобильных (< lg) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-2xl border-t border-gray-200/50 shadow-2xl pb-safe">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.active;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all ${
                  isActive
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className={`relative ${isActive ? 'scale-110' : ''} transition-transform`}>
                  <Icon className="w-6 h-6" />
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></div>
                  )}
                </div>
                <span className={`text-xs font-light ${isActive ? 'font-medium' : ''}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Отступ для контента, чтобы не перекрывался навигацией */}
      <div className="lg:hidden h-20" />
    </>
  );
}
