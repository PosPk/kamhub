'use client';

import React, { useState, useEffect } from 'react';
import { PageLayout } from '@/components/PageLayout';
import { 
  Mountain, Compass, Fish, Waves, TreePine, Sun, 
  CloudSnow, Wind, Droplets, Search, Filter, Star,
  MapPin, Calendar, Users, DollarSign, TrendingUp,
  Sparkles
} from 'lucide-react';
import { Tour, Weather } from '@/types';
import { AIChatWidget } from '@/components/AIChatWidget';
import { TransferSearchWidget } from '@/components/TransferSearchWidget';

export default function TouristDashboard() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('tours');
  const [filters, setFilters] = useState({
    activity: '',
    priceRange: [0, 50000],
    difficulty: '',
  });
  const [transferResults, setTransferResults] = useState<any[]>([]);

  useEffect(() => {
    fetchTours();
    fetchWeather();
  }, []);

  const fetchTours = async () => {
    try {
      const response = await fetch('/api/tours');
      const data = await response.json();
      if (data.success) {
        setTours(data.data.tours);
      }
    } catch (error) {
      console.error('Error fetching tours:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeather = async () => {
    try {
      const response = await fetch('/api/weather?city=Petropavlovsk-Kamchatsky');
      const data = await response.json();
      if (data.success) {
        setWeather(data.weather);
      }
    } catch (error) {
      console.error('Error fetching weather:', error);
    }
  };

  const getActivityIcon = (activity: string) => {
    const iconMap: { [key: string]: any } = {
      hiking: Mountain,
      sightseeing: Compass,
      wildlife: TreePine,
      fishing: Fish,
      skiing: CloudSnow,
      diving: Waves,
    };
    const Icon = iconMap[activity] || Mountain;
    return <Icon className="w-5 h-5" />;
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors: { [key: string]: string } = {
      easy: 'from-green-400 to-emerald-500',
      medium: 'from-yellow-400 to-orange-500',
      hard: 'from-red-400 to-pink-500',
    };
    return colors[difficulty] || 'from-gray-400 to-gray-500';
  };

  const getWeatherIcon = (condition: string) => {
    const iconMap: { [key: string]: any } = {
      clear: Sun,
      mostly_clear: Sun,
      partly_cloudy: CloudSnow,
      overcast: Wind,
      rain: Droplets,
      snow: CloudSnow,
    };
    const Icon = iconMap[condition] || Sun;
    return <Icon className="w-6 h-6" />;
  };

  const filteredTours = tours.filter((tour) => {
    if (filters.activity && tour.activity !== filters.activity) return false;
    if (tour.priceFrom < filters.priceRange[0] || tour.priceFrom > filters.priceRange[1]) return false;
    if (filters.difficulty && tour.difficulty !== filters.difficulty) return false;
    return true;
  });

  return (
    <PageLayout title="Туристам" backLink="/">
      <div className="space-y-6">
        {/* Weather Widget - УСИЛЕН КОНТРАСТ */}
        {weather && (
          <div className="bg-white/70 backdrop-blur-2xl rounded-3xl p-6 border-2 border-white/50 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-medium mb-1 text-blue-700 drop-shadow-sm">
                  Петропавловск-Камчатский
                </h3>
                  <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {getWeatherIcon(weather.condition)}
                    <span className="text-4xl font-extralight">{Math.round(weather.temperature)}°</span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center gap-2">
                      <Wind className="w-4 h-4" />
                      <span>{weather.windSpeed} м/с</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Droplets className="w-4 h-4" />
                      <span>{weather.humidity}%</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Прогноз погоды</p>
                <p className="text-lg font-light">{weather.condition}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: 'tours', label: 'Туры', icon: Mountain },
            { id: 'transfers', label: 'Трансферы', icon: MapPin },
            { id: 'ai', label: 'AI Помощник', icon: Sparkles },
          ].map((tab) => {
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
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {selectedTab === 'tours' && (
          <div className="space-y-6">
            {/* Filters - УСИЛЕН КОНТРАСТ */}
            <div className="bg-white/70 backdrop-blur-2xl rounded-2xl p-4 border-2 border-white/50 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-blue-700 drop-shadow-sm" />
                <h3 className="text-lg font-medium text-gray-900">Фильтры</h3>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <select
                  value={filters.activity}
                  onChange={(e) => setFilters({ ...filters, activity: e.target.value })}
                  className="px-4 py-2 rounded-xl bg-white/70 border-2 border-white/50 backdrop-blur-xl font-medium text-gray-900 shadow-sm"
                >
                  <option value="">Все активности</option>
                  <option value="hiking">Походы</option>
                  <option value="fishing">Рыбалка</option>
                  <option value="wildlife">Дикая природа</option>
                  <option value="skiing">Лыжи</option>
                </select>
                <select
                  value={filters.difficulty}
                  onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                  className="px-4 py-2 rounded-xl bg-white/70 border-2 border-white/50 backdrop-blur-xl font-medium text-gray-900 shadow-sm"
                >
                  <option value="">Все уровни</option>
                  <option value="easy">Легкий</option>
                  <option value="medium">Средний</option>
                  <option value="hard">Сложный</option>
                </select>
                <input
                  type="number"
                  placeholder="Макс. цена"
                  onChange={(e) => setFilters({ ...filters, priceRange: [0, parseInt(e.target.value) || 50000] })}
                  className="px-4 py-2 rounded-xl bg-white/70 border-2 border-white/50 backdrop-blur-xl font-medium text-gray-900 shadow-sm placeholder:text-gray-500"
                />
              </div>
            </div>

            {/* Tours Grid */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-500"></div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTours.map((tour) => (
                  <div
                    key={tour.id}
                    className="bg-white/60 backdrop-blur-2xl rounded-2xl p-5 border border-white/40 hover:bg-white/80 transition-all shadow-lg hover:shadow-2xl hover:scale-105 group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getDifficultyColor(tour.difficulty)} flex items-center justify-center text-white shadow-lg`}>
                        {getActivityIcon(tour.activity)}
                      </div>
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-medium">{tour.rating || '5.0'}</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-light mb-2 text-gray-900">
                      {tour.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{tour.description}</p>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{tour.duration}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>До {tour.maxParticipants} человек</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-lg font-medium text-blue-600">
                          от {tour.priceFrom.toLocaleString()} ₽
                        </span>
                      </div>
                    </div>
                    <button className="mt-4 w-full py-2 rounded-xl font-light text-sm text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all hover:scale-105 shadow-lg">
                      Забронировать
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedTab === 'transfers' && (
          <div className="bg-white/60 backdrop-blur-2xl rounded-2xl p-6 border border-white/40">
            <TransferSearchWidget onSearchResults={setTransferResults} />
          </div>
        )}

        {selectedTab === 'ai' && (
          <div className="bg-white/60 backdrop-blur-2xl rounded-2xl p-6 border border-white/40">
            <AIChatWidget />
          </div>
        )}
      </div>
    </PageLayout>
  );
}
