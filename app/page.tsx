'use client';

import React, { useState, useEffect } from 'react';
import { Search, MapPin, Calendar, Users, Star, Clock, TrendingUp, Mountain, Waves, Flame, AlertTriangle, Shield, Phone } from 'lucide-react';
import { TourCard } from '@/components/TourCard';
import type { Tour } from '@/types';

export default function Home() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [priceRange, setPriceRange] = useState([0, 200000]);

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    try {
      const response = await fetch('/api/tours?limit=9');
      const data = await response.json();
      if (data.success && data.data?.data) {
        setTours(data.data.data);
      }
    } catch (error) {
      console.error('Error fetching tours:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      
      {/* Hero Section - Travel Style */}
      <section className="relative h-[70vh] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop"
            alt="Камчатка"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
        </div>

        {/* Hero Content */}
        <div className="relative h-full flex items-center justify-center px-4">
          <div className="text-center max-w-4xl">
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 drop-shadow-2xl">
              Откройте для себя Камчатку
            </h1>
            <p className="text-xl md:text-2xl text-white/95 mb-8 drop-shadow-lg">
              Вулканы, медведи, океан — незабываемые приключения на краю света
            </p>

            {/* Search Bar */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <select className="flex-1 bg-transparent border-0 outline-none text-gray-900 dark:text-white">
                    <option>Все направления</option>
                    <option>Вулканы</option>
                    <option>Океан</option>
                    <option>Долина гейзеров</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <input 
                    type="date" 
                    className="flex-1 bg-transparent border-0 outline-none text-gray-900 dark:text-white"
                    placeholder="Даты"
                  />
                </div>

                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <Users className="w-5 h-5 text-gray-400" />
                  <select className="flex-1 bg-transparent border-0 outline-none text-gray-900 dark:text-white">
                    <option>1 человек</option>
                    <option>2 человека</option>
                    <option>3-5 человек</option>
                    <option>6+ человек</option>
                  </select>
                </div>

                <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-xl hover:from-orange-600 hover:to-red-700 transition-all flex items-center justify-center gap-2">
                  <Search className="w-5 h-5" />
                  Найти тур
                </button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-6 mt-8 text-white">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">4.9 из 5</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span className="font-semibold">5000+ туристов</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span className="font-semibold">МЧС сертификат</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Bar */}
      <section className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => setSelectedDifficulty('all')}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                selectedDifficulty === 'all' 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Все туры
            </button>
            <button 
              onClick={() => setSelectedDifficulty('easy')}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                selectedDifficulty === 'easy' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Легкие
            </button>
            <button 
              onClick={() => setSelectedDifficulty('moderate')}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                selectedDifficulty === 'moderate' 
                  ? 'bg-yellow-500 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Средние
            </button>
            <button 
              onClick={() => setSelectedDifficulty('hard')}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                selectedDifficulty === 'hard' 
                  ? 'bg-red-500 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Сложные
            </button>

            <div className="flex-1" />

            <button className="px-4 py-2 rounded-full font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Карта
            </button>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-8">
          Популярные направления
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { 
              title: 'Вулканы', 
              icon: Mountain, 
              image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600',
              count: '24 тура',
              color: 'from-orange-500 to-red-600'
            },
            { 
              title: 'Океан', 
              icon: Waves, 
              image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600',
              count: '18 туров',
              color: 'from-blue-500 to-cyan-600'
            },
            { 
              title: 'Долина гейзеров', 
              icon: Flame, 
              image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600',
              count: '12 туров',
              color: 'from-purple-500 to-pink-600'
            },
          ].map((category, index) => (
            <div 
              key={index}
              className="group relative h-80 rounded-3xl overflow-hidden cursor-pointer transition-transform hover:scale-[1.02]"
            >
              <img 
                src={category.image} 
                alt={category.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-60 group-hover:opacity-70 transition-opacity`} />
              
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <category.icon className="w-12 h-12 text-white mb-4" />
                <h3 className="text-3xl font-black text-white mb-2">
                  {category.title}
                </h3>
                <p className="text-white/90 font-medium">
                  {category.count}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tours Grid */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
              Рекомендуемые туры
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Проверенные маршруты с лучшими отзывами
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <TrendingUp className="w-4 h-4" />
            <span>Сортировать по популярности</span>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 animate-pulse">
                <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4" />
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : tours.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tours.map((tour) => (
              <TourCard
                key={tour.id}
                tour={tour}
                onClick={() => console.log('Tour clicked:', tour.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Mountain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Туры скоро появятся
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Мы работаем над добавлением маршрутов
            </p>
          </div>
        )}
      </section>

      {/* Safety Section */}
      <section className="bg-orange-50 dark:bg-orange-900/20 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <AlertTriangle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              <h2 className="text-3xl font-black text-gray-900 dark:text-white">
                Безопасность превыше всего
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6">
                <Shield className="w-8 h-8 text-green-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Сертифицированные гиды
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Все наши гиды имеют сертификаты МЧС и многолетний опыт работы на Камчатке
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6">
                <Phone className="w-8 h-8 text-blue-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  24/7 поддержка
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Круглосуточная связь с координационным центром и экстренными службами
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6">
                <Mountain className="w-8 h-8 text-purple-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Мониторинг вулканов
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Ежедневный контроль сейсмической активности и корректировка маршрутов
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6">
                <Waves className="w-8 h-8 text-cyan-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Прогноз погоды
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Актуальная информация о погоде на маршруте перед каждым выходом
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-orange-500 to-red-600 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            Готовы к приключению?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Забронируйте тур прямо сейчас и получите скидку 10% на первое путешествие
          </p>
          <button className="px-12 py-4 bg-white text-orange-600 font-bold rounded-2xl hover:bg-gray-100 transition-all text-lg shadow-2xl">
            Выбрать тур
          </button>
        </div>
      </section>
    </div>
  );
}
