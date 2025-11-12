'use client';

import React, { useState } from 'react';
import { PageLayout } from '@/components/PageLayout';
import { GlassCard } from '@/components/GlassCard';
import { 
  BarChart3, Calendar, Users, TrendingUp, 
  DollarSign, Star, Briefcase, MapPin,
  CheckCircle, Clock, AlertCircle, Sparkles
} from 'lucide-react';

export default function OperatorDashboard() {
  const [selectedTab, setSelectedTab] = useState('overview');

  const tabs = [
    { id: 'overview', name: 'Обзор', icon: BarChart3 },
    { id: 'tours', name: 'Туры', icon: MapPin },
    { id: 'bookings', name: 'Бронирования', icon: Calendar },
    { id: 'guides', name: 'Гиды', icon: Users },
  ];

  const stats = [
    { icon: MapPin, label: 'Туров', value: '24', color: 'from-blue-400 to-cyan-400' },
    { icon: Calendar, label: 'Бронирований', value: '156', color: 'from-green-400 to-emerald-400' },
    { icon: DollarSign, label: 'Выручка', value: '₽850K', color: 'from-purple-400 to-pink-400' },
    { icon: Star, label: 'Рейтинг', value: '4.9', color: 'from-orange-400 to-red-400' },
  ];

  const recentBookings = [
    { id: 1, tour: 'Авачинский вулкан', client: 'Иван П.', status: 'confirmed', amount: '₽15,000' },
    { id: 2, tour: 'Долина гейзеров', client: 'Мария С.', status: 'pending', amount: '₽25,000' },
    { id: 3, tour: 'Медвежье сафари', client: 'Алексей К.', status: 'confirmed', amount: '₽18,000' },
  ];

  const guides = [
    { id: 1, name: 'Александр Вулканов', rating: 4.9, tours: 45, status: 'active' },
    { id: 2, name: 'Елена Гейзерова', rating: 4.8, tours: 32, status: 'active' },
    { id: 3, name: 'Михаил Медведев', rating: 4.7, tours: 28, status: 'on_leave' },
  ];

  return (
    <PageLayout title="Панель оператора" backLink="/">
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-light transition-all whitespace-nowrap ${
                  selectedTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'bg-white/60 text-gray-800 hover:bg-white/80 backdrop-blur-xl border border-white/40'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <GlassCard key={index} className="p-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-2xl font-light text-gray-900 mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-600 font-light">{stat.label}</div>
                  </GlassCard>
                );
              })}
            </div>

            {/* Recent Bookings */}
            <GlassCard className="p-6">
              <h3 className="text-xl font-light text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Последние бронирования
              </h3>
              <div className="space-y-3">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 rounded-xl bg-white/40 hover:bg-white/60 transition-all">
                    <div className="flex items-center gap-3">
                      {booking.status === 'confirmed' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <Clock className="w-5 h-5 text-orange-600" />
                      )}
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{booking.tour}</div>
                        <div className="text-xs text-gray-600">{booking.client}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900 text-sm">{booking.amount}</div>
                      <div className={`text-xs ${booking.status === 'confirmed' ? 'text-green-600' : 'text-orange-600'}`}>
                        {booking.status === 'confirmed' ? 'Подтверждено' : 'Ожидает'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        )}

        {/* Tours Tab */}
        {selectedTab === 'tours' && (
          <GlassCard className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center shadow-lg">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-light text-gray-800 mb-2">Управление турами</h3>
            <p className="text-gray-600 font-light mb-4">Полный список ваших туров</p>
            <div className="flex items-center justify-center gap-2 text-blue-600">
              <Sparkles className="w-5 h-5" />
              <span className="font-light">В разработке</span>
            </div>
          </GlassCard>
        )}

        {/* Bookings Tab */}
        {selectedTab === 'bookings' && (
          <GlassCard className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center shadow-lg">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-light text-gray-800 mb-2">Бронирования</h3>
            <p className="text-gray-600 font-light mb-4">Управление заказами клиентов</p>
            <div className="flex items-center justify-center gap-2 text-blue-600">
              <Sparkles className="w-5 h-5" />
              <span className="font-light">В разработке</span>
            </div>
          </GlassCard>
        )}

        {/* Guides Tab */}
        {selectedTab === 'guides' && (
          <GlassCard className="p-6">
            <h3 className="text-xl font-light text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Гиды
            </h3>
            <div className="space-y-3">
              {guides.map((guide) => (
                <div key={guide.id} className="flex items-center justify-between p-4 rounded-xl bg-white/40 hover:bg-white/60 transition-all">
                  <div>
                    <div className="font-medium text-gray-900">{guide.name}</div>
                    <div className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                      <Star className="w-4 h-4 text-orange-400 fill-orange-400" />
                      {guide.rating} • {guide.tours} туров
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-light ${
                    guide.status === 'active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {guide.status === 'active' ? 'Активен' : 'Отдых'}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        )}
      </div>
    </PageLayout>
  );
}
