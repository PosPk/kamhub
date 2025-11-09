'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Cloud, Sun, Wind, Droplets, ThermometerSun, Moon, CloudSnow,
  Mountain, Users, Compass, Car, Briefcase, Shield,
  TrendingUp, Star, Award, Leaf, BarChart3,
  Phone, AlertTriangle, MapPin, Check, ArrowRight,
  Home, ShoppingBag, Calendar, DollarSign, Target,
  Activity, Zap, Heart, Search, CloudRain, Stars,
  Sparkles, MessageCircle, Send, X, Flame, Fish, 
  Waves, TreePine, Droplet, Camera, Tent,
  Utensils, Ship, Dog, Footprints, Sunrise,
  Binoculars, Snowflake, Helicopter, TentTree,
  Truck, Sailboat, Cloudy, Timer, Wine, Navigation
} from 'lucide-react';
import { AIChatWidget } from '@/components/AIChatWidget';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [aiSearchResults, setAiSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

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
    const weatherTimer = setInterval(fetchWeather, 5 * 60 * 1000);
    
    return () => {
      clearInterval(timer);
      clearInterval(weatherTimer);
    };
  }, []);

  // AI Умный поиск туров
  const handleAISearch = async () => {
    if (!searchQuery.trim() || isSearching) return;
    
    setIsSearching(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Найди туры на Камчатке по запросу: ${searchQuery}`,
          sessionId: `search_${Date.now()}`
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        // TODO: парсить результаты и показывать туры
        console.log('AI Search results:', data);
      }
    } catch (error) {
      console.error('AI Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

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

  // Роли и сущности - элегантный список
  const roles = [
    {
      id: 'tourist',
      icon: Users,
      title: 'Турист',
      subtitle: 'Открой Камчатку',
      color: 'from-blue-400/80 to-cyan-400/80',
      href: '/hub/tourist'
    },
    {
      id: 'operator',
      icon: Briefcase,
      title: 'Туроператор',
      subtitle: 'Управляй бизнесом',
      color: 'from-purple-400/80 to-pink-400/80',
      href: '/hub/operator'
    },
    {
      id: 'guide',
      icon: Compass,
      title: 'Гид',
      subtitle: 'Веди за собой',
      color: 'from-green-400/80 to-emerald-400/80',
      href: '/hub/guide'
    },
    {
      id: 'transfer',
      icon: Car,
      title: 'Трансфер',
      subtitle: 'Доставь комфортно',
      color: 'from-orange-400/80 to-red-400/80',
      href: '/hub/transfer'
    },
    {
      id: 'stay',
      icon: Home,
      title: 'Размещение',
      subtitle: 'Принимай гостей',
      color: 'from-indigo-400/80 to-blue-400/80',
      href: '/hub/stay'
    },
    {
      id: 'souvenirs',
      icon: ShoppingBag,
      title: 'Сувениры',
      subtitle: 'Продавай эксклюзив',
      color: 'from-pink-400/80 to-rose-400/80',
      href: '/hub/souvenirs'
    }
  ];

  // Quick search categories БЕЗ ЭМОДЗИ - Активности Камчатки (ПЕРЕСМОТРЕННЫЕ ИКОНКИ)
  const searchCategories = [
    { icon: Flame, label: 'Вулканы' },              // ✅ Огонь - идеально для вулканов
    { icon: Fish, label: 'Рыбалка' },               // ✅ Рыба - идеально
    { icon: Droplet, label: 'Термальные источники' }, // ✅ Капля - подходит для воды
    { icon: Binoculars, label: 'Медведи' },         // ✅ Бинокль - наблюдение за медведями
    { icon: Helicopter, label: 'Хели-ски' },        // ✅ Вертолет - точное соответствие
    { icon: Wind, label: 'Снегоходы' },             // ✅ Ветер - скорость и движение
    { icon: Waves, label: 'Каякинг' },              // ✅ Волны - водный спорт
    { icon: Mountain, label: 'Восхождения' },       // ✅ Гора - восхождения
    { icon: Camera, label: 'Фототуры' },            // ✅ Камера - фотография
    { icon: Ship, label: 'Морские прогулки' },      // ✅ Корабль - морские туры
    { icon: Sailboat, label: 'Наблюдение за китами' }, // ✅ Парусник - наблюдение с лодки
    { icon: Dog, label: 'Собачьи упряжки' },        // ✅ Собака - упряжки
    { icon: Helicopter, label: 'Вертолетные туры' }, // ✅ Вертолет - точное соответствие
    { icon: Utensils, label: 'Гастротуры' },        // ✅ Приборы - еда
    { icon: Truck, label: 'Джип-туры' },            // ✅ Грузовик - внедорожник
    { icon: Footprints, label: 'Этнотуры' },        // ✅ Следы - путешествие
    { icon: TreePine, label: 'Экотуры' },           // ✅ Сосна - природа
    { icon: Tent, label: 'Кемпинг' },               // ✅ Палатка - кемпинг
    { icon: Waves, label: 'Сёрфинг' },              // ✅ Волны - серфинг
    { icon: Sunrise, label: 'Рассветы' },           // ✅ Восход - рассвет
    { icon: Navigation, label: 'Трекинг' },         // ✅ Навигация - походы
    { icon: Cloudy, label: 'Дайвинг' }              // ✅ Облака/глубина - подводное
  ];

  return (
    <main className="min-h-screen lg:h-screen w-full overflow-hidden lg:overflow-auto relative">
      {/* HERO SECTION */}
      <section className={`relative min-h-screen lg:h-[50vh] w-full flex flex-col overflow-hidden bg-gradient-to-br ${getBackgroundGradient()} transition-colors duration-1000`}>
        
        {/* Weather Animations */}
        {(weather.condition === 'clear' && isNight) && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(100)].map((_, i) => (
              <div key={i} className="absolute animate-pulse" 
                   style={{
                     left: `${Math.random() * 100}%`,
                     top: `${Math.random() * 100}%`,
                     animationDelay: `${Math.random() * 3}s`,
                     animationDuration: `${2 + Math.random() * 3}s`
                   }}>
                <div className="w-1 h-1 bg-white/80 rounded-full" />
              </div>
            ))}
          </div>
        )}

        {weather.condition === 'snow' && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(50)].map((_, i) => (
              <div key={i} className="absolute animate-snow"
                   style={{
                     left: `${Math.random() * 100}%`,
                     top: `-${Math.random() * 20}%`,
                     animationDelay: `${Math.random() * 5}s`,
                     animationDuration: `${5 + Math.random() * 5}s`
                   }}>
                <CloudSnow className="w-3 h-3 text-white/60" />
              </div>
            ))}
          </div>
        )}

        {weather.condition === 'rain' && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(100)].map((_, i) => (
              <div key={i} className="absolute animate-snow"
                   style={{
                     left: `${Math.random() * 100}%`,
                     top: `-${Math.random() * 20}%`,
                     animationDelay: `${Math.random() * 2}s`,
                     animationDuration: `${1 + Math.random() * 2}s`
                   }}>
                <div className="w-0.5 h-4 bg-blue-400/40" />
              </div>
            ))}
          </div>
        )}

        {(weather.condition === 'clouds' || weather.condition === 'wind') && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Оригинальные волнистые линии ветра */}
            {[...Array(15)].map((_, i) => (
              <div key={i} className="absolute animate-wind-flow"
                   style={{
                     top: `${10 + i * 6}%`,
                     left: `-20%`,
                     width: '150%',
                     height: '2px',
                     animationDelay: `${i * 0.3}s`,
                     animationDuration: `${4 + Math.random() * 2}s`
                   }}>
                <svg width="100%" height="100%" className="opacity-20">
                  <path
                    d={`M 0 0 Q ${50 + Math.random() * 100} ${-10 + Math.random() * 20}, ${100 + Math.random() * 100} 0 T ${200 + Math.random() * 100} 0`}
                    stroke={isNight ? 'rgba(255,255,255,0.3)' : 'rgba(100,100,100,0.3)'}
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray="5,10"
                  />
                </svg>
              </div>
            ))}
            
            {/* Частицы пыли/листьев */}
            {[...Array(30)].map((_, i) => (
              <div key={`particle-${i}`} className="absolute animate-wind-particle"
                   style={{
                     top: `${Math.random() * 100}%`,
                     left: `-5%`,
                     animationDelay: `${Math.random() * 5}s`,
                     animationDuration: `${3 + Math.random() * 3}s`
                   }}>
                <div 
                  className="w-1 h-1 rounded-full opacity-40"
                  style={{
                    background: isNight ? 'rgba(255,255,255,0.6)' : 'rgba(120,120,120,0.6)',
                    transform: `rotate(${Math.random() * 360}deg)`
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Top Bar */}
        <div className="relative z-20 w-full flex items-center justify-between px-4 py-2">
          <Link href="/" className="flex items-center gap-1.5 group">
            <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform shadow-lg">
              K
            </div>
            <div className="text-white hidden sm:block">
              <div className="font-light text-xs">Kamchatour Hub</div>
            </div>
          </Link>
          
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
          {/* Greeting */}
          <div className="mb-4">
            <p className="text-xl md:text-2xl font-light text-white/90">
              {getGreeting()}, Камчатка
            </p>
          </div>

          {/* AI Smart Search - УМНЫЙ с AI */}
          <div className="w-full max-w-3xl mb-6">
            <div className="relative group">
              <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-yellow-300/90 animate-pulse" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAISearch()}
                placeholder="Спроси AI.Kam: 'Найди восхождение на вулкан для новичков'..."
                className="w-full px-5 py-3 pl-12 pr-24 bg-white/50 backdrop-blur-3xl border-2 border-white/50 rounded-2xl text-gray-800 placeholder-gray-500/70 font-light text-sm focus:bg-white/70 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all shadow-2xl"
              />
              <button 
                onClick={handleAISearch}
                disabled={isSearching}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white rounded-xl text-xs font-medium transition-all shadow-lg flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSearching ? (
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3" />
                )}
                AI
              </button>
            </div>
            
            {/* Quick Categories - БЕЗ ЭМОДЗИ */}
            <div className="mt-3 flex flex-wrap gap-2 justify-center">
              {searchCategories.map((cat, i) => (
                <button 
                  key={i}
                  onClick={() => {
                    setSearchQuery(cat.label);
                    handleAISearch();
                  }}
                  className="px-3 py-1 bg-white/30 backdrop-blur-xl border border-white/40 rounded-full text-white text-xs font-light hover:bg-white/50 transition-all flex items-center gap-1.5 shadow-lg"
                >
                  <cat.icon className="w-3 h-3" />
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

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

      {/* ROLES - Компактный стильный scroll */}
      <section className="w-full bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 py-4 lg:py-3 overflow-hidden">
        <div className="text-center mb-3 lg:mb-2 px-4">
          <h2 className="text-lg lg:text-xl font-extralight mb-0.5 text-gray-800">
            Выберите свою роль
          </h2>
          <p className="text-xs font-light text-gray-600 hidden lg:block">
            Каждая роль открывает уникальные возможности
          </p>
        </div>

        <div className="flex lg:grid lg:grid-cols-6 gap-2 lg:gap-3 px-4 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 snap-x snap-mandatory lg:snap-none scrollbar-hide lg:max-w-7xl lg:mx-auto">
          {roles.map((role) => (
            <Link 
              key={role.id}
              href={role.href}
              className="group flex-shrink-0 w-40 lg:w-full snap-center relative"
            >
              {/* Ripple effect background */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/0 group-hover:from-white/20 group-hover:to-transparent rounded-xl lg:rounded-2xl transition-all duration-700"></div>
              
              <div className="relative bg-white/60 backdrop-blur-xl rounded-xl lg:rounded-2xl p-3 lg:p-4 border border-white/40 hover:bg-white/80 hover:scale-105 lg:hover:scale-110 hover:-translate-y-1 lg:hover:-translate-y-2 transition-all duration-300 shadow-lg hover:shadow-2xl h-full overflow-hidden">
                {/* Shine effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute top-0 -left-full w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 group-hover:left-full transition-all duration-1000"></div>
                </div>
                
                {/* Icon */}
                <div className={`w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br ${role.color} backdrop-blur-xl rounded-lg lg:rounded-xl flex items-center justify-center mb-2 lg:mb-3 group-hover:scale-125 group-hover:rotate-6 transition-all duration-300 shadow-lg relative mx-auto lg:mx-0`}>
                  <role.icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/20 rounded-lg lg:rounded-xl transition-all duration-300"></div>
                </div>
                
                {/* Content */}
                <h3 className="text-sm lg:text-base font-light mb-0.5 lg:mb-1 text-gray-800 group-hover:text-gray-900 transition-colors text-center lg:text-left">{role.title}</h3>
                <p className="text-gray-500 mb-1 lg:mb-2 font-light text-xs hidden lg:block">{role.subtitle}</p>
                
                {/* Arrow with pulse */}
                <div className="flex items-center justify-center lg:justify-start gap-0.5 lg:gap-1 text-blue-600 font-light group-hover:gap-1 lg:group-hover:gap-2 transition-all text-xs">
                  <span className="group-hover:font-medium transition-all hidden lg:inline">Открыть</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 group-hover:scale-125 transition-all" />
                </div>
                
                {/* Corner accent */}
                <div className={`absolute top-2 right-2 w-2 h-2 bg-gradient-to-br ${role.color} rounded-full opacity-0 group-hover:opacity-100 group-hover:scale-150 transition-all duration-300`}></div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="w-full bg-gradient-to-br from-green-50/40 via-emerald-50/30 to-teal-50/40 py-4 lg:py-3">
        <div className="text-center mb-3 lg:mb-2 px-4">
          <h2 className="text-lg lg:text-xl font-extralight mb-0.5 text-gray-800">
            Уникальные возможности
          </h2>
          <p className="text-xs font-light text-gray-600 hidden lg:block">
            Технологии для современного туризма
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 px-4 max-w-7xl mx-auto">
          <div className="bg-white/60 backdrop-blur-2xl p-3 lg:p-4 rounded-xl lg:rounded-2xl border border-white/40 hover:bg-white/80 transition-all shadow-lg hover:shadow-xl">
            <ThermometerSun className="w-8 h-8 lg:w-10 lg:h-10 text-blue-500 mb-2 lg:mb-3 mx-auto lg:mx-0" />
            <h3 className="text-sm lg:text-base font-light text-gray-800 mb-1 lg:mb-2 text-center lg:text-left">Метеослужба</h3>
            <p className="text-gray-600 font-light text-xs mb-2 hidden lg:block">
              Прогноз на 14 дней
            </p>
            <Link href="/hub/tourist" className="inline-flex items-center justify-center lg:justify-start gap-1 text-blue-600 text-xs font-light hover:gap-1.5 transition-all w-full lg:w-auto">
              <span className="hidden lg:inline">Подробнее</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="bg-white/60 backdrop-blur-2xl p-3 lg:p-4 rounded-xl lg:rounded-2xl border border-white/40 hover:bg-white/80 transition-all shadow-lg hover:shadow-xl">
            <Shield className="w-8 h-8 lg:w-10 lg:h-10 text-red-500 mb-2 lg:mb-3 mx-auto lg:mx-0" />
            <h3 className="text-sm lg:text-base font-light text-gray-800 mb-1 lg:mb-2 text-center lg:text-left">Безопасность 24/7</h3>
            <p className="text-gray-600 font-light text-xs mb-4">
              SOS с геолокацией
            </p>
            <Link href="/hub/safety" className="inline-flex items-center gap-1.5 text-red-600 text-xs font-light hover:gap-2 transition-all">
              Подробнее
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="bg-white/60 backdrop-blur-2xl p-3 lg:p-4 rounded-xl lg:rounded-2xl border border-white/40 hover:bg-white/80 transition-all shadow-lg hover:shadow-xl">
            <Leaf className="w-8 h-8 lg:w-10 lg:h-10 text-green-500 mb-2 lg:mb-3 mx-auto lg:mx-0" />
            <h3 className="text-sm lg:text-base font-light text-gray-800 mb-1 lg:mb-2 text-center lg:text-left">Eco-Points</h3>
            <p className="text-gray-600 font-light text-xs mb-4">
              Зарабатывай баллы
            </p>
            <Link href="/hub/tourist" className="inline-flex items-center gap-1.5 text-green-600 text-xs font-light hover:gap-2 transition-all">
              Подробнее
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="bg-white/60 backdrop-blur-2xl p-3 lg:p-4 rounded-xl lg:rounded-2xl border border-white/40 hover:bg-white/80 transition-all shadow-lg hover:shadow-xl">
            <BarChart3 className="w-8 h-8 lg:w-10 lg:h-10 text-purple-500 mb-2 lg:mb-3 mx-auto lg:mx-0" />
            <h3 className="text-sm lg:text-base font-light text-gray-800 mb-1 lg:mb-2 text-center lg:text-left">Аналитика</h3>
            <p className="text-gray-600 font-light text-xs mb-4">
              Детальная статистика
            </p>
            <Link href="/hub/operator" className="inline-flex items-center gap-1.5 text-purple-600 text-xs font-light hover:gap-2 transition-all">
              Подробнее
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </section>

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
          {/* Header */}
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

          {/* Chat Content */}
          <div className="h-[calc(100%-64px)]">
            <AIChatWidget />
          </div>
        </div>
      )}

      {/* Hide scrollbar but keep functionality */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </main>
  );
}
