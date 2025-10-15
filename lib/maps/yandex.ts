// =============================================
// ИНТЕГРАЦИЯ С YANDEX MAPS API
// Kamchatour Hub - Yandex Maps Integration
// =============================================

import { config } from '@/lib/config';

interface Coordinates {
  lat: number;
  lng: number;
}

interface RoutePoint {
  coordinates: Coordinates;
  address: string;
  name?: string;
}

interface RouteInfo {
  distance: number; // в метрах
  duration: number; // в секундах
  points: RoutePoint[];
}

interface GeocodingResult {
  coordinates: Coordinates;
  address: string;
  formattedAddress: string;
}

interface ReverseGeocodingResult {
  address: string;
  formattedAddress: string;
  components: Array<{
    kind: string;
    name: string;
  }>;
}

export class YandexMapsService {
  private apiKey: string;
  private baseUrl: string = 'https://geocode-maps.yandex.ru/1.x';

  constructor() {
    this.apiKey = config.maps.yandex.apiKey || process.env.YANDEX_MAPS_API_KEY || '';
    if (!this.apiKey) {
      console.warn('YANDEX_MAPS_API_KEY not configured');
    }
  }

  // Геокодирование - получение координат по адресу
  async geocode(address: string): Promise<GeocodingResult | null> {
    if (!this.apiKey) {
      throw new Error('Yandex Maps API key not configured');
    }

    try {
      const response = await fetch(
        `${this.baseUrl}?apikey=${this.apiKey}&geocode=${encodeURIComponent(address)}&format=json&results=1`
      );
      
      const data = await response.json();
      
      if (data.response?.GeoObjectCollection?.featureMember?.length > 0) {
        const geoObject = data.response.GeoObjectCollection.featureMember[0].GeoObject;
        const coordinates = geoObject.Point.pos.split(' ').map(Number);
        
        return {
          coordinates: {
            lng: coordinates[0],
            lat: coordinates[1]
          },
          address: geoObject.metaDataProperty.GeocoderMetaData.text,
          formattedAddress: geoObject.metaDataProperty.GeocoderMetaData.Address.formatted
        };
      }
      
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      throw error;
    }
  }

  // Обратное геокодирование - получение адреса по координатам
  async reverseGeocode(coordinates: Coordinates): Promise<ReverseGeocodingResult | null> {
    if (!this.apiKey) {
      throw new Error('Yandex Maps API key not configured');
    }

    try {
      const response = await fetch(
        `${this.baseUrl}?apikey=${this.apiKey}&geocode=${coordinates.lng},${coordinates.lat}&format=json&results=1`
      );
      
      const data = await response.json();
      
      if (data.response?.GeoObjectCollection?.featureMember?.length > 0) {
        const geoObject = data.response.GeoObjectCollection.featureMember[0].GeoObject;
        const address = geoObject.metaDataProperty.GeocoderMetaData.Address;
        
        return {
          address: geoObject.metaDataProperty.GeocoderMetaData.text,
          formattedAddress: address.formatted,
          components: address.Components.map((component: any) => ({
            kind: component.kind,
            name: component.name
          }))
        };
      }
      
      return null;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      throw error;
    }
  }

  // Построение маршрута между точками
  async buildRoute(points: RoutePoint[]): Promise<RouteInfo | null> {
    if (!this.apiKey) {
      throw new Error('Yandex Maps API key not configured');
    }

    if (points.length < 2) {
      throw new Error('At least 2 points required for route building');
    }

    try {
      // Формируем строку точек для API
      const waypoints = points.map(point => 
        `${point.coordinates.lng},${point.coordinates.lat}`
      ).join('~');

      const response = await fetch(
        `https://api.routing.yandex.net/v2/route?apikey=${this.apiKey}&waypoints=${waypoints}&mode=driving&format=json`
      );
      
      const data = await response.json();
      
      if (data.route?.legs?.length > 0) {
        const route = data.route;
        const totalDistance = route.legs.reduce((sum: number, leg: any) => sum + leg.distance.value, 0);
        const totalDuration = route.legs.reduce((sum: number, leg: any) => sum + leg.duration.value, 0);
        
        return {
          distance: totalDistance,
          duration: totalDuration,
          points: points
        };
      }
      
      return null;
    } catch (error) {
      console.error('Route building error:', error);
      throw error;
    }
  }

