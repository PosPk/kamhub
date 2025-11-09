'use client';

import React, { useState, useEffect } from 'react';
import { 
  Cloud, Sun, Wind, Droplets, ThermometerSun, Moon, CloudSnow,
  Mountain, Users, Compass, Car, Briefcase, Shield,
  TrendingUp, Star, Award, Leaf, BarChart3,
  Phone, AlertTriangle, MapPin, Check, ArrowRight,
  Home, ShoppingBag, Calendar, DollarSign, Target,
  Activity, Zap, Heart
} from 'lucide-react';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState({
    temp: 8,
    condition: 'snow', // 'snow', 'wind', 'rain', 'clear'
    wind: 12,
    humidity: 78,
    feels_like: 5
  });

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-2xl text-gray-400">Загрузка...</div>
      </div>
    );
  }

  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes().toString().padStart(2, '0');
  const hoursStr = hours.toString().padStart(2, '0');

  // Приветствие по времени суток
  const getGreeting = () => {
    if (hours >= 6 && hours < 12) return 'Доброе утро';
    if (hours >= 12 && hours < 18) return 'Добрый день';
    if (hours >= 18 && hours < 23) return 'Добрый вечер';
    return 'Доброй ночи';
  };

  // Цвета фона по времени суток (как Samsung Weather)
  const getBackgroundGradient = () => {
    if (hours >= 6 && hours < 12) {
      // Утро: нежный голубой
      return 'from-sky-100 via-blue-50 to-indigo-100';
    }
    if (hours >= 12 && hours < 18) {
      // День: светлый голубой
      return 'from-blue-100 via-sky-50 to-cyan-100';
    }
    if (hours >= 18 && hours < 23) {
      // Вечер: теплый закат
      return 'from-orange-100 via-pink-100 to-purple-200';
    }
    // Ночь: темный синий
    return 'from-slate-800 via-blue-900 to-indigo-900';
  };

  const isNight = hours >= 23 || hours < 6;
  const textColor = isNight ? 'text-white' : 'text-gray-800';
  const textSecondary = isNight ? 'text-white/70' : 'text-gray-600';

  return (
    <main className="min-h-screen w-full overflow-hidden">
      {/* HERO SECTION - Samsung Weather Style */}
      <section className={`relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br ${getBackgroundGradient()} transition-colors duration-1000`}>
        
        {/* Weather Animation */}
        {weather.condition === 'snow' && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-snow"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `-${Math.random() * 20}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${5 + Math.random() * 5}s`
                }}
              >
                <CloudSnow className="w-3 h-3 text-white/60" />
              </div>
            ))}
          </div>
        )}

        {weather.condition === 'wind' && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-wind"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `-10%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              >
                <Wind className="w-6 h-6 text-gray-400/40" />
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="relative z-10 w-full text-center">
          {/* Приветствие */}
          <div className="mb-4">
            <p className={`text-2xl md:text-3xl font-light ${textSecondary}`}>
              {getGreeting()}, Камчатка
            </p>
          </div>

          {/* Time Display - ИЗЯЩНЫЙ */}
          <div className="mb-8">
            <div className={`text-[12rem] md:text-[16rem] font-extralight ${textColor} tracking-tighter leading-none`}>
              {hoursStr}<span className="text-gray-400">:</span>{minutes}
            </div>
            <div className={`text-lg md:text-xl font-light ${textSecondary} mt-2`}>
              {currentTime.toLocaleDateString('ru-RU', { 
                weekday: 'long', 
                day: 'numeric',
                month: 'long'
              })}
            </div>
          </div>

          {/* Weather Card - МИНИМАЛИСТИЧНАЯ */}
          <div className="inline-flex items-center gap-8 px-10 py-6 bg-white/40 backdrop-blur-3xl rounded-full border border-white/30 mb-12 shadow-xl">
            <div className="flex items-center gap-4">
              <ThermometerSun className={`w-8 h-8 ${textColor}`} />
              <div className="text-left">
                <div className={`text-5xl font-extralight ${textColor}`}>{weather.temp}°</div>
              </div>
            </div>
            <div className="w-px h-12 bg-gray-300/50"></div>
            <div className="flex items-center gap-6 text-left">
              <div className="flex items-center gap-2">
                <Wind className={`w-5 h-5 ${textSecondary}`} />
                <span className={`text-lg font-light ${textSecondary}`}>{weather.wind} м/с</span>
              </div>
              <div className="flex items-center gap-2">
                <Droplets className={`w-5 h-5 ${textSecondary}`} />
                <span className={`text-lg font-light ${textSecondary}`}>{weather.humidity}%</span>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className={`flex items-center justify-center gap-2 ${textSecondary} text-lg mb-16 font-light`}>
            <MapPin className="w-5 h-5" />
            <span>Петропавловск-Камчатский</span>
          </div>

          {/* Title - ИЗЯЩНЫЙ */}
          <h1 className={`text-5xl md:text-7xl font-extralight ${textColor} mb-4 tracking-tight`}>
            Kamchatour Hub
          </h1>
          <p className={`text-xl md:text-2xl font-light ${textSecondary} mb-16`}>
            Экосистема туризма Камчатки
          </p>

          {/* CTA Buttons - МИНИМАЛИСТИЧНЫЕ */}
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="/hub/tourist" className="group flex items-center gap-3 px-8 py-4 bg-white/50 backdrop-blur-xl text-gray-800 rounded-full font-light text-lg hover:bg-white/70 transition-all hover:scale-105 shadow-lg border border-white/50">
              <Users className="w-5 h-5" />
              Я турист
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <a href="/hub/operator" className="group flex items-center gap-3 px-8 py-4 bg-gray-800/50 backdrop-blur-xl text-white rounded-full font-light text-lg border border-gray-700/50 hover:bg-gray-800/70 transition-all hover:scale-105 shadow-lg">
              <Briefcase className="w-5 h-5" />
              Я бизнес
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          {/* Scroll Indicator */}
          <div className="mt-24 animate-bounce">
            <div className={`w-6 h-10 border-2 ${isNight ? 'border-white/40' : 'border-gray-400/40'} rounded-full flex items-start justify-center p-2 mx-auto`}>
              <div className={`w-1 h-2 ${isNight ? 'bg-white/60' : 'bg-gray-600/60'} rounded-full animate-scroll`}></div>
            </div>
          </div>
        </div>
      </section>

      {/* ROLES SECTION */}
      <section className="w-full bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="w-full py-20 md:py-28">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-extralight mb-4 text-gray-800">
              Экосистема для каждого
            </h2>
            <p className="text-xl font-light text-gray-600">
              Выберите свою роль и начните зарабатывать уже сегодня
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-0">
            {/* Tourist */}
            <div className="group relative bg-white/60 backdrop-blur-3xl p-12 border border-white/40 hover:bg-white/80 hover:backdrop-blur-[100px] transition-all duration-700 shadow-lg hover:shadow-2xl">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-400/80 to-cyan-400/80 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-xl">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-light mb-3 text-gray-800">Турист</h3>
                <p className="text-gray-500 mb-6 font-light">Открой Камчатку</p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 font-light text-sm">234+ актуальных тура</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 font-light text-sm">Прогноз погоды на 14 дней</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 font-light text-sm">SOS безопасность 24/7</span>
                  </li>
                </ul>
                <a href="/hub/tourist" className="inline-flex items-center gap-2 text-blue-600 font-light group-hover:gap-3 transition-all">
                  Начать путешествие
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Operator */}
            <div className="group relative bg-white/60 backdrop-blur-3xl p-12 border border-white/40 hover:bg-white/80 hover:backdrop-blur-[100px] transition-all duration-700 shadow-lg hover:shadow-2xl">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-400/80 to-pink-400/80 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-xl">
                  <Briefcase className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-light mb-3 text-gray-800">Туроператор</h3>
                <p className="text-gray-500 mb-6 font-light">Управляй профессионально</p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 font-light text-sm">CRM с аналитикой</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 font-light text-sm">+47% к доходам в среднем</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 font-light text-sm">Мгновенные бронирования</span>
                  </li>
                </ul>
                <a href="/hub/operator" className="inline-flex items-center gap-2 text-purple-600 font-light group-hover:gap-3 transition-all">
                  Начать зарабатывать
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Guide */}
            <div className="group relative bg-white/60 backdrop-blur-3xl p-12 border border-white/40 hover:bg-white/80 hover:backdrop-blur-[100px] transition-all duration-700 shadow-lg hover:shadow-2xl">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-green-400/80 to-emerald-400/80 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-xl">
                  <Compass className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-light mb-3 text-gray-800">Гид</h3>
                <p className="text-gray-500 mb-6 font-light">Твоё время - твои деньги</p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 font-light text-sm">Умный календарь</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 font-light text-sm">До 150к₽/месяц топ гиды</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 font-light text-sm">Система рейтингов</span>
                  </li>
                </ul>
                <a href="/hub/guide" className="inline-flex items-center gap-2 text-green-600 font-light group-hover:gap-3 transition-all">
                  Стать гидом
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Transfer */}
            <div className="group relative bg-white/60 backdrop-blur-3xl p-12 border border-white/40 hover:bg-white/80 hover:backdrop-blur-[100px] transition-all duration-700 shadow-lg hover:shadow-2xl">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-400/80 to-red-400/80 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-xl">
                  <Car className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-light mb-3 text-gray-800">Трансфер</h3>
                <p className="text-gray-500 mb-6 font-light">Логистика нового уровня</p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 font-light text-sm">Умная маршрутизация</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 font-light text-sm">95% загрузка транспорта</span>
                  </li>
                </ul>
                <a href="/hub/transfer" className="inline-flex items-center gap-2 text-orange-600 font-light group-hover:gap-3 transition-all">
                  Подключить транспорт
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Stay */}
            <div className="group relative bg-white/60 backdrop-blur-3xl p-12 border border-white/40 hover:bg-white/80 hover:backdrop-blur-[100px] transition-all duration-700 shadow-lg hover:shadow-2xl">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-400/80 to-blue-400/80 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-xl">
                  <Home className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-light mb-3 text-gray-800">Размещение</h3>
                <p className="text-gray-500 mb-6 font-light">Гостиницы и отели</p>
                <a href="/hub/stay" className="inline-flex items-center gap-2 text-indigo-600 font-light group-hover:gap-3 transition-all">
                  Подробнее
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Souvenirs */}
            <div className="group relative bg-white/60 backdrop-blur-3xl p-12 border border-white/40 hover:bg-white/80 hover:backdrop-blur-[100px] transition-all duration-700 shadow-lg hover:shadow-2xl">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-pink-400/80 to-rose-400/80 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-xl">
                  <ShoppingBag className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-light mb-3 text-gray-800">Сувениры</h3>
                <p className="text-gray-500 mb-6 font-light">Магазины и мастера</p>
                <a href="/hub/souvenirs" className="inline-flex items-center gap-2 text-pink-600 font-light group-hover:gap-3 transition-all">
                  Подробнее
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="w-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="w-full py-20 md:py-28">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-extralight mb-4 text-gray-800">
              Уникальные возможности
            </h2>
            <p className="text-xl font-light text-gray-600">
              Технологии, которые делают путешествия лучше
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-0">
            <div className="bg-white/50 backdrop-blur-[80px] p-10 border border-white/30 hover:bg-white/70 hover:backdrop-blur-[100px] transition-all duration-700 shadow-lg hover:shadow-2xl">
              <ThermometerSun className="w-12 h-12 text-blue-500 mb-6" />
              <h3 className="text-2xl font-light text-gray-800 mb-4">Метеослужба</h3>
              <p className="text-gray-600 font-light mb-6 text-sm">
                Прогноз погоды на 14 дней
              </p>
              <a href="/hub/tourist" className="inline-flex items-center gap-2 text-blue-600 font-light hover:gap-3 transition-all text-sm">
                Подробнее
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            <div className="bg-white/50 backdrop-blur-[80px] p-10 border border-white/30 hover:bg-white/70 hover:backdrop-blur-[100px] transition-all duration-700 shadow-lg hover:shadow-2xl">
              <Shield className="w-12 h-12 text-red-500 mb-6" />
              <h3 className="text-2xl font-light text-gray-800 mb-4">Безопасность 24/7</h3>
              <p className="text-gray-600 font-light mb-6 text-sm">
                SOS с геолокацией
              </p>
              <a href="/hub/safety" className="inline-flex items-center gap-2 text-red-600 font-light hover:gap-3 transition-all text-sm">
                Подробнее
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            <div className="bg-white/50 backdrop-blur-[80px] p-10 border border-white/30 hover:bg-white/70 hover:backdrop-blur-[100px] transition-all duration-700 shadow-lg hover:shadow-2xl">
              <Leaf className="w-12 h-12 text-green-500 mb-6" />
              <h3 className="text-2xl font-light text-gray-800 mb-4">Eco-Points</h3>
              <p className="text-gray-600 font-light mb-6 text-sm">
                Зарабатывай баллы
              </p>
              <a href="/hub/tourist" className="inline-flex items-center gap-2 text-green-600 font-light hover:gap-3 transition-all text-sm">
                Подробнее
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            <div className="bg-white/50 backdrop-blur-[80px] p-10 border border-white/30 hover:bg-white/70 hover:backdrop-blur-[100px] transition-all duration-700 shadow-lg hover:shadow-2xl">
              <BarChart3 className="w-12 h-12 text-purple-500 mb-6" />
              <h3 className="text-2xl font-light text-gray-800 mb-4">Аналитика</h3>
              <p className="text-gray-600 font-light mb-6 text-sm">
                Детальная статистика
              </p>
              <a href="/hub/operator" className="inline-flex items-center gap-2 text-purple-600 font-light hover:gap-3 transition-all text-sm">
                Подробнее
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className={`w-full bg-gradient-to-br ${getBackgroundGradient()} transition-colors duration-1000`}>
        <div className="w-full py-20 md:py-28 text-center">
          <Target className={`w-16 h-16 mx-auto mb-8 ${isNight ? 'text-white/80' : 'text-gray-700'}`} />
          <h2 className={`text-4xl md:text-6xl font-extralight ${textColor} mb-8`}>
            Готовы начать?
          </h2>
          <p className={`text-xl font-light ${textSecondary} mb-16 max-w-2xl mx-auto`}>
            Присоединяйтесь к экосистеме туризма Камчатки уже сегодня
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="/hub/tourist" className="flex items-center gap-3 px-10 py-4 bg-white/50 backdrop-blur-xl text-gray-800 rounded-full font-light text-lg hover:bg-white/70 transition-all hover:scale-105 shadow-lg border border-white/50">
              <Users className="w-6 h-6" />
              Искать туры
            </a>
            <a href="/hub/operator" className="flex items-center gap-3 px-10 py-4 bg-gray-800/50 backdrop-blur-xl text-white rounded-full font-light text-lg border border-gray-700/50 hover:bg-gray-800/70 transition-all hover:scale-105 shadow-lg">
              <Briefcase className="w-6 h-6" />
              Открыть CRM
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
