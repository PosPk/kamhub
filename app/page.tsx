'use client';

import React, { useState, useEffect } from 'react';
import { Tour, Partner, Weather } from '@/types';
import { TourCard } from '@/components/TourCard';
import { PartnerCard } from '@/components/PartnerCard';
import { WeatherWidget } from '@/components/WeatherWidget';
import { EcoPointsWidget } from '@/components/EcoPointsWidget';
import { AIChatWidget } from '@/components/AIChatWidget';

// Иконки для ролей
const ROLE_ICONS: Record<string, string> = {
  'Турист': '🏃',
  'Туроператор': '🎯',
  'Гид': '🗺️',
  'Трансфер': '🚗',
  'Размещение': '🏠',
  'Сувениры': '🎁',
  'Прокат снаряжения': '🎣',
  'Прокат авто': '🚙',
};

export default function Home() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyEcoPoints, setNearbyEcoPoints] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

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
      if (toursData.success && toursData.data?.tours) {
        setTours(toursData.data.tours);
      }

      // Загружаем партнеров
      const partnersResponse = await fetch('/api/partners?limit=6');
      const partnersData = await partnersResponse.json();
      if (partnersData.success && partnersData.data?.data) {
        setPartners(partnersData.data.data);
      }

      // Загружаем eco-points
      const ecoPointsResponse = await fetch('/api/eco-points?limit=10');
      const ecoPointsData = await ecoPointsResponse.json();
      if (ecoPointsData.success && ecoPointsData.data) {
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
          setUserLocation({
            lat: 53.0195,
            lng: 158.6505,
          });
        }
      );
    } else {
      setUserLocation({
        lat: 53.0195,
        lng: 158.6505,
      });
    }
  };

  // Поиск
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setShowSearchResults(false);
      return;
    }

    try {
      const response = await fetch(`/api/tours?search=${encodeURIComponent(query)}`);
      const data = await response.json();
      if (data.success && data.data?.tours) {
        setSearchResults(data.data.tours);
        setShowSearchResults(true);
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  return (
    <main className="min-h-screen bg-premium-black text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl mx-6 mb-8 mt-6">
        <div className="absolute inset-0 -z-10">
          <div 
            className="w-full h-[60vh] bg-cover bg-center"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070')",
            }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-premium-gold/20 via-transparent to-blue-500/20 animate-aurora"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
        
        <div className="relative p-8 md:p-12 grid content-end gap-6 min-h-[60vh]">
          <div className="max-w-3xl">
            <h1 className="font-display text-5xl sm:text-7xl font-black leading-tight mb-4 bg-gradient-to-r from-premium-gold via-yellow-300 to-premium-gold bg-clip-text text-transparent">
              Камчатка ждёт вас
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Вулканы, океан, медведи и гейзеры. Забронируйте незабываемое приключение.
            </p>
            
            {/* Поиск */}
            <div className="relative max-w-2xl">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input 
                    placeholder="Поиск туров: вулканы, рыбалка, медведи..." 
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full h-14 rounded-2xl px-6 text-slate-900 text-lg focus:outline-none focus:ring-4 focus:ring-premium-gold/50 shadow-xl"
                    name="q" 
                  />
                  {showSearchResults && searchResults.length > 0 && (
                    <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-2xl overflow-hidden z-50">
                      {searchResults.slice(0, 5).map((tour: any) => (
                        <a
                          key={tour.id}
                          href={`/tours/${tour.id}`}
                          className="block p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                        >
                          <div className="font-bold text-gray-900">{tour.title}</div>
                          <div className="text-sm text-gray-600">от {tour.priceFrom?.toLocaleString()} ₽</div>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                <a 
                  href="/demo"
                  className="h-14 rounded-2xl px-8 font-bold bg-gradient-to-r from-premium-gold to-yellow-600 text-premium-black flex items-center gap-2 hover:shadow-xl hover:shadow-premium-gold/50 transition-all transform hover:scale-105"
                >
                  🚀 Демо
                </a>
              </div>
            </div>

            {/* CTA кнопки */}
            <div className="flex gap-4 mt-6">
              <a 
                href="/auth/login"
                className="px-8 py-3 bg-blue-600/90 text-white border border-blue-400/40 rounded-xl hover:bg-blue-600 transition-all font-bold backdrop-blur-xl shadow-lg"
              >
                Войти
              </a>
              <a 
                href="/auth/login"
                className="px-8 py-3 bg-green-600/90 text-white border border-green-400/40 rounded-xl hover:bg-green-600 transition-all font-bold backdrop-blur-xl shadow-lg"
              >
                Стать партнёром
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Статистика */}
      <section className="px-6 py-8">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6 text-center">
            <div className="text-5xl font-black bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent mb-2">
              {tours.length || 5}
            </div>
            <div className="text-white/70 font-semibold">Активных туров</div>
          </div>
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6 text-center">
            <div className="text-5xl font-black bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent mb-2">
              {partners.length || 10}
            </div>
            <div className="text-white/70 font-semibold">Проверенных партнёров</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 text-center">
            <div className="text-5xl font-black bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent mb-2">
              150+
            </div>
            <div className="text-white/70 font-semibold">Довольных туристов</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 backdrop-blur-xl border border-orange-500/30 rounded-2xl p-6 text-center">
            <div className="text-5xl font-black bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent mb-2">
              4.9
            </div>
            <div className="text-white/70 font-semibold">Средний рейтинг ⭐</div>
          </div>
        </div>
      </section>

      {/* Роли с иконками */}
      <section className="px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-premium-gold via-yellow-300 to-premium-gold bg-clip-text text-transparent">
              Кому это нужно?
            </h2>
            <p className="text-xl text-white/70">Выберите свою роль в экосистеме</p>
          </div>
          
          <div className="grid gap-6 grid-cols-2 sm:grid-cols-4">
            {[
              ['Турист', '/hub/tourist'],
              ['Туроператор', '/hub/operator'],
              ['Гид', '/hub/guide'],
              ['Трансфер', '/hub/transfer'],
              ['Размещение', '/hub/stay'],
              ['Сувениры', '/hub/souvenirs'],
              ['Прокат снаряжения', '/hub/gear'],
              ['Прокат авто', '/hub/cars'],
            ].map(([title, href]) => (
              <a 
                key={title} 
                href={href} 
                className="group rounded-2xl bg-white/5 border border-white/10 p-6 hover:bg-white/10 hover:border-premium-gold/50 transition-all transform hover:scale-105 hover:shadow-xl hover:shadow-premium-gold/20"
              >
                <div className="text-5xl mb-3 transform group-hover:scale-110 transition-transform">
                  {ROLE_ICONS[title] || '🎯'}
                </div>
                <div className="text-lg font-extrabold mb-1">{title}</div>
                <div className="text-sm text-white/70">Персональные инструменты</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Популярные туры */}
      <section className="px-6 py-12 bg-gradient-to-b from-transparent via-white/5 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-4xl font-black bg-gradient-to-r from-premium-gold to-yellow-300 bg-clip-text text-transparent">
              Популярные туры
            </h2>
            <a href="/tours" className="text-premium-gold hover:text-yellow-300 font-bold transition-colors">
              Все туры →
            </a>
          </div>
          
          {loading ? (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white/5 rounded-2xl h-80 animate-pulse"></div>
              ))}
            </div>
          ) : tours.length > 0 ? (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {tours.map((tour) => (
                <TourCard
                  key={tour.id}
                  tour={tour}
                  onClick={() => {
                    window.location.href = `/tours/${tour.id}`;
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center text-white/70 py-20">
              <div className="text-6xl mb-4">🏔️</div>
              <p className="text-xl">Туры скоро появятся</p>
            </div>
          )}
        </div>
      </section>

      {/* НОВАЯ СЕКЦИЯ: Партнёры */}
      {partners.length > 0 && (
        <section className="px-6 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-4xl font-black bg-gradient-to-r from-premium-gold to-yellow-300 bg-clip-text text-transparent">
                Наши партнёры
              </h2>
              <a href="/partners" className="text-premium-gold hover:text-yellow-300 font-bold transition-colors">
                Все партнёры →
              </a>
            </div>
            
            <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
              {partners.map((partner) => (
                <div
                  key={partner.id}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-premium-gold/50 transition-all transform hover:scale-105 group"
                >
                  <div className="aspect-square bg-white/10 rounded-xl flex items-center justify-center mb-3 group-hover:bg-white/20 transition-colors">
                    <span className="text-4xl">🏢</span>
                  </div>
                  <div className="text-sm font-bold text-white/90 text-center line-clamp-2">
                    {partner.name}
                  </div>
                  <div className="text-xs text-white/60 text-center mt-1">
                    ⭐ {partner.rating || '4.5'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Отзывы */}
      <section className="px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black mb-4 bg-gradient-to-r from-premium-gold to-yellow-300 bg-clip-text text-transparent">
              Отзывы туристов
            </h2>
            <p className="text-xl text-white/70">Что говорят о Камчатке</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                name: 'Анна К.',
                avatar: '👩',
                rating: 5,
                text: 'Невероятные впечатления! Восхождение на Авачинский вулкан - это что-то космическое. Гиды профессионалы, всё организовано на высшем уровне.',
                tour: 'Восхождение на вулкан',
              },
              {
                name: 'Дмитрий М.',
                avatar: '👨',
                rating: 5,
                text: 'Долина гейзеров превзошла все ожидания. Это нужно видеть своими глазами! Спасибо команде за незабываемый опыт.',
                tour: 'Долина гейзеров',
              },
              {
                name: 'Елена С.',
                avatar: '👩',
                rating: 5,
                text: 'Рыбалка на Камчатке - мечта! Поймали огромных лососей, увидели медведей в дикой природе. Вернёмся ещё!',
                tour: 'Рыболовный тур',
              },
            ].map((review, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl">{review.avatar}</div>
                  <div className="flex-1">
                    <div className="font-bold text-white">{review.name}</div>
                    <div className="text-sm text-premium-gold">
                      {'⭐'.repeat(review.rating)}
                    </div>
                  </div>
                </div>
                <p className="text-white/80 mb-3 text-sm leading-relaxed">&ldquo;{review.text}&rdquo;</p>
                <div className="text-xs text-white/50">Тур: {review.tour}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Weather and Eco-points Widgets */}
      {userLocation && (
        <section className="px-6 py-6">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
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

      {/* SOS и Камчатка */}
      <section className="px-6 py-6">
        <div className="max-w-6xl mx-auto grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white/5 border border-white/10 p-5 grid gap-4 sm:grid-cols-2 sm:items-start">
            <div className="grid gap-4">
              <div className="text-sm text-white/70">SOS и безопасность</div>
              <div className="grid gap-3">
                <a href="#" className="rounded-xl bg-premium-gold text-premium-black text-center py-3 font-bold hover:bg-yellow-600 transition-colors">
                  SOS
                </a>
                <a href="#" className="rounded-xl bg-white/10 text-center py-3 font-bold hover:bg-white/20 transition-colors">
                  МЧС
                </a>
                <a href="#" className="rounded-xl bg-white/10 text-center py-3 font-bold hover:bg-white/20 transition-colors">
                  Сейсмика
                </a>
              </div>
              <div className="text-white/70 text-xs">Тестовый режим</div>
            </div>
            <div className="w-full h-72 grid place-items-center cursor-pointer">
              <a href="/hub/safety" target="_blank" rel="noopener noreferrer" className="inline-block w-[70%] sm:w-[80%] max-w-[520px]">
                <img 
                  src="/graphics/kamchatka-button.svg" 
                  alt="Камчатка" 
                  className="w-full h-auto filter drop-shadow-[0_0_30px_rgba(230,193,73,0.6)] hover:drop-shadow-[0_0_50px_rgba(230,193,73,0.8)] transition-all duration-300" 
                />
              </a>
            </div>
          </div>
          
          <div className="rounded-2xl bg-white/5 border border-white/10 p-5 grid gap-2">
            <div className="text-sm text-white/70">Экология</div>
            <div className="text-2xl font-black text-premium-gold">Eco‑points: 0</div>
            <div className="text-white/70 text-sm">Собирайте баллы за бережное поведение</div>
          </div>
        </div>
      </section>

      {/* AI Chat Widget */}
      <section className="px-6 py-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-extrabold mb-4 bg-gradient-to-r from-premium-gold to-yellow-300 bg-clip-text text-transparent">
            AI-Гид по Камчатке
          </h2>
          <AIChatWidget
            userId="demo-user"
            className="w-full h-96"
          />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-20 border-t border-white/10 bg-gradient-to-b from-transparent to-black/50">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Колонка 1: О проекте */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gold-gradient"></div>
                <span className="font-bold text-xl text-premium-gold">Kamchatour Hub</span>
              </div>
              <p className="text-white/70 text-sm mb-4">
                Экосистема туризма Камчатки. Туры, партнёры, бронирование.
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors">
                  <span className="text-xl">📱</span>
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors">
                  <span className="text-xl">✈️</span>
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors">
                  <span className="text-xl">📧</span>
                </a>
              </div>
            </div>

            {/* Колонка 2: Для туристов */}
            <div>
              <h3 className="font-bold text-white mb-4">Для туристов</h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li><a href="/tours" className="hover:text-premium-gold transition-colors">Все туры</a></li>
                <li><a href="/partners" className="hover:text-premium-gold transition-colors">Партнёры</a></li>
                <li><a href="/hub/safety" className="hover:text-premium-gold transition-colors">Безопасность</a></li>
                <li><a href="/demo" className="hover:text-premium-gold transition-colors">Демо-режим</a></li>
              </ul>
            </div>

            {/* Колонка 3: Для бизнеса */}
            <div>
              <h3 className="font-bold text-white mb-4">Для бизнеса</h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li><a href="/auth/login" className="hover:text-premium-gold transition-colors">Стать партнёром</a></li>
                <li><a href="/hub/operator" className="hover:text-premium-gold transition-colors">CRM-система</a></li>
                <li><a href="/hub/operator" className="hover:text-premium-gold transition-colors">Аналитика</a></li>
                <li><a href="/partner/dashboard" className="hover:text-premium-gold transition-colors">Личный кабинет</a></li>
              </ul>
            </div>

            {/* Колонка 4: Контакты */}
            <div>
              <h3 className="font-bold text-white mb-4">Контакты</h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li>📍 Петропавловск-Камчатский</li>
                <li>📞 +7 (999) 123-45-67</li>
                <li>📧 info@kamchatour.ru</li>
                <li>🕐 Пн-Вс: 9:00-21:00</li>
              </ul>
            </div>
          </div>

          {/* Нижняя часть футера */}
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-white/50">
              © 2025 Kamchatour Hub. Все права защищены.
            </div>
            <div className="flex gap-6 text-sm text-white/50">
              <a href="#" className="hover:text-premium-gold transition-colors">Политика конфиденциальности</a>
              <a href="#" className="hover:text-premium-gold transition-colors">Условия использования</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
