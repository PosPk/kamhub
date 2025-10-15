'use client';

import React, { useState } from 'react';
import { Protected } from '@/components/Protected';

export default function TransferHub() {
  const [activeTab, setActiveTab] = useState('routes');

  return (
    <Protected roles={['transfer', 'admin']}>
      <main className="min-h-screen bg-premium-black text-white">
        {/* Header */}
        <div className="bg-white/5 border-b border-white/10 p-6">
          <h1 className="text-3xl font-black text-premium-gold">Панель трансфера</h1>
          <p className="text-white/70">Управление маршрутами и бронированиями</p>
        </div>

        {/* Tabs */}
        <div className="px-6 py-4 border-b border-white/10">
          <div className="flex space-x-4">
            {[
              { id: 'routes', label: 'Маршруты' },
              { id: 'bookings', label: 'Бронирования' },
              { id: 'vehicles', label: 'Транспорт' },
              { id: 'schedule', label: 'Расписание' }
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
          {activeTab === 'routes' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Маршруты</h2>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="text-center text-white/70 py-8">
                  <div className="text-4xl mb-2">🚗</div>
                  <p>Маршруты загружаются...</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Бронирования</h2>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="text-center text-white/70 py-8">
                  <div className="text-4xl mb-2">📋</div>
                  <p>Бронирования загружаются...</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'vehicles' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Транспорт</h2>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="text-center text-white/70 py-8">
                  <div className="text-4xl mb-2">🚐</div>
                  <p>Список транспорта загружается...</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Расписание</h2>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="text-center text-white/70 py-8">
                  <div className="text-4xl mb-2">📅</div>
                  <p>Расписание загружается...</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </Protected>
  );
}