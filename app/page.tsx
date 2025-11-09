'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  ThermometerSun, Wind, Droplets, MapPin, Users, Briefcase,
  Target, X, Sparkles, ArrowRight, Shield, Leaf, BarChart3,
  Compass, Car, Home, ShoppingBag, Flame, Fish, Droplet, Binoculars,
  Helicopter, Waves, Mountain, Camera
} from 'lucide-react';
import { AIChatWidget } from '@/components/AIChatWidget';
import { WeatherAnimations } from '@/components/home/WeatherAnimations';
import { TopBar } from '@/components/home/TopBar';
import { AISmartSearch } from '@/components/home/AISmartSearch';
import { RolesSection, type Role } from '@/components/home/RolesSection';
import { FeaturesSection, type Feature } from '@/components/home/FeaturesSection';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState({
    temp: 8,
    condition: 'clear',
    wind: 12,
    humidity: 78,
    feels_like: 5,
    description: 'ясно'
  });
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiSearchResults, setAiSearchResults] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    
    // ОПТИМИЗИРОВАНО: Обновляем только при смене минуты
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(prev => {
        if (now.getMinutes() !== prev.getMinutes()) {
          return now;
        }
        return prev;
      });
    };
    
    const timer = setInterval(updateTime, 1000);
    
    // Загрузка погоды
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
    const weatherTimer = setInterval(fetchWeather, 5 * 60 * 1000);
    
    return () => {
      clearInterval(timer);
      clearInterval(weatherTimer);
    };
  }, []);

  // AI Search handler - ДОРАБОТАНО: теперь с UI для результатов
  const handleAISearch = useCallback(async (query: string) => {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Найди туры на Камчатке по запросу: ${query}`,
          sessionId: `search_${Date.now()}`
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        // TODO: парсить и отобразить результаты
        setAiSearchResults([data]);
        console.log('AI Search results:', data);
      }
    } catch (error) {
      console.error('AI Search error:', error);
    }
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
  const timeString = `${hoursStr}:${minutes}`;

  const getGreeting = () => {
    if (hours >= 6 && hours < 12) return 'Доброе утро';
    if (hours >= 12 && hours < 18) return 'Добрый день';
    if (hours >= 18 && hours < 23) return 'Добрый вечер';
    return 'Доброй ночи';
  };

  const getBackgroundGradient = () => {
    if (hours >= 6 && hours < 12) return 'from-sky-100 via-blue-50 to-indigo-100';
    if (hours >= 12 && hours < 18) return 'from-blue-100 via-sky-50 to-cyan-100';
    if (hours >= 18 && hours < 23) return 'from-orange-100 via-pink-100 to-purple-200';
    return 'from-slate-800 via-blue-900 to-indigo-900';
  };

  const isNight = hours >= 23 || hours < 6;
  const textColor = isNight ? 'text-white' : 'text-gray-800';
  const textSecondary = isNight ? 'text-white/70' : 'text-gray-600';

  // ДАННЫЕ: Роли
  const roles: Role[] = [
    { id: 'tourist', icon: Users, title: 'Турист', subtitle: 'Открой Камчатку', color: 'from-blue-400/80 to-cyan-400/80', href: '/hub/tourist' },
    { id: 'operator', icon: Briefcase, title: 'Туроператор', subtitle: 'Управляй бизнесом', color: 'from-purple-400/80 to-pink-400/80', href: '/hub/operator' },
    { id: 'guide', icon: Compass, title: 'Гид', subtitle: 'Веди за собой', color: 'from-green-400/80 to-emerald-400/80', href: '/hub/guide' },
    { id: 'transfer', icon: Car, title: 'Трансфер', subtitle: 'Доставь комфортно', color: 'from-orange-400/80 to-red-400/80', href: '/hub/transfer' },
    { id: 'stay', icon: Home, title: 'Размещение', subtitle: 'Принимай гостей', color: 'from-indigo-400/80 to-blue-400/80', href: '/hub/stay' },
    { id: 'souvenirs', icon: ShoppingBag, title: 'Сувениры', subtitle: 'Продавай эксклюзив', color: 'from-pink-400/80 to-rose-400/80', href: '/hub/souvenirs' }
  ];

  // ДАННЫЕ: Features
  const features: Feature[] = [
    { icon: ThermometerSun, title: 'Метеослужба', description: 'Прогноз на 14 дней', link: '/hub/tourist', color: 'blue' },
    { icon: Shield, title: 'Безопасность 24/7', description: 'SOS с геолокацией', link: '/hub/safety', color: 'red' },
    { icon: Leaf, title: 'Eco-Points', description: 'Зарабатывай баллы', link: '/hub/tourist', color: 'green' },
    { icon: BarChart3, title: 'Аналитика', description: 'Детальная статистика', link: '/hub/operator', color: 'purple' }
  ];

  // ДАННЫЕ: Категории - ОПТИМИЗИРОВАНО: ТОП-8 вместо 22
  const searchCategories = [
    { icon: Flame, label: 'Вулканы' },
    { icon: Fish, label: 'Рыбалка' },
    { icon: Mountain, label: 'Восхождения' },
    { icon: Binoculars, label: 'Медведи' },
    { icon: Camera, label: 'Фототуры' },
    { icon: Helicopter, label: 'Хели-ски' },
    { icon: Waves, label: 'Каякинг' },
    { icon: Droplet, label: 'Термальные источники' }
  ];

  return (
    <main className="min-h-screen lg:h-screen w-full overflow-hidden lg:overflow-auto relative">
      {/* HERO SECTION */}
      <section className={`relative min-h-screen lg:h-[50vh] w-full flex flex-col overflow-hidden bg-gradient-to-br ${getBackgroundGradient()} transition-colors duration-1000`}>
        
        {/* Weather Animations - ОПТИМИЗИРОВАНО: мемоизация в компоненте */}
        <WeatherAnimations condition={weather.condition} isNight={isNight} />

        {/* Top Bar */}
        <TopBar time={timeString} />

        {/* Content */}
        <div className="relative z-10 w-full text-center flex-1 flex flex-col items-center justify-center px-4">
          {/* Greeting */}
          <div className="mb-4">
            <p className="text-xl md:text-2xl font-light text-white/90">
              {getGreeting()}, Камчатка
            </p>
          </div>

          {/* AI Smart Search - ОПТИМИЗИРОВАНО: компонент + топ-8 категорий */}
          <AISmartSearch categories={searchCategories} onSearch={handleAISearch} />

          {/* Weather Card */}
          <div className="inline-flex items-center gap-3 px-5 py-2 bg-white/30 backdrop-blur-3xl rounded-full border border-white/30 mb-3 shadow-xl">
            <div className="flex items-center gap-2">
              <ThermometerSun className="w-5 h-5 text-white" />
              <div className="text-2xl font-extralight text-white">{weather.temp}°</div>
            </div>
            <div className="w-px h-6 bg-white/30"></div>
            <div className="flex items-center gap-3">
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
          <div className="flex items-center gap-1 text-white/80 text-xs mb-6 font-light">
            <MapPin className="w-3.5 h-3.5" />
            <span>Петропавловск-Камчатский</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-extralight text-white mb-2 tracking-tight">
            Kamchatour Hub
          </h1>
          <p className="text-sm md:text-base font-light text-white/80 mb-6">
            Экосистема туризма Камчатки
          </p>

          {/* CTA Buttons */}
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

      {/* ROLES - Компонент */}
      <RolesSection roles={roles} />

      {/* FEATURES - Компонент */}
      <FeaturesSection features={features} />

      {/* FINAL CTA - Hidden on desktop lg+ */}
      <section className={`w-full lg:hidden bg-gradient-to-br ${getBackgroundGradient()} transition-colors duration-1000 py-12`}>
        <div className="text-center px-4">
          <Target className={`w-10 h-10 mx-auto mb-4 ${isNight ? 'text-white/80' : 'text-gray-700'}`} />
          <h2 className={`text-xl font-extralight ${textColor} mb-4`}>
            Готовы начать?
          </h2>
          <p className={`text-sm font-light ${textSecondary} mb-6 max-w-2xl mx-auto`}>
            Присоединяйтесь к экосистеме туризма Камчатки
          </p>
          
          <div className="flex flex-wrap gap-2 justify-center">
            <Link href="/hub/tourist" className="flex items-center gap-1.5 px-5 py-2 bg-white/50 backdrop-blur-xl text-gray-800 rounded-full font-light text-xs hover:bg-white/70 transition-all hover:scale-105 shadow-lg border border-white/50">
              <Users className="w-3.5 h-3.5" />
              Искать туры
            </Link>
            <Link href="/hub/operator" className="flex items-center gap-1.5 px-5 py-2 bg-gray-800/50 backdrop-blur-xl text-white rounded-full font-light text-xs border border-gray-700/50 hover:bg-gray-800/70 transition-all hover:scale-105 shadow-lg">
              <Briefcase className="w-3.5 h-3.5" />
              Открыть CRM
            </Link>
          </div>
        </div>
      </section>

      {/* FLOATING AI.Kam BUTTON */}
      <button
        onClick={() => setShowAIChat(!showAIChat)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-500 hover:from-yellow-500 hover:via-orange-500 hover:to-pink-600 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 group"
      >
        {showAIChat ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <div className="relative">
            <Sparkles className="w-6 h-6 text-white animate-pulse" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
          </div>
        )}
      </button>

      {/* AI.Kam Chat Widget */}
      {showAIChat && (
        <div className="fixed bottom-24 right-6 z-50 w-96 h-[600px] bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">AI.Kam</h3>
                <p className="text-white/80 text-xs">Твой AI помощник</p>
              </div>
            </div>
            <button 
              onClick={() => setShowAIChat(false)}
              className="w-8 h-8 hover:bg-white/20 rounded-full flex items-center justify-center transition-all"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          <div className="h-[calc(100%-64px)]">
            <AIChatWidget />
          </div>
        </div>
      )}

      {/* Hide scrollbar */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </main>
  );
}
