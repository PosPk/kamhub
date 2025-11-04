'use client';

import React, { useState, useEffect } from 'react';
import { Weather } from '@/types';
import { 
  Sun, Cloud, CloudRain, CloudSnow, CloudDrizzle, 
  CloudFog, CloudLightning, Droplets, Wind, 
  Gauge, Eye, CloudSun 
} from 'lucide-react';

interface WeatherWidgetProps {
  lat: number;
  lng: number;
  location?: string;
  className?: string;
}

export function WeatherWidget({ lat, lng, location, className }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWeather();
  }, [lat, lng]);

  const fetchWeather = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/weather?lat=${lat}&lng=${lng}&location=${location || ''}`);
      const data = await response.json();
      
      if (data.success) {
        setWeather(data.data);
      } else {
        setError(data.error || 'Не удалось получить данные о погоде');
      }
    } catch (err) {
      setError('Ошибка при загрузке погоды');
      console.error('Weather fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition: string) => {
    const iconClass = "w-12 h-12";
    switch (condition) {
      case 'clear':
        return <Sun className={iconClass + " text-yellow-500"} />;
      case 'mostly_clear':
        return <CloudSun className={iconClass + " text-yellow-400"} />;
      case 'partly_cloudy':
        return <Cloud className={iconClass + " text-gray-400"} />;
      case 'overcast':
        return <Cloud className={iconClass + " text-gray-500"} />;
      case 'fog':
        return <CloudFog className={iconClass + " text-gray-400"} />;
      case 'drizzle':
        return <CloudDrizzle className={iconClass + " text-blue-400"} />;
      case 'rain':
        return <CloudRain className={iconClass + " text-blue-500"} />;
      case 'snow':
        return <CloudSnow className={iconClass + " text-blue-200"} />;
      case 'thunderstorm':
        return <CloudLightning className={iconClass + " text-purple-500"} />;
      default:
        return <CloudSun className={iconClass + " text-yellow-400"} />;
    }
  };

  const getWeatherText = (condition: string) => {
    switch (condition) {
      case 'clear':
        return 'Ясно';
      case 'mostly_clear':
        return 'В основном ясно';
      case 'partly_cloudy':
        return 'Переменная облачность';
      case 'overcast':
        return 'Пасмурно';
      case 'fog':
        return 'Туман';
      case 'drizzle':
        return 'Моросящий дождь';
      case 'rain':
        return 'Дождь';
      case 'snow':
        return 'Снег';
      case 'thunderstorm':
        return 'Гроза';
      default:
        return 'Неизвестно';
    }
  };

  const getWindDirection = (degrees: number) => {
    const directions = ['С', 'СВ', 'В', 'ЮВ', 'Ю', 'ЮЗ', 'З', 'СЗ'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  const getUVIndexText = (index: number) => {
    if (index <= 2) return 'Низкий';
    if (index <= 5) return 'Умеренный';
    if (index <= 7) return 'Высокий';
    if (index <= 10) return 'Очень высокий';
    return 'Экстремальный';
  };

  const getUVIndexColor = (index: number) => {
    if (index <= 2) return 'text-green-600';
    if (index <= 5) return 'text-yellow-600';
    if (index <= 7) return 'text-orange-600';
    if (index <= 10) return 'text-red-600';
    return 'text-purple-600';
  };

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-100 dark:border-gray-700 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-100 dark:border-gray-700 ${className}`}>
        <div className="text-center text-gray-500 dark:text-gray-400">
          <div className="mb-2 flex justify-center">
            <CloudSun className="w-8 h-8 text-gray-400" />
          </div>
          <div className="text-sm">{error}</div>
          <button
            onClick={fetchWeather}
            className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  if (!weather) {
    return null;
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-100 dark:border-gray-700 ${className}`}>
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Погода</h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {weather.location}
        </div>
      </div>

      {/* Текущая погода */}
      <div className="text-center mb-4">
        <div className="mb-2 flex justify-center">
          {getWeatherIcon(weather.condition)}
        </div>
        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
          {weather.temperature}°C
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {getWeatherText(weather.condition)}
        </div>
      </div>

      {/* Детали погоды */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center space-x-2">
          <Droplets className="w-4 h-4 text-blue-500" />
          <span className="text-gray-600">Влажность</span>
          <span className="font-medium">{weather.humidity}%</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Wind className="w-4 h-4 text-gray-500" />
          <span className="text-gray-600">Ветер</span>
          <span className="font-medium">
            {weather.windSpeed} км/ч {getWindDirection(weather.windDirection)}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Gauge className="w-4 h-4 text-gray-500" />
          <span className="text-gray-600">Давление</span>
          <span className="font-medium">{weather.pressure} мм рт.ст.</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Eye className="w-4 h-4 text-gray-500" />
          <span className="text-gray-600">Видимость</span>
          <span className="font-medium">{weather.visibility} км</span>
        </div>
        
        <div className="flex items-center space-x-2 col-span-2">
          <Sun className="w-4 h-4 text-yellow-500" />
          <span className="text-gray-600">УФ-индекс</span>
          <span className={`font-medium ${getUVIndexColor(weather.uvIndex)}`}>
            {weather.uvIndex} ({getUVIndexText(weather.uvIndex)})
          </span>
        </div>
      </div>

      {/* Прогноз на завтра */}
      {weather.forecast && weather.forecast.length > 1 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm font-medium text-gray-900 mb-2">Завтра</div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <span>{getWeatherIcon(weather.forecast[1].condition)}</span>
              <span className="text-gray-600">
                {weather.forecast[1].temperature.min}° - {weather.forecast[1].temperature.max}°
              </span>
            </div>
            <div className="text-gray-600">
              {getWeatherText(weather.forecast[1].condition)}
            </div>
          </div>
        </div>
      )}

      {/* Время обновления */}
      <div className="mt-4 text-xs text-gray-400 text-center">
        Обновлено: {new Date(weather.lastUpdated).toLocaleTimeString('ru-RU')}
      </div>
    </div>
  );
}