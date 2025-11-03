/**
 * TRANSFERS PAGE
 * Поиск и бронирование трансферов
 */

'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { TransferSearchWidget } from '@/components/TransferSearchWidget';
import { TransferOption } from '@/types/transfer';

export default function TransfersPage() {
  const [searchResults, setSearchResults] = useState<TransferOption[]>([]);

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white mb-2">
            Поиск <span className="text-premium-gold">Трансферов</span>
          </h1>
          <p className="text-white/70">
            Найдите удобный трансфер по Камчатке
          </p>
        </div>

        {/* Search Widget */}
        <div className="mb-8">
          <TransferSearchWidget
            onSearchResults={setSearchResults}
            className="w-full"
          />
        </div>

        {/* Results */}
        {searchResults.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">
              Найдено вариантов: {searchResults.length}
            </h2>
            <div className="space-y-4">
              {searchResults.map((transfer) => (
                <div
                  key={transfer.scheduleId}
                  className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-premium-gold/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        {transfer.route.name}
                      </h3>
                      <div className="flex items-center gap-4 text-white/70 text-sm">
                        <span>🚗 {transfer.vehicle.vehicleType}</span>
                        <span>👥 Мест: {transfer.availableSeats}</span>
                        <span>⭐ {transfer.driver.rating}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-premium-gold">
                        {transfer.pricePerPerson}₽
                      </div>
                      <div className="text-white/70 text-sm">за человека</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-white/70 text-sm">
                      <div>⏰ {transfer.departureTime} → {transfer.arrivalTime}</div>
                      <div>👨‍✈️ {transfer.driver.name}</div>
                    </div>
                    <button className="px-6 py-2 bg-premium-gold text-premium-black rounded-xl hover:bg-premium-gold/90 transition-colors font-bold">
                      Забронировать
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {searchResults.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🚌</div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Выполните поиск трансферов
            </h3>
            <p className="text-white/70">
              Укажите маршрут и дату для поиска доступных трансферов
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
