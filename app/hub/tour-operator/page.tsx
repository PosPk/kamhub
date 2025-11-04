'use client';

import { useEffect, useState } from 'react';

interface DashboardStats {
  totalTours: number;
  totalSchedules: number;
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  monthlyRevenue: number;
  weeklyRevenue: number;
  avgBookingValue: number;
  occupancyRate: number;
  statusStats: {
    pending: number;
    confirmed: number;
    cancelled: number;
  };
}

interface Tour {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  duration: number;
  price: number;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  schedulesCount: number;
  bookingsCount: number;
  revenue: number;
}

interface Schedule {
  id: string;
  startDate: string;
  departureTime: string;
  returnTime: string;
  maxParticipants: number;
  availableSlots: number;
  bookedSlots: number;
  basePrice: number;
  status: string;
  meetingPoint: string;
  tourId: string;
  tourTitle: string;
  bookingsCount: number;
  totalParticipants: number;
}

interface Booking {
  id: string;
  bookingNumber: string;
  bookingDate: string;
  tourStartDate: string;
  participantsCount: number;
  adultsCount: number;
  childrenCount: number;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  confirmationCode: string;
  tourTitle: string;
  departureTime: string;
  meetingPoint: string;
}

interface RevenueData {
  date: string;
  bookings: number;
  revenue: number;
  participants: number;
}

interface UpcomingTour {
  scheduleId: string;
  startDate: string;
  departureTime: string;
  meetingPoint: string;
  maxParticipants: number;
  availableSlots: number;
  tourId: string;
  tourTitle: string;
  duration: number;
  bookingsCount: number;
  totalParticipants: number;
  bookings: any[];
}

interface DashboardData {
  stats: DashboardStats;
  tours: Tour[];
  schedules: Schedule[];
  activeBookings: Booking[];
  revenueChart: RevenueData[];
  upcomingTours: UpcomingTour[];
}

