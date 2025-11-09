/**
 * WEATHER API ENDPOINT
 * Получение данных о погоде для Петропавловска-Камчатского
 */

import { NextRequest, NextResponse } from 'next/server';
import { cache } from '@/lib/cache/redis';
import { logger } from '@/lib/logger';

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || '';
const DEFAULT_CITY = 'Petropavlovsk-Kamchatsky';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get('city') || DEFAULT_CITY;

    // Проверяем кэш (5 минут)
    const cacheKey = `weather:${city}`;
    const cached = await cache.get(cacheKey);
    
    if (cached) {
      return NextResponse.json(cached);
    }

    // Если нет API ключа - возвращаем моковые данные
    if (!OPENWEATHER_API_KEY) {
      const mockData = {
        temp: -5,
        feels_like: -8,
        condition: 'snow',
        description: 'снег',
        humidity: 85,
        wind_speed: 12,
        pressure: 1013,
        icon: '13d',
      };
      
      await cache.set(cacheKey, mockData, { ttl: 300 });
      return NextResponse.json(mockData);
    }

    // Получаем данные от OpenWeather
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=ru`,
      { next: { revalidate: 300 } } // 5 минут
    );

    if (!response.ok) {
      throw new Error(`OpenWeather API error: ${response.status}`);
    }

    const data = await response.json();

    const weatherData = {
      temp: data.main.temp,
      feels_like: data.main.feels_like,
      condition: data.weather[0].main.toLowerCase(),
      description: data.weather[0].description,
      humidity: data.main.humidity,
      wind_speed: data.wind.speed,
      pressure: data.main.pressure,
      icon: data.weather[0].icon,
    };

    // Кэшируем на 5 минут
    await cache.set(cacheKey, weatherData, { ttl: 300 });

    logger.info('Weather data fetched', { city, temp: weatherData.temp });

    return NextResponse.json(weatherData);

  } catch (error) {
    logger.error('Error fetching weather', error);

    // Fallback данные
    const fallbackData = {
      temp: -5,
      feels_like: -8,
      condition: 'clouds',
      description: 'облачно',
      humidity: 75,
      wind_speed: 8,
      pressure: 1010,
      icon: '04d',
    };

    return NextResponse.json(fallbackData);
  }
}
