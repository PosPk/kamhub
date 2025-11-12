'use client';

import React from 'react';
import Link from 'next/link';

interface TopBarProps {
  time: string;
  isNight: boolean;
}

export function TopBar({ time, isNight }: TopBarProps) {
  // Динамические цвета в зависимости от времени суток - УСИЛЕН КОНТРАСТ
  const textColor = isNight ? 'text-white drop-shadow-lg' : 'text-gray-900 drop-shadow-[0_1px_4px_rgba(255,255,255,0.8)]';
  const bgGlass = isNight ? 'bg-white/30' : 'bg-gray-900/40';
  const borderColor = isNight ? 'border-white/40' : 'border-gray-900/50';
  const hoverBg = isNight ? 'hover:bg-white/40' : 'hover:bg-gray-900/50';
  
  return (
    <div className="relative z-20 w-full flex items-center justify-between px-4 py-2">
      <Link href="/" className="flex items-center gap-1.5 group">
        <div className={`w-8 h-8 rounded-lg ${bgGlass} backdrop-blur-xl border-2 ${borderColor} flex items-center justify-center ${textColor} font-bold text-sm group-hover:scale-110 transition-transform shadow-2xl`}>
          K
        </div>
        <div className={`${textColor} hidden sm:block`}>
          <div className="font-medium text-xs">Kamchatour Hub</div>
        </div>
      </Link>
      
      <div className="flex items-center gap-2">
        <div className="text-right">
          <div className={`text-lg font-light ${textColor} tracking-tight`}>
            {time}
          </div>
        </div>
        <Link
          href="/auth/login"
          className={`px-3 py-1 ${bgGlass} backdrop-blur-xl border-2 ${borderColor} rounded-full ${textColor} text-xs font-medium ${hoverBg} transition-all shadow-2xl`}
        >
          Вход
        </Link>
      </div>
    </div>
  );
}