export default function TourOperatorDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'bookings' | 'schedules' | 'tours'>('overview');
  
  // Mock operator ID (в реальном приложении из AuthContext)
  const operatorId = 'b5d82b0f-fb2c-4449-91b4-6b7f4916b7df';

  useEffect(() => {
    loadDashboard();
    // Auto-refresh каждые 30 секунд
    const interval = setInterval(loadDashboard, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadDashboard() {
    try {
      const response = await fetch(`/api/tours/operator/dashboard?operatorId=${operatorId}`);
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
        setError(null);
      } else {
        setError(result.error || 'Failed to load dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-white text-lg">Загрузка дашборда...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center bg-red-500/10 border border-red-500 rounded-lg p-8 max-w-md">
          <p className="text-red-400 text-lg mb-4">❌ Ошибка загрузки</p>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={loadDashboard}
            className="bg-gold text-black px-6 py-2 rounded-lg hover:bg-gold/80 transition"
          >
            Повторить
          </button>
        </div>
      </div>
    );
  }

  const { stats, tours, schedules, activeBookings, revenueChart, upcomingTours } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              🎒 Дашборд Туроператора
            </h1>
            <p className="text-gray-400">
              Управление турами и бронированиями
            </p>
          </div>
          <button
            onClick={loadDashboard}
            className="bg-gold/10 border border-gold text-gold px-4 py-2 rounded-lg hover:bg-gold/20 transition"
          >
            🔄 Обновить
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Revenue */}
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-xl p-6">
            <div className="flex justify-between items-start mb-2">
              <span className="text-green-400 text-sm">Общая выручка</span>
              <span className="text-2xl">💰</span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">
              {stats.totalRevenue.toLocaleString('ru-RU')} ₽
            </p>
            <p className="text-green-400 text-sm">
              За месяц: {stats.monthlyRevenue.toLocaleString('ru-RU')} ₽
            </p>
          </div>

          {/* Total Bookings */}
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-xl p-6">
            <div className="flex justify-between items-start mb-2">
              <span className="text-blue-400 text-sm">Бронирований</span>
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">
              {stats.totalBookings}
            </p>
            <p className="text-blue-400 text-sm">
              Подтверждено: {stats.confirmedBookings}
            </p>
          </div>

          {/* Tours & Schedules */}
          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-xl p-6">
            <div className="flex justify-between items-start mb-2">
              <span className="text-purple-400 text-sm">Туры</span>
              <span className="text-2xl">🎯</span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">
              {stats.totalTours}
            </p>
            <p className="text-purple-400 text-sm">
              Расписаний: {stats.totalSchedules}
            </p>
          </div>

          {/* Occupancy Rate */}
          <div className="bg-gradient-to-br from-gold/20 to-gold/10 border border-gold/30 rounded-xl p-6">
            <div className="flex justify-between items-start mb-2">
              <span className="text-gold text-sm">Заполняемость</span>
              <span className="text-2xl">📈</span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">
              {stats.occupancyRate.toFixed(1)}%
            </p>
            <p className="text-gold text-sm">
              Средний чек: {stats.avgBookingValue.toLocaleString('ru-RU')} ₽
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-700">
          {[
            { id: 'overview', label: '📊 Обзор', icon: '📊' },
            { id: 'bookings', label: '🎫 Бронирования', icon: '🎫' },
            { id: 'schedules', label: '📅 Расписание', icon: '📅' },
            { id: 'tours', label: '🎒 Туры', icon: '🎒' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`px-6 py-3 rounded-t-lg transition ${
                selectedTab === tab.id
                  ? 'bg-gold text-black font-bold'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            {/* Upcoming Tours */}
            {upcomingTours.length > 0 && (
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">
                  🚀 Предстоящие туры (сегодня/завтра)
                </h2>
                <div className="space-y-4">
                  {upcomingTours.map(tour => (
                    <div key={tour.scheduleId} className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-bold text-white mb-1">
                            {tour.tourTitle}
                          </h3>
                          <p className="text-gray-400 text-sm">
                            📅 {new Date(tour.startDate).toLocaleDateString('ru-RU')} в {tour.departureTime}
                          </p>
                          <p className="text-gray-400 text-sm">
                            📍 {tour.meetingPoint}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-gold font-bold text-lg">
                            {tour.totalParticipants}/{tour.maxParticipants}
                          </p>
                          <p className="text-gray-400 text-sm">
                            участников
                          </p>
                        </div>
                      </div>
                      {tour.bookings.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-700">
                          <p className="text-gray-400 text-sm mb-2">Бронирования:</p>
                          {tour.bookings.map((booking: any) => (
                            <div key={booking.booking_id} className="flex justify-between items-center py-1">
                              <span className="text-white text-sm">
                                {booking.contact_name} ({booking.participants_count} чел.)
                              </span>
                              <span className={`text-xs px-2 py-1 rounded ${
                                booking.check_in_status === 'checked_in' 
                                  ? 'bg-green-500/20 text-green-400'
                                  : 'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {booking.check_in_status === 'checked_in' ? '✅ Отметились' : '⏳ Ожидание'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Revenue Chart */}
            {revenueChart.length > 0 && (
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">
                  📈 Выручка за последние 30 дней
                </h2>
                <div className="h-64 flex items-end gap-2">
                  {revenueChart.map((day, idx) => {
                    const maxRevenue = Math.max(...revenueChart.map(d => d.revenue));
                    const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center">
                        <div 
                          className="w-full bg-gradient-to-t from-gold to-gold/50 rounded-t hover:from-gold/80 hover:to-gold/40 transition cursor-pointer group relative"
                          style={{ height: `${height}%`, minHeight: day.revenue > 0 ? '10px' : '0' }}
                        >
                          <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-gray-900 border border-gold rounded-lg p-2 text-xs text-white opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                            <p className="font-bold">{day.revenue.toLocaleString('ru-RU')} ₽</p>
                            <p className="text-gray-400">{day.bookings} брон.</p>
                            <p className="text-gray-400">{day.participants} чел.</p>
                          </div>
                        </div>
                        <span className="text-gray-500 text-xs mt-2">
                          {new Date(day.date).getDate()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Status Distribution */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                📊 Статистика по статусам
              </h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-4xl font-bold text-yellow-400">
                    {stats.statusStats.pending}
                  </p>
                  <p className="text-gray-400 mt-2">⏳ Ожидание</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-green-400">
                    {stats.statusStats.confirmed}
                  </p>
                  <p className="text-gray-400 mt-2">✅ Подтверждено</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-red-400">
                    {stats.statusStats.cancelled}
                  </p>
                  <p className="text-gray-400 mt-2">❌ Отменено</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'bookings' && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              🎫 Активные бронирования ({activeBookings.length})
            </h2>
            <div className="space-y-3">
              {activeBookings.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Нет активных бронирований</p>
              ) : (
                activeBookings.map(booking => (
                  <div key={booking.id} className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 hover:border-gold transition">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-white font-bold">
                          #{booking.bookingNumber}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {booking.tourTitle}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <span className={`px-3 py-1 rounded text-xs ${
                          booking.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                          booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {booking.status}
                        </span>
                        <span className={`px-3 py-1 rounded text-xs ${
                          booking.paymentStatus === 'paid' ? 'bg-green-500/20 text-green-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {booking.paymentStatus}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                      <div>
                        <p className="text-gray-500 text-xs">Дата тура</p>
                        <p className="text-white text-sm">
                          {new Date(booking.tourStartDate).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Участники</p>
                        <p className="text-white text-sm">
                          {booking.participantsCount} чел.
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Сумма</p>
                        <p className="text-gold text-sm font-bold">
                          {booking.totalPrice.toLocaleString('ru-RU')} ₽
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Контакт</p>
                        <p className="text-white text-sm">
                          {booking.contactName}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {selectedTab === 'schedules' && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              📅 Ближайшие расписания ({schedules.length})
            </h2>
            <div className="space-y-3">
              {schedules.map(schedule => (
                <div key={schedule.id} className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-white font-bold mb-1">
                        {schedule.tourTitle}
                      </h3>
                      <p className="text-gray-400 text-sm mb-2">
                        📅 {new Date(schedule.startDate).toLocaleDateString('ru-RU')} 
                        {' '}{schedule.departureTime} - {schedule.returnTime}
                      </p>
                      <p className="text-gray-400 text-sm">
                        📍 {schedule.meetingPoint}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gold mb-1">
                        {schedule.bookedSlots}/{schedule.maxParticipants}
                      </p>
                      <p className="text-gray-400 text-sm mb-2">
                        Свободно: {schedule.availableSlots}
                      </p>
                      <span className={`px-3 py-1 rounded text-xs ${
                        schedule.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400' :
                        schedule.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {schedule.status}
                      </span>
                    </div>
                  </div>
                  {schedule.bookingsCount > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <p className="text-gray-400 text-sm">
                        📊 Бронирований: {schedule.bookingsCount} 
                        {' '} | Участников: {schedule.totalParticipants}
                        {' '} | Выручка: {(schedule.basePrice * schedule.totalParticipants).toLocaleString('ru-RU')} ₽
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'tours' && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              🎒 Мои туры ({tours.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tours.map(tour => (
                <div key={tour.id} className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 hover:border-gold transition">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-white font-bold text-lg">
                      {tour.title}
                    </h3>
                    <span className={`px-2 py-1 rounded text-xs ${
                      tour.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {tour.isActive ? '✅ Активен' : '❌ Неактивен'}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                    {tour.description}
                  </p>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <p className="text-gray-500 text-xs">Цена</p>
                      <p className="text-gold font-bold">
                        {tour.price.toLocaleString('ru-RU')} ₽
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Длительность</p>
                      <p className="text-white">
                        {tour.duration} ч
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Расписаний</p>
                      <p className="text-white">
                        {tour.schedulesCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Бронирований</p>
                      <p className="text-white">
                        {tour.bookingsCount}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-700">
                    <div>
                      <p className="text-gray-500 text-xs">Рейтинг</p>
                      <p className="text-gold">
                        ⭐ {tour.rating.toFixed(1)} ({tour.reviewCount})
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500 text-xs">Выручка</p>
                      <p className="text-green-400 font-bold">
                        {tour.revenue.toLocaleString('ru-RU')} ₽
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
