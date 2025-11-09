'use client';

import React, { useState, useEffect } from 'react';
import { Tour, Partner, Weather } from '@/types';
import { TourCard } from '@/components/TourCard';
import { PartnerCard } from '@/components/PartnerCard';
import { WeatherWidget } from '@/components/WeatherWidget';
import { EcoPointsWidget } from '@/components/EcoPointsWidget';
import { AIChatWidget } from '@/components/AIChatWidget';
import { Rocket, Mountain, Leaf, Users, MapPin, Home as HomeIcon, ShoppingBag, Package, Car, PhoneCall, AlertTriangle, Activity, Search, Sparkles } from 'lucide-react';

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
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl mx-0 sm:mx-6 mb-8 mt-8">
        <div className="absolute inset-0 -z-10">
          <video 
            className="w-full h-[60vh] object-cover" 
            autoPlay 
            muted 
            loop 
            playsInline 
            poster="https://images.unsplash.com/photo-1520496938500-76fd098ad75a?q=80&w=1920&auto=format&fit=crop"
          >
            <source src="https://cdn.coverr.co/videos/coverr-aurora-over-mountains-0157/1080p.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="absolute inset-0 video-overlay"></div>
        <div className="absolute inset-0 p-8 sm:p-12 grid content-end gap-6">
          <div className="max-w-3xl">
            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-black leading-tight text-white mb-4">
              Экосистема туризма Камчатки
            </h1>
            <p className="text-xl text-white/90 mb-6">
              Туры, партнёры, CRM, бронирование, безопасность, рефералы и экология — в едином центре.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center max-w-3xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                placeholder="Куда поедем? вулканы, океан, медведи…" 
                className="w-full h-14 rounded-xl pl-12 pr-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur text-gray-900 dark:text-white border-2 border-transparent focus:border-blue-500 transition-all" 
                name="q" 
              />
            </div>
            <a 
              href="/demo"
              className="h-14 rounded-xl px-8 font-bold bg-gradient-to-r from-blue-500 to-cyan-500 text-white flex items-center justify-center gap-2 hover:shadow-xl hover:scale-105 transition-all"
            >
              <Rocket className="w-5 h-5" />
              Демо
            </a>
          </div>
          <div className="flex gap-4 flex-wrap">
            <a 
              href="/auth/login"
              className="px-6 py-3 glass rounded-xl text-white font-semibold hover:bg-white/20 transition-all"
            >
              Войти
            </a>
            <a 
              href="/auth/login"
              className="px-6 py-3 glass rounded-xl text-white font-semibold hover:bg-white/20 transition-all"
            >
              Регистрация
            </a>
          </div>
          <div className="text-sm text-white/80 flex items-center gap-2 glass px-4 py-2 rounded-lg inline-flex w-fit">
            <Sparkles className="w-4 h-4" />
            <span><strong>Демо-режим</strong> - попробуйте все функции без регистрации</span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-4 sm:px-6 py-12">
        <div className="text-center mb-12 fade-in">
          <h2 className="font-display text-4xl sm:text-6xl font-black mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Камчатка.
            </span>
          </h2>
          <p className="text-xl text-secondary">экосистема путешествий</p>
        </div>
        
        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-6 text-primary">Кому это нужно</h3>
        </div>
        
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 mb-16">
          {[
            { title: 'Турист', href: '/hub/tourist', icon: Users, color: 'from-blue-500 to-cyan-500' },
            { title: 'Туроператор', href: '/hub/operator', icon: Mountain, color: 'from-purple-500 to-pink-500' },
            { title: 'Гид', href: '/hub/guide', icon: MapPin, color: 'from-green-500 to-emerald-500' },
            { title: 'Трансфер', href: '/hub/transfer', icon: Car, color: 'from-orange-500 to-red-500' },
            { title: 'Размещение', href: '/hub/stay', icon: HomeIcon, color: 'from-indigo-500 to-blue-500' },
            { title: 'Сувениры', href: '/hub/souvenirs', icon: ShoppingBag, color: 'from-pink-500 to-rose-500' },
            { title: 'Прокат снаряжения', href: '/hub/gear', icon: Package, color: 'from-teal-500 to-cyan-500' },
            { title: 'Прокат авто', href: '/hub/cars', icon: Car, color: 'from-amber-500 to-orange-500' },
          ].map(({ title, href, icon: Icon, color }) => (
            <a 
              key={title} 
              href={href} 
              className="card group cursor-pointer"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="font-bold text-lg mb-1 text-primary">{title}</div>
              <div className="text-sm text-tertiary">Персональные инструменты</div>
            </a>
          ))}
        </div>
      </section>


      {/* Tours Section */}
      <section className="px-4 sm:px-6 py-12 bg-secondary/50">
        <h2 className="text-3xl font-bold mb-8 flex items-center gap-3 text-primary">
          <Mountain className="w-8 h-8 text-blue-500" />
          Популярные туры
        </h2>
        {loading ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-secondary rounded-2xl h-80 animate-pulse"></div>
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
          <div className="text-center text-tertiary py-16 card">
            <Mountain className="w-20 h-20 mx-auto mb-4 opacity-40" />
            <p className="text-lg">Туры временно недоступны</p>
          </div>
        )}
      </section>


      {/* Weather and Eco-points Widgets */}
      {userLocation && (
        <section className="px-4 sm:px-6 py-12">
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
      <section className="px-4 sm:px-6 py-12 bg-secondary/50">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="card md:col-span-2">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-primary">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  SOS и безопасность
                </h3>
                <div className="grid gap-3">
                  <a href="#" className="rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white text-center py-4 font-bold flex items-center justify-center gap-2 hover:shadow-xl transition-all">
                    <PhoneCall className="w-5 h-5" />
                    SOS
                  </a>
                  <a href="#" className="rounded-xl bg-secondary border border-color text-center py-4 font-bold flex items-center justify-center gap-2 hover:bg-tertiary transition-all">
                    <AlertTriangle className="w-5 h-5" />
                    МЧС
                  </a>
                  <a href="#" className="rounded-xl bg-secondary border border-color text-center py-4 font-bold flex items-center justify-center gap-2 hover:bg-tertiary transition-all">
                    <Activity className="w-5 h-5" />
                    Сейсмика
                  </a>
                </div>
                <div className="text-tertiary text-xs mt-4">Тестовый режим: интеграции в процессе</div>
              </div>
              <div className="flex items-center justify-center">
                <a href="/hub/safety" target="_blank" rel="noopener noreferrer" className="group">
                  <div className="rounded-2xl border border-color bg-tertiary/50 p-8 hover:shadow-xl transition-all group-hover:scale-105">
                    <img src="/graphics/kamchatka-button.svg" alt="Камчатка" className="w-full h-auto max-w-xs" />
                  </div>
                </a>
              </div>
            </div>
          </div>
          
          <div className="card bg-gradient-to-br from-green-500/10 to-emerald-500/10">
            <div className="flex items-center gap-2 mb-4">
              <Leaf className="w-6 h-6 text-green-500" />
              <h3 className="text-lg font-bold text-primary">Экология</h3>
            </div>
            <div className="text-4xl font-black text-green-600 mb-2">Eco‑points: 0</div>
            <div className="text-tertiary text-sm">Собирайте баллы за бережное поведение</div>
          </div>
        </div>
      </section>

      {/* AI Chat Widget */}
      <section className="px-4 sm:px-6 py-12">
        <h2 className="text-3xl font-bold mb-8 flex items-center gap-3 text-primary">
          <Sparkles className="w-8 h-8 text-cyan-500" />
          AI-Гид по Камчатке
        </h2>
        <AIChatWidget
          userId="demo-user"
          className="w-full h-96"
        />
      </section>

      {/* Quick Links Section */}
      <section className="px-4 sm:px-6 py-12 bg-secondary/50">
        <h3 className="text-2xl font-bold mb-6 text-primary">Быстрые переходы</h3>
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
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
              href={href as string} 
              className="text-center font-semibold border border-color rounded-xl p-4 bg-primary hover:bg-secondary transition-all"
            >
              {title}
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
