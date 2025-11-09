'use client';

import React from 'react';
import Link from 'next/link';

interface TopBarProps {
  time: string;
}

export function TopBar({ time }: TopBarProps) {
  return (
    <div className="relative z-20 w-full flex items-center justify-between px-4 py-2">
      <Link href="/" className="flex items-center gap-1.5 group">
        <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform shadow-lg">
          K
        </div>
        <div className="text-white hidden sm:block">
          <div className="font-light text-xs">Kamchatour Hub</div>
        </div>
      </Link>
      
      <div className="flex items-center gap-2">
        <div className="text-right">
          <div className="text-lg font-extralight text-white tracking-tight">
            {time}
          </div>
        </div>
        <Link 
          href="/auth/login" 
          className="px-3 py-1 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full text-white text-xs font-light hover:bg-white/30 transition-all shadow-lg"
        >
          Вход
        </Link>
      </div>
    </div>
  );
}
