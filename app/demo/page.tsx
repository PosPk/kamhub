'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageLayout } from '@/components/PageLayout';
import { GlassCard } from '@/components/GlassCard';
import { User, Building2, Car, MapPin, ArrowRight, Info, LogOut } from 'lucide-react';

export default function DemoPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [demoUser, setDemoUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Создаем демо-пользователя
    const demoUserData = {
      id: 'demo_user_123',
      name: 'Демо Пользователь',
      email: 'demo@kamchatour.ru',
      role: 'tourist',
      avatar: '/api/placeholder/64/64',
      isDemo: true
    };

    // Сохраняем в localStorage для демо-режима
    localStorage.setItem('demo_user', JSON.stringify(demoUserData));
    localStorage.setItem('demo_mode', 'true');
    
    setDemoUser(demoUserData);
    setIsLoading(false);
  }, []);

  if (!mounted) {
    return null;
  }

  const hours = new Date().getHours();
  const isNight = hours >= 23 || hours < 5;
  const textColor = isNight ? 'text-white' : 'text-gray-800';
  const textSecondary = isNight ? 'text-white/80' : 'text-gray-600';

  const handleStartDemo = (role: string) => {
    const updatedUser = { ...demoUser, role };
    localStorage.setItem('demo_user', JSON.stringify(updatedUser));
    
    // Перенаправляем в соответствующий дашборд
    switch (role) {
      case 'tourist':
        router.push('/hub/tourist');
        break;
      case 'operator':
        router.push('/hub/operator');
        break;
      case 'transfer-operator':
        router.push('/hub/transfer-operator');
        break;
      case 'guide':
        router.push('/hub/guide');
        break;
      default:
        router.push('/hub/tourist');
    }
  };

  if (isLoading) {
    return (
      <PageLayout title="Загрузка..." backLink="/">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className={`w-16 h-16 border-4 ${isNight ? 'border-white' : 'border-blue-500'} border-t-transparent rounded-full animate-spin mx-auto mb-4`}></div>
            <p className={`${textColor} text-lg`}>Загружаем демо-режим...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  const roles = [
    {
      id: 'tourist',
      icon: User,
      title: 'Турист',
      description: 'Поиск туров, трансферов, прогноз погоды, AI-помощник',
      features: ['Поиск трансферов', 'Система лояльности', 'Бронирование'],
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'operator',
      icon: Building2,
      title: 'Туроператор',
      description: 'CRM система, управление турами, аналитика',
      features: ['Управление турами', 'Статистика', 'Бронирования'],
      gradient: 'from-emerald-500 to-teal-500'
    },
    {
      id: 'transfer-operator',
      icon: Car,
      title: 'Оператор трансферов',
      description: 'Управление водителями, заказами, аналитика',
      features: ['Управление водителями', 'Активные заказы', 'Платежи'],
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      id: 'guide',
      icon: MapPin,
      title: 'Гид',
      description: 'Расписание, группы, заработок, профиль',
      features: ['Расписание', 'Группы', 'Заработок'],
      gradient: 'from-orange-500 to-amber-500'
    }
  ];

  return (
    <PageLayout title="Демо-режим" backLink="/">
      <div className="space-y-6">
        {/* Заголовок */}
        <GlassCard className="p-6 text-center" isNight={isNight}>
          <h1 className={`text-3xl font-light ${textColor} mb-3`}>
            Kamchatour Hub
          </h1>
          <p className={`text-lg ${textSecondary}`}>
            Выберите роль для просмотра функциональности
          </p>
        </GlassCard>

        {/* Роли */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <GlassCard
                key={role.id}
                className="p-6 cursor-pointer group"
                isNight={isNight}
                onClick={() => handleStartDemo(role.id)}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${role.gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-xl font-medium ${textColor} mb-2 flex items-center justify-between`}>
                      {role.title}
                      <ArrowRight className={`w-5 h-5 ${textSecondary} group-hover:translate-x-1 transition-transform`} />
                    </h3>
                    <p className={`${textSecondary} text-sm mb-3`}>
                      {role.description}
                    </p>
                    <div className={`text-xs ${textSecondary} space-y-1`}>
                      {role.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className={`w-1 h-1 rounded-full bg-gradient-to-r ${role.gradient}`}></div>
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>

        {/* Информация о демо-режиме */}
        <GlassCard className="p-6" isNight={isNight}>
          <div className="flex items-start gap-3 mb-4">
            <Info className={`w-6 h-6 ${textColor} mt-0.5`} />
            <h3 className={`text-xl font-medium ${textColor}`}>О демо-режиме</h3>
          </div>
          <div className={`space-y-3 ${textSecondary} text-sm`}>
            <p>
              <span className={`font-medium ${textColor}`}>Данные:</span> Используются демо-данные для демонстрации функциональности
            </p>
            <p>
              <span className={`font-medium ${textColor}`}>API:</span> Работают с заглушками, реальные API ключи не требуются
            </p>
            <p>
              <span className={`font-medium ${textColor}`}>Функции:</span> Все основные функции доступны для просмотра
            </p>
            <p>
              <span className={`font-medium ${textColor}`}>Безопасность:</span> Демо-режим не влияет на реальные данные
            </p>
          </div>
        </GlassCard>

        {/* Кнопка выхода из демо */}
        <div className="text-center">
          <button 
            onClick={() => {
              localStorage.removeItem('demo_user');
              localStorage.removeItem('demo_mode');
              router.push('/');
            }}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all shadow-lg ${
              isNight
                ? 'bg-red-500/20 text-red-400 border-2 border-red-500/40 hover:bg-red-500/30'
                : 'bg-red-100/60 text-red-700 border-2 border-red-200/60 hover:bg-red-200/70'
            }`}
          >
            <LogOut className="w-4 h-4" />
            Выйти из демо-режима
          </button>
        </div>
      </div>
    </PageLayout>
  );
}
