'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Clock, Wind, Droplets, Eye, Sun, Moon, Cloud, CloudRain, CloudSnow, Sunrise, Sunset } from 'lucide-react';

// Петропавловск-Камчатский
const KAMCHATKA_LAT = 53.0195;
const KAMCHATKA_LNG = 158.6505;

export default function Home() {
  const [weather, setWeather] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchWeather();
    
    // Обновляем время каждую минуту
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchWeather = async () => {
    try {
      const response = await fetch(`/api/weather?lat=${KAMCHATKA_LAT}&lng=${KAMCHATKA_LNG}&location=Петропавловск-Камчатский`);
      const data = await response.json();
      if (data.success) {
        setWeather(data.data);
      }
    } catch (error) {
      console.error('Weather error:', error);
    }
  };

  // Определяем время суток
  const getTimeOfDay = () => {
    const hour = currentTime.getHours();
    if (hour >= 5 && hour < 7) return 'dawn'; // Рассвет
    if (hour >= 7 && hour < 18) return 'day'; // День
    if (hour >= 18 && hour < 20) return 'sunset'; // Закат
    return 'night'; // Ночь
  };

  // Определяем сезон
  const getSeason = () => {
    const month = currentTime.getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  };

  // Получаем градиент фона как у Samsung Weather
  const getBackgroundGradient = () => {
    const timeOfDay = getTimeOfDay();
    const season = getSeason();
    const condition = weather?.condition || 'clear';

    // Samsung Weather градиенты
    if (condition.includes('rain') || condition.includes('drizzle')) {
      if (timeOfDay === 'night') return 'from-slate-900 via-gray-800 to-slate-900';
      return 'from-gray-600 via-gray-500 to-gray-600';
    }
    
    if (condition.includes('snow')) {
      return 'from-slate-200 via-blue-100 to-slate-300';
    }

    if (condition.includes('cloud') || condition.includes('overcast')) {
      if (timeOfDay === 'night') return 'from-slate-800 via-gray-700 to-slate-800';
      return 'from-gray-400 via-gray-300 to-blue-200';
    }

    // Ясная погода
    if (timeOfDay === 'dawn') return 'from-orange-300 via-pink-300 to-purple-400';
    if (timeOfDay === 'day') {
      if (season === 'summer') return 'from-sky-400 via-blue-400 to-blue-500';
      if (season === 'winter') return 'from-sky-300 via-blue-200 to-blue-300';
      return 'from-sky-400 via-blue-300 to-blue-400';
    }
    if (timeOfDay === 'sunset') return 'from-orange-400 via-red-400 to-purple-500';
    if (timeOfDay === 'night') return 'from-indigo-900 via-purple-900 to-slate-900';

    return 'from-sky-400 via-blue-400 to-blue-500';
  };

  // Иконка погоды
  const getWeatherIcon = () => {
    const condition = weather?.condition || 'clear';
    const timeOfDay = getTimeOfDay();
    const iconClass = "w-32 h-32 md:w-40 md:h-40";

    if (condition.includes('rain')) return <CloudRain className={iconClass + " text-white"} />;
    if (condition.includes('snow')) return <CloudSnow className={iconClass + " text-white"} />;
    if (condition.includes('cloud')) return <Cloud className={iconClass + " text-white"} />;
    
    if (timeOfDay === 'dawn') return <Sunrise className={iconClass + " text-orange-200"} />;
    if (timeOfDay === 'sunset') return <Sunset className={iconClass + " text-orange-200"} />;
    if (timeOfDay === 'night') return <Moon className={iconClass + " text-yellow-100"} />;
    
    return <Sun className={iconClass + " text-yellow-100"} />;
  };

  // Текст погоды на русском
  const getWeatherText = () => {
    const condition = weather?.condition || 'clear';
    if (condition === 'clear') return 'Ясно';
    if (condition === 'mostly_clear') return 'Малооблачно';
    if (condition === 'partly_cloudy') return 'Облачно';
    if (condition === 'overcast') return 'Пасмурно';
    if (condition === 'rain') return 'Дождь';
    if (condition === 'snow') return 'Снег';
    if (condition === 'fog') return 'Туман';
    return 'Переменная облачность';
  };

  if (!mounted) return null;

  const gradient = getBackgroundGradient();

  return (
    <div className={`min-h-screen bg-gradient-to-br ${gradient} transition-all duration-1000 relative overflow-hidden`}>
      
      {/* Анимированный фон - частицы погоды */}
      {weather?.condition?.includes('rain') && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-px h-12 bg-white/30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-${Math.random() * 20}%`,
                animation: `fall ${1 + Math.random() * 2}s linear infinite`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      {weather?.condition?.includes('snow') && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full opacity-80"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-${Math.random() * 20}%`,
                animation: `fall ${3 + Math.random() * 3}s linear infinite`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Основной контент */}
      <div className="relative z-10 min-h-screen flex flex-col">
        
        {/* Верхняя панель */}
        <div className="p-6 flex items-center justify-between text-white/90">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            <span className="font-medium">Петропавловск-Камчатский</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <span className="font-medium">
              {currentTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {/* Центральная секция - погода */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          
          {weather ? (
            <>
              {/* Иконка погоды */}
              <div className="mb-8 animate-float">
                {getWeatherIcon()}
              </div>

              {/* Температура */}
              <div className="text-8xl md:text-9xl font-thin text-white mb-4 tracking-tight">
                {weather.temperature}°
              </div>

              {/* Описание */}
              <div className="text-3xl md:text-4xl font-light text-white/90 mb-12">
                {getWeatherText()}
              </div>

              {/* Дополнительные данные - горизонтально */}
              <div className="grid grid-cols-3 gap-8 md:gap-16 max-w-2xl mx-auto">
                
                <div className="flex flex-col items-center">
                  <Wind className="w-8 h-8 text-white/70 mb-2" />
                  <div className="text-2xl font-light text-white">{weather.windSpeed}</div>
                  <div className="text-sm text-white/60">км/ч</div>
                </div>

                <div className="flex flex-col items-center">
                  <Droplets className="w-8 h-8 text-white/70 mb-2" />
                  <div className="text-2xl font-light text-white">{weather.humidity}</div>
                  <div className="text-sm text-white/60">%</div>
                </div>

                <div className="flex flex-col items-center">
                  <Eye className="w-8 h-8 text-white/70 mb-2" />
                  <div className="text-2xl font-light text-white">{weather.visibility}</div>
                  <div className="text-sm text-white/60">км</div>
                </div>

              </div>
            </>
          ) : (
            <div className="text-white text-2xl">Загрузка погоды...</div>
          )}

        </div>

        {/* Нижняя панель - прогноз */}
        {weather?.forecast && weather.forecast.length > 1 && (
          <div className="p-6">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 max-w-4xl mx-auto border border-white/20">
              <div className="text-white/70 text-sm font-medium mb-4">Прогноз на 5 дней</div>
              
              <div className="grid grid-cols-5 gap-4">
                {weather.forecast.slice(0, 5).map((day: any, i: number) => (
                  <div key={i} className="text-center">
                    <div className="text-white/60 text-xs mb-2">
                      {i === 0 ? 'Сегодня' : new Date(day.date).toLocaleDateString('ru-RU', { weekday: 'short' })}
                    </div>
                    <div className="my-2">
                      {day.condition?.includes('rain') ? <CloudRain className="w-8 h-8 text-white/70 mx-auto" /> :
                       day.condition?.includes('snow') ? <CloudSnow className="w-8 h-8 text-white/70 mx-auto" /> :
                       day.condition?.includes('cloud') ? <Cloud className="w-8 h-8 text-white/70 mx-auto" /> :
                       <Sun className="w-8 h-8 text-white/70 mx-auto" />}
                    </div>
                    <div className="text-white font-medium">{day.temperature?.max}°</div>
                    <div className="text-white/50 text-sm">{day.temperature?.min}°</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Кнопка к турам */}
        <div className="p-6 text-center">
          <a 
            href="/hub/tourist"
            className="inline-block px-8 py-4 bg-white/20 hover:bg-white/30 backdrop-blur-xl rounded-full text-white font-medium transition-all border border-white/30 hover:border-white/50"
          >
            Посмотреть туры →
          </a>
        </div>

      </div>

      {/* CSS для анимаций */}
      <style jsx>{`
        @keyframes fall {
          to {
            transform: translateY(100vh);
          }
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>

    </div>
  );
}
