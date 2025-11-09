'use client';

import React, { useState, useEffect } from 'react';
import { Tour, Partner, Weather } from '@/types';
import { TourCard } from '@/components/TourCard';
import { PartnerCard } from '@/components/PartnerCard';
import { WeatherWidget } from '@/components/WeatherWidget';
import { EcoPointsWidget } from '@/components/EcoPointsWidget';
import { AIChatWidget } from '@/components/AIChatWidget';
import { Rocket, Mountain, Leaf, Users, MapPin, Home as HomeIcon, ShoppingBag, Package, Car, PhoneCall, AlertTriangle, Activity } from 'lucide-react';

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
    <main className="min-h-screen bg-premium-black text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl mx-6 mb-8">
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
          <h1 className="font-display text-4xl sm:text-6xl font-black leading-tight">
            Экосистема туризма Камчатки
          </h1>
          <p className="max-w-2xl text-white/85">
            Туры, партнёры, CRM, бронирование, безопасность, рефералы и экология — в едином центре.
          </p>
          <div className="flex gap-2 items-center">
            <input 
              placeholder="Куда поедем? вулканы, океан, медведи…" 
              className="flex-1 h-12 rounded-xl px-4 text-slate-900" 
              name="q" 
            />
            <a 
              href="/demo"
              className="h-12 rounded-xl px-5 font-bold bg-premium-gold text-premium-black flex items-center gap-2"
            >
              <Rocket className="w-5 h-5" />
              Демо
            </a>
          </div>
          <div className="flex gap-4 justify-center mt-4">
            <a 
              href="/auth/login"
              className="px-6 py-2 bg-blue-600/20 text-blue-400 border border-blue-600/40 rounded-lg hover:bg-blue-600/30 transition-colors"
            >
              Войти
            </a>
            <a 
              href="/auth/login"
              className="px-6 py-2 bg-green-600/20 text-green-400 border border-green-600/40 rounded-lg hover:bg-green-600/30 transition-colors"
            >
              Регистрация
            </a>
          </div>
          <div className="text-sm text-white/70 mt-2 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            <span><strong>Демо-режим</strong> - попробуйте все функции без регистрации</span>
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
            { title: 'Турист', href: '/hub/tourist', icon: Users },
            { title: 'Туроператор', href: '/hub/operator', icon: Mountain },
            { title: 'Гид', href: '/hub/guide', icon: MapPin },
            { title: 'Трансфер', href: '/hub/transfer', icon: Car },
            { title: 'Размещение', href: '/hub/stay', icon: HomeIcon },
            { title: 'Сувениры', href: '/hub/souvenirs', icon: ShoppingBag },
            { title: 'Прокат снаряжения', href: '/hub/gear', icon: Package },
            { title: 'Прокат авто', href: '/hub/cars', icon: Car },
          ].map(({ title, href, icon: Icon }) => (
            <a 
              key={title} 
              href={href} 
              className="rounded-2xl bg-white/5 border border-white/10 p-5 hover:bg-white/10 transition group"
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-5 h-5 text-premium-gold group-hover:scale-110 transition-transform" />
                <div className="text-lg font-extrabold">{title}</div>
              </div>
              <div className="text-sm text-white/70">Персональные инструменты и витрины</div>
            </a>
          ))}
        </div>
      </section>


      {/* Tours Section */}
      <section className="px-6 py-6">
        <h2 className="text-xl font-extrabold mb-4 flex items-center gap-2">
          <Mountain className="w-6 h-6 text-premium-gold" />
          Популярные туры
        </h2>
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
            <Mountain className="w-16 h-16 mx-auto mb-4 text-white/40" />
            <p>Туры временно недоступны</p>
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
            <div className="text-sm text-white/70 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              SOS и безопасность
            </div>
            <div className="grid gap-3">
              <a href="#" className="rounded-xl bg-premium-gold text-premium-black text-center py-3 font-bold flex items-center justify-center gap-2">
                <PhoneCall className="w-5 h-5" />
                SOS
              </a>
              <a href="#" className="rounded-xl bg-white/10 text-center py-3 font-bold flex items-center justify-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                МЧС
              </a>
              <a href="#" className="rounded-xl bg-white/10 text-center py-3 font-bold flex items-center justify-center gap-2">
                <Activity className="w-5 h-5" />
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
          <div className="text-sm text-white/70 flex items-center gap-2">
            <Leaf className="w-4 h-4" />
            Экология
          </div>
          <div className="text-2xl font-black text-premium-gold">Eco‑points: 0</div>
          <div className="text-white/70 text-sm">Собирайте баллы за бережное поведение</div>
        </div>
      </section>

      {/* AI Chat Widget */}
      <section className="px-6 py-6">
        <h2 className="text-xl font-extrabold mb-4 flex items-center gap-2">
          <Activity className="w-6 h-6 text-premium-gold" />
          AI-Гид по Камчатке
        </h2>
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
              href={href as string} 
              className="text-center font-semibold border border-white/10 rounded-xl p-3 bg-white/5 hover:bg-white/10 transition"
            >
              {title}
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
