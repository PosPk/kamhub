'use client';

import React from 'react';
import { Protected } from '@/components/Protected';

export default function SouvenirsHub() {
  return (
    <Protected roles={['traveler', 'admin']}>
      <main className="min-h-screen bg-premium-black text-white">
        <div className="bg-white/5 border-b border-white/10 p-6">
          <h1 className="text-3xl font-black text-premium-gold">Сувениры</h1>
          <p className="text-white/70">Камчатские сувениры и подарки</p>
        </div>
        <div className="p-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
            <div className="text-4xl mb-4">🎁</div>
            <p className="text-white/70">Каталог сувениров в разработке</p>
          </div>
        </div>
      </main>
    </Protected>
  );
}