'use client';

import React from 'react';
import { PageLayout } from '@/components/PageLayout';
import { GlassCard } from '@/components/GlassCard';
import { Home, Calendar, Users, Star, Sparkles } from 'lucide-react';

export default function StayHub() {
  return (
    <PageLayout title="Размещение" backLink="/">
      <GlassCard className="p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-400 to-blue-400 flex items-center justify-center shadow-lg">
          <Home className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-light text-gray-800 mb-2">Отели и жилье</h2>
        <p className="text-gray-600 mb-4 font-light">Управление бронированиями и размещением</p>
        <div className="flex items-center justify-center gap-2 text-blue-600">
          <Sparkles className="w-5 h-5" />
          <span className="font-light">В разработке</span>
        </div>
      </GlassCard>
    </PageLayout>
  );
}
