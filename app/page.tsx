'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Tour, Partner, Weather } from '@/types';
import { TourCard } from '@/components/TourCard';
import { PartnerCard } from '@/components/PartnerCard';
import { WeatherWidget } from '@/components/WeatherWidget';
import { EcoPointsWidget } from '@/components/EcoPointsWidget';
import { AIChatWidget } from '@/components/AIChatWidget';

export default function Home() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyEcoPoints, setNearbyEcoPoints] = useState([]);

  useEffect(() => {
    fetchData();
    getUserLocation();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Загружаем туры
      const toursResponse = await fetch('/api/tours?limit=6');
      const toursData = await toursResponse.json();
      if (toursData.success) {
        setTours(toursData.data.data);
      }

      // Загружаем партнеров
      const partnersResponse = await fetch('/api/partners?limit=6');
      const partnersData = await partnersResponse.json();
      if (partnersData.success) {
        setPartners(partnersData.data.data);
      }

      // Загружаем eco-points
      const ecoPointsResponse = await fetch('/api/eco-points?limit=10');
      const ecoPointsData = await ecoPointsResponse.json();
      if (ecoPointsData.success) {
        setNearbyEcoPoints(ecoPointsData.data);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Устанавливаем координаты Петропавловска-Камчатского по умолчанию
          setUserLocation({
            lat: 53.0195,
            lng: 158.6505,
          });
        }
      );
    } else {
      // Устанавливаем координаты Петропавловска-Камчатского по умолчанию
      setUserLocation({
        lat: 53.0195,
        lng: 158.6505,
      });
    }
  };

  return (
    <AppLayout>
      <main className="min-h-screen bg-premium-black text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl mx-6 mb-8 card-premium hover-glow">
        <div className="absolute inset-0 -z-10">
          <video 
            className="w-full h-[48vh] object-cover" 
            autoPlay 
            muted 
            loop 
            playsInline 
            poster="https://images.unsplash.com/photo-1520496938500-76fd098ad75a?q=80&w=1920&auto=format&fit=crop"
          >
            <source src="https://cdn.coverr.co/videos/coverr-aurora-over-mountains-0157/1080p.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="absolute inset-0 gradient-gold-aurora animate-aurora"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
        <div className="absolute inset-0 p-8 grid content-end gap-4">
          <h1 className="font-display text-4xl sm:text-6xl font-black leading-tight text-gradient-gold">
            Экосистема туризма Камчатки
          </h1>
          <p className="max-w-2xl text-white/85">
            Туры, партнёры, CRM, бронирование, безопасность, рефералы и экология — в едином центре.
          </p>
          <div className="flex gap-2 items-center">
            <input 
              placeholder="Куда поедем? вулканы, океан, медведи…" 
              className="input-premium flex-1 h-12" 
              name="q" 
            />
            <a 
              href="/demo"
              className="button-primary h-12 px-5 flex items-center gap-2"
            >
              🚀 Демо
            </a>
          </div>
          <div className="flex gap-4 justify-center mt-4">
            <a 
              href="/auth/login"
              className="button-secondary px-6 py-2"
            >
              Войти
            </a>
            <a 
              href="/auth/login"
              className="button-primary px-6 py-2"
            >
              Регистрация
            </a>
          </div>
          <div className="text-sm text-white/70 mt-2">
            💡 <strong>Демо-режим</strong> - попробуйте все функции без регистрации
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-6 py-6 grid gap-4">
        <div className="grid gap-1 text-center">
          <div className="font-display text-3xl sm:text-5xl font-black leading-tight text-gold gold-glow">
            Камчатка.
          </div>
          <div className="font-display text-3xl sm:text-5xl font-black leading-tight text-gold gold-glow">
            экосистема путешествий.
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold">Кому это нужно</h2>
          <div className="text-white/70 text-sm">Выберите роль, чтобы продолжить</div>
        </div>
        
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
          {[
            ['Турист', '/hub/tourist', '👤'],
            ['Туроператор', '/hub/operator', '🏢'],
            ['Гид', '/hub/guide', '🗺️'],
            ['Трансфер', '/hub/transfer', '🚗'],
            ['Размещение', '/hub/stay', '🏨'],
            ['Сувениры', '/hub/souvenirs', '🛍️'],
            ['Прокат снаряжения', '/hub/gear', '⛷️'],
            ['Прокат авто', '/hub/cars', '🚙'],
          ].map(([title, href, icon]) => (
            <a 
              key={title} 
              href={href} 
              className="card-premium hover-lift p-5 group"
            >
              <div className="icon-circle mb-3 group-hover:scale-110 transition-transform">
                {icon}
              </div>
              <div className="text-lg font-extrabold text-gradient-gold mb-1">{title}</div>
              <div className="text-sm text-white/70">Персональные инструменты и витрины</div>
            </a>
          ))}
        </div>
      </section>


      {/* Tours Section */}
      <section className="px-6 py-6">
        <h2 className="text-xl font-extrabold mb-4">Популярные туры</h2>
        {loading ? (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton skeleton-card h-80"></div>
            ))}
          </div>
        ) : tours.length > 0 ? (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {tours.map((tour) => (
              <div key={tour.id} className="animate-fade-in">
                <TourCard
                  tour={tour}
                  onClick={() => {
                    console.log('Tour clicked:', tour.id);
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">🏔️</div>
            <div className="empty-state-title">Туры временно недоступны</div>
            <div className="empty-state-description">
              Скоро здесь появится множество интересных предложений
            </div>
          </div>
        )}
      </section>


      {/* Weather and Eco-points Widgets */}
      {userLocation && (
        <section className="px-6 py-6">
          <div className="grid md:grid-cols-2 gap-6">
            <WeatherWidget
              lat={userLocation.lat}
              lng={userLocation.lng}
              location="Петропавловск-Камчатский"
              className="h-80"
            />
            <EcoPointsWidget
              userId="demo-user"
              className="h-80"
            />
          </div>
        </section>
      )}

      {/* SOS and Ecology Section */}
      <section className="px-6 py-6 grid gap-4 sm:grid-cols-3">
        <div className="card-premium hover-lift p-5 grid gap-4 sm:grid-cols-2 sm:items-start">
          <div className="grid gap-4">
            <div className="text-sm text-white/70">SOS и безопасность</div>
            <div className="grid gap-3">
              <a href="#" className="button-primary w-full text-center py-3">
                🆘 SOS
              </a>
              <a href="#" className="button-secondary w-full text-center py-3">
                МЧС
              </a>
              <a href="#" className="button-secondary w-full text-center py-3">
                Сейсмика
              </a>
            </div>
            <div className="text-white/70 text-xs">
              <span className="badge badge-warning">Тестовый режим</span>
            </div>
          </div>
          <div className="w-full h-72 rounded-2xl overflow-hidden border border-white/10 bg-black grid place-items-center cursor-pointer group hover-glow">
            <div className="w-[70%] sm:w-[80%]">
              <a href="/hub/safety" target="_blank" rel="noopener noreferrer" className="group inline-block w-full max-w-[520px]">
                <div className="rounded-2xl border border-white/10 bg-black grid place-items-center map-button-glow w-full hover-scale">
                  <img src="/graphics/kamchatka-button.svg" alt="Камчатка" className="kamchatka-button w-full h-auto" />
                </div>
              </a>
            </div>
          </div>
        </div>
        
        <div className="card-premium hover-lift p-5 grid gap-2">
          <div className="text-sm text-white/70">Экология</div>
          <div className="text-2xl font-black text-gradient-gold">Eco‑points: 0</div>
          <div className="text-white/70 text-sm">Собирайте баллы за бережное поведение</div>
          <div className="progress-bar mt-4">
            <div className="progress-bar-fill" style={{ width: '0%' }}></div>
          </div>
        </div>
      </section>

      {/* AI Chat Widget */}
      <section className="px-6 py-6">
        <h2 className="text-xl font-extrabold mb-4">AI-Гид по Камчатке</h2>
        <AIChatWidget
          userId="demo-user"
          className="w-full h-96"
        />
      </section>

      {/* Quick Links Section */}
      <section className="px-6 py-8 grid gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold">Быстрые переходы</h2>
        </div>
        <div className="grid gap-3 grid-auto-fit">
          {[
            ['Каталог туров', '/partners', '📋'],
            ['Поиск', '/search', '🔍'],
            ['Витрина Commerce', '/premium', '🛒'],
            ['Витрина Adventure', '/premium2', '🏔️'],
            ['Размещение', '/hub/stay', '🏨'],
            ['Безопасность', '/hub/safety', '🛡️'],
            ['Рефералы и бусты', '/hub/operator', '💰'],
          ].map(([title, href, icon]) => (
            <a 
              key={title} 
              href={href} 
              className="card-premium hover-lift text-center font-semibold p-4 flex flex-col items-center gap-2"
            >
              <span className="text-2xl">{icon}</span>
              <span>{title}</span>
            </a>
          ))}
        </div>
      </section>
      </main>
    </AppLayout>
  );
}