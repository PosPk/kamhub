'use client';

import React, { useState, useEffect } from 'react';
import { Search, MapPin, Calendar, Users, Star, SlidersHorizontal, Heart, Share2, ChevronRight } from 'lucide-react';
import { TourCard } from '@/components/TourCard';
import type { Tour } from '@/types';

export default function Home() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    try {
      const response = await fetch('/api/tours?limit=12');
      const data = await response.json();
      if (data.success && data.data?.data) {
        setTours(data.data.data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      
      {/* Hero - Как у Airbnb */}
      <section className="relative bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          
          {/* Заголовок */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
              Найдите идеальный тур
              <br />
              <span className="text-orange-600">на Камчатке</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              500+ туров от проверенных операторов. Бронируйте онлайн за 2 минуты
            </p>
          </div>

          {/* Поисковая панель - как у Booking */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-2">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                
                {/* Локация */}
                <div className="md:col-span-4 relative">
                  <div className="flex items-center gap-3 px-4 py-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors border border-transparent hover:border-gray-300 dark:hover:border-gray-600">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">Куда</div>
                      <input 
                        type="text"
                        placeholder="Вулканы, океан, гейзеры..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-transparent border-0 outline-none text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Даты */}
                <div className="md:col-span-3 relative">
                  <div className="flex items-center gap-3 px-4 py-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors border border-transparent hover:border-gray-300 dark:hover:border-gray-600">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">Когда</div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">Любые даты</div>
                    </div>
                  </div>
                </div>

                {/* Гости */}
                <div className="md:col-span-3 relative">
                  <div className="flex items-center gap-3 px-4 py-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors border border-transparent hover:border-gray-300 dark:hover:border-gray-600">
                    <Users className="w-5 h-5 text-gray-400" />
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">Кто</div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">1 турист</div>
                    </div>
                  </div>
                </div>

                {/* Кнопка поиска */}
                <div className="md:col-span-2">
                  <button className="w-full h-full bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 px-6 py-4">
                    <Search className="w-5 h-5" />
                    <span className="hidden md:inline">Найти</span>
                  </button>
                </div>

              </div>
            </div>
          </div>

          {/* Быстрые фильтры */}
          <div className="max-w-4xl mx-auto mt-6 flex flex-wrap gap-3 justify-center">
            {['Вулканы', 'Океан', 'Медведи', 'Гейзеры', 'Рыбалка', 'Экстрим'].map((tag) => (
              <button
                key={tag}
                className="px-6 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-gray-900 dark:hover:border-white transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* Основной контент */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Фильтры и сортировка - sticky */}
        <div className="sticky top-0 z-40 bg-white dark:bg-gray-900 py-4 border-b border-gray-200 dark:border-gray-800 mb-8 -mx-4 px-4">
          <div className="flex items-center justify-between">
            
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Фильтры
              </button>
              
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-semibold text-gray-900 dark:text-white">{tours.length}</span> туров найдено
              </div>
            </div>

            <select className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-sm font-medium">
              <option>Рекомендуемые</option>
              <option>Сначала дешевые</option>
              <option>Сначала дорогие</option>
              <option>Лучшие отзывы</option>
            </select>

          </div>
        </div>

        {/* Сетка туров - как у GetYourGuide */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/3] bg-gray-200 dark:bg-gray-800 rounded-2xl mb-3" />
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : tours.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tours.map((tour) => (
              <TourCardModern key={tour.id} tour={tour} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Туры не найдены
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Попробуйте изменить параметры поиска
            </p>
          </div>
        )}

      </section>

      {/* Trust Section - как у Booking */}
      <section className="bg-gray-50 dark:bg-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-orange-600 mb-2">500+</div>
              <div className="text-gray-600 dark:text-gray-400">Туров на выбор</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-600 mb-2">50K+</div>
              <div className="text-gray-600 dark:text-gray-400">Довольных туристов</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-600 mb-2">4.9★</div>
              <div className="text-gray-600 dark:text-gray-400">Средний рейтинг</div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

// Современная карточка тура
function TourCardModern({ tour }: { tour: Tour }) {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div className="group cursor-pointer">
      {/* Изображение */}
      <div className="relative aspect-[4/3] mb-3 overflow-hidden rounded-2xl">
        <img
          src={tour.images?.[0] || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'}
          alt={tour.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Кнопки overlay */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
        >
          <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} />
        </button>

        {/* Бейдж */}
        {tour.difficulty && (
          <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur rounded-full text-xs font-semibold text-gray-900">
            {tour.difficulty}
          </div>
        )}
      </div>

      {/* Контент */}
      <div className="space-y-2">
        {/* Локация */}
        <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
          <MapPin className="w-3 h-3" />
          <span>Камчатка</span>
        </div>

        {/* Название */}
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 group-hover:text-orange-600 transition-colors">
          {tour.title}
        </h3>

        {/* Рейтинг и отзывы */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-orange-500 text-orange-500" />
            <span className="text-sm font-semibold text-gray-900 dark:text-white">4.9</span>
          </div>
          <span className="text-xs text-gray-500">(127 отзывов)</span>
        </div>

        {/* Цена */}
        <div className="flex items-baseline gap-2 pt-2">
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            {(tour.priceFrom || 15000).toLocaleString('ru-RU')} ₽
          </span>
          <span className="text-sm text-gray-500">/ человек</span>
        </div>
      </div>
    </div>
  );
}
