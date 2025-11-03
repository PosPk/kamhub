/**
 * HEADER COMPONENT
 * 
 * Верхняя панель навигации
 * Содержит поиск, уведомления, профиль
 */

'use client';

import React, { useState } from 'react';
import { useRoles } from '@/contexts/RoleContext';
import Link from 'next/link';

export function Header() {
  let roles: string[] = ['traveler'];
  try {
    const rolesContext = useRoles();
    roles = rolesContext.roles;
  } catch (error) {
    console.warn('RoleContext not available in Header');
  }
  
  const [showSearch, setShowSearch] = useState(false);
  const [notifications, setNotifications] = useState(0); // TODO: получать из API

  return (
    <header className="sticky top-0 z-30 bg-premium-black/95 backdrop-blur-lg border-b border-premium-gold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Search */}
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <input
                type="text"
                placeholder="Поиск туров, трансферов..."
                className="w-full px-4 py-2 pl-10 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-premium-gold focus:border-transparent"
                onFocus={() => setShowSearch(true)}
                onBlur={() => setTimeout(() => setShowSearch(false), 200)}
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50">
                🔍
              </span>
              {showSearch && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-premium-black border border-premium-gold/20 rounded-lg p-4 shadow-xl">
                  <div className="text-white/70 text-sm mb-2">Быстрый поиск:</div>
                  <div className="space-y-2">
                    <Link href="/tours" className="block px-3 py-2 hover:bg-white/5 rounded">
                      🏔️ Туры
                    </Link>
                    <Link href="/transfers" className="block px-3 py-2 hover:bg-white/5 rounded">
                      🚌 Трансферы
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4 ml-4">
            {/* Notifications */}
            <button className="relative p-2 text-white/70 hover:text-white transition-colors">
              <span className="text-xl">🔔</span>
              {notifications > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-premium-gold text-premium-black text-xs rounded-full flex items-center justify-center font-bold">
                  {notifications > 9 ? '9+' : notifications}
                </span>
              )}
            </button>

            {/* Profile */}
            <Link
              href="/profile"
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gold-gradient flex items-center justify-center">
                <span className="text-premium-black font-bold">👤</span>
              </div>
              <span className="text-white/70 text-sm hidden sm:block">
                {roles[0] || 'traveler'}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
