/**
 * TOURS PAGE
 * Каталог туров с поиском и фильтрами
 */

'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Tour } from '@/types';
import { TourCard } from '@/components/TourCard';
import { logger } from '@/lib/logger';

export default function ToursPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    activity: '',
    difficulty: '',
    priceMax: 50000,
  });

  useEffect(() => {
    fetchTours();
  }, [filters]);

  const fetchTours = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.activity) params.append('activity', filters.activity);
      if (filters.difficulty) params.append('difficulty', filters.difficulty);
      if (filters.priceMax) params.append('maxPrice', filters.priceMax.toString());

      const response = await fetch(`/api/tours?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setTours(data.data.tours || []);
      }
    } catch (error) {
      logger.error('Error fetching tours', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white mb-2">
            Каталог <span className="text-premium-gold">Туров</span>
          </h1>
          <p className="text-white/70">
            Найдите идеальный тур для вашего путешествия по Камчатке
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white/5 rounded-2xl p-6 mb-8 border border-white/10">
          <h3 className="text-xl font-bold text-white mb-4">Фильтры</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Активность
              </label>
              <select
                value={filters.activity}
                onChange={(e) => setFilters({ ...filters, activity: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-premium-gold"
              >
                <option value="">Все активности</option>
                <option value="hiking">Пешие походы</option>
                <option value="sightseeing">Экскурсии</option>
                <option value="wildlife">Дикая природа</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Сложность
              </label>
              <select
                value={filters.difficulty}
                onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-premium-gold"
              >
                <option value="">Любая</option>
                <option value="easy">Легкая</option>
                <option value="medium">Средняя</option>
                <option value="hard">Сложная</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Цена до
              </label>
              <input
                type="number"
                value={filters.priceMax}
                onChange={(e) => setFilters({ ...filters, priceMax: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-premium-gold"
                placeholder="50000"
              />
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white/5 rounded-2xl h-80 animate-pulse" />
            ))}
          </div>
        ) : tours.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tours.map((tour) => (
              <TourCard
                key={tour.id}
                tour={tour}
                onClick={() => {
                  // Navigate to tour details
                  window.location.href = `/tours/${tour.id}`;
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏔️</div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Туры не найдены
            </h3>
            <p className="text-white/70">
              Попробуйте изменить фильтры поиска
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
