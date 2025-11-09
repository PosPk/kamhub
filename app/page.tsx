'use client';

import React, { useState, useEffect } from 'react';
import { Tour } from '@/types';
import { TourCard } from '@/components/TourCard';
import { Cloud, CloudRain, Sun, Moon, Wind, Droplets, Mountain, Users, MapPin, Home as HomeIcon, ShoppingBag, Package, Car, Leaf, AlertTriangle, Sparkles } from 'lucide-react';

export default function Home() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState({
    temp: 12,
    condition: 'Облачно',
    location: 'Петропавловск-Камчатский',
    humidity: 75,
    wind: 15
  });
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchData();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const toursResponse = await fetch('/api/tours?limit=6');
      const toursData = await toursResponse.json();
      if (toursData.success) {
        setTours(toursData.data.data);
      }

      // Fetch real weather
      const weatherResponse = await fetch('/api/weather');
      const weatherData = await weatherResponse.json();
      if (weatherData.success) {
        setWeather({
          temp: Math.round(weatherData.data.temp),
          condition: weatherData.data.description,
          location: weatherData.data.location,
          humidity: weatherData.data.humidity,
          wind: weatherData.data.windSpeed
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const hour = currentTime.getHours();
  const greeting = hour < 12 ? 'Доброе утро' : hour < 18 ? 'Добрый день' : 'Добрый вечер';
  const timeOfDay = hour < 6 ? 'night' : hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : hour < 21 ? 'evening' : 'night';

  return (
    <main className="min-h-screen relative">
      <div className="blur-overlay"></div>
      
      {/* Hero Weather Section */}
      <section className="weather-hero weather-container">
        <div className="max-w-4xl">
          <div className="fade-in">
            <div className="text-xl md:text-2xl font-medium mb-4 text-primary opacity-80">
              {greeting}
            </div>
            <div className="weather-title mb-6">
              {weather.location}
            </div>
            <div className="flex items-baseline gap-4 mb-8">
              <div className="temperature">{weather.temp}°</div>
              <div className="float-element">
                {weather.temp > 20 ? <Sun className="w-20 h-20 md:w-32 md:h-32 text-yellow-400" /> :
                 weather.temp > 10 ? <Cloud className="w-20 h-20 md:w-32 md:h-32 text-gray-400" /> :
                 <CloudRain className="w-20 h-20 md:w-32 md:h-32 text-blue-400" />}
              </div>
            </div>
            <div className="weather-subtitle mb-8">{weather.condition}</div>
            
            {/* Weather details */}
            <div className="flex gap-6 flex-wrap mb-12">
              <div className="weather-card px-6 py-4">
                <div className="flex items-center gap-3">
                  <Droplets className="w-6 h-6 text-blue-400" />
                  <div>
                    <div className="text-sm opacity-70">Влажность</div>
                    <div className="text-xl font-bold">{weather.humidity}%</div>
                  </div>
                </div>
              </div>
              <div className="weather-card px-6 py-4">
                <div className="flex items-center gap-3">
                  <Wind className="w-6 h-6 text-gray-400" />
                  <div>
                    <div className="text-sm opacity-70">Ветер</div>
                    <div className="text-xl font-bold">{weather.wind} м/с</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="weather-container fade-in fade-in-delay-1">
        <div className="max-w-4xl mx-auto mb-16">
          <input
            type="text"
            placeholder="Куда поедем? Вулканы, океан, медведи..."
            className="weather-search"
          />
        </div>
      </section>

      {/* Quick Access Cards */}
      <section className="weather-container fade-in fade-in-delay-2">
        <h2 className="weather-subtitle mb-8">Кому это нужно</h2>
        <div className="weather-grid mb-16">
          {[
            { title: 'Турист', icon: Users, gradient: 'from-blue-400 to-cyan-400', href: '/hub/tourist' },
            { title: 'Туроператор', icon: Mountain, gradient: 'from-purple-400 to-pink-400', href: '/hub/operator' },
            { title: 'Гид', icon: MapPin, gradient: 'from-green-400 to-emerald-400', href: '/hub/guide' },
            { title: 'Трансфер', icon: Car, gradient: 'from-orange-400 to-red-400', href: '/hub/transfer' },
            { title: 'Размещение', icon: HomeIcon, gradient: 'from-indigo-400 to-blue-400', href: '/hub/stay' },
            { title: 'Сувениры', icon: ShoppingBag, gradient: 'from-pink-400 to-rose-400', href: '/hub/souvenirs' },
            { title: 'Снаряжение', icon: Package, gradient: 'from-teal-400 to-cyan-400', href: '/hub/gear' },
            { title: 'Авто', icon: Car, gradient: 'from-amber-400 to-orange-400', href: '/hub/cars' },
          ].map(({ title, icon: Icon, gradient, href }) => (
            <a key={title} href={href} className="weather-link">
              <div className="weather-card group cursor-pointer h-full">
                <div className={`weather-icon-wrapper bg-gradient-to-br ${gradient} mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">{title}</h3>
                <p className="text-sm opacity-70">Персональный кабинет</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Tours Section */}
      <section className="weather-container fade-in fade-in-delay-3">
        <h2 className="weather-subtitle mb-8 flex items-center gap-3">
          <Mountain className="w-10 h-10" />
          Популярные туры
        </h2>
        {loading ? (
          <div className="weather-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="weather-card h-80 animate-pulse"></div>
            ))}
          </div>
        ) : tours.length > 0 ? (
          <div className="weather-grid">
            {tours.map((tour) => (
              <TourCard
                key={tour.id}
                tour={tour}
                onClick={() => console.log('Tour:', tour.id)}
              />
            ))}
          </div>
        ) : (
          <div className="weather-card text-center py-16">
            <Mountain className="w-20 h-20 mx-auto mb-4 opacity-30" />
            <p className="weather-text">Туры скоро появятся</p>
          </div>
        )}
      </section>

      {/* Safety & Ecology */}
      <section className="weather-container fade-in fade-in-delay-4">
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <div className="weather-card">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="w-8 h-8 text-red-400" />
              <h3 className="text-2xl font-bold">Безопасность</h3>
            </div>
            <div className="space-y-3">
              <a href="/hub/safety" className="weather-button w-full text-center block bg-gradient-to-r from-red-400 to-rose-400">
                SOS Экстренная помощь
              </a>
              <a href="/hub/safety" className="weather-card block text-center py-3 hover:scale-105 transition-transform">
                МЧС Камчатки
              </a>
              <a href="/hub/safety" className="weather-card block text-center py-3 hover:scale-105 transition-transform">
                Сейсмическая активность
              </a>
            </div>
          </div>

          <div className="weather-card bg-gradient-to-br from-green-400/20 to-emerald-400/20">
            <div className="flex items-center gap-3 mb-6">
              <Leaf className="w-8 h-8 text-green-400" />
              <h3 className="text-2xl font-bold">Экология</h3>
            </div>
            <div className="text-6xl font-black mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              0
            </div>
            <p className="weather-text">Eco-points за бережное отношение к природе</p>
          </div>
        </div>
      </section>

      {/* AI Assistant */}
      <section className="weather-container fade-in fade-in-delay-4 mb-16">
        <div className="weather-card max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <div className="weather-icon-wrapper bg-gradient-to-br from-purple-400 to-pink-400">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">AI-Гид Камчатки</h3>
              <p className="text-sm opacity-70">Ваш персональный помощник</p>
            </div>
          </div>
          <input
            type="text"
            placeholder="Спросите что-то о Камчатке..."
            className="weather-search"
          />
        </div>
      </section>
    </main>
  );
}