  // Поиск ближайших точек
  async findNearby(
    center: Coordinates,
    radius: number = 1000, // в метрах
    type?: string
  ): Promise<Array<{
    coordinates: Coordinates;
    name: string;
    address: string;
    distance: number;
  }>> {
    if (!this.apiKey) {
      throw new Error('Yandex Maps API key not configured');
    }

    try {
      const response = await fetch(
        `https://search-maps.yandex.ru/v1/?apikey=${this.apiKey}&text=${type || 'место'}&ll=${center.lng},${center.lat}&spn=${radius/1000},${radius/1000}&results=10&format=json`
      );
      
      const data = await response.json();
      
      if (data.features) {
        return data.features.map((feature: any) => ({
          coordinates: {
            lng: feature.geometry.coordinates[0],
            lat: feature.geometry.coordinates[1]
          },
          name: feature.properties.name,
          address: feature.properties.description,
          distance: this.calculateDistance(center, {
            lng: feature.geometry.coordinates[0],
            lat: feature.geometry.coordinates[1]
          })
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Nearby search error:', error);
      throw error;
    }
  }

  // Расчет расстояния между двумя точками (формула гаверсинуса)
  calculateDistance(point1: Coordinates, point2: Coordinates): number {
    const R = 6371000; // Радиус Земли в метрах
    const dLat = this.toRadians(point2.lat - point1.lat);
    const dLng = this.toRadians(point2.lng - point1.lng);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(point1.lat)) * Math.cos(this.toRadians(point2.lat)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c;
  }

  // Преобразование градусов в радианы
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Получение статической карты
  getStaticMapUrl(
    center: Coordinates,
    zoom: number = 13,
    size: string = '600x400',
    markers?: Array<{
      coordinates: Coordinates;
      color?: string;
      label?: string;
    }>
  ): string {
    if (!this.apiKey) {
      throw new Error('Yandex Maps API key not configured');
    }

    let url = `https://static-maps.yandex.ru/1.x/?ll=${center.lng},${center.lat}&z=${zoom}&l=map&size=${size}&apikey=${this.apiKey}`;
    
    if (markers && markers.length > 0) {
      const markersStr = markers.map(marker => 
        `${marker.coordinates.lng},${marker.coordinates.lat},${marker.color || 'red'}${marker.label ? `,${marker.label}` : ''}`
      ).join('~');
      url += `&pt=${markersStr}`;
    }
    
    return url;
  }

  // Получение URL для встраивания карты
  getEmbedMapUrl(
    center: Coordinates,
    zoom: number = 13,
    markers?: Array<{
      coordinates: Coordinates;
      color?: string;
      label?: string;
    }>
  ): string {
    let url = `https://yandex.ru/maps/?ll=${center.lng},${center.lat}&z=${zoom}&l=map`;
    
    if (markers && markers.length > 0) {
      const markersStr = markers.map(marker => 
        `${marker.coordinates.lng},${marker.coordinates.lat},${marker.color || 'red'}${marker.label ? `,${marker.label}` : ''}`
      ).join('~');
      url += `&pt=${markersStr}`;
    }
    
    return url;
  }

  // Валидация координат
  isValidCoordinates(coordinates: Coordinates): boolean {
    return (
      typeof coordinates.lat === 'number' &&
      typeof coordinates.lng === 'number' &&
      coordinates.lat >= -90 &&
      coordinates.lat <= 90 &&
      coordinates.lng >= -180 &&
      coordinates.lng <= 180
    );
  }

  // Форматирование расстояния
  formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${Math.round(meters)} м`;
    } else {
      return `${(meters / 1000).toFixed(1)} км`;
    }
  }

  // Форматирование времени
  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}ч ${minutes}м`;
    } else {
      return `${minutes}м`;
    }
  }
}

// Создаем глобальный экземпляр
export const yandexMaps = new YandexMapsService();

// Экспортируем типы
export type { 
  Coordinates, 
  RoutePoint, 
  RouteInfo, 
  GeocodingResult, 
  ReverseGeocodingResult 
};