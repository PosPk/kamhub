'use client';

import React, { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  isNight?: boolean;
  onClick?: () => void;
}

export function GlassCard({ children, className = '', hover = true, isNight = false, onClick }: GlassCardProps) {
  const bgClass = isNight ? 'bg-white/10' : 'bg-white/60';
  const borderClass = isNight ? 'border-white/20' : 'border-white/40';
  const hoverClass = hover 
    ? isNight 
      ? 'hover:bg-white/20 hover:scale-[1.02]' 
      : 'hover:bg-white/80 hover:scale-[1.02]'
    : '';

  return (
    <div
      onClick={onClick}
      className={`${bgClass} backdrop-blur-xl rounded-2xl border ${borderClass} shadow-lg transition-all duration-300 ${hoverClass} ${className} ${onClick ? 'cursor-pointer' : ''}`}
    >
      {children}
    </div>
  );
}
