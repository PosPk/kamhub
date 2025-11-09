'use client';

import React from 'react';
import Link from 'next/link';

interface TopBarProps {
  time: string;
  isNight: boolean;
}

export function TopBar({ time, isNight }: TopBarProps) {
  // Динамические цвета в зависимости от времени суток
  const textColor = isNight ? 'text-white' : 'text-gray-800';
  const bgGlass = isNight ? 'bg-white/20' : 'bg-gray-800/20';
  const borderColor = isNight ? 'border-white/30' : 'border-gray-800/30';
  const hoverBg = isNight ? 'hover:bg-white/30' : 'hover:bg-gray-800/30';
  
  return (
    <div className="relative z-20 w-full flex items-center justify-between px-4 py-2">
      <Link href="/" className="flex items-center gap-1.5 group">
        <div className={`w-8 h-8 rounded-lg ${bgGlass} backdrop-blur-xl border ${borderColor} flex items-center justify-center ${textColor} font-bold text-sm group-hover:scale-110 transition-transform shadow-lg`}>
          K
        </div>
        <div className={`${textColor} hidden sm:block`}>
          <div className="font-light text-xs">Kamchatour Hub</div>
        </div>
      </Link>
      
      <div className="flex items-center gap-2">
        <div className="text-right">
          <div className={`text-lg font-extralight ${textColor} tracking-tight`}>
            {time}
          </div>
        </div>
        <Link 
          href="/auth/login" 
          className={`px-3 py-1 ${bgGlass} backdrop-blur-xl border ${borderColor} rounded-full ${textColor} text-xs font-light ${hoverBg} transition-all shadow-lg`}
        >
          Вход
        </Link>
      </div>
    </div>
  );
}
