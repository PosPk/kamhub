'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative inline-flex items-center justify-center
        w-12 h-12 rounded-xl
        bg-gray-200 dark:bg-gray-800
        hover:bg-gray-300 dark:hover:bg-gray-700
        transition-all duration-300
        focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2
        ${className}
      `}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className="relative w-6 h-6">
        <Sun
          className={`
            absolute inset-0 w-6 h-6 text-yellow-500
            transition-all duration-300
            ${theme === 'dark' ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}
          `}
        />
        <Moon
          className={`
            absolute inset-0 w-6 h-6 text-blue-400
            transition-all duration-300
            ${theme === 'light' ? '-rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}
          `}
        />
      </div>
    </button>
  );
}

export function ThemeToggleCompact({ className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-lg
        bg-gray-200 dark:bg-gray-800
        hover:bg-gray-300 dark:hover:bg-gray-700
        text-gray-900 dark:text-gray-100
        transition-all duration-300
        focus:outline-none focus:ring-2 focus:ring-gold
        ${className}
      `}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <>
          <Moon className="w-5 h-5" />
          <span className="text-sm font-medium">Темная</span>
        </>
      ) : (
        <>
          <Sun className="w-5 h-5" />
          <span className="text-sm font-medium">Светлая</span>
        </>
      )}
    </button>
  );
}
