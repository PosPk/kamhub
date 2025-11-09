'use client';

import React from 'react';
import { X, MapPin, Calendar, Users, DollarSign, Star } from 'lucide-react';
import Link from 'next/link';

interface SearchResult {
  id?: string;
  title: string;
  description: string;
  price?: number;
  duration?: string;
  rating?: number;
  category?: string;
}

interface AISearchResultsProps {
  results: SearchResult[];
  isLoading: boolean;
  onClose: () => void;
}

export function AISearchResults({ results, isLoading, onClose }: AISearchResultsProps) {
  if (!isLoading && results.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[80vh] bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Результаты AI поиска</h3>
              <p className="text-white/80 text-xs">
                {isLoading ? 'Ищем лучшие туры...' : `Найдено ${results.length} ${results.length === 1 ? 'тур' : 'туров'}`}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 hover:bg-white/20 rounded-full flex items-center justify-center transition-all"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-orange-400/30 border-t-orange-400 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 font-light">AI анализирует ваш запрос...</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {results.map((result, index) => (
                <div 
                  key={index}
                  className="bg-white/60 backdrop-blur-xl rounded-2xl p-5 border border-white/40 hover:bg-white/80 transition-all shadow-lg hover:shadow-xl group"
                >
                  {/* Category Badge */}
                  {result.category && (
                    <div className="inline-block px-3 py-1 bg-gradient-to-r from-blue-400 to-cyan-400 text-white text-xs font-medium rounded-full mb-3">
                      {result.category}
                    </div>
                  )}

                  {/* Title */}
                  <h4 className="text-lg font-light text-gray-800 mb-2 group-hover:text-gray-900 transition-colors">
                    {result.title}
                  </h4>

                  {/* Description */}
                  <p className="text-sm text-gray-600 font-light mb-4 line-clamp-2">
                    {result.description}
                  </p>

                  {/* Meta Info */}
                  <div className="flex flex-wrap gap-3 text-xs text-gray-600 mb-4">
                    {result.duration && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{result.duration}</span>
                      </div>
                    )}
                    {result.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        <span>{result.rating}</span>
                      </div>
                    )}
                  </div>

                  {/* Price & CTA */}
                  <div className="flex items-center justify-between">
                    {result.price ? (
                      <div className="text-lg font-medium text-blue-600">
                        от {result.price.toLocaleString()} ₽
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">Цена по запросу</div>
                    )}
                    <Link
                      href={result.id ? `/hub/tourist?tour=${result.id}` : '/hub/tourist'}
                      className="px-4 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl text-xs font-medium transition-all shadow-lg"
                    >
                      Подробнее
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && results.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-gray-400" />
              </div>
              <h4 className="text-lg font-light text-gray-800 mb-2">Ничего не найдено</h4>
              <p className="text-sm text-gray-600 font-light">
                Попробуйте изменить запрос или выберите категорию
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
