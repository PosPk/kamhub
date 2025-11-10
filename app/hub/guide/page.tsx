'use client';

import React from 'react';
import { PageLayout } from '@/components/PageLayout';
import { GlassCard } from '@/components/GlassCard';
import { Compass, Calendar, Users, MapPin, Star, Sparkles } from 'lucide-react';

export default function GuideDashboard() {
  const stats = [
    { icon: Calendar, label: 'Туров сегодня', value: '3', color: 'from-blue-400 to-cyan-400' },
    { icon: Users, label: 'Туристов', value: '24', color: 'from-green-400 to-emerald-400' },
    { icon: Star, label: 'Рейтинг', value: '4.9', color: 'from-orange-400 to-red-400' },
  ];

  return (
    <PageLayout title="Панель гида" backLink="/">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <GlassCard key={index} className="p-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-2 shadow-lg mx-auto`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-xl font-light text-gray-900 text-center">{stat.value}</div>
                <div className="text-xs text-gray-600 font-light text-center">{stat.label}</div>
              </GlassCard>
            );
          })}
        </div>

        {/* Main Content */}
        <GlassCard className="p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center shadow-lg">
            <Compass className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-light text-gray-800 mb-2">Расписание гида</h2>
          <p className="text-gray-600 mb-4 font-light">Управление экскурсиями и маршрутами</p>
          <div className="flex items-center justify-center gap-2 text-blue-600">
            <Sparkles className="w-5 h-5" />
            <span className="font-light">В разработке</span>
          </div>
        </GlassCard>
      </div>
    </PageLayout>
  );
}
