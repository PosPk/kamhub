'use client';

import React from 'react';
import { Protected } from '@/components/Protected';

export default function GearHub() {
  return (
    <Protected roles={['tourist', 'admin']}>
      <main className="min-h-screen bg-premium-black text-white">
        <div className="bg-white/5 border-b border-white/10 p-6">
          <h1 className="text-3xl font-black text-premium-gold">Прокат снаряжения</h1>
          <p className="text-white/70">Снаряжение для активного отдыха</p>
        </div>
        <div className="p-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
            <div className="text-4xl mb-4">🎒</div>
            <p className="text-white/70">Каталог снаряжения в разработке</p>
          </div>
        </div>
      </main>
    </Protected>
  );
}