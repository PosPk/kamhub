'use client';

import React, { useState, useEffect } from 'react';
import { Tour } from '@/types';

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch tours
        const toursResponse = await fetch('/api/tours?limit=6');
        const toursData = await toursResponse.json();
        if (toursData.success) {
          setTours(toursData.data.data);
        }

        // Fetch weather
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

    fetchData();
  }, []);

  if (!mounted) {
    return (
      <main className="min-h-screen relative flex items-center justify-center">
        <div className="text-2xl opacity-50">Загрузка...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen relative p-8">
      <div className="blur-overlay"></div>
      
      {/* Hero Section */}
      <section className="weather-container min-h-[60vh] flex flex-col items-center justify-center relative z-10 text-center py-20">
        <h1 className="weather-title mb-6">
          Добрый день, Камчатка!
        </h1>
        
        {/* Weather Card */}
        <div className="weather-card max-w-md w-full mb-8 p-8">
          <div className="text-center">
            <div className="text-6xl font-black mb-2">{weather.temp}°</div>
            <div className="text-xl opacity-80">{weather.condition}</div>
            <div className="text-sm opacity-60 mt-2">{weather.location}</div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
            <div>
              <div className="opacity-70">Влажность</div>
              <div className="font-semibold">{weather.humidity}%</div>
            </div>
            <div>
              <div className="opacity-70">Ветер</div>
              <div className="font-semibold">{weather.wind} м/с</div>
            </div>
          </div>
        </div>
      </section>

      {/* Search */}
      <section className="weather-container mb-16">
        <input
          type="text"
          placeholder="Куда поедем? Вулканы, океан, медведи..."
          className="weather-search"
        />
      </section>

      {/* Roles */}
      <section className="weather-container mb-16">
        <h2 className="weather-subtitle mb-8">Кому это нужно</h2>
        <div className="weather-grid">
          {[
            { title: 'Турист', href: '/hub/tourist' },
            { title: 'Туроператор', href: '/hub/operator' },
            { title: 'Гид', href: '/hub/guide' },
            { title: 'Трансфер', href: '/hub/transfer' },
          ].map(({ title, href }) => (
            <a key={title} href={href} className="weather-card group cursor-pointer">
              <h3 className="text-2xl font-bold mb-2">{title}</h3>
              <p className="text-sm opacity-70">Персональный кабинет</p>
            </a>
          ))}
        </div>
      </section>

      {/* Tours */}
      <section className="weather-container mb-16">
        <h2 className="weather-subtitle mb-8">Популярные туры</h2>
        {loading ? (
          <div className="text-center opacity-50">Загрузка туров...</div>
        ) : tours.length > 0 ? (
          <div className="weather-grid">
            {tours.map((tour) => (
              <div key={tour.id} className="weather-card">
                <h3 className="text-xl font-bold mb-2">{tour.title}</h3>
                <p className="text-sm opacity-70 mb-4">{tour.description}</p>
                <div className="text-lg font-bold text-blue-400">
                  от {tour.priceFrom} ₽
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="weather-card text-center py-8">
            <p className="opacity-70">Туры скоро появятся</p>
          </div>
        )}
      </section>

      {/* Safety & Ecology */}
      <section className="weather-container mb-16">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="weather-card">
            <h3 className="text-2xl font-bold mb-4">Безопасность</h3>
            <a href="/hub/safety" className="weather-button w-full text-center block bg-gradient-to-r from-red-400 to-rose-400">
              SOS Экстренная помощь
            </a>
          </div>

          <div className="weather-card bg-gradient-to-br from-green-400/20 to-emerald-400/20">
            <h3 className="text-2xl font-bold mb-4">Экология</h3>
            <div className="text-6xl font-black mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              0
            </div>
            <p className="opacity-70">Eco-points за бережное отношение к природе</p>
          </div>
        </div>
      </section>

      {/* AI Assistant */}
      <section className="weather-container mb-16">
        <div className="weather-card max-w-4xl mx-auto text-center p-8">
          <h3 className="text-3xl font-bold mb-4">AI-Гид Камчатки</h3>
          <p className="text-lg opacity-80 mb-6">
            Ваш персональный помощник
          </p>
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
