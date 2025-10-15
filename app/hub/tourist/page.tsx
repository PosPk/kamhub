'use client';

import React, { useState, useEffect } from 'react';
import { Tour } from '@/types';
import { TourCard } from '@/components/TourCard';
import { Protected } from '@/components/Protected';

export default function TouristHub() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    try {
      const response = await fetch('/api/tours?limit=12');
      const data = await response.json();
      if (data.success) {
        setTours(data.data.data);
      }
    } catch (error) {
      console.error('Error fetching tours:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Protected roles={['traveler', 'admin']}>
      <main className="min-h-screen bg-premium-black text-white">
        {/* Header */}
        <div className="bg-white/5 border-b border-white/10 p-6">
          <h1 className="text-3xl font-black text-premium-gold">Витрина туров</h1>
          <p className="text-white/70">Выберите идеальное путешествие по Камчатке</p>
        </div>

        {/* Tours Grid */}
        <div className="p-6">
          {loading ? (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white/5 rounded-2xl h-80 animate-pulse"></div>
              ))}
            </div>
          ) : tours.length > 0 ? (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {tours.map((tour) => (
                <TourCard
                  key={tour.id}
                  tour={tour}
                  onClick={() => {
                    console.log('Tour clicked:', tour.id);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center text-white/70 py-12">
              <div className="text-4xl mb-4">🏔️</div>
              <p>Туры временно недоступны</p>
            </div>
          )}
        </div>
      </main>
    </Protected>
  );
}