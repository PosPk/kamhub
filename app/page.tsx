'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Cloud, Sun, Wind, Droplets, ThermometerSun, Moon, CloudSnow,
  Mountain, Users, Compass, Car, Briefcase, Shield,
  TrendingUp, Star, Award, Leaf, BarChart3,
  Phone, AlertTriangle, MapPin, Check, ArrowRight,
  Home, ShoppingBag, Calendar, DollarSign, Target,
  Activity, Zap, Heart, Search, CloudRain, Stars
} from 'lucide-react';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState({
    temp: 8,
    condition: 'clear', // 'snow', 'wind', 'rain', 'clear', 'clouds'
    wind: 12,
    humidity: 78,
    feels_like: 5,
    description: 'ясно'
  });

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // Загрузка реальной погоды
    const fetchWeather = async () => {
      try {
        const res = await fetch('/api/weather?city=Petropavlovsk-Kamchatsky');
        if (res.ok) {
          const data = await res.json();
          setWeather({
            temp: Math.round(data.temp),
            condition: data.condition,
            wind: Math.round(data.wind_speed),
            humidity: data.humidity,
            feels_like: Math.round(data.feels_like),
            description: data.description
          });
        }
      } catch (error) {
        console.error('Weather fetch error:', error);
      }
    };
    
    fetchWeather();
    // Обновляем погоду каждые 5 минут
    const weatherTimer = setInterval(fetchWeather, 5 * 60 * 1000);
    
    return () => {
      clearInterval(timer);
      clearInterval(weatherTimer);
    };
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
      <section className={`relative min-h-screen w-full flex flex-col overflow-hidden bg-gradient-to-br ${getBackgroundGradient()} transition-colors duration-1000`}>
        
        {/* Weather Animation */}
        {/* Stars Animation for Clear Weather */}
        {(weather.condition === 'clear' && isNight) && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(100)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 3}s`
                }}
              >
                <div className="w-1 h-1 bg-white/80 rounded-full" />
              </div>
            ))}
          </div>
        )}

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

        {weather.condition === 'rain' && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(100)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-snow"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `-${Math.random() * 20}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random() * 2}s`
                }}
              >
                <div className="w-0.5 h-4 bg-blue-400/40" />
              </div>
            ))}
          </div>
        )}

        {(weather.condition === 'clouds' || weather.condition === 'wind') && (
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

        {/* Top Bar - Logo and Time/Account */}
        <div className="relative z-20 w-full flex items-center justify-between px-4 py-2">
          {/* Logo Left */}
          <Link href="/" className="flex items-center gap-1.5 group">
            <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform shadow-lg">
              K
            </div>
            <div className="text-white hidden sm:block">
              <div className="font-light text-xs">Kamchatour Hub</div>
            </div>
          </Link>
          
          {/* Time and Account Right */}
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="text-lg font-extralight text-white tracking-tight">
                {hoursStr}:{minutes}
              </div>
            </div>
            <Link href="/auth/login" className="px-3 py-1 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full text-white text-xs font-light hover:bg-white/30 transition-all shadow-lg">
              Вход
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 w-full text-center flex-1 flex flex-col items-center justify-center px-4">
          {/* Приветствие */}
          <div className="mb-4">
            <p className="text-xl md:text-2xl font-light text-white/90">
              {getGreeting()}, Камчатка
            </p>
          </div>

          {/* Smart Search Bar */}
          <div className="w-full max-w-2xl mb-6">
            <div className="relative group">
              <input
                type="text"
                placeholder="Найдите идеальный тур: вулканы, рыбалка, сёрфинг..."
                className="w-full px-5 py-2.5 pl-11 bg-white/40 backdrop-blur-3xl border border-white/40 rounded-full text-white placeholder-white/60 font-light text-sm focus:bg-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all shadow-xl"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70" />
              <button className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-white/80 hover:bg-white text-gray-800 rounded-full text-xs font-medium transition-all shadow-lg">
                Найти
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5 justify-center">
              <button className="px-2.5 py-0.5 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full text-white/80 text-xs font-light hover:bg-white/30 transition-all">
                🌋 Вулканы
              </button>
              <button className="px-2.5 py-0.5 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full text-white/80 text-xs font-light hover:bg-white/30 transition-all">
                🎣 Рыбалка
              </button>
              <button className="px-2.5 py-0.5 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full text-white/80 text-xs font-light hover:bg-white/30 transition-all">
                🏄 Сёрфинг
              </button>
              <button className="px-2.5 py-0.5 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full text-white/80 text-xs font-light hover:bg-white/30 transition-all">
                🐻 Дикая природа
              </button>
              <button className="px-2.5 py-0.5 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full text-white/80 text-xs font-light hover:bg-white/30 transition-all">
                ♨️ Термальные источники
              </button>
            </div>
          </div>

          {/* Weather Card - МИНИМАЛИСТИЧНАЯ */}
          <div className="inline-flex items-center gap-3 px-5 py-2 bg-white/30 backdrop-blur-3xl rounded-full border border-white/30 mb-3 shadow-xl">
            <div className="flex items-center gap-2">
              <ThermometerSun className="w-5 h-5 text-white" />
              <div className="text-left">
                <div className="text-2xl font-extralight text-white">{weather.temp}°</div>
              </div>
            </div>
            <div className="w-px h-6 bg-white/30"></div>
            <div className="flex items-center gap-3 text-left">
              <div className="flex items-center gap-1">
                <Wind className="w-3.5 h-3.5 text-white/80" />
                <span className="text-xs font-light text-white/80">{weather.wind} м/с</span>
              </div>
              <div className="flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-white/80" />
                <span className="text-xs font-light text-white/80">{weather.humidity}%</span>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center justify-center gap-1 text-white/80 text-xs mb-6 font-light">
            <MapPin className="w-3.5 h-3.5" />
            <span>Петропавловск-Камчатский</span>
          </div>

          {/* Title - ИЗЯЩНЫЙ */}
          <h1 className="text-3xl md:text-5xl font-extralight text-white mb-2 tracking-tight">
            Kamchatour Hub
          </h1>
          <p className="text-sm md:text-base font-light text-white/80 mb-6">
            Экосистема туризма Камчатки
          </p>

          {/* CTA Buttons - МИНИМАЛИСТИЧНЫЕ */}
          <div className="flex flex-wrap gap-2 justify-center">
            <Link href="/hub/tourist" className="group flex items-center gap-1.5 px-4 py-1.5 bg-white/50 backdrop-blur-xl text-gray-800 rounded-full font-light text-xs hover:bg-white/70 transition-all hover:scale-105 shadow-lg border border-white/50">
              <Users className="w-3 h-3" />
              Я турист
              <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/hub/operator" className="group flex items-center gap-1.5 px-4 py-1.5 bg-gray-800/50 backdrop-blur-xl text-white rounded-full font-light text-xs border border-gray-700/50 hover:bg-gray-800/70 transition-all hover:scale-105 shadow-lg">
              <Briefcase className="w-3 h-3" />
              Я бизнес
              <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Scroll Indicator */}
          <div className="mt-12 animate-bounce">
            <div className={`w-5 h-8 border-2 ${isNight ? 'border-white/40' : 'border-gray-400/40'} rounded-full flex items-start justify-center p-1.5 mx-auto`}>
              <div className={`w-1 h-1.5 ${isNight ? 'bg-white/60' : 'bg-gray-600/60'} rounded-full animate-scroll`}></div>
            </div>
          </div>
        </div>
      </section>

      {/* ROLES SECTION */}
      <section className="w-full bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50">
        <div className="w-full py-8 md:py-10">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-4xl font-extralight mb-2 text-gray-800">
              Экосистема для каждого
            </h2>
            <p className="text-sm font-light text-gray-600">
              Выберите свою роль и начните зарабатывать
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-0">
            {/* Tourist */}
            <div className="group relative bg-white/60 backdrop-blur-3xl p-6 border border-white/40 hover:bg-white/80 hover:backdrop-blur-[100px] transition-all duration-700 shadow-lg hover:shadow-2xl">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400/80 to-cyan-400/80 backdrop-blur-xl rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500 shadow-xl">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-light mb-2 text-gray-800">Турист</h3>
                <p className="text-gray-500 mb-4 font-light text-sm">Открой Камчатку</p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 font-light text-xs">234+ актуальных тура</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 font-light text-xs">Прогноз погоды на 14 дней</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 font-light text-xs">SOS безопасность 24/7</span>
                  </li>
                </ul>
                <Link href="/hub/tourist" className="inline-flex items-center gap-1.5 text-blue-600 text-sm font-light group-hover:gap-2 transition-all">
                  Начать путешествие
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Operator */}
            <div className="group relative bg-white/60 backdrop-blur-3xl p-6 border border-white/40 hover:bg-white/80 hover:backdrop-blur-[100px] transition-all duration-700 shadow-lg hover:shadow-2xl">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400/80 to-pink-400/80 backdrop-blur-xl rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500 shadow-xl">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-light mb-2 text-gray-800">Туроператор</h3>
                <p className="text-gray-500 mb-4 font-light text-sm">Управляй профессионально</p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 font-light text-xs">CRM с аналитикой</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 font-light text-xs">+47% к доходам в среднем</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 font-light text-xs">Мгновенные бронирования</span>
                  </li>
                </ul>
                <Link href="/hub/operator" className="inline-flex items-center gap-1.5 text-purple-600 text-sm font-light group-hover:gap-2 transition-all">
                  Начать зарабатывать
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Guide */}
            <div className="group relative bg-white/60 backdrop-blur-3xl p-6 border border-white/40 hover:bg-white/80 hover:backdrop-blur-[100px] transition-all duration-700 shadow-lg hover:shadow-2xl">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400/80 to-emerald-400/80 backdrop-blur-xl rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500 shadow-xl">
                  <Compass className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-light mb-2 text-gray-800">Гид</h3>
                <p className="text-gray-500 mb-4 font-light text-sm">Твоё время - твои деньги</p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 font-light text-xs">Умный календарь</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 font-light text-xs">До 150к₽/месяц топ гиды</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 font-light text-xs">Система рейтингов</span>
                  </li>
                </ul>
                <Link href="/hub/guide" className="inline-flex items-center gap-1.5 text-green-600 text-sm font-light group-hover:gap-2 transition-all">
                  Стать гидом
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Transfer */}
            <div className="group relative bg-white/60 backdrop-blur-3xl p-6 border border-white/40 hover:bg-white/80 hover:backdrop-blur-[100px] transition-all duration-700 shadow-lg hover:shadow-2xl">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400/80 to-red-400/80 backdrop-blur-xl rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500 shadow-xl">
                  <Car className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-light mb-2 text-gray-800">Трансфер</h3>
                <p className="text-gray-500 mb-4 font-light text-sm">Логистика нового уровня</p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 font-light text-xs">Умная маршрутизация</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 font-light text-xs">95% загрузка транспорта</span>
                  </li>
                </ul>
                <Link href="/hub/transfer" className="inline-flex items-center gap-1.5 text-orange-600 text-sm font-light group-hover:gap-2 transition-all">
                  Подключить транспорт
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Stay */}
            <div className="group relative bg-white/60 backdrop-blur-3xl p-6 border border-white/40 hover:bg-white/80 hover:backdrop-blur-[100px] transition-all duration-700 shadow-lg hover:shadow-2xl">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-400/80 to-blue-400/80 backdrop-blur-xl rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500 shadow-xl">
                  <Home className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-light mb-2 text-gray-800">Размещение</h3>
                <p className="text-gray-500 mb-4 font-light text-sm">Гостиницы и отели</p>
                <Link href="/hub/stay" className="inline-flex items-center gap-1.5 text-indigo-600 text-sm font-light group-hover:gap-2 transition-all">
                  Подробнее
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Souvenirs */}
            <div className="group relative bg-white/60 backdrop-blur-3xl p-6 border border-white/40 hover:bg-white/80 hover:backdrop-blur-[100px] transition-all duration-700 shadow-lg hover:shadow-2xl">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-400/80 to-rose-400/80 backdrop-blur-xl rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500 shadow-xl">
                  <ShoppingBag className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-light mb-2 text-gray-800">Сувениры</h3>
                <p className="text-gray-500 mb-4 font-light text-sm">Магазины и мастера</p>
                <Link href="/hub/souvenirs" className="inline-flex items-center gap-1.5 text-pink-600 text-sm font-light group-hover:gap-2 transition-all">
                  Подробнее
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="w-full bg-gradient-to-br from-green-50/40 via-emerald-50/30 to-teal-50/40">
        <div className="w-full py-8 md:py-10">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-4xl font-extralight mb-2 text-gray-800">
              Уникальные возможности
            </h2>
            <p className="text-sm font-light text-gray-600">
              Технологии, которые делают путешествия лучше
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-0">
            <div className="bg-white/50 backdrop-blur-[80px] p-6 border border-white/30 hover:bg-white/70 hover:backdrop-blur-[100px] transition-all duration-700 shadow-lg hover:shadow-2xl">
              <ThermometerSun className="w-10 h-10 text-blue-500 mb-4" />
              <h3 className="text-lg font-light text-gray-800 mb-3">Метеослужба</h3>
              <p className="text-gray-600 font-light mb-4 text-xs">
                Прогноз погоды на 14 дней
              </p>
              <Link href="/hub/tourist" className="inline-flex items-center gap-1.5 text-blue-600 text-xs font-light hover:gap-2 transition-all">
                Подробнее
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="bg-white/50 backdrop-blur-[80px] p-6 border border-white/30 hover:bg-white/70 hover:backdrop-blur-[100px] transition-all duration-700 shadow-lg hover:shadow-2xl">
              <Shield className="w-10 h-10 text-red-500 mb-4" />
              <h3 className="text-lg font-light text-gray-800 mb-3">Безопасность 24/7</h3>
              <p className="text-gray-600 font-light mb-4 text-xs">
                SOS с геолокацией
              </p>
              <Link href="/hub/safety" className="inline-flex items-center gap-1.5 text-red-600 text-xs font-light hover:gap-2 transition-all">
                Подробнее
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="bg-white/50 backdrop-blur-[80px] p-6 border border-white/30 hover:bg-white/70 hover:backdrop-blur-[100px] transition-all duration-700 shadow-lg hover:shadow-2xl">
              <Leaf className="w-10 h-10 text-green-500 mb-4" />
              <h3 className="text-lg font-light text-gray-800 mb-3">Eco-Points</h3>
              <p className="text-gray-600 font-light mb-4 text-xs">
                Зарабатывай баллы
              </p>
              <Link href="/hub/tourist" className="inline-flex items-center gap-1.5 text-green-600 text-xs font-light hover:gap-2 transition-all">
                Подробнее
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="bg-white/50 backdrop-blur-[80px] p-6 border border-white/30 hover:bg-white/70 hover:backdrop-blur-[100px] transition-all duration-700 shadow-lg hover:shadow-2xl">
              <BarChart3 className="w-10 h-10 text-purple-500 mb-4" />
              <h3 className="text-lg font-light text-gray-800 mb-3">Аналитика</h3>
              <p className="text-gray-600 font-light mb-4 text-xs">
                Детальная статистика
              </p>
              <Link href="/hub/operator" className="inline-flex items-center gap-1.5 text-purple-600 text-xs font-light hover:gap-2 transition-all">
                Подробнее
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className={`w-full bg-gradient-to-br ${getBackgroundGradient()} transition-colors duration-1000`}>
        <div className="w-full py-12 md:py-16 text-center">
          <Target className={`w-12 h-12 mx-auto mb-6 ${isNight ? 'text-white/80' : 'text-gray-700'}`} />
          <h2 className={`text-2xl md:text-4xl font-extralight ${textColor} mb-6`}>
            Готовы начать?
          </h2>
          <p className={`text-base font-light ${textSecondary} mb-10 max-w-2xl mx-auto px-4`}>
            Присоединяйтесь к экосистеме туризма Камчатки уже сегодня
          </p>
          
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/hub/tourist" className="flex items-center gap-2 px-6 py-2.5 bg-white/50 backdrop-blur-xl text-gray-800 rounded-full font-light text-sm hover:bg-white/70 transition-all hover:scale-105 shadow-lg border border-white/50">
              <Users className="w-4 h-4" />
              Искать туры
            </Link>
            <Link href="/hub/operator" className="flex items-center gap-2 px-6 py-2.5 bg-gray-800/50 backdrop-blur-xl text-white rounded-full font-light text-sm border border-gray-700/50 hover:bg-gray-800/70 transition-all hover:scale-105 shadow-lg">
              <Briefcase className="w-4 h-4" />
              Открыть CRM
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
