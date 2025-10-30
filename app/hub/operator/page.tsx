'use client';

import React, { useState, useEffect } from 'react';
import { Tour, Weather } from '@/types';

export default function OperatorDashboard() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [stats, setStats] = useState({
    totalTours: 0,
    activeBookings: 0,
    monthlyRevenue: 0,
    rating: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Загружаем туры
      const toursResponse = await fetch('/api/tours');
      const toursData = await toursResponse.json();
      if (toursData.success) {
        setTours(toursData.data.tours);
      }

      // Загружаем статистику
      const statsResponse = await fetch('/api/operator/stats');
      const statsData = await statsResponse.json();
      if (statsData.success) {
        setStats(statsData.data);
      }

      // Загружаем погоду
      const weatherResponse = await fetch('/api/weather?lat=53.0375&lng=158.6556&location=Петропавловск-Камчатский');
      const weatherData = await weatherResponse.json();
      if (weatherData.success) {
        setWeather(weatherData.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', name: 'Обзор', icon: '📊' },
    { id: 'tours', name: 'Туры', icon: '🏔️' },
    { id: 'bookings', name: 'Бронирования', icon: '📅' },
    { id: 'guides', name: 'Гиды', icon: '👨‍🏫' },
    { id: 'analytics', name: 'Аналитика', icon: '📈' },
    { id: 'weather', name: 'Погода', icon: '🌤️' },
  ];

  const mockBookings = [
    {
      id: '1',
      tourName: 'Восхождение на Авачинский вулкан',
      customerName: 'Иван Петров',
      date: '2024-01-15',
      participants: 4,
      total: 60000,
      status: 'confirmed',
    },
    {
      id: '2',
      tourName: 'Долина гейзеров',
      customerName: 'Мария Сидорова',
      date: '2024-01-16',
      participants: 2,
      total: 50000,
      status: 'pending',
    },
    {
      id: '3',
      tourName: 'Медвежье сафари',
      customerName: 'Алексей Козлов',
      date: '2024-01-17',
      participants: 6,
      total: 72000,
      status: 'confirmed',
    },
  ];

  const mockGuides = [
    {
      id: '1',
      name: 'Александр Вулканов',
      rating: 4.9,
      tours: 45,
      earnings: 125000,
      status: 'active',
    },
    {
      id: '2',
      name: 'Елена Гейзерова',
      rating: 4.8,
      tours: 32,
      earnings: 98000,
      status: 'active',
    },
    {
      id: '3',
      name: 'Михаил Медведев',
      rating: 4.7,
      tours: 28,
      earnings: 87000,
      status: 'on_leave',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-premium-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-premium-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Загружаем данные...</p>
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
              <h1 className="text-3xl font-bold text-white">Панель оператора</h1>
              <p className="text-white/70 mt-1">Управление турами и аналитика</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-white text-sm">Уровень оператора</div>
                <div className="text-premium-gold text-lg font-bold">L2 - Партнерский</div>
              </div>
              {weather && (
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">🌤️</span>
                    <span className="text-white text-lg font-bold">{weather.temperature}°C</span>
                  </div>
                  <p className="text-white/70 text-sm">{weather.location}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex space-x-1 bg-white/5 rounded-xl p-1 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-colors ${
                selectedTab === tab.id
                  ? 'bg-premium-gold text-premium-black'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="font-medium">{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">Всего туров</p>
                    <p className="text-3xl font-bold text-white">{stats.totalTours}</p>
                  </div>
                  <div className="text-3xl">🏔️</div>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">Активные бронирования</p>
                    <p className="text-3xl font-bold text-white">{stats.activeBookings}</p>
                  </div>
                  <div className="text-3xl">📅</div>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">Доход за месяц</p>
                    <p className="text-3xl font-bold text-white">{stats.monthlyRevenue.toLocaleString()}₽</p>
                  </div>
                  <div className="text-3xl">💰</div>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">Рейтинг</p>
                    <p className="text-3xl font-bold text-white">{stats.rating}</p>
                  </div>
                  <div className="text-3xl">⭐</div>
                </div>
              </div>
            </div>

            {/* Recent Bookings */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-6">Последние бронирования</h3>
              <div className="space-y-4">
                {mockBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div className="flex-1">
                      <h4 className="text-white font-bold">{booking.tourName}</h4>
                      <p className="text-white/70 text-sm">{booking.customerName} • {booking.participants} чел. • {booking.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-premium-gold font-bold text-lg">{booking.total.toLocaleString()}₽</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        booking.status === 'confirmed' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {booking.status === 'confirmed' ? 'Подтверждено' : 'Ожидает'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weather Alert */}
            {weather && weather.safetyLevel !== 'excellent' && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-6">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">⚠️</div>
                  <div>
                    <h3 className="text-lg font-bold text-yellow-400">Погодное предупреждение</h3>
                    <p className="text-white/70">
                      Текущие погодные условия: {weather.safetyLevel === 'good' ? 'Хорошие' : 
                      weather.safetyLevel === 'difficult' ? 'Сложные' : 'Опасные'}
                    </p>
                    <div className="mt-2">
                      {weather.recommendations?.map((rec, index) => (
                        <p key={index} className="text-white/70 text-sm">• {rec}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tours Tab */}
        {selectedTab === 'tours' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white">Управление турами</h3>
              <button className="px-6 py-3 bg-premium-gold text-premium-black rounded-xl hover:bg-premium-gold/90 transition-colors font-bold">
                + Создать тур
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tours.map((tour) => (
                <div key={tour.id} className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="text-lg font-bold text-white">{tour.title}</h4>
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold">
                      Активен
                    </span>
                  </div>
                  
                  <p className="text-white/70 text-sm mb-4 line-clamp-2">{tour.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/70">Цена:</span>
                      <span className="text-premium-gold font-bold">{tour.priceFrom.toLocaleString()}₽</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/70">Рейтинг:</span>
                      <span className="text-white">{tour.rating} ⭐</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/70">Бронирования:</span>
                      <span className="text-white">{tour.reviewsCount}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button className="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm">
                      Редактировать
                    </button>
                    <button className="flex-1 px-4 py-2 bg-premium-gold text-premium-black rounded-lg hover:bg-premium-gold/90 transition-colors text-sm font-bold">
                      Слоты
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {selectedTab === 'bookings' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white">Управление бронированиями</h3>
            
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-white/70">Тур</th>
                      <th className="text-left py-3 px-4 text-white/70">Клиент</th>
                      <th className="text-left py-3 px-4 text-white/70">Дата</th>
                      <th className="text-left py-3 px-4 text-white/70">Участники</th>
                      <th className="text-left py-3 px-4 text-white/70">Сумма</th>
                      <th className="text-left py-3 px-4 text-white/70">Статус</th>
                      <th className="text-left py-3 px-4 text-white/70">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockBookings.map((booking) => (
                      <tr key={booking.id} className="border-b border-white/5">
                        <td className="py-3 px-4 text-white">{booking.tourName}</td>
                        <td className="py-3 px-4 text-white/70">{booking.customerName}</td>
                        <td className="py-3 px-4 text-white/70">{booking.date}</td>
                        <td className="py-3 px-4 text-white/70">{booking.participants}</td>
                        <td className="py-3 px-4 text-premium-gold font-bold">{booking.total.toLocaleString()}₽</td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            booking.status === 'confirmed' 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {booking.status === 'confirmed' ? 'Подтверждено' : 'Ожидает'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button className="text-premium-gold hover:text-premium-gold/80 text-sm">
                            Подробнее
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Guides Tab */}
        {selectedTab === 'guides' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white">Управление гидами</h3>
              <button className="px-6 py-3 bg-premium-gold text-premium-black rounded-xl hover:bg-premium-gold/90 transition-colors font-bold">
                + Добавить гида
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockGuides.map((guide) => (
                <div key={guide.id} className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="text-lg font-bold text-white">{guide.name}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      guide.status === 'active' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {guide.status === 'active' ? 'Активен' : 'В отпуске'}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/70">Рейтинг:</span>
                      <span className="text-white">{guide.rating} ⭐</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/70">Туров:</span>
                      <span className="text-white">{guide.tours}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/70">Заработок:</span>
                      <span className="text-premium-gold font-bold">{guide.earnings.toLocaleString()}₽</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button className="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm">
                      Профиль
                    </button>
                    <button className="flex-1 px-4 py-2 bg-premium-gold text-premium-black rounded-lg hover:bg-premium-gold/90 transition-colors text-sm font-bold">
                      Расписание
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {selectedTab === 'analytics' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white">Аналитика и отчеты</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h4 className="text-lg font-bold text-white mb-4">Доходы по месяцам</h4>
                <div className="space-y-3">
                  {['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь'].map((month, index) => (
                    <div key={month} className="flex items-center justify-between">
                      <span className="text-white/70">{month}</span>
                      <div className="flex items-center space-x-3">
                        <div className="w-32 bg-white/10 rounded-full h-2">
                          <div 
                            className="bg-premium-gold h-2 rounded-full" 
                            style={{ width: `${Math.random() * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-premium-gold font-bold w-20 text-right">
                          {Math.floor(Math.random() * 200000 + 50000).toLocaleString()}₽
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h4 className="text-lg font-bold text-white mb-4">Популярные туры</h4>
                <div className="space-y-3">
                  {tours.slice(0, 5).map((tour, index) => (
                    <div key={tour.id} className="flex items-center justify-between">
                      <span className="text-white/70 truncate">{tour.title}</span>
                      <div className="flex items-center space-x-3">
                        <div className="w-24 bg-white/10 rounded-full h-2">
                          <div 
                            className="bg-premium-gold h-2 rounded-full" 
                            style={{ width: `${(tour.rating / 5) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-premium-gold font-bold w-12 text-right">
                          {tour.reviewsCount}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Weather Tab */}
        {selectedTab === 'weather' && weather && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white">Погодные условия</h3>
            
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-4xl mb-2">🌤️</div>
                  <div className="text-3xl font-bold text-white">{weather.temperature}°C</div>
                  <div className="text-white/70 capitalize">{weather.condition}</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl mb-2">💨</div>
                  <div className="text-xl font-bold text-white">{weather.windSpeed} км/ч</div>
                  <div className="text-white/70">Ветер</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl mb-2">💧</div>
                  <div className="text-xl font-bold text-white">{weather.humidity}%</div>
                  <div className="text-white/70">Влажность</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl mb-2">👁️</div>
                  <div className="text-xl font-bold text-white">{weather.visibility} км</div>
                  <div className="text-white/70">Видимость</div>
                </div>
              </div>
              
              <div className="border-t border-white/10 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold text-white">Рекомендации для туров</h4>
                  <span className={`text-lg font-bold ${
                    weather.safetyLevel === 'excellent' ? 'text-green-400' :
                    weather.safetyLevel === 'good' ? 'text-blue-400' :
                    weather.safetyLevel === 'difficult' ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {weather.safetyLevel === 'excellent' && 'Отличные условия'}
                    {weather.safetyLevel === 'good' && 'Хорошие условия'}
                    {weather.safetyLevel === 'difficult' && 'Сложные условия'}
                    {weather.safetyLevel === 'dangerous' && 'Опасные условия'}
                  </span>
                </div>
                
                <div className="space-y-2">
                  {weather.recommendations?.map((rec, index) => (
                    <div key={index} className="text-white/70 text-sm">
                      {rec}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}