'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const { theme, toggleTheme } = useTheme();

  // Не рендерим до монтирования на клиенте
  if (!mounted) {
    return (
      <div className={`w-14 h-7 rounded-full bg-gray-300 dark:bg-gray-700 ${className}`} />
    );
  }

  const buttonClass = `relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-premium-gold/50 ${
    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
  } ${className}`;
  
  const spanClass = `absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 flex items-center justify-center ${
    theme === 'dark' ? 'translate-x-7' : 'translate-x-0'
  }`;

  return (
    <button
      onClick={toggleTheme}
      className={buttonClass}
      aria-label="Toggle theme"
    >
      <span className={spanClass}>
        {theme === 'dark' ? (
          <Moon className="w-4 h-4 text-gray-700" />
        ) : (
          <Sun className="w-4 h-4 text-yellow-500" />
        )}
      </span>
    </button>
  );
}
