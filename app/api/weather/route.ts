import { NextRequest, NextResponse } from 'next/server';
import { Weather, ApiResponse } from '@/types';
import { config } from '@/lib/config';

// GET /api/weather - Получение данных о погоде
export const dynamic = 'force-dynamic';

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
    // Пробуем получить данные с Open-Meteo (бесплатный API)
    const openMeteoUrl = `${config.weather.openMeteo.baseUrl}/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,precipitation,windspeed_10m,winddirection_10m,pressure_msl,visibility,uv_index&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max&timezone=auto`;

    const response = await fetch(openMeteoUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Kamchatour Hub/1.0',
      },
      next: { revalidate: 1800 }, // Кэшируем на 30 минут
    });

    if (!response.ok) {
      throw new Error(`Open-Meteo API error: ${response.status}`);
    }

    const data = await response.json();

    // Формируем текущую погоду
    const current = data.current_weather;
    const hourly = data.hourly;
    const daily = data.daily;

    const weather: Weather = {
      location: location || `${lat.toFixed(2)}, ${lng.toFixed(2)}`,
      temperature: Math.round(current.temperature),
      condition: getWeatherCondition(current.weathercode),
      humidity: Math.round(hourly.relativehumidity_2m[0] || 0),
      windSpeed: Math.round(current.windspeed * 3.6), // Конвертируем м/с в км/ч
      windDirection: current.winddirection,
      pressure: Math.round(hourly.pressure_msl[0] || 0),
      visibility: Math.round(hourly.visibility[0] || 0),
      uvIndex: Math.round(hourly.uv_index[0] || 0),
      forecast: generateForecast(daily),
      lastUpdated: new Date(),
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
      windSpeed: Math.round(daily.windspeed_10m_max[i] * 3.6),
      humidity: 60, // Open-Meteo не предоставляет дневную влажность
    });
  }

  return forecast;
}