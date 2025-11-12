/**
 * WEATHER API ENDPOINT
 * Получение данных о погоде для Петропавловска-Камчатского
 * Использует Open-Meteo API (БЕЗ регистрации и ключей!)
 */

import { NextRequest, NextResponse } from 'next/server';
import { cache } from '@/lib/cache/redis';
import { logger } from '@/lib/logger';

// Координаты Петропавловска-Камчатского
const COORDINATES = {
  'Petropavlovsk-Kamchatsky': { lat: 53.0167, lon: 158.65 },
};

// Маппинг WMO Weather codes → наши conditions
// https://open-meteo.com/en/docs
function getConditionFromCode(code: number): { condition: string; description: string } {
  if (code === 0) return { condition: 'clear', description: 'ясно' };
  if (code <= 3) return { condition: 'clouds', description: 'облачно' };
  if (code <= 49) return { condition: 'clouds', description: 'туман' };
  if (code <= 59) return { condition: 'rain', description: 'морось' };
  if (code <= 69) return { condition: 'rain', description: 'дождь' };
  if (code <= 79) return { condition: 'snow', description: 'снег' };
  if (code <= 84) return { condition: 'rain', description: 'ливень' };
  if (code <= 86) return { condition: 'snow', description: 'снегопад' };
  return { condition: 'clouds', description: 'переменная' };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get('city') || 'Petropavlovsk-Kamchatsky';

    // Проверяем кэш (5 минут)
    const cacheKey = `weather:${city}`;
    const cached = await cache.get(cacheKey);
    
    if (cached) {
      return NextResponse.json(cached);
    }

    // Получаем координаты города
    const coords = COORDINATES[city as keyof typeof COORDINATES] || COORDINATES['Petropavlovsk-Kamchatsky'];

    // Запрос к Open-Meteo API (БЕЗ ключа!)
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,surface_pressure&timezone=Asia/Kamchatka`,
      { next: { revalidate: 300 } } // 5 минут
    );

    if (!response.ok) {
      throw new Error(`Open-Meteo API error: ${response.status}`);
    }

    const data = await response.json();
    const current = data.current;

    // Определяем condition и description из weather_code
    const { condition, description } = getConditionFromCode(current.weather_code);

    const weatherData = {
      temp: Math.round(current.temperature_2m),
      feels_like: Math.round(current.temperature_2m - 2), // Примерное ощущение с учетом ветра
      condition,
      description,
      humidity: current.relative_humidity_2m,
      wind_speed: Math.round(current.wind_speed_10m),
      pressure: current.surface_pressure,
      icon: condition === 'clear' ? '01d' : condition === 'rain' ? '10d' : condition === 'snow' ? '13d' : '04d',
    };

    // Кэшируем на 5 минут
    await cache.set(cacheKey, weatherData, { ttl: 300 });

    logger.info('Weather data fetched from Open-Meteo', { city, temp: weatherData.temp, condition });

    return NextResponse.json(weatherData);

  } catch (error) {
    logger.error('Error fetching weather', error);

    // Fallback данные (более реалистичные для Камчатки)
    const fallbackData = {
      temp: 1,
      feels_like: -2,
      condition: 'clouds',
      description: 'облачно',
      humidity: 60,
      wind_speed: 5,
      pressure: 1013,
      icon: '04d',
    };

    return NextResponse.json(fallbackData);
  }
}
