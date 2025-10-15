'use client';

import React, { useState, useEffect } from 'react';
import { TransferOperatorDashboard as TransferOperatorDashboardType, TransferOperatorStats } from '@/types/transfer';

export default function TransferOperatorDashboard() {
  const [dashboard, setDashboard] = useState<TransferOperatorDashboardType | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await fetch('/api/transfers/operator/dashboard?operator_id=operator_1');
      const data = await response.json();
      if (data.success) {
        setDashboard(data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', name: 'Обзор', icon: '📊' },
    { id: 'bookings', name: 'Бронирования', icon: '🎫' },
    { id: 'vehicles', name: 'Транспорт', icon: '🚗' },
    { id: 'drivers', name: 'Водители', icon: '👨‍💼' },
    { id: 'routes', name: 'Маршруты', icon: '🗺️' },
    { id: 'analytics', name: 'Аналитика', icon: '📈' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-premium-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-premium-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Загружаем дашборд...</p>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="min-h-screen bg-premium-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg">Ошибка загрузки дашборда</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-premium-black">
      {/* Header */}
      <div className="bg-gradient-to-r from-premium-black to-premium-gold/10 border-b border-premium-gold/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Дашборд перевозчика</h1>
              <p className="text-white/70 mt-1">Управление трансферами и бронированиями</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-premium-gold">
                  {dashboard.stats.totalRevenue.toLocaleString()} ₽
                </div>
                <div className="text-white/70 text-sm">Общая выручка</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-premium-black/30 p-1 rounded-xl">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedTab === tab.id
                    ? 'bg-premium-gold text-premium-black'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-white">{dashboard.stats.totalVehicles}</div>
                    <div className="text-white/70">Транспорт</div>
                  </div>
                  <div className="text-3xl">🚗</div>
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-white">{dashboard.stats.totalDrivers}</div>
                    <div className="text-white/70">Водители</div>
                  </div>
                  <div className="text-3xl">👨‍💼</div>
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-white">{dashboard.stats.activeBookings}</div>
                    <div className="text-white/70">Активные заказы</div>
                  </div>
                  <div className="text-3xl">🎫</div>
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-white">{dashboard.stats.averageDriverRating.toFixed(1)}</div>
                    <div className="text-white/70">Средний рейтинг</div>
                  </div>
                  <div className="text-3xl">⭐</div>
                </div>
              </div>
            </div>

            {/* Revenue Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="text-lg font-bold text-white mb-2">Дневная выручка</div>
                <div className="text-3xl font-bold text-premium-gold">
                  {dashboard.stats.dailyRevenue.toLocaleString()} ₽
                </div>
              </div>
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="text-lg font-bold text-white mb-2">Недельная выручка</div>
                <div className="text-3xl font-bold text-premium-gold">
                  {dashboard.stats.weeklyRevenue.toLocaleString()} ₽
                </div>
              </div>
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="text-lg font-bold text-white mb-2">Месячная выручка</div>
                <div className="text-3xl font-bold text-premium-gold">
                  {dashboard.stats.monthlyRevenue.toLocaleString()} ₽
                </div>
              </div>
            </div>

            {/* Recent Bookings */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">Последние бронирования</h3>
              <div className="space-y-4">
                {dashboard.recentBookings.slice(0, 5).map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-premium-gold/20 rounded-full flex items-center justify-center">
                        <span className="text-2xl">🚗</span>
                      </div>
                      <div>
                        <div className="font-bold text-white">
                          {booking.contactPhone} • {booking.passengersCount} пассажиров
                        </div>
                        <div className="text-white/70 text-sm">
                          {booking.bookingDate} в {booking.departureTime}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-premium-gold">
                        {booking.totalPrice.toLocaleString()} ₽
                      </div>
                      <div className={`text-sm ${
                        booking.status === 'confirmed' ? 'text-green-400' :
                        booking.status === 'pending' ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {booking.status === 'confirmed' ? 'Подтверждено' :
                         booking.status === 'pending' ? 'Ожидает' :
                         'Отменено'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {selectedTab === 'bookings' && (
          <div className="space-y-6">
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">Управление бронированиями</h3>
              <div className="space-y-4">
                {dashboard.activeBookings.map((booking) => (
                  <div key={booking.id} className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="font-bold text-white">
                          Бронирование #{booking.confirmationCode}
                        </div>
                        <div className="text-white/70 text-sm">
                          {booking.contactPhone} • {booking.passengersCount} пассажиров
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-premium-gold">
                          {booking.totalPrice.toLocaleString()} ₽
                        </div>
                        <div className={`text-sm ${
                          booking.status === 'confirmed' ? 'text-green-400' :
                          booking.status === 'pending' ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          {booking.status === 'confirmed' ? 'Подтверждено' :
                           booking.status === 'pending' ? 'Ожидает' :
                           'Отменено'}
                        </div>
                      </div>
                    </div>
                    
                    {booking.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors">
                          Подтвердить
                        </button>
                        <button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">
                          Отклонить
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Vehicles Tab */}
        {selectedTab === 'vehicles' && (
          <div className="space-y-6">
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">Транспортный парк</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dashboard.vehicles.map((vehicle) => (
                  <div key={vehicle.id} className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-2xl">
                        {vehicle.vehicleType === 'economy' ? '🚗' :
                         vehicle.vehicleType === 'comfort' ? '🚙' :
                         vehicle.vehicleType === 'business' ? '🚘' :
                         vehicle.vehicleType === 'minibus' ? '🚐' : '🚌'}
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs ${
                        vehicle.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {vehicle.isActive ? 'Активен' : 'Неактивен'}
                      </div>
                    </div>
                    <div className="font-bold text-white">{vehicle.make} {vehicle.model}</div>
                    <div className="text-white/70 text-sm">{vehicle.licensePlate}</div>
                    <div className="text-white/70 text-sm">{vehicle.capacity} мест</div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {vehicle.features.map((feature) => (
                        <span key={feature} className="px-2 py-1 bg-premium-gold/20 text-premium-gold text-xs rounded">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Drivers Tab */}
        {selectedTab === 'drivers' && (
          <div className="space-y-6">
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">Водители</h3>
              <div className="space-y-4">
                {dashboard.drivers.map((driver) => (
                  <div key={driver.id} className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-premium-gold/20 rounded-full flex items-center justify-center">
                          <span className="text-2xl">👨‍💼</span>
                        </div>
                        <div>
                          <div className="font-bold text-white">{driver.name}</div>
                          <div className="text-white/70 text-sm">{driver.phone}</div>
                          <div className="text-white/70 text-sm">{driver.totalTrips} поездок</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1">
                          <span className="text-premium-gold">⭐</span>
                          <span className="font-bold text-white">{driver.rating.toFixed(1)}</span>
                        </div>
                        <div className="text-white/70 text-sm">
                          {driver.languages.join(', ')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Routes Tab */}
        {selectedTab === 'routes' && (
          <div className="space-y-6">
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">Маршруты</h3>
              <div className="space-y-4">
                {dashboard.routes.map((route) => (
                  <div key={route.id} className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white">{route.name}</div>
                        <div className="text-white/70 text-sm">
                          {route.fromLocation} → {route.toLocation}
                        </div>
                        <div className="text-white/70 text-sm">
                          {route.distanceKm} км • {route.estimatedDurationMinutes} мин
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`px-2 py-1 rounded-full text-xs ${
                          route.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {route.isActive ? 'Активен' : 'Неактивен'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {selectedTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-bold text-white mb-4">Статистика бронирований</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-white/70">Всего бронирований:</span>
                    <span className="text-white font-bold">{dashboard.stats.totalBookings}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Активные:</span>
                    <span className="text-green-400 font-bold">{dashboard.stats.activeBookings}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Ожидают подтверждения:</span>
                    <span className="text-yellow-400 font-bold">{dashboard.stats.pendingBookings}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Завершенные:</span>
                    <span className="text-blue-400 font-bold">{dashboard.stats.completedBookings}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Отмененные:</span>
                    <span className="text-red-400 font-bold">{dashboard.stats.cancelledBookings}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-bold text-white mb-4">Финансовая статистика</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-white/70">Общая выручка:</span>
                    <span className="text-premium-gold font-bold">
                      {dashboard.stats.totalRevenue.toLocaleString()} ₽
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">За месяц:</span>
                    <span className="text-premium-gold font-bold">
                      {dashboard.stats.monthlyRevenue.toLocaleString()} ₽
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">За неделю:</span>
                    <span className="text-premium-gold font-bold">
                      {dashboard.stats.weeklyRevenue.toLocaleString()} ₽
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">За день:</span>
                    <span className="text-premium-gold font-bold">
                      {dashboard.stats.dailyRevenue.toLocaleString()} ₽
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}