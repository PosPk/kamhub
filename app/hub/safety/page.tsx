'use client';

import React, { useState } from 'react';
import { PageLayout } from '@/components/PageLayout';
import { GlassCard } from '@/components/GlassCard';
import { Shield, AlertTriangle, Phone, CloudSnow, MapPin } from 'lucide-react';

export default function SafetyHub() {
  const [activeTab, setActiveTab] = useState('sos');

  return (
    <PageLayout title="SOS и безопасность" backLink="/">
      <div className="space-y-4">
        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: 'sos', label: 'SOS', icon: AlertTriangle },
            { id: 'emergency', label: 'МЧС', icon: Shield },
            { id: 'seismic', label: 'Сейсмика', icon: AlertTriangle },
            { id: 'weather', label: 'Погода', icon: CloudSnow }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-light transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'bg-white/60 text-gray-800 hover:bg-white/80 backdrop-blur-xl border border-white/40'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {activeTab === 'sos' && (
          <GlassCard className="p-6 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
              <AlertTriangle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-light text-gray-800 mb-2">ЭКСТРЕННЫЙ ВЫЗОВ</h2>
            <p className="text-gray-600 mb-4 font-light">В случае экстренной ситуации</p>
            <button className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-light py-3 px-8 rounded-xl shadow-lg transition-all hover:scale-105">
              <span className="flex items-center justify-center gap-2">
                <Phone className="w-5 h-5" />
                ВЫЗВАТЬ SOS
              </span>
            </button>
            <div className="mt-6 grid md:grid-cols-2 gap-4">
              <div className="text-left">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Экстренные номера</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">МЧС</span><span className="font-mono text-gray-800">112</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Полиция</span><span className="font-mono text-gray-800">102</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Скорая</span><span className="font-mono text-gray-800">103</span></div>
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Ваша локация</h3>
                <div className="flex justify-center">
                  <MapPin className="w-12 h-12 text-blue-500" />
                </div>
                <p className="text-xs text-gray-600 mt-1">Координаты загружаются...</p>
              </div>
            </div>
          </GlassCard>
        )}

        {activeTab === 'emergency' && (
          <GlassCard className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-red-400 to-orange-400 flex items-center justify-center shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-light text-gray-800 mb-2">МЧС Камчатки</h2>
            <p className="text-gray-600 font-light">Информация МЧС загружается...</p>
          </GlassCard>
        )}

        {activeTab === 'seismic' && (
          <GlassCard className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-400 to-yellow-400 flex items-center justify-center shadow-lg">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-light text-gray-800 mb-2">Сейсмическая активность</h2>
            <p className="text-gray-600 font-light">Данные сейсмики загружаются...</p>
          </GlassCard>
        )}

        {activeTab === 'weather' && (
          <GlassCard className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center shadow-lg">
              <CloudSnow className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-light text-gray-800 mb-2">Погодные условия</h2>
            <p className="text-gray-600 font-light">Прогноз погоды загружается...</p>
          </GlassCard>
        )}
      </div>
    </PageLayout>
  );
}
