'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Wind, Droplets, Eye, Sun, Moon, Cloud, CloudRain, CloudSnow, Sunrise, Sunset, Search, SlidersHorizontal } from 'lucide-react';
import './samsung-elegant.css';

// Петропавловск-Камчатский
const KAMCHATKA_LAT = 53.0195;
const KAMCHATKA_LNG = 158.6505;

export default function SamsungWeatherHomePage() {
  const [weather, setWeather] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchWeather();
    
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchWeather = async () => {
    try {
      const lat = KAMCHATKA_LAT;
      const lon = KAMCHATKA_LNG;
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,is_day,wind_speed_10m,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&forecast_days=5`);
      const data = await res.json();
      
      setWeather({
        temperature: Math.round(data.current.temperature_2m),
        weatherCode: data.current.weather_code,
        isDay: data.current.is_day === 1,
        windSpeed: Math.round(data.current.wind_speed_10m),
        humidity: data.current.relative_humidity_2m,
        forecast: data.daily
      });
    } catch (error) {
      console.error('Weather error:', error);
    }
  };

  const getThemeGradient = () => {
    if (!weather) return 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)';
    
    const { weatherCode, isDay } = weather;
    const hour = currentTime.getHours();
    
    // Снег
    if (weatherCode >= 71 && weatherCode <= 77) {
      return 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 30%, #7dd3fc 60%, #bae6fd 100%)';
    }
    
    // Дождь
    if (weatherCode >= 51 && weatherCode <= 67 || weatherCode >= 80) {
      if (!isDay) return 'linear-gradient(135deg, #334155 0%, #475569 50%, #334155 100%)';
      return 'linear-gradient(135deg, #64748b 0%, #94a3b8 50%, #64748b 100%)';
    }
    
    // Облачно
    if (weatherCode >= 1 && weatherCode <= 3) {
      if (!isDay) return 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #1e293b 100%)';
      return 'linear-gradient(135deg, #cbd5e1 0%, #e2e8f0 50%, #cbd5e1 100%)';
    }
    
    // Ясно
    if (weatherCode === 0) {
      // Рассвет
      if (hour >= 5 && hour < 7) {
        return 'linear-gradient(135deg, #fbbf24 0%, #fb923c 30%, #f97316 60%, #fbbf24 100%)';
      }
      // Закат
      if (hour >= 18 && hour < 20) {
        return 'linear-gradient(135deg, #fb923c 0%, #f97316 30%, #dc2626 60%, #fb923c 100%)';
      }
      // День
      if (isDay) {
        return 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 30%, #0284c7 60%, #38bdf8 100%)';
      }
      // Ночь
      return 'linear-gradient(135deg, #1e1b4b 0%, #312e81 30%, #4c1d95 60%, #312e81 100%)';
    }
    
    return 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)';
  };

  const getWeatherIcon = () => {
    if (!weather) return <Cloud className="w-32 h-32 md:w-40 md:h-40 text-white/80" />;
    
    const { weatherCode, isDay } = weather;
    const hour = currentTime.getHours();
    const iconClass = "w-32 h-32 md:w-40 md:h-40 animate-float";
    
    if (weatherCode >= 71 && weatherCode <= 77) return <CloudSnow className={`${iconClass} text-white`} />;
    if (weatherCode >= 51) return <CloudRain className={`${iconClass} text-white/90`} />;
    if (weatherCode >= 1 && weatherCode <= 3) return <Cloud className={`${iconClass} text-white/80`} />;
    
    if (hour >= 5 && hour < 7) return <Sunrise className={`${iconClass} text-orange-200`} />;
    if (hour >= 18 && hour < 20) return <Sunset className={`${iconClass} text-orange-200`} />;
    if (!isDay) return <Moon className={`${iconClass} text-yellow-100`} />;
    
    return <Sun className={`${iconClass} text-yellow-100`} />;
  };

  const getWeatherText = () => {
    if (!weather) return 'Загрузка...';
    
    const code = weather.weatherCode;
    if (code === 0) return 'Ясно';
    if (code >= 1 && code <= 3) return 'Облачно';
    if (code >= 51 && code <= 67) return 'Дождь';
    if (code >= 71 && code <= 77) return 'Снег';
    if (code >= 80) return 'Ливень';
    return 'Переменная облачность';
  };

  const gradient = getThemeGradient();

  return (
    <div className="weather-background" style={{ background: gradient }}>
      
      {/* Погодные частицы */}
      {weather?.weatherCode >= 51 && weather?.weatherCode <= 67 && (
        <div className="weather-particles">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-${Math.random() * 20}%`,
                width: '2px',
                height: '20px',
                animation: `fall ${1 + Math.random() * 2}s linear infinite`,
                animationDelay: `${Math.random() * 2}s`,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.5)'
              }}
            />
          ))}
        </div>
      )}

      {weather?.weatherCode >= 71 && weather?.weatherCode <= 77 && (
        <div className="weather-particles">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-${Math.random() * 20}%`,
                width: '8px',
                height: '8px',
                animation: `fall ${3 + Math.random() * 3}s linear infinite`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Контент */}
      <div className="relative z-10 min-h-screen flex flex-col">
        
        {/* Хедер */}
        <div className="hero-elegant">
          <div className="hero-content-elegant">
            
            {/* Локация и время */}
            <div className="flex items-center justify-between mb-8 text-white/70 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Петропавловск-Камчатский</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{currentTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

            {/* Погода */}
            {weather && (
              <>
                <div className="mb-6">
                  {getWeatherIcon()}
                </div>

                <div className="hero-title-elegant mb-4">
                  {weather.temperature}°
                </div>

                <div className="hero-subtitle-elegant mb-8">
                  {getWeatherText()}
                </div>

                {/* Детали */}
                <div className="grid grid-cols-3 gap-8 max-w-md mx-auto mb-12">
                  <div className="text-center">
                    <Wind className="w-6 h-6 text-white/60 mx-auto mb-2" />
                    <div className="text-xl font-light text-white">{weather.windSpeed}</div>
                    <div className="text-xs text-white/50">км/ч</div>
                  </div>
                  <div className="text-center">
                    <Droplets className="w-6 h-6 text-white/60 mx-auto mb-2" />
                    <div className="text-xl font-light text-white">{weather.humidity}</div>
                    <div className="text-xs text-white/50">%</div>
                  </div>
                  <div className="text-center">
                    <Eye className="w-6 h-6 text-white/60 mx-auto mb-2" />
                    <div className="text-xl font-light text-white">10</div>
                    <div className="text-xs text-white/50">км</div>
                  </div>
                </div>
              </>
            )}

            {/* Поиск */}
            <div className="search-elegant">
              <div className="search-box-elegant">
                <input
                  type="text"
                  placeholder="Поиск туров: вулканы, океан, медведи..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input-elegant"
                />
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="filter-btn-elegant"
                >
                  <SlidersHorizontal />
                  Фильтры
                </button>
                <button className="filter-btn-elegant bg-purple-600/30 border-purple-500/50">
                  <Search />
                </button>
              </div>

              {showFilters && (
                <div className="filters-panel-elegant">
                  <div className="filter-group">
                    <label>Категория</label>
                    <select>
                      <option>Все</option>
                      <option>Вулканы</option>
                      <option>Океан</option>
                      <option>Медведи</option>
                    </select>
                  </div>
                  <div className="filter-group">
                    <label>Цена</label>
                    <select>
                      <option>Любая</option>
                      <option>До 10000₽</option>
                      <option>10000-50000₽</option>
                      <option>50000₽+</option>
                    </select>
                  </div>
                  <div className="filter-group">
                    <label>Длительность</label>
                    <select>
                      <option>Любая</option>
                      <option>1 день</option>
                      <option>2-3 дня</option>
                      <option>Неделя+</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="mt-12">
              <a
                href="/hub/tourist"
                className="inline-block px-10 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-full text-white font-medium transition-all border border-white/20 hover:border-white/40 text-lg"
              >
                Посмотреть все туры →
              </a>
            </div>

          </div>
        </div>

        {/* Прогноз */}
        {weather?.forecast && (
          <div className="px-6 pb-12">
            <div className="glass-card max-w-4xl mx-auto p-8">
              <div className="text-white/60 text-sm font-medium mb-6">Прогноз на 5 дней</div>
              
              <div className="grid grid-cols-5 gap-6">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="text-center">
                    <div className="text-white/50 text-xs mb-3">
                      {i === 0 ? 'Сегодня' : new Date(weather.forecast.time[i]).toLocaleDateString('ru-RU', { weekday: 'short' })}
                    </div>
                    <div className="my-3">
                      {weather.forecast.weather_code[i] >= 71 ? <CloudSnow className="w-8 h-8 text-white/70 mx-auto" /> :
                       weather.forecast.weather_code[i] >= 51 ? <CloudRain className="w-8 h-8 text-white/70 mx-auto" /> :
                       weather.forecast.weather_code[i] >= 1 ? <Cloud className="w-8 h-8 text-white/70 mx-auto" /> :
                       <Sun className="w-8 h-8 text-white/70 mx-auto" />}
                    </div>
                    <div className="text-white font-medium text-lg">{Math.round(weather.forecast.temperature_2m_max[i])}°</div>
                    <div className="text-white/40 text-sm">{Math.round(weather.forecast.temperature_2m_min[i])}°</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
