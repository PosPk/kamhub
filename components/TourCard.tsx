'use client';

import React from 'react';
import { Tour } from '@/types';
import { formatCurrency, formatDuration, formatRating } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface TourCardProps {
  tour: Tour;
  className?: string;
  onClick?: () => void;
}

export function TourCard({ tour, className, onClick }: TourCardProps) {
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
        'bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {/* Изображение тура */}
      <div className="relative h-48 bg-gray-200">
        {tour.images && tour.images.length > 0 ? (
          <img
            src={tour.images[0].url}
            alt={tour.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-green-100">
            <div className="text-center">
              <div className="text-4xl mb-2">🏔️</div>
              <div className="text-gray-600 text-sm">Камчатка</div>
            </div>
          </div>
        )}
        
        {/* Сложность */}
        <div className="absolute top-3 left-3">
          <span
            className={cn(
              'px-2 py-1 rounded-full text-xs font-medium',
              getDifficultyColor(tour.difficulty)
            )}
          >
            {getDifficultyText(tour.difficulty)}
          </span>
        </div>
        
        {/* Рейтинг */}
        {tour.rating > 0 && (
          <div className="absolute top-3 right-3 bg-white bg-opacity-90 px-2 py-1 rounded-full flex items-center space-x-1">
            <span className="text-yellow-500">⭐</span>
            <span className="text-sm font-medium">{formatRating(tour.rating)}</span>
            <span className="text-xs text-gray-500">({tour.reviewCount})</span>
          </div>
        )}
      </div>

      {/* Контент карточки */}
      <div className="p-4">
        {/* Название и цена */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {tour.name}
          </h3>
          <div className="text-right ml-2">
            <div className="text-xl font-bold text-gray-900">
              {formatCurrency(tour.price, tour.currency)}
            </div>
            <div className="text-sm text-gray-500">за человека</div>
          </div>
        </div>

        {/* Описание */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {tour.shortDescription || tour.description}
        </p>

        {/* Детали тура */}
        <div className="space-y-2 mb-4">
          {/* Продолжительность */}
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">⏱️</span>
            <span>{formatDuration(tour.duration)}</span>
          </div>

          {/* Размер группы */}
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">👥</span>
            <span>
              {tour.minGroupSize === tour.maxGroupSize
                ? `${tour.minGroupSize} чел.`
                : `${tour.minGroupSize}-${tour.maxGroupSize} чел.`}
            </span>
          </div>

          {/* Сезон */}
          {tour.season && tour.season.length > 0 && (
            <div className="flex items-center text-sm text-gray-600">
              <span className="mr-2">🌿</span>
              <span>
                {tour.season
                  .map(s => {
                    switch (s) {
                      case 'spring': return 'Весна';
                      case 'summer': return 'Лето';
                      case 'autumn': return 'Осень';
                      case 'winter': return 'Зима';
                      default: return s;
                    }
                  })
                  .join(', ')}
              </span>
            </div>
          )}
        </div>

        {/* Оператор */}
        {tour.operator && (
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <span className="mr-2">🏢</span>
            <span>{tour.operator.name}</span>
            {tour.operator.rating > 0 && (
              <span className="ml-2 text-yellow-500">
                ⭐ {formatRating(tour.operator.rating)}
              </span>
            )}
          </div>
        )}

        {/* Кнопка бронирования */}
        <button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
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