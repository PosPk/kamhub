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
import { AISearchResults } from '@/components/home/AISearchResults';

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
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

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

  // ИСПРАВЛЕНИЕ: Динамическое применение темы к body
  useEffect(() => {
    if (typeof document === 'undefined') return;
    
    const hours = currentTime.getHours();
    
    // Удаляем все предыдущие классы темы
    const themeClasses = ['dawn', 'morning', 'afternoon', 'evening', 'late-evening', 'night'];
    document.body.classList.remove(...themeClasses);
    
    // Применяем текущую тему
    let themeClass = 'night';
    if (hours >= 5 && hours < 7) themeClass = 'dawn';
    else if (hours >= 7 && hours < 12) themeClass = 'morning';
    else if (hours >= 12 && hours < 18) themeClass = 'afternoon';
    else if (hours >= 18 && hours < 21) themeClass = 'evening';
    else if (hours >= 21 && hours < 23) themeClass = 'late-evening';
    
    document.body.classList.add(themeClass);
    
    console.log(`🎨 Тема применена: ${themeClass} (${hours}:00)`);
  }, [currentTime]);

  // AI Search handler - ГОТОВО: с полноценным UI
  const handleAISearch = useCallback(async (query: string) => {
    setIsSearching(true);
    setShowSearchResults(true);
    setAiSearchResults([]);
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Найди туры на Камчатке по запросу: ${query}. Ответь в формате JSON массива с полями: title, description, price, duration, rating, category`,
          sessionId: `search_${Date.now()}`
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        
        // Парсинг AI ответа - извлекаем туры из ответа
        let results = [];
        try {
          // Попытка распарсить JSON из ответа
          const jsonMatch = data.message?.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            results = JSON.parse(jsonMatch[0]);
          } else {
            // Фолбэк: создаем результат из текста
            results = [{
              title: query,
              description: data.message || 'AI обрабатывает ваш запрос...',
              category: 'Рекомендация AI'
            }];
          }
        } catch (e) {
          // Если парсинг не удался, показываем текстовый ответ
          results = [{
            title: `Результаты по запросу: ${query}`,
            description: data.message || 'Ищем туры...',
            category: 'AI Помощник'
          }];
        }
        
        setAiSearchResults(results);
      }
    } catch (error) {
      console.error('AI Search error:', error);
      setAiSearchResults([{
        title: 'Ошибка поиска',
        description: 'Не удалось выполнить поиск. Попробуйте позже.',
        category: 'Ошибка'
      }]);
    } finally {
      setIsSearching(false);
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
    if (hours >= 5 && hours < 7) return 'Доброе утро, рассвет';
    if (hours >= 7 && hours < 12) return 'Доброе утро';
    if (hours >= 12 && hours < 18) return 'Добрый день';
    if (hours >= 18 && hours < 21) return 'Добрый вечер';
    if (hours >= 21 && hours < 23) return 'Вечереет';
    return 'Доброй ночи';
  };

  const getBackgroundGradient = () => {
    // 🌅 Рассвет (5:00-7:00): розово-оранжевые теплые тона
    if (hours >= 5 && hours < 7) return 'from-rose-200 via-orange-100 to-amber-100';
    // ☀️ Утро (7:00-12:00): светлый голубой
    if (hours >= 7 && hours < 12) return 'from-sky-100 via-blue-50 to-indigo-100';
    // 🌞 День (12:00-18:00): яркий голубой
    if (hours >= 12 && hours < 18) return 'from-blue-100 via-sky-50 to-cyan-100';
    // 🌆 Вечер (18:00-21:00): оранжево-розовый закат
    if (hours >= 18 && hours < 21) return 'from-orange-100 via-pink-100 to-purple-200';
    // 🌃 Поздний вечер (21:00-23:00): темнеющее небо
    if (hours >= 21 && hours < 23) return 'from-indigo-300 via-purple-200 to-pink-200';
    // 🌙 Ночь (23:00-5:00): темное небо
    return 'from-slate-800 via-blue-900 to-indigo-900';
  };

  const isNight = hours >= 23 || hours < 5;
  const isDawn = hours >= 5 && hours < 7;
  const textColor = isNight ? 'text-white' : 'text-gray-800';
  const textSecondary = isNight ? 'text-white/70' : 'text-gray-600';

  // ДАННЫЕ: Роли - ОБНОВЛЕНО: 2 основные роли
  const roles: Role[] = [
    { 
      id: 'tourist', 
      icon: Users, 
      title: 'Турист путешественник', 
      subtitle: 'Открой Камчатку для себя', 
      color: 'from-blue-400/80 to-cyan-400/80', 
      href: '/hub/tourist' 
    },
    { 
      id: 'business', 
      icon: Briefcase, 
      title: 'Турбизнес', 
      subtitle: 'Все для вашего бизнеса', 
      color: 'from-purple-400/80 to-pink-400/80', 
      href: '/hub/business' 
    }
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
        
        {/* Background Image - Kamchatka */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/uploads/fon-1762759253594.jpg"
            alt="Kamchatka"
            className="w-full h-full object-contain lg:object-cover"
            style={{ objectPosition: 'center top' }}
          />
          {/* Gradient overlay для читаемости */}
          <div className={`absolute inset-0 ${getBackgroundGradient()} bg-gradient-to-br opacity-60 transition-opacity duration-1000`}></div>
        </div>
        
        {/* Weather Animations - ОПТИМИЗИРОВАНО: мемоизация в компоненте */}
        <WeatherAnimations condition={weather.condition} isNight={isNight} isDawn={isDawn} />

        {/* Top Bar */}
        <TopBar time={timeString} isNight={isNight} />

        {/* Content */}
        <div className="relative z-10 w-full text-center flex-1 flex flex-col items-center justify-center px-4">
          {/* Greeting */}
          <div className="mb-4">
            <p className={`text-xl md:text-2xl font-light ${isNight ? 'text-white/90' : 'text-gray-800'}`}>
              {getGreeting()}, Камчатка
            </p>
          </div>

          {/* Weather Card */}
          <div className={`inline-flex items-center gap-3 px-5 py-2 ${isNight ? 'bg-white/30 border-white/30' : 'bg-gray-800/30 border-gray-800/30'} backdrop-blur-3xl rounded-full border mb-3 shadow-xl`}>
            <div className="flex items-center gap-2">
              <ThermometerSun className={`w-5 h-5 ${textColor}`} />
              <div className={`text-2xl font-extralight ${textColor}`}>{weather.temp}°</div>
            </div>
            <div className={`w-px h-6 ${isNight ? 'bg-white/30' : 'bg-gray-800/30'}`}></div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Wind className={`w-3.5 h-3.5 ${textSecondary}`} />
                <span className={`text-xs font-light ${textSecondary}`}>{weather.wind} м/с</span>
              </div>
              <div className="flex items-center gap-1">
                <Droplets className={`w-3.5 h-3.5 ${textSecondary}`} />
                <span className={`text-xs font-light ${textSecondary}`}>{weather.humidity}%</span>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className={`flex items-center gap-1 ${textSecondary} text-xs mb-4 font-light`}>
            <MapPin className="w-3.5 h-3.5" />
            <span>Петропавловск-Камчатский</span>
          </div>

          {/* Description */}
          <p className={`text-sm md:text-base font-light ${textSecondary} mb-4`}>
            Экосистема туризма Камчатки
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            <Link href="/hub/tourist" className={`group flex items-center gap-1.5 px-4 py-1.5 ${isNight ? 'bg-white/50 text-gray-800 border-white/50 hover:bg-white/70' : 'bg-gray-800/50 text-white border-gray-800/50 hover:bg-gray-800/70'} backdrop-blur-xl rounded-full font-light text-xs transition-all hover:scale-105 shadow-lg border`}>
              <Users className="w-3 h-3" />
              Я турист
              <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/hub/business" className={`group flex items-center gap-1.5 px-4 py-1.5 ${isNight ? 'bg-gray-800/50 text-white border-gray-700/50 hover:bg-gray-800/70' : 'bg-white/50 text-gray-800 border-white/50 hover:bg-white/70'} backdrop-blur-xl rounded-full font-light text-xs border transition-all hover:scale-105 shadow-lg`}>
              <Briefcase className="w-3 h-3" />
              Я бизнес
              <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* AI Smart Search - ОПТИМИЗИРОВАНО: компонент + топ-8 категорий */}
          <AISmartSearch categories={searchCategories} onSearch={handleAISearch} isNight={isNight} />

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

      {/* AI Search Results Modal */}
      {showSearchResults && (
        <AISearchResults
          results={aiSearchResults}
          isLoading={isSearching}
          onClose={() => {
            setShowSearchResults(false);
            setAiSearchResults([]);
          }}
        />
      )}

      {/* Hide scrollbar */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </main>
  );
}
