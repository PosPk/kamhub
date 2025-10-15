'use client';

import React, { useState } from 'react';
import { Protected } from '@/components/Protected';

export default function GuideHub() {
  const [activeTab, setActiveTab] = useState('schedule');

  return (
    <Protected roles={['guide', 'admin']}>
      <main className="min-h-screen bg-premium-black text-white">
        {/* Header */}
        <div className="bg-white/5 border-b border-white/10 p-6">
          <h1 className="text-3xl font-black text-premium-gold">Панель гида</h1>
          <p className="text-white/70">Управление экскурсиями и расписанием</p>
        </div>

        {/* Tabs */}
        <div className="px-6 py-4 border-b border-white/10">
          <div className="flex space-x-4">
            {[
              { id: 'schedule', label: 'Расписание' },
              { id: 'tours', label: 'Мои туры' },
              { id: 'clients', label: 'Клиенты' },
              { id: 'earnings', label: 'Заработок' }
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
          {activeTab === 'schedule' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Расписание на неделю</h2>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="text-center text-white/70 py-8">
                  <div className="text-4xl mb-2">📅</div>
                  <p>Расписание загружается...</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tours' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Мои туры</h2>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="text-center text-white/70 py-8">
                  <div className="text-4xl mb-2">🏔️</div>
                  <p>Туры загружаются...</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'clients' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Клиенты</h2>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="text-center text-white/70 py-8">
                  <div className="text-4xl mb-2">👥</div>
                  <p>Список клиентов загружается...</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'earnings' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Заработок</h2>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="text-center text-white/70 py-8">
                  <div className="text-4xl mb-2">💰</div>
                  <p>Статистика заработка загружается...</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </Protected>
  );
}