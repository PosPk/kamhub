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
    
    // Обновляем только при смене минуты (оптимизация)
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(prev => {
        if (now.getMinutes() !== prev.getMinutes()) {
          return now;
        }
        return prev;
      });
    };
    
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Динамическая тема для body
  useEffect(() => {
    if (typeof document === 'undefined') return;
    
    const hours = currentTime.getHours();
    const themeClasses = ['dawn', 'morning', 'afternoon', 'evening', 'late-evening', 'night'];
    document.body.classList.remove(...themeClasses);
    
    let themeClass = 'night';
    if (hours >= 5 && hours < 7) themeClass = 'dawn';
    else if (hours >= 7 && hours < 12) themeClass = 'morning';
    else if (hours >= 12 && hours < 18) themeClass = 'afternoon';
    else if (hours >= 18 && hours < 21) themeClass = 'evening';
    else if (hours >= 21 && hours < 23) themeClass = 'late-evening';
    
    document.body.classList.add(themeClass);
  }, [currentTime]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-2xl text-gray-400">Загрузка...</div>
      </div>
    );
  }

  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes().toString().padStart(2, '0');
  const hoursStr = hours.toString().padStart(2, '0');
  const timeString = `${hoursStr}:${minutes}`;
  
  // Градиенты точно как на главной странице
  const getBackgroundGradient = () => {
    if (hours >= 5 && hours < 7) return 'from-rose-200 via-orange-100 to-amber-100'; // DAWN
    if (hours >= 7 && hours < 12) return 'from-sky-100 via-blue-50 to-indigo-100'; // MORNING
    if (hours >= 12 && hours < 18) return 'from-blue-100 via-sky-50 to-cyan-100'; // AFTERNOON
    if (hours >= 18 && hours < 21) return 'from-orange-100 via-pink-100 to-purple-200'; // EVENING
    if (hours >= 21 && hours < 23) return 'from-indigo-300 via-purple-200 to-pink-200'; // LATE EVENING
    return 'from-slate-800 via-blue-900 to-indigo-900'; // NIGHT
  };

  const isNight = hours >= 23 || hours < 5;
  const textColor = isNight ? 'text-white' : 'text-gray-800';
  const textSecondary = isNight ? 'text-white/70' : 'text-gray-600';
  const bgGlass = isNight ? 'bg-white/20' : 'bg-gray-800/20';
  const borderColor = isNight ? 'border-white/30' : 'border-gray-800/30';
  const hoverBg = isNight ? 'hover:bg-white/30' : 'hover:bg-gray-800/30';

  return (
    <main className="min-h-screen w-full overflow-x-hidden relative">
      <section className={`relative min-h-screen w-full bg-gradient-to-br ${getBackgroundGradient()} transition-colors duration-1000`}>
        
        {/* Top bar - точно как на главной */}
        <div className="relative z-20 w-full flex items-center justify-between px-4 py-2">
          {/* Левая часть - Лого + Назад */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-1.5 group">
              <div className={`w-8 h-8 rounded-lg ${bgGlass} backdrop-blur-xl border ${borderColor} flex items-center justify-center ${textColor} font-bold text-sm group-hover:scale-110 transition-transform shadow-lg`}>
                K
              </div>
              <div className={`${textColor} hidden sm:block`}>
                <div className="font-light text-xs">Kamchatour Hub</div>
              </div>
            </Link>
            
            {backLink !== '/' && (
              <Link 
                href={backLink}
                className={`flex items-center gap-1.5 px-3 py-1 ${bgGlass} backdrop-blur-xl border ${borderColor} rounded-full ${textColor} text-xs font-light ${hoverBg} transition-all shadow-lg`}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Назад</span>
              </Link>
            )}

            {title && (
              <h1 className={`hidden lg:block text-base font-light ${textColor} ml-2`}>{title}</h1>
            )}
          </div>

          {/* Правая часть - Время + Личный кабинет */}
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className={`text-lg font-extralight ${textColor} tracking-tight`}>
                {timeString}
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

        {/* Контент */}
        <div className="relative pt-4 pb-20 px-4">
          <div className="max-w-7xl mx-auto">
            {title && (
              <div className="mb-6">
                <h1 className={`text-2xl md:text-4xl font-extralight ${textColor} mb-2 lg:hidden`}>
                  {title}
                </h1>
              </div>
            )}
            
            {children}
          </div>
        </div>

        {/* Home button - floating (скрыт на мобильных, т.к. есть нижняя навигация) */}
        {showHomeButton && (
          <Link
            href="/"
            className="hidden lg:flex fixed bottom-6 left-6 z-50 w-12 h-12 rounded-full shadow-2xl items-center justify-center transition-all hover:scale-110"
            style={{
              background: isNight 
                ? 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.3) 100%)'
                : 'linear-gradient(135deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.3) 100%)',
              backdropFilter: 'blur(20px)'
            }}
          >
            <Home className={`w-6 h-6 ${textColor}`} />
          </Link>
        )}
      </section>
    </main>
  );
}
