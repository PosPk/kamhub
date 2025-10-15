'use client';

import React, { useState, useEffect } from 'react';
import { Tour, Partner, Weather } from '@/types';
import { TourCardEnhanced } from '@/components/TourCardEnhanced';
import { PartnerCard } from '@/components/PartnerCard';
import { WeatherWidget } from '@/components/WeatherWidget';
import { EcoPointsWidget } from '@/components/EcoPointsWidget';
import { AIChatWidget } from '@/components/AIChatWidget';
import { InteractiveMap } from '@/components/InteractiveMap';
import { SmartFilters } from '@/components/SmartFilters';

export default function Home() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [filters, setFilters] = useState({
    difficulty: [] as string[],
    season: [] as string[],
    priceRange: [0, 100000] as [number, number],
    duration: [1, 24] as [number, number]
  });
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Kamchatour Hub</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#tours" className="text-gray-700 hover:text-blue-600">Туры</a>
              <a href="#partners" className="text-gray-700 hover:text-blue-600">Партнеры</a>
              <a href="#about" className="text-gray-700 hover:text-blue-600">О нас</a>
            </nav>
            <button
              onClick={() => setShowChat(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              AI-гид
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Добро пожаловать на{' '}
            <span className="text-blue-600">Камчатку</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Откройте для себя удивительную природу Камчатки с нашими эксклюзивными турами и услугами
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#tours" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Начать путешествие
            </a>
            <button
              onClick={() => setShowChat(true)}
              className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Спросить AI-гида
            </button>
          </div>
        </div>
      </section>

      {/* Weather and Eco-points Widgets */}
      {userLocation && (
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
          </div>
        </section>
      )}

      {/* Interactive Map Section */}
      {nearbyEcoPoints.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
              Интерактивная карта Камчатки
            </h2>
            <InteractiveMap
              ecoPoints={nearbyEcoPoints}
              onPointClick={(point) => {
                console.log('Eco point clicked:', point);
              }}
            />
          </div>
        </section>
      )}

      {/* Tours Section */}
      <section id="tours" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Популярные туры
          </h2>
          
          {/* Smart Filters */}
          <div className="mb-8">
            <SmartFilters
              filters={filters}
              onFiltersChange={setFilters}
            />
          </div>
          
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-lg h-80 animate-pulse"></div>
              ))}
            </div>
          ) : tours.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tours.map((tour) => (
                <TourCardEnhanced
                  key={tour.id}
                  tour={tour}
                  onClick={() => {
                    // Здесь будет логика перехода к детальной странице тура
                    console.log('Tour clicked:', tour.id);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">
              <div className="text-4xl mb-4">🏔️</div>
              <p>Туры временно недоступны</p>
            </div>
          )}
          
          <div className="text-center mt-8">
            <a
              href="/tours"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Показать все туры
            </a>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section id="partners" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Наши партнеры
          </h2>
          
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-lg h-80 animate-pulse"></div>
              ))}
            </div>
          ) : partners.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {partners.map((partner) => (
                <PartnerCard
                  key={partner.id}
                  partner={partner}
                  onClick={() => {
                    // Здесь будет логика перехода к профилю партнера
                    console.log('Partner clicked:', partner.id);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">
              <div className="text-4xl mb-4">🤝</div>
              <p>Партнеры временно недоступны</p>
            </div>
          )}
          
          <div className="text-center mt-8">
            <a
              href="/partners"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Показать всех партнеров
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="about" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Почему выбирают нас
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏔️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Уникальные маршруты</h3>
              <p className="text-gray-600">
                Исследуйте вулканы, гейзеры и дикую природу Камчатки
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌿</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Экологичность</h3>
              <p className="text-gray-600">
                Заботимся о сохранении природы и поддерживаем местные сообщества
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⭐</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Опытные гиды</h3>
              <p className="text-gray-600">
                Профессиональные гиды с глубокими знаниями региона
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Готовы к приключению?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Присоединяйтесь к тысячам путешественников, которые уже открыли для себя Камчатку
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#tours"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Забронировать тур
            </a>
            <button
              onClick={() => setShowChat(true)}
              className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Спросить AI-гида
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Kamchatour Hub</h3>
              <p className="text-gray-400">
                Ваш надежный партнер в путешествиях по Камчатке
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Туры</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Вулканы</a></li>
                <li><a href="#" className="hover:text-white">Гейзеры</a></li>
                <li><a href="#" className="hover:text-white">Дикая природа</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Услуги</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Трансфер</a></li>
                <li><a href="#" className="hover:text-white">Размещение</a></li>
                <li><a href="#" className="hover:text-white">Снаряжение</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Контакты</h4>
              <ul className="space-y-2 text-gray-400">
                <li>+7 (4152) 123-456</li>
                <li>info@kamchatour.ru</li>
                <li>Петропавловск-Камчатский</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Kamchatour Hub. Все права защищены.</p>
          </div>
        </div>
      </footer>

      {/* AI Chat Widget */}
      {showChat && (
        <div className="fixed bottom-4 right-4 z-50">
          <AIChatWidget
            userId="demo-user"
            onClose={() => setShowChat(false)}
            className="w-80 h-96"
          />
        </div>
      )}
    </div>
  );
}