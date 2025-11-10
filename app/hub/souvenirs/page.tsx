'use client';

import React from 'react';
import { PageLayout } from '@/components/PageLayout';
import { GlassCard } from '@/components/GlassCard';
import { ShoppingBag, Sparkles } from 'lucide-react';

export default function SouvenirsHub() {
  return (
    <PageLayout title="Сувениры" backLink="/">
      <GlassCard className="p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center shadow-lg">
          <ShoppingBag className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-light text-gray-800 mb-2">Камчатские сувениры</h2>
        <p className="text-gray-600 mb-4 font-light">Уникальные подарки и памятные изделия</p>
        <div className="flex items-center justify-center gap-2 text-blue-600">
          <Sparkles className="w-5 h-5" />
          <span className="font-light">Каталог в разработке</span>
        </div>
      </GlassCard>
    </PageLayout>
  );
}