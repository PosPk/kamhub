'use client';

import React, { useState, useEffect } from 'react';
import { Protected } from '@/components/Protected';
import { OperatorNav } from '@/components/operator/OperatorNav';
import { OperatorMetricsGrid } from '@/components/operator/Dashboard/OperatorMetricsGrid';
import { RecentBookingsTable } from '@/components/operator/Dashboard/RecentBookingsTable';
import { TopToursTable } from '@/components/operator/Dashboard/TopToursTable';
import { SimpleChart } from '@/components/admin/Dashboard/SimpleChart';
import { LoadingSpinner, EmptyState } from '@/components/admin/shared';
import { OperatorDashboardData, OperatorBooking } from '@/types/operator';

export default function OperatorDashboard() {
  const [data, setData] = useState<OperatorDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('30');
  const [selectedBooking, setSelectedBooking] = useState<OperatorBooking | null>(null);

  // TODO: Получить реальный ID оператора из сессии
  const operatorId = 'mock-operator-id';

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/operator/dashboard?operatorId=${operatorId}&period=${period}`
      );
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch data');
      }

      setData(result.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewBookingDetails = (booking: OperatorBooking) => {
    setSelectedBooking(booking);
    // TODO: Открыть модальное окно с деталями
    console.log('Viewing booking details:', booking);
  };

  return (
    <Protected roles={['operator', 'admin']}>
      <main className="min-h-screen bg-premium-black text-white">
        <OperatorNav />

        {/* Header */}
        <div className="bg-white/5 border-b border-white/10 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black text-premium-gold">
                  Панель оператора
                </h1>
                <p className="text-white/70 mt-1">
                  Управление турами, бронированиями и аналитика
                </p>
              </div>

              {/* Period Selector */}
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-premium-gold transition-colors"
              >
                <option value="7">Последние 7 дней</option>
                <option value="30">Последние 30 дней</option>
                <option value="90">Последние 90 дней</option>
                <option value="365">Последний год</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <LoadingSpinner size="lg" message="Загрузка данных..." />
            </div>
          ) : error ? (
            <EmptyState
              icon="⚠️"
              title="Ошибка загрузки"
              description={error}
              action={{
                label: 'Попробовать снова',
                onClick: fetchDashboardData
              }}
            />
          ) : !data ? (
            <EmptyState
              icon="📊"
              title="Нет данных"
              description="Данные не найдены"
            />
          ) : (
            <div className="space-y-8">
              {/* Metrics Grid */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Ключевые показатели
                </h2>
                <OperatorMetricsGrid metrics={data.metrics} />
              </section>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-white mb-4">
                    Выручка
                  </h2>
                  <SimpleChart
                    data={data.revenueChart}
                    type="bar"
                    color="#D4AF37"
                  />
                </section>

                {/* Bookings Chart */}
                <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-white mb-4">
                    Бронирования
                  </h2>
                  <SimpleChart
                    data={data.bookingsChart}
                    type="line"
                    color="#60A5FA"
                  />
                </section>
              </div>

              {/* Top Tours */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Топ-5 туров
                </h2>
                {data.topTours.length > 0 ? (
                  <TopToursTable tours={data.topTours} />
                ) : (
                  <EmptyState
                    icon="🏔️"
                    title="Нет туров"
                    description="Создайте свой первый тур"
                  />
                )}
              </section>

              {/* Upcoming Tours */}
              {data.upcomingTours.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">
                    Предстоящие туры
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.upcomingTours.map((tour) => (
                      <div
                        key={`${tour.tourId}-${tour.date.toString()}`}
                        className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors"
                      >
                        <h3 className="font-semibold text-white mb-2">
                          {tour.tourName}
                        </h3>
                        <p className="text-white/60 text-sm mb-3">
                          {new Date(tour.date).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-white/80">
                            <span className="text-xl mr-1">👥</span>
                            {tour.bookingsCount} / {tour.capacity}
                          </span>
                          <div className="w-20 bg-white/10 rounded-full h-2">
                            <div
                              className="bg-premium-gold h-2 rounded-full"
                              style={{
                                width: `${(tour.bookingsCount / tour.capacity) * 100}%`
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Recent Bookings */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Последние бронирования
                </h2>
                {data.recentBookings.length > 0 ? (
                  <RecentBookingsTable
                    bookings={data.recentBookings}
                    onViewDetails={handleViewBookingDetails}
                  />
                ) : (
                  <EmptyState
                    icon="📅"
                    title="Нет бронирований"
                    description="Бронирования появятся здесь"
                  />
                )}
              </section>
            </div>
          )}
        </div>
      </main>
    </Protected>
  );
}
