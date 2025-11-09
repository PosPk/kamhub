'use client';

import React, { useState, useEffect } from 'react';
import { 
  Cloud, Sun, Wind, Droplets, ThermometerSun,
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
    condition: 'Облачно',
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
        <div className="text-2xl text-white/70">Загрузка...</div>
      </div>
    );
  }

  const hours = currentTime.getHours().toString().padStart(2, '0');
  const minutes = currentTime.getMinutes().toString().padStart(2, '0');

  return (
    <main className="min-h-screen w-full overflow-hidden">
      {/* HERO SECTION - Samsung Weather Style */}
      <section className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 animate-gradient"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 animate-float">
            <Cloud className="w-16 h-16 text-white/20" />
          </div>
          <div className="absolute top-40 right-20 animate-float-delayed">
            <Cloud className="w-12 h-12 text-white/15" />
          </div>
          <div className="absolute bottom-32 left-1/4 animate-float">
            <Mountain className="w-20 h-20 text-white/10" />
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 w-full px-6 md:px-12 lg:px-20 text-center">
          {/* Time Display */}
          <div className="mb-8">
            <div className="text-8xl md:text-9xl font-black text-white tracking-tight">
              {hours}:{minutes}
            </div>
            <div className="text-xl md:text-2xl text-white/80 mt-2">
              {currentTime.toLocaleDateString('ru-RU', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>

          {/* Weather Card */}
          <div className="inline-flex items-center gap-6 px-12 py-8 bg-white/10 backdrop-blur-2xl rounded-[3rem] border border-white/20 mb-12 shadow-2xl">
            <ThermometerSun className="w-16 h-16 text-white" />
            <div className="text-left">
              <div className="text-6xl font-black text-white">{weather.temp}°</div>
              <div className="text-xl text-white/80">{weather.condition}</div>
            </div>
            <div className="w-px h-16 bg-white/20"></div>
            <div className="text-left space-y-2">
              <div className="flex items-center gap-2 text-white/80">
                <Wind className="w-5 h-5" />
                <span>{weather.wind} м/с</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Droplets className="w-5 h-5" />
                <span>{weather.humidity}%</span>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center justify-center gap-2 text-white/90 text-xl mb-12">
            <MapPin className="w-6 h-6" />
            <span className="font-medium">Петропавловск-Камчатский</span>
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
            KAMCHATOUR HUB
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-16">
            Экосистема туризма Камчатки
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-6 justify-center">
            <a href="/hub/tourist" className="group flex items-center gap-3 px-10 py-5 bg-white text-purple-600 rounded-3xl font-bold text-lg hover:bg-white/90 transition-all hover:scale-105 shadow-2xl">
              <Users className="w-6 h-6" />
              Я турист
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a href="/hub/operator" className="group flex items-center gap-3 px-10 py-5 bg-white/20 backdrop-blur-xl text-white rounded-3xl font-bold text-lg border-2 border-white/30 hover:bg-white/30 transition-all hover:scale-105 shadow-2xl">
              <Briefcase className="w-6 h-6" />
              Я бизнес
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          {/* Scroll Indicator */}
          <div className="mt-20 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
              <div className="w-1 h-2 bg-white/70 rounded-full animate-scroll"></div>
            </div>
          </div>
        </div>
      </section>

      {/* ROLES SECTION - Full Width */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-gray-50 via-white to-gray-50 w-full">
        <div className="w-full px-6 md:px-12 lg:px-20">
          <div className="text-center mb-16 md:mb-24">
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Экосистема для каждого
            </h2>
            <p className="text-xl md:text-2xl text-gray-600">
              Выберите свою роль и начните зарабатывать уже сегодня
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Tourist */}
            <div className="group relative bg-white rounded-[2.5rem] p-10 shadow-xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-4 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-bl-[3rem] blur-2xl"></div>
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-lg">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl font-black mb-4">Турист</h3>
                <p className="text-gray-600 mb-6 text-lg">Открой Камчатку</p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">234+ актуальных тура</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Прогноз погоды на 14 дней</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">SOS безопасность 24/7</span>
                  </li>
                </ul>
                <a href="/hub/tourist" className="inline-flex items-center gap-2 text-blue-600 font-bold text-lg group-hover:gap-4 transition-all">
                  Начать путешествие
                  <ArrowRight className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Operator */}
            <div className="group relative bg-white rounded-[2.5rem] p-10 shadow-xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-4 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-bl-[3rem] blur-2xl"></div>
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-lg">
                  <Briefcase className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl font-black mb-4">Туроператор</h3>
                <p className="text-gray-600 mb-6 text-lg">Управляй профессионально</p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">CRM с аналитикой</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">+47% к доходам в среднем</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Мгновенные бронирования</span>
                  </li>
                </ul>
                <a href="/hub/operator" className="inline-flex items-center gap-2 text-purple-600 font-bold text-lg group-hover:gap-4 transition-all">
                  Начать зарабатывать
                  <ArrowRight className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Guide */}
            <div className="group relative bg-white rounded-[2.5rem] p-10 shadow-xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-4 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-bl-[3rem] blur-2xl"></div>
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-lg">
                  <Compass className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl font-black mb-4">Гид</h3>
                <p className="text-gray-600 mb-6 text-lg">Твоё время - твои деньги</p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Умный календарь</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">До 150к₽/месяц топ гиды</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Система рейтингов</span>
                  </li>
                </ul>
                <a href="/hub/guide" className="inline-flex items-center gap-2 text-green-600 font-bold text-lg group-hover:gap-4 transition-all">
                  Стать гидом
                  <ArrowRight className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Transfer */}
            <div className="group relative bg-white rounded-[2.5rem] p-10 shadow-xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-4 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-bl-[3rem] blur-2xl"></div>
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-lg">
                  <Car className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl font-black mb-4">Трансфер</h3>
                <p className="text-gray-600 mb-6 text-lg">Логистика нового уровня</p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Умная маршрутизация</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">95% загрузка транспорта</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Авто-платежи</span>
                  </li>
                </ul>
                <a href="/hub/transfer" className="inline-flex items-center gap-2 text-orange-600 font-bold text-lg group-hover:gap-4 transition-all">
                  Подключить транспорт
                  <ArrowRight className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Stay */}
            <div className="group relative bg-white rounded-[2.5rem] p-10 shadow-xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-4 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/20 to-blue-500/20 rounded-bl-[3rem] blur-2xl"></div>
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-lg">
                  <Home className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl font-black mb-4">Размещение</h3>
                <p className="text-gray-600 mb-6 text-lg">Гостиницы и отели</p>
                <a href="/hub/stay" className="inline-flex items-center gap-2 text-indigo-600 font-bold text-lg group-hover:gap-4 transition-all">
                  Подробнее
                  <ArrowRight className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Souvenirs */}
            <div className="group relative bg-white rounded-[2.5rem] p-10 shadow-xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-4 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-bl-[3rem] blur-2xl"></div>
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-rose-500 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-lg">
                  <ShoppingBag className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl font-black mb-4">Сувениры</h3>
                <p className="text-gray-600 mb-6 text-lg">Магазины и мастера</p>
                <a href="/hub/souvenirs" className="inline-flex items-center gap-2 text-pink-600 font-bold text-lg group-hover:gap-4 transition-all">
                  Подробнее
                  <ArrowRight className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION - Full Width with Gradient */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 w-full relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        
        <div className="relative z-10 w-full px-6 md:px-12 lg:px-20">
          <div className="text-center mb-16 md:mb-24">
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6">
              Уникальные возможности
            </h2>
            <p className="text-xl md:text-2xl text-white/90">
              Технологии, которые делают путешествия лучше
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Weather */}
            <div className="bg-white/10 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-white/20 hover:bg-white/20 transition-all duration-500 hover:scale-105">
              <ThermometerSun className="w-16 h-16 text-white mb-6" />
              <h3 className="text-2xl font-black text-white mb-4">Метеослужба</h3>
              <p className="text-white/80 mb-6">
                Прогноз погоды на 14 дней с учетом вулканической активности
              </p>
              <a href="/hub/tourist" className="inline-flex items-center gap-2 text-white font-bold hover:gap-4 transition-all">
                Подробнее
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>

            {/* Safety */}
            <div className="bg-white/10 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-white/20 hover:bg-white/20 transition-all duration-500 hover:scale-105">
              <Shield className="w-16 h-16 text-white mb-6" />
              <h3 className="text-2xl font-black text-white mb-4">Безопасность 24/7</h3>
              <p className="text-white/80 mb-6">
                SOS с геолокацией и прямая связь с МЧС
              </p>
              <a href="/hub/safety" className="inline-flex items-center gap-2 text-white font-bold hover:gap-4 transition-all">
                Подробнее
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>

            {/* Eco */}
            <div className="bg-white/10 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-white/20 hover:bg-white/20 transition-all duration-500 hover:scale-105">
              <Leaf className="w-16 h-16 text-white mb-6" />
              <h3 className="text-2xl font-black text-white mb-4">Eco-Points</h3>
              <p className="text-white/80 mb-6">
                Зарабатывай баллы, заботясь о природе Камчатки
              </p>
              <a href="/hub/tourist" className="inline-flex items-center gap-2 text-white font-bold hover:gap-4 transition-all">
                Подробнее
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>

            {/* Analytics */}
            <div className="bg-white/10 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-white/20 hover:bg-white/20 transition-all duration-500 hover:scale-105">
              <BarChart3 className="w-16 h-16 text-white mb-6" />
              <h3 className="text-2xl font-black text-white mb-4">Аналитика</h3>
              <p className="text-white/80 mb-6">
                Детальная статистика и отчеты для бизнеса
              </p>
              <a href="/hub/operator" className="inline-flex items-center gap-2 text-white font-bold hover:gap-4 transition-all">
                Подробнее
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA - Full Width */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 w-full relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        
        <div className="relative z-10 w-full px-6 md:px-12 lg:px-20 text-center">
          <Target className="w-20 h-20 mx-auto mb-8 text-yellow-300" />
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-8">
            Готовы начать?
          </h2>
          <p className="text-xl md:text-2xl text-white/90 mb-16 max-w-3xl mx-auto">
            Присоединяйтесь к экосистеме туризма Камчатки уже сегодня
          </p>
          
          <div className="flex flex-wrap gap-6 justify-center">
            <a href="/hub/tourist" className="flex items-center gap-3 px-12 py-6 bg-white text-purple-600 rounded-3xl font-black text-xl hover:bg-white/90 transition-all hover:scale-105 shadow-2xl">
              <Users className="w-7 h-7" />
              Искать туры
            </a>
            <a href="/hub/operator" className="flex items-center gap-3 px-12 py-6 bg-white/20 backdrop-blur-xl text-white rounded-3xl font-black text-xl border-2 border-white/30 hover:bg-white/30 transition-all hover:scale-105 shadow-2xl">
              <Briefcase className="w-7 h-7" />
              Открыть CRM
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
