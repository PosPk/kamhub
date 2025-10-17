'use client';

import React, { useState } from 'react';
import { Protected } from '@/components/Protected';

export default function StayHub() {
  const [activeTab, setActiveTab] = useState('properties');

  return (
    <Protected roles={['tourist', 'admin']}>
      <main className="min-h-screen bg-premium-black text-white">
        {/* Header */}
        <div className="bg-white/5 border-b border-white/10 p-6">
          <h1 className="text-3xl font-black text-premium-gold">Размещение</h1>
          <p className="text-white/70">Найдите идеальное место для отдыха</p>
        </div>

        {/* Tabs */}
        <div className="px-6 py-4 border-b border-white/10">
          <div className="flex space-x-4">
            {[
              { id: 'properties', label: 'Объекты' },
              { id: 'bookings', label: 'Мои бронирования' },
              { id: 'favorites', label: 'Избранное' },
              { id: 'reviews', label: 'Отзывы' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl font-bold transition-colors ${
                  activeTab === tab.id
                    ? 'bg-premium-gold text-premium-black'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'properties' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Доступные объекты</h2>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="text-center text-white/70 py-8">
                  <div className="text-4xl mb-2">🏨</div>
                  <p>Объекты размещения загружаются...</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Мои бронирования</h2>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="text-center text-white/70 py-8">
                  <div className="text-4xl mb-2">📋</div>
                  <p>Бронирования загружаются...</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Избранное</h2>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="text-center text-white/70 py-8">
                  <div className="text-4xl mb-2">❤️</div>
                  <p>Избранные объекты загружаются...</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Отзывы</h2>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="text-center text-white/70 py-8">
                  <div className="text-4xl mb-2">⭐</div>
                  <p>Отзывы загружаются...</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </Protected>
  );
}