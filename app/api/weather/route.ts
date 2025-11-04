import { NextRequest, NextResponse } from 'next/server';
import { Weather, ApiResponse } from '@/types';
import { config } from '@/lib/config';

export const dynamic = 'force-dynamic';

// GET /api/weather - Получение данных о погоде
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const location = searchParams.get('location');

    if (!lat || !lng) {
      return NextResponse.json({
        success: false,
        error: 'Latitude and longitude are required',
      } as ApiResponse<null>, { status: 400 });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    // Проверяем валидность координат
    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid coordinates',
      } as ApiResponse<null>, { status: 400 });
    }

    // Получаем данные о погоде
    const weather = await getWeatherData(latitude, longitude, location || undefined);

    return NextResponse.json({
      success: true,
      data: weather,
    } as ApiResponse<Weather>);

  } catch (error) {
    console.error('Error fetching weather:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch weather data',
      message: error instanceof Error ? error.message : 'Unknown error',
    } as ApiResponse<null>, { status: 500 });
  }
}

// Функция для получения данных о погоде
async function getWeatherData(lat: number, lng: number, location?: string): Promise<Weather> {
  try {
    // Используем НОВЫЙ endpoint с current (более точные данные!)
    const openMeteoUrl = `${config.weather.openMeteo.baseUrl}/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,relativehumidity_2m,precipitation,windspeed_10m,winddirection_10m,pressure_msl,visibility,uv_index&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,weathercode&timezone=auto`;

    const response = await fetch(openMeteoUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Kamchatour Hub/1.0',
      },
      next: { revalidate: 600 }, // Кэш на 10 минут (более актуальные данные)
    });

    if (!response.ok) {
      throw new Error(`Open-Meteo API error: ${response.status}`);
    }

    const data = await response.json();

    // Формируем текущую погоду из НОВОГО формата
    const current = data.current;
    const hourly = data.hourly;
    const daily = data.daily;

    // Текущий час для индекса в hourly
    const currentHourIndex = 0;

    const weather: Weather = {
      location: location || `${lat.toFixed(2)}, ${lng.toFixed(2)}`,
      temperature: Math.round(current.temperature_2m), // ИСПРАВЛЕНО!
      condition: getWeatherCondition(current.weather_code),
      humidity: Math.round(current.relative_humidity_2m || 0),
      windSpeed: Math.round(current.wind_speed_10m), // Уже в км/ч
      windDirection: current.wind_direction_10m,
      pressure: Math.round(hourly.pressure_msl[currentHourIndex] || 0),
      visibility: Math.round((hourly.visibility?.[currentHourIndex] || 10000) / 1000), // Метры -> км
      uvIndex: Math.round(hourly.uv_index[currentHourIndex] || 0),
      forecast: generateForecast(daily),
      lastUpdated: new Date(),
      safetyLevel: getSafetyLevel(current.weather_code, current.wind_speed_10m, (hourly.visibility?.[currentHourIndex] || 10000) / 1000),
      recommendations: getWeatherRecommendations(current.weather_code, current.wind_speed_10m, (hourly.visibility?.[currentHourIndex] || 10000) / 1000),
    };

    return weather;

  } catch (error) {
    console.error('Error fetching weather from Open-Meteo:', error);
    
    // Если Open-Meteo не работает, пробуем Yandex Weather
    if (config.weather.yandex.apiKey) {
      try {
        return await getYandexWeather(lat, lng, location);
      } catch (yandexError) {
        console.error('Error fetching weather from Yandex:', yandexError);
      }
    }

    // Возвращаем данные по умолчанию
    return getDefaultWeather(lat, lng, location);
  }
}

// Функция для получения погоды с Yandex
async function getYandexWeather(lat: number, lng: number, location?: string): Promise<Weather> {
  const yandexUrl = `${config.weather.yandex.baseUrl}/forecast?lat=${lat}&lon=${lng}&lang=ru_RU`;

  const response = await fetch(yandexUrl, {
    method: 'GET',
    headers: {
      'X-Yandex-API-Key': config.weather.yandex.apiKey,
    },
    next: { revalidate: 1800 },
  });

  if (!response.ok) {
    throw new Error(`Yandex Weather API error: ${response.status}`);
  }

  const data = await response.json();
  const fact = data.fact;
  const forecast = data.forecast;

  return {
    location: location || data.info.tzinfo.name,
    temperature: fact.temp,
    condition: fact.condition,
    humidity: fact.humidity,
    windSpeed: fact.wind_speed,
    windDirection: fact.wind_dir,
    pressure: fact.pressure_mm,
    visibility: fact.visibility,
    uvIndex: fact.uv_index,
    forecast: forecast.parts.map((part: any) => ({
      date: new Date(part.date),
      temperature: {
        min: part.temp_min,
        max: part.temp_max,
      },
      condition: part.condition,
      precipitation: part.prec_mm,
      windSpeed: part.wind_speed,
      humidity: part.humidity,
    })),
    lastUpdated: new Date(),
    safetyLevel: getSafetyLevel(fact.condition, fact.wind_speed, fact.visibility),
    recommendations: getWeatherRecommendations(fact.condition, fact.wind_speed, fact.visibility),
  };
}

// Функция для получения погоды по умолчанию
function getDefaultWeather(lat: number, lng: number, location?: string): Weather {
  return {
    location: location || `${lat.toFixed(2)}, ${lng.toFixed(2)}`,
    temperature: 15,
    condition: 'partly_cloudy',
    humidity: 60,
    windSpeed: 10,
    windDirection: 180,
    pressure: 760,
    visibility: 10,
    uvIndex: 3,
    forecast: [
      {
        date: new Date(),
        temperature: { min: 10, max: 20 },
        condition: 'partly_cloudy',
        precipitation: 0,
        windSpeed: 10,
        humidity: 60,
      },
    ],
    lastUpdated: new Date(),
    safetyLevel: 'good',
    recommendations: ['Подходящие условия для туризма'],
  };
}

// Функция для определения состояния погоды по коду
function getWeatherCondition(code: number): string {
  const conditions: { [key: number]: string } = {
    0: 'clear',
    1: 'mostly_clear',
    2: 'partly_cloudy',
    3: 'overcast',
    45: 'fog',
    48: 'fog',
    51: 'drizzle',
    53: 'drizzle',
    55: 'drizzle',
    61: 'rain',
    63: 'rain',
    65: 'rain',
    71: 'snow',
    73: 'snow',
    75: 'snow',
    77: 'snow',
    80: 'rain',
    81: 'rain',
    82: 'rain',
    85: 'snow',
    86: 'snow',
    95: 'thunderstorm',
    96: 'thunderstorm',
    99: 'thunderstorm',
  };

  return conditions[code] || 'unknown';
}

// Функция для определения уровня безопасности
function getSafetyLevel(condition: string | number, windSpeed: number, visibility: number): 'excellent' | 'good' | 'difficult' | 'dangerous' {
  // Если передано число (код погоды), конвертируем в строку
  const weatherCondition = typeof condition === 'number' ? getWeatherCondition(condition) : condition;
  
  // Опасные условия
  if (weatherCondition === 'thunderstorm' || windSpeed > 20 || visibility < 1) {
    return 'dangerous';
  }
  
  // Сложные условия
  if (weatherCondition === 'rain' || weatherCondition === 'snow' || windSpeed > 15 || visibility < 3) {
    return 'difficult';
  }
  
  // Хорошие условия
  if (weatherCondition === 'partly_cloudy' || weatherCondition === 'overcast' || windSpeed > 10 || visibility < 5) {
    return 'good';
  }
  
  // Отличные условия
  return 'excellent';
}

// Функция для получения рекомендаций по погоде
function getWeatherRecommendations(condition: string | number, windSpeed: number, visibility: number): string[] {
  const recommendations: string[] = [];
  const weatherCondition = typeof condition === 'number' ? getWeatherCondition(condition) : condition;
  
  // Рекомендации по видимости
  if (visibility < 1) {
    recommendations.push('❌ Очень плохая видимость - туры отменены');
  } else if (visibility < 3) {
    recommendations.push('⚠️ Ограниченная видимость - будьте осторожны');
  }
  
  // Рекомендации по ветру
  if (windSpeed > 20) {
    recommendations.push('❌ Очень сильный ветер - туры отменены');
  } else if (windSpeed > 15) {
    recommendations.push('⚠️ Сильный ветер - ограничения для горных туров');
  } else if (windSpeed > 10) {
    recommendations.push('💨 Умеренный ветер - подходящие условия');
  }
  
  // Рекомендации по осадкам
  if (weatherCondition === 'thunderstorm') {
    recommendations.push('❌ Гроза - все туры отменены');
  } else if (weatherCondition === 'rain' || weatherCondition === 'snow') {
    recommendations.push('🌧️ Осадки - возьмите дождевик');
  } else if (weatherCondition === 'drizzle') {
    recommendations.push('🌦️ Мелкий дождь - легкая одежда от дождя');
  }
  
  // Рекомендации по облачности
  if (weatherCondition === 'clear' || weatherCondition === 'mostly_clear') {
    recommendations.push('☀️ Отличная погода - идеально для всех туров');
  } else if (weatherCondition === 'partly_cloudy') {
    recommendations.push('⛅ Хорошая погода - подходит для большинства туров');
  } else if (weatherCondition === 'overcast') {
    recommendations.push('☁️ Пасмурно - подходящие условия для туризма');
  }
  
  // Общие рекомендации
  if (recommendations.length === 0) {
    recommendations.push('✅ Подходящие условия для туризма');
  }
  
  return recommendations;
}

// Функция для генерации прогноза
function generateForecast(daily: any): any[] {
  const forecast = [];
  const today = new Date();

  for (let i = 0; i < Math.min(7, daily.time.length); i++) {
    const date = new Date(daily.time[i]);
    forecast.push({
      date,
      temperature: {
        min: Math.round(daily.temperature_2m_min[i]),
        max: Math.round(daily.temperature_2m_max[i]),
      },
      condition: getWeatherCondition(daily.weathercode[i]),
      precipitation: daily.precipitation_sum[i] || 0,
      windSpeed: Math.round(daily.windspeed_10m_max[i]), // Уже в км/ч
      humidity: 60, // Open-Meteo не предоставляет дневную влажность
    });
  }

  return forecast;
}