'use client';

import React, { useState, useEffect } from 'react';
import { 
  Mountain, Users, MapPin, Car, Briefcase, Shield, 
  TrendingUp, Award, Clock, Star, ChevronRight,
  Leaf, Compass, Heart, Calendar, DollarSign,
  Activity, Target, BarChart3, Zap, Globe,
  Sun, Cloud, Wind, Droplets, ThermometerSun,
  Phone, AlertTriangle, Check, ArrowRight,
  Package, Home, ShoppingBag, Truck
} from 'lucide-react';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState({
    tours: 234,
    tourists: 1247,
    guides: 89,
    transfers: 47,
    rating: 4.8,
    revenue: 2.4
  });

  useEffect(() => {
    setMounted(true);
    
    // Анимация счетчиков
    const interval = setInterval(() => {
      setStats(prev => ({
        tours: prev.tours + Math.floor(Math.random() * 3),
        tourists: prev.tourists + Math.floor(Math.random() * 5),
        guides: prev.guides,
        transfers: prev.transfers,
        rating: 4.8,
        revenue: prev.revenue + 0.1
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return (
      <main className="min-h-screen relative flex items-center justify-center">
        <div className="text-2xl opacity-50">Загрузка...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen relative">
      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 opacity-90"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
        
        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full mb-8 border border-white/20">
            <Mountain className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-medium">Экосистема туризма Камчатки</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black text-white mb-6 leading-tight">
            KAMCHATOUR<br/>
            <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              HUB
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto">
            Где каждая роль имеет значение. Туристы находят приключения,
            бизнес получает инструменты роста.
          </p>

          {/* Live Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <Activity className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-3xl font-black text-white">{stats.tours}</div>
              <div className="text-sm text-white/70">Активных туров</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <Users className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-3xl font-black text-white">{stats.tourists}</div>
              <div className="text-sm text-white/70">Туристов</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <Compass className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-3xl font-black text-white">{stats.guides}</div>
              <div className="text-sm text-white/70">Гидов онлайн</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <Star className="w-8 h-8 text-orange-400 mx-auto mb-2" />
              <div className="text-3xl font-black text-white">{stats.rating}</div>
              <div className="text-sm text-white/70">Рейтинг</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/hub/tourist" className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all hover:scale-105">
              <Users className="w-5 h-5" />
              Я турист
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a href="/hub/operator" className="group inline-flex items-center gap-2 px-8 py-4 bg-purple-500/20 backdrop-blur-md text-white rounded-xl font-bold text-lg border-2 border-white/30 hover:bg-purple-500/30 transition-all hover:scale-105">
              <Briefcase className="w-5 h-5" />
              Я бизнес
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          {/* Scroll Indicator */}
          <div className="mt-20 animate-bounce">
            <ChevronRight className="w-8 h-8 text-white mx-auto rotate-90" />
          </div>
        </div>
      </section>

      {/* ROLES ECOSYSTEM */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Экосистема для каждого
            </h2>
            <p className="text-xl text-gray-600">
              Выберите свою роль и начните зарабатывать уже сегодня
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Tourist */}
            <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Турист</h3>
              <p className="text-gray-600 mb-6">Открой Камчатку</p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{stats.tours} актуальных тура</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Прогноз погоды на 14 дней</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">SOS безопасность 24/7</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Eco-points система</span>
                </li>
              </ul>
              <a href="/hub/tourist" className="group/btn inline-flex items-center gap-2 text-blue-600 font-semibold hover:gap-3 transition-all">
                Начать путешествие
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Operator */}
            <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Туроператор</h3>
              <p className="text-gray-600 mb-6">Управляй профессионально</p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">CRM с аналитикой</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">+47% к доходам в среднем</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Мгновенные бронирования</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Мобильное приложение</span>
                </li>
              </ul>
              <a href="/hub/operator" className="group/btn inline-flex items-center gap-2 text-purple-600 font-semibold hover:gap-3 transition-all">
                Начать зарабатывать
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Guide */}
            <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Compass className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Гид</h3>
              <p className="text-gray-600 mb-6">Твоё время - твои деньги</p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Умный календарь</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">До 150к₽/месяц топ гиды</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Система рейтингов</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Все в телефоне</span>
                </li>
              </ul>
              <a href="/hub/guide" className="group/btn inline-flex items-center gap-2 text-green-600 font-semibold hover:gap-3 transition-all">
                Стать гидом
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Transfer */}
            <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Car className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Трансфер</h3>
              <p className="text-gray-600 mb-6">Логистика нового уровня</p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Умная маршрутизация</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">95% загрузка транспорта</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Авто-платежи</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Интеграция с турами</span>
                </li>
              </ul>
              <a href="/hub/transfer" className="group/btn inline-flex items-center gap-2 text-orange-600 font-semibold hover:gap-3 transition-all">
                Подключить транспорт
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* More roles */}
            <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Home className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Размещение</h3>
              <p className="text-gray-600 mb-6">Гостиницы и отели</p>
              <a href="/hub/stay" className="group/btn inline-flex items-center gap-2 text-indigo-600 font-semibold hover:gap-3 transition-all">
                Подробнее
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Сувениры</h3>
              <p className="text-gray-600 mb-6">Магазины и мастера</p>
              <a href="/hub/souvenirs" className="group/btn inline-flex items-center gap-2 text-pink-600 font-semibold hover:gap-3 transition-all">
                Подробнее
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Уникальные возможности
            </h2>
            <p className="text-xl text-gray-600">
              Технологии, которые делают путешествия лучше
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Weather */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-8 border-2 border-blue-100">
              <ThermometerSun className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-2xl font-bold mb-3">Метеослужба</h3>
              <p className="text-gray-600 mb-6">
                Прогноз погоды на 14 дней с учетом вулканической активности
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm">
                  <Sun className="w-4 h-4 text-orange-500" />
                  <span>Почасовой прогноз</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Wind className="w-4 h-4 text-blue-500" />
                  <span>Состояние маршрутов</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Mountain className="w-4 h-4 text-gray-600" />
                  <span>Вулканы онлайн</span>
                </li>
              </ul>
              <a href="/hub/tourist" className="inline-flex items-center gap-2 text-blue-600 font-semibold">
                Смотреть погоду
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Safety */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-3xl p-8 border-2 border-red-100">
              <Shield className="w-12 h-12 text-red-600 mb-4" />
              <h3 className="text-2xl font-bold mb-3">Безопасность 24/7</h3>
              <p className="text-gray-600 mb-6">
                Твоя безопасность - наш приоритет номер один
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span>SOS с геолокацией</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-orange-500" />
                  <span>Связь с МЧС</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  <span>Трекинг маршрутов</span>
                </li>
              </ul>
              <a href="/hub/safety" className="inline-flex items-center gap-2 text-red-600 font-semibold">
                Подробнее
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Eco */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 border-2 border-green-100">
              <Leaf className="w-12 h-12 text-green-600 mb-4" />
              <h3 className="text-2xl font-bold mb-3">Eco-Points</h3>
              <p className="text-gray-600 mb-6">
                Зарабатывай баллы, заботясь о природе Камчатки
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm">
                  <Target className="w-4 h-4 text-green-500" />
                  <span>Баллы за эко-туры</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Award className="w-4 h-4 text-yellow-500" />
                  <span>Обмен на скидки</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <span>Топ эко-туристов</span>
                </li>
              </ul>
              <a href="/hub/tourist" className="inline-flex items-center gap-2 text-green-600 font-semibold">
                Начать зарабатывать
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Analytics */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 border-2 border-purple-100">
              <BarChart3 className="w-12 h-12 text-purple-600 mb-4" />
              <h3 className="text-2xl font-bold mb-3">Аналитика</h3>
              <p className="text-gray-600 mb-6">
                Детальная статистика и отчеты для бизнеса
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-purple-500" />
                  <span>Графики доходов</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Activity className="w-4 h-4 text-pink-500" />
                  <span>Real-time метрики</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <span>Прогноз выручки</span>
                </li>
              </ul>
              <a href="/hub/operator" className="inline-flex items-center gap-2 text-purple-600 font-semibold">
                Смотреть аналитику
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 bg-gradient-to-br from-purple-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <Target className="w-16 h-16 mx-auto mb-6 text-yellow-300" />
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            Готовы начать?
          </h2>
          <p className="text-xl mb-12 text-white/90">
            Присоединяйтесь к экосистеме туризма Камчатки уже сегодня
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/hub/tourist" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all hover:scale-105">
              <Users className="w-5 h-5" />
              Искать туры
            </a>
            <a href="/hub/operator" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-purple-500/30 backdrop-blur-md text-white rounded-xl font-bold text-lg border-2 border-white/30 hover:bg-purple-500/50 transition-all hover:scale-105">
              <Briefcase className="w-5 h-5" />
              Открыть CRM
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
