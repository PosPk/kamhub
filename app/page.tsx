'use client';

import React, { useState, useEffect } from 'react';
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
    <div className="min-h-screen bg-premium-black text-white relative overflow-hidden">
      {/* Modern animated background */}
      <div className="fixed inset-0 -z-20">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0a0a0a] to-black"></div>
        <div className="absolute inset-0 gradient-gold-aurora animate-aurora opacity-30"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#e6c149] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-[#a2d2ff] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-[#e6c149] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
        </div>
      </div>

      {/* Hero Section - Modern Design */}
      <section className="relative overflow-hidden rounded-3xl mx-4 sm:mx-6 mb-12 mt-6 backdrop-blur-xl border border-white/10">
        <div className="absolute inset-0 -z-10">
          <video 
            className="w-full h-[50vh] sm:h-[60vh] object-cover" 
            autoPlay 
            muted 
            loop 
            playsInline 
            poster="https://images.unsplash.com/photo-1520496938500-76fd098ad75a?q=80&w=1920&auto=format&fit=crop"
          >
            <source src="https://cdn.coverr.co/videos/coverr-aurora-over-mountains-0157/1080p.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="absolute inset-0 gradient-gold-aurora animate-aurora opacity-40"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        
        {/* Glass morphism content */}
        <div className="relative p-6 sm:p-8 lg:p-12 grid content-end gap-6 min-h-[50vh] sm:min-h-[60vh]">
          <div className="max-w-4xl space-y-6">
            <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-black leading-tight bg-gradient-to-r from-[#e6c149] via-[#ffd700] to-[#a2d2ff] bg-clip-text text-transparent animate-fade-in">
              Экосистема туризма<br />Камчатки
            </h1>
            <p className="max-w-2xl text-lg sm:text-xl text-white/90 leading-relaxed">
              Туры, партнёры, CRM, бронирование, безопасность, рефералы и экология — в едином центре.
            </p>
            
            {/* Modern search bar */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-2xl">
              <div className="flex-1 relative flex items-center gap-2">
                <input 
                  placeholder="Куда поедем? вулканы, океан, медведи…" 
                  className="flex-1 h-14 rounded-2xl px-6 text-slate-900 bg-white/95 backdrop-blur-sm border-2 border-transparent focus:border-[#e6c149] transition-all shadow-lg hover:shadow-xl" 
                  name="q"
                  id="search-input"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const value = (e.target as HTMLInputElement).value;
                      if (value.trim()) {
                        window.location.href = `/hub/tours?search=${encodeURIComponent(value)}`;
                      }
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const input = document.getElementById('search-input') as HTMLInputElement;
                    const value = input?.value.trim();
                    if (value) {
                      window.location.href = `/hub/tours?search=${encodeURIComponent(value)}`;
                    }
                  }}
                  className="h-14 px-6 rounded-2xl font-bold bg-gradient-to-r from-[#e6c149] to-[#ffd700] text-premium-black flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(230,193,73,0.5)] transition-all hover:scale-105 whitespace-nowrap"
                  aria-label="Найти туры"
                >
                  <span>🔍</span>
                  <span>Найти</span>
                </button>
              </div>
              <a 
                href="/demo"
                className="h-14 rounded-2xl px-8 font-bold bg-gradient-to-r from-[#a2d2ff]/20 to-[#e6c149]/20 backdrop-blur-sm text-white border border-[#a2d2ff]/30 rounded-xl hover:from-[#a2d2ff]/30 hover:to-[#e6c149]/30 transition-all hover:scale-105 flex items-center justify-center gap-2"
              >
                <span>🚀</span>
                <span>Демо</span>
              </a>
            </div>
            
            {/* CTA buttons */}
            <div className="flex flex-wrap gap-3 mt-4">
              <a 
                href="/auth/login"
                className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-xl hover:bg-white/20 transition-all hover:scale-105"
              >
                Войти
              </a>
              <a 
                href="/auth/login"
                className="px-6 py-3 bg-gradient-to-r from-[#a2d2ff]/20 to-[#e6c149]/20 backdrop-blur-sm text-white border border-[#a2d2ff]/30 rounded-xl hover:from-[#a2d2ff]/30 hover:to-[#e6c149]/30 transition-all hover:scale-105"
              >
                Регистрация
              </a>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-white/70 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-lg w-fit border border-white/10">
              <span className="text-lg">💡</span>
              <span><strong>Демо-режим</strong> - попробуйте все функции без регистрации</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content - Modern Cards */}
      <section className="px-4 sm:px-6 py-8 grid gap-8">
        <div className="grid gap-2 text-center max-w-4xl mx-auto">
          <div className="font-display text-3xl sm:text-5xl lg:text-6xl font-black leading-tight bg-gradient-to-r from-[#e6c149] via-[#ffd700] to-[#a2d2ff] bg-clip-text text-transparent">
            Камчатка.
          </div>
          <div className="font-display text-3xl sm:text-5xl lg:text-6xl font-black leading-tight bg-gradient-to-r from-[#a2d2ff] via-[#e6c149] to-[#ffd700] bg-clip-text text-transparent">
            экосистема путешествий.
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            Кому это нужно
          </h2>
          <div className="text-white/70 text-sm bg-white/5 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10">
            Выберите роль, чтобы продолжить
          </div>
        </div>
        
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {[
            ['Турист', '/hub/tourist', '🏔️'],
            ['Туроператор', '/hub/operator', '🏢'],
            ['Гид', '/hub/guide', '🧭'],
            ['Трансфер', '/hub/transfer', '🚌'],
            ['Размещение', '/hub/stay', '🏨'],
            ['Сувениры', '/hub/souvenirs', '🎁'],
            ['Прокат снаряжения', '/hub/gear', '⛷️'],
            ['Прокат авто', '/hub/cars', '🚗'],
          ].map(([title, href, icon], index) => (
            <a 
              key={title} 
              href={href} 
              className="group relative rounded-2xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 p-6 hover:border-[#e6c149]/50 transition-all duration-300 hover:scale-105 hover:shadow-[0_8px_30px_rgba(230,193,73,0.2)] backdrop-blur-sm overflow-hidden"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#e6c149]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="text-3xl mb-3 transform group-hover:scale-110 transition-transform">{icon}</div>
                <div className="text-lg font-extrabold mb-2 group-hover:text-[#e6c149] transition-colors">{title}</div>
                <div className="text-sm text-white/70">Персональные инструменты и витрины</div>
              </div>
            </a>
          ))}
        </div>
      </section>


      {/* Tours Section - Modern */}
      <section className="px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            Популярные туры
          </h2>
          <a href="/hub/tours" className="text-sm text-[#e6c149] hover:text-[#ffd700] transition-colors flex items-center gap-2">
            Все туры <span>→</span>
          </a>
        </div>
        {loading ? (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gradient-to-br from-white/5 to-white/0 rounded-2xl border border-white/10 h-80 skeleton"></div>
            ))}
          </div>
        ) : tours.length > 0 ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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
          <div className="text-center text-white/70 py-16 bg-gradient-to-br from-white/5 to-white/0 rounded-2xl border border-white/10 backdrop-blur-sm">
            <div className="text-6xl mb-4">🏔️</div>
            <p className="text-lg">Туры временно недоступны</p>
            <p className="text-sm text-white/50 mt-2">Скоро здесь появятся удивительные маршруты</p>
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
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5 grid gap-4 sm:grid-cols-2 sm:items-start">
          <div className="grid gap-4">
            <div className="text-sm text-white/70">SOS и безопасность</div>
            <div className="grid gap-3">
              <a href="#" className="rounded-xl bg-premium-gold text-premium-black text-center py-3 font-bold">
                SOS
              </a>
              <a href="#" className="rounded-xl bg-white/10 text-center py-3 font-bold">
                МЧС
              </a>
              <a href="#" className="rounded-xl bg-white/10 text-center py-3 font-bold">
                Сейсмика
              </a>
            </div>
            <div className="text-white/70 text-xs">Тестовый режим: интеграции в процессе</div>
          </div>
          <div className="w-full h-72 rounded-2xl overflow-hidden border border-white/10 bg-black grid place-items-center cursor-pointer group">
            <div className="w-[70%] sm:w-[80%]">
              <a href="/hub/safety" target="_blank" rel="noopener noreferrer" className="group inline-block w-full max-w-[520px]">
                <div className="rounded-2xl border border-white/10 bg-black grid place-items-center map-button-glow w-full">
                  <img src="/graphics/kamchatka-button.svg" alt="Камчатка" className="kamchatka-button w-full h-auto" />
                </div>
              </a>
            </div>
          </div>
        </div>
        
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5 grid gap-2">
          <div className="text-sm text-white/70">Экология</div>
          <div className="text-2xl font-black text-premium-gold">Eco‑points: 0</div>
          <div className="text-white/70 text-sm">Собирайте баллы за бережное поведение</div>
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
        <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(160px,1fr))]">
          {[
            ['Каталог туров', '/partners'],
            ['Поиск', '/search'],
            ['Витрина Commerce', '/premium'],
            ['Витрина Adventure', '/premium2'],
            ['Размещение', '/hub/stay'],
            ['Безопасность', '/hub/safety'],
            ['Рефералы и бусты', '/hub/operator'],
          ].map(([title, href]) => (
            <a 
              key={title} 
              href={href} 
              className="text-center font-semibold border border-white/10 rounded-xl p-3 bg-white/5 hover:bg-white/10"
            >
              {title}
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}