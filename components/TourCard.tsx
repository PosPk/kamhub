'use client';

import React from 'react';
import { Tour } from '@/types';
// import { formatCurrency, formatDuration, formatRating } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface TourCardProps {
  tour: Tour;
  className?: string;
  onClick?: () => void;
}

export function TourCard({ tour, className, onClick }: TourCardProps) {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDuration = (duration: string) => {
    return duration;
  };

  const formatRating = (rating: number) => {
    return rating.toFixed(1);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'Легкий';
      case 'medium':
        return 'Средний';
      case 'hard':
        return 'Сложный';
      default:
        return difficulty;
    }
  };

  return (
    <div
      className={cn(
        'weather-card overflow-hidden cursor-pointer h-full flex flex-col',
        className
      )}
      onClick={onClick}
    >
      {/* Изображение тура */}
      <div className="relative h-48 bg-gradient-to-br from-slate-800 to-slate-900 flex-shrink-0">
        {tour.images && tour.images.length > 0 ? (
          <img
            src={tour.images[0]}
            alt={tour.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-green-100">
            <div className="text-center">
              <div className="text-4xl mb-2">🏔️</div>
              <div className="text-gray-600 text-sm font-semibold">{tour.title}</div>
            </div>
          </div>
        )}
        
        {/* Сложность */}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-400 to-cyan-400 text-white">
            {getDifficultyText(tour.difficulty)}
          </span>
        </div>
        
        {/* Рейтинг */}
        {tour.rating > 0 && (
          <div className="absolute top-3 right-3 weather-card px-3 py-1 rounded-full flex items-center space-x-1">
            <span className="text-yellow-400">⭐</span>
            <span className="text-sm font-bold">{tour.rating}</span>
            <span className="text-xs opacity-70">({tour.reviewsCount})</span>
          </div>
        )}
      </div>

      {/* Контент карточки */}
      <div className="p-6 flex-1 flex flex-col">
        {/* Название и цена */}
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-bold line-clamp-2 flex-1">
            {tour.title}
          </h3>
          <div className="text-right ml-2">
            <div className="text-xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              {formatCurrency(tour.priceFrom, 'RUB')}
            </div>
            <div className="text-sm opacity-70">за человека</div>
          </div>
        </div>

        {/* Описание */}
        <p className="opacity-70 text-sm mb-4 line-clamp-2">
          {tour.description}
        </p>

        {/* Детали тура */}
        <div className="space-y-2 mb-4 flex-1">
          {/* Продолжительность */}
          <div className="flex items-center text-sm opacity-70">
            <span className="mr-2">⏱️</span>
            <span>{tour.duration}</span>
          </div>

          {/* Размер группы */}
          <div className="flex items-center text-sm opacity-70">
            <span className="mr-2">👥</span>
            <span>
              {tour.minParticipants === tour.maxParticipants
                ? `${tour.minParticipants} чел.`
                : `${tour.minParticipants}-${tour.maxParticipants} чел.`}
            </span>
          </div>

          {/* Сезон */}
          {tour.activity && (
            <div className="flex items-center text-sm opacity-70">
              <span className="mr-2">🌿</span>
              <span>Круглый год</span>
            </div>
          )}
        </div>

        {/* Оператор */}
        {tour.operator && (
          <div className="flex items-center text-sm opacity-70 mb-4">
            <span className="mr-2">🏢</span>
            <span>{tour.operator.name}</span>
            {tour.operator.rating > 0 && (
              <span className="ml-2 text-yellow-400">
                ⭐ {formatRating(tour.operator.rating)}
              </span>
            )}
          </div>
        )}

        {/* Кнопка бронирования */}
        <button
          className="w-full bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200"
          onClick={(e) => {
            e.stopPropagation();
            // Здесь будет логика бронирования
          }}
        >
          Забронировать
        </button>
      </div>
    </div>
  );
}