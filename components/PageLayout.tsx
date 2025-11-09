'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  backLink?: string;
  showHomeButton?: boolean;
}

export function PageLayout({ 
  children, 
  title, 
  backLink = '/', 
  showHomeButton = true 
}: PageLayoutProps) {
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-2xl text-gray-400">Загрузка...</div>
      </div>
    );
  }

  const hour = currentTime.getHours();
  const isNight = hour >= 21 || hour < 6;
  
  const getBackgroundGradient = () => {
    if (hour >= 6 && hour < 12) return 'from-sky-200 via-blue-100 to-cyan-50';
    if (hour >= 12 && hour < 17) return 'from-blue-300 via-sky-200 to-cyan-100';
    if (hour >= 17 && hour < 21) return 'from-indigo-400 via-purple-300 to-pink-200';
    return 'from-slate-900 via-blue-900 to-indigo-950';
  };

  const textColor = isNight ? 'text-white' : 'text-gray-800';
  const textSecondary = isNight ? 'text-gray-300' : 'text-gray-600';

  const timeString = currentTime.toLocaleTimeString('ru-RU', { 
    hour: '2-digit', 
    minute: '2-digit'
  });

  return (
    <main className="min-h-screen w-full overflow-x-hidden relative">
      <section className={`relative min-h-screen w-full bg-gradient-to-br ${getBackgroundGradient()} transition-colors duration-1000`}>
        
        {/* Top bar - минималистичный */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3 bg-white/5 backdrop-blur-md border-b border-white/10">
          {/* Левая часть - Лого + Назад */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 hover:scale-105 transition-transform">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center backdrop-blur-xl border border-white/20">
                <span className="text-white text-sm font-bold">K</span>
              </div>
            </Link>
            
            {backLink !== '/' && (
              <Link 
                href={backLink}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-xl transition-all ${textColor} text-sm font-light border border-white/20`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Назад</span>
              </Link>
            )}

            {title && (
              <h1 className={`hidden md:block text-lg font-light ${textColor}`}>{title}</h1>
            )}
          </div>

          {/* Правая часть - Время + Личный кабинет */}
          <div className="flex items-center gap-3">
            <div className={`text-lg font-light ${textColor}`}>
              {timeString}
            </div>
            <Link 
              href="/auth/login"
              className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-xl transition-all text-sm font-light border border-white/20"
              style={{ color: 'var(--ultramarine-light)' }}
            >
              Личный кабинет
            </Link>
          </div>
        </div>

        {/* Контент */}
        <div className="relative pt-16 pb-8 px-4">
          <div className="max-w-7xl mx-auto">
            {title && (
              <div className="mb-8">
                <h1 className={`text-3xl md:text-5xl font-extralight ${textColor} mb-2 md:hidden`}>
                  {title}
                </h1>
              </div>
            )}
            
            {children}
          </div>
        </div>

        {/* Home button - floating */}
        {showHomeButton && (
          <Link
            href="/"
            className="fixed bottom-6 left-6 z-50 w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110"
            style={{
              background: 'linear-gradient(135deg, var(--ultramarine) 0%, var(--ultramarine-light) 50%, var(--ultramarine-lighter) 100%)'
            }}
          >
            <Home className="w-6 h-6 text-white" />
          </Link>
        )}
      </section>
    </main>
  );
}
