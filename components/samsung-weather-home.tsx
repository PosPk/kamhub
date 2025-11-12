'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// =============================================
// ТИПЫ
// =============================================

interface WeatherData {
  temp: number;
  feels_like: number;
  condition: string;
  description: string;
  humidity: number;
  wind_speed: number;
  pressure: number;
  icon: string;
}

interface Tour {
  id: string;
  name: string;
  image: string;
  price: number;
  duration: string;
  rating: number;
}

// =============================================
// ГЛАВНЫЙ КОМПОНЕНТ
// =============================================

export function KamchatourWeatherHome() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Обновление времени каждую секунду
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Загрузка погоды
  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    try {
      const response = await fetch('/api/weather?city=Petropavlovsk-Kamchatsky');
      if (response.ok) {
        const data = await response.json();
        setWeather(data);
      }
    } catch (error) {
      console.error('Error fetching weather:', error);
    } finally {
      setLoading(false);
    }
  };

  // Определяем градиент на основе времени и погоды
  const getGradient = () => {
    const hour = currentTime.getHours();
    
    if (hour >= 5 && hour < 7) {
      // Рассвет
      return 'from-orange-300 via-pink-400 to-purple-500';
    } else if (hour >= 7 && hour < 12) {
      // Утро
      return 'from-blue-300 via-blue-400 to-blue-500';
    } else if (hour >= 12 && hour < 17) {
      // День
      return 'from-cyan-300 via-blue-400 to-blue-600';
    } else if (hour >= 17 && hour < 20) {
      // Закат
      return 'from-orange-400 via-red-400 to-purple-600';
    } else {
      // Ночь
      return 'from-indigo-900 via-purple-900 to-blue-900';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', { 
      weekday: 'long', 
      day: 'numeric',
      month: 'long' 
    });
  };

  // Популярные туры (моковые данные)
  const tours: Tour[] = [
    {
      id: '1',
      name: 'Вулканы Мутновский и Горелый',
      image: '/tours/volcano.jpg',
      price: 15000,
      duration: '1 день',
      rating: 4.9,
    },
    {
      id: '2',
      name: 'Долина Гейзеров',
      image: '/tours/geysers.jpg',
      price: 35000,
      duration: '1 день',
      rating: 5.0,
    },
    {
      id: '3',
      name: 'Авачинский вулкан',
      image: '/tours/avacha.jpg',
      price: 8000,
      duration: '8 часов',
      rating: 4.8,
    },
  ];

  if (loading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${getGradient()} flex items-center justify-center`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-white text-2xl font-light"
        >
          Загрузка...
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getGradient()} transition-all duration-1000`}>
      {/* Анимированный фон */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Контент */}
      <div className="relative z-10 px-6 py-8 max-w-7xl mx-auto">
        {/* Верхняя панель */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-start mb-12"
        >
          <div>
            <h1 className="text-white text-5xl font-extralight mb-2">
              Петропавловск-Камчатский
            </h1>
            <p className="text-white/80 text-xl font-light">
              {formatDate(currentTime)}
            </p>
          </div>
          <div className="text-right">
            <div className="text-white text-6xl font-extralight tabular-nums">
              {formatTime(currentTime)}
            </div>
          </div>
        </motion.div>

        {/* Основной виджет погоды */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="backdrop-blur-xl bg-white/10 rounded-[40px] p-8 mb-8 border border-white/20"
        >
          <div className="flex items-start justify-between">
            {/* Температура */}
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-start"
              >
                <span className="text-white text-[120px] font-extralight leading-none tabular-nums">
                  {weather ? Math.round(weather.temp) : '--'}
                </span>
                <span className="text-white/80 text-6xl font-light mt-4">°</span>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-4 space-y-2"
              >
                <p className="text-white text-2xl font-light capitalize">
                  {weather?.description || 'Загрузка...'}
                </p>
                <p className="text-white/70 text-lg font-light">
                  Ощущается как {weather ? Math.round(weather.feels_like) : '--'}°
                </p>
              </motion.div>
            </div>

            {/* Иконка погоды */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              className="text-8xl"
            >
              {getWeatherIcon(weather?.condition || 'clear')}
            </motion.div>
          </div>

          {/* Дополнительная информация */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-3 gap-6 mt-8 pt-8 border-t border-white/20"
          >
            <div className="text-center">
              <div className="text-white/60 text-sm font-light mb-1">Влажность</div>
              <div className="text-white text-2xl font-light">
                {weather?.humidity || '--'}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-white/60 text-sm font-light mb-1">Ветер</div>
              <div className="text-white text-2xl font-light">
                {weather ? Math.round(weather.wind_speed) : '--'} м/с
              </div>
            </div>
            <div className="text-center">
              <div className="text-white/60 text-sm font-light mb-1">Давление</div>
              <div className="text-white text-2xl font-light">
                {weather ? Math.round(weather.pressure * 0.75) : '--'} мм
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Популярные туры */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-8"
        >
          <h2 className="text-white text-3xl font-light mb-6">Популярные туры</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tours.map((tour, index) => (
              <motion.div
                key={tour.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="backdrop-blur-xl bg-white/10 rounded-3xl overflow-hidden border border-white/20 cursor-pointer group"
              >
                {/* Изображение (заглушка) */}
                <div className="h-48 bg-gradient-to-br from-orange-400/50 to-red-500/50 relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-2 text-white/90">
                      <span className="text-2xl">⭐</span>
                      <span className="text-lg font-medium">{tour.rating}</span>
                    </div>
                  </div>
                </div>

                {/* Информация */}
                <div className="p-6">
                  <h3 className="text-white text-xl font-medium mb-3 line-clamp-2">
                    {tour.name}
                  </h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white/60 text-sm mb-1">Длительность</div>
                      <div className="text-white text-base font-medium">{tour.duration}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-white/60 text-sm mb-1">От</div>
                      <div className="text-white text-2xl font-semibold">
                        {(tour.price / 1000).toFixed(0)}K ₽
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Быстрые действия */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {quickActions.map((action, index) => (
            <motion.button
              key={action.label}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 text-center hover:bg-white/15 transition-colors"
            >
              <div className="text-5xl mb-3">{action.icon}</div>
              <div className="text-white text-base font-medium">{action.label}</div>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

// =============================================
// ХЕЛПЕРЫ
// =============================================

function getWeatherIcon(condition: string): string {
  const icons: Record<string, string> = {
    clear: '☀️',
    clouds: '⛅',
    rain: '🌧️',
    snow: '🌨️',
    thunderstorm: '⛈️',
    drizzle: '🌦️',
    mist: '🌫️',
    fog: '🌫️',
  };
  
  return icons[condition.toLowerCase()] || '🌤️';
}

const quickActions = [
  { icon: '🗺️', label: 'Туры' },
  { icon: '🚗', label: 'Трансферы' },
  { icon: '🤖', label: 'AI Гид' },
  { icon: '📞', label: 'Поддержка' },
];
