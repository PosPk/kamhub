/**
 * MOBILE NAVIGATION COMPONENT
 * 
 * Нижняя навигация для мобильных устройств
 * Показывает основные разделы приложения
 */

'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const navItems = [
  { id: 'home', label: 'Главная', icon: '🏠', href: '/' },
  { id: 'tours', label: 'Туры', icon: '🏔️', href: '/tours' },
  { id: 'transfers', label: 'Трансферы', icon: '🚌', href: '/transfers' },
  { id: 'ai', label: 'AI', icon: '🤖', href: '/ai-chat' },
  { id: 'profile', label: 'Профиль', icon: '👤', href: '/profile' },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-premium-black border-t border-premium-gold/20 md:hidden z-50 safe-area-bottom">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors relative ${
                isActive ? 'text-premium-gold' : 'text-white/60'
              }`}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-premium-gold rounded-b-full" />
              )}
              
              <span className="text-2xl mb-1">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
