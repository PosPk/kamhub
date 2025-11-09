'use client';

import React, { useEffect, useRef, useState } from 'react';
import { yandexMaps, Coordinates, RoutePoint } from '@/lib/maps/yandex';

interface TransferMapProps {
  route?: {
    from: string;
    to: string;
    fromCoordinates: Coordinates;
    toCoordinates: Coordinates;
  };
  vehicles?: Array<{
    id: string;
    coordinates: Coordinates;
    name: string;
    status: 'available' | 'busy' | 'offline';
  }>;
  bookings?: Array<{
    id: string;
    coordinates: Coordinates;
    passengerName: string;
    status: 'pending' | 'confirmed' | 'in_progress';
  }>;
  center?: Coordinates;
  zoom?: number;
  height?: string;
  showRoute?: boolean;
  showVehicles?: boolean;
  showBookings?: boolean;
  onMarkerClick?: (id: string, type: 'vehicle' | 'booking') => void;
  className?: string;
}

export function TransferMap({
  route,
  vehicles = [],
  bookings = [],
  center,
  zoom = 13,
  height = '400px',
  showRoute = true,
  showVehicles = true,
  showBookings = true,
  onMarkerClick,
  className = ''
}: TransferMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Загрузка Yandex Maps API
  useEffect(() => {
    const loadYandexMaps = () => {
      if ((window as any).ymaps) {
        setMapLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://api-maps.yandex.ru/2.1/?apikey=${process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY}&lang=ru_RU`;
      script.onload = () => {
        (window as any).ymaps.ready(() => {
          setMapLoaded(true);
        });
      };
      script.onerror = () => {
        setError('Ошибка загрузки карт');
      };
      document.head.appendChild(script);
    };

    loadYandexMaps();
  }, []);

  // Инициализация карты
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    try {
      (window as any).ymaps.ready(() => {
        const map = new (window as any).ymaps.Map(mapRef.current, {
          center: center || [53.9, 27.6], // Минск по умолчанию
          zoom: zoom,
          controls: ['zoomControl', 'fullscreenControl', 'typeSelector']
        });

        setMapInstance(map);

        // Добавляем маршрут если есть
        if (route && showRoute) {
          addRoute(map, route);
        }

        // Добавляем маркеры транспорта
        if (showVehicles && vehicles.length > 0) {
          addVehicleMarkers(map, vehicles);
        }

        // Добавляем маркеры бронирований
        if (showBookings && bookings.length > 0) {
          addBookingMarkers(map, bookings);
        }

        // Устанавливаем границы карты
        if (vehicles.length > 0 || bookings.length > 0) {
          const bounds = calculateBounds([...vehicles, ...bookings]);
          map.setBounds(bounds, { checkZoomRange: true });
        }
      });
    } catch (err) {
      console.error('Map initialization error:', err);
      setError('Ошибка инициализации карты');
    }
  }, [mapLoaded, route, vehicles, bookings, center, zoom, showRoute, showVehicles, showBookings]);

  // Добавление маршрута на карту
  const addRoute = (map: any, route: any) => {
    const multiRoute = new (window as any).ymaps.multiRouter.MultiRoute({
      referencePoints: [
        [route.fromCoordinates.lng, route.fromCoordinates.lat],
        [route.toCoordinates.lng, route.toCoordinates.lat]
      ],
      params: {
        routingMode: 'auto'
      }
    }, {
      boundsAutoApply: true
    });

    map.geoObjects.add(multiRoute);
  };

  // Добавление маркеров транспорта
  const addVehicleMarkers = (map: any, vehicles: any[]) => {
    vehicles.forEach(vehicle => {
      const marker = new (window as any).ymaps.Placemark(
        [vehicle.coordinates.lng, vehicle.coordinates.lat],
        {
          balloonContent: `
            <div class="p-2">
              <h3 class="font-bold text-lg">${vehicle.name}</h3>
              <p class="text-sm text-gray-600">Статус: ${getVehicleStatusText(vehicle.status)}</p>
            </div>
          `,
          iconContent: getVehicleIcon(vehicle.status),
          iconLayout: 'default#imageWithContent',
          iconImageHref: getVehicleIconUrl(vehicle.status),
          iconImageSize: [32, 32],
          iconImageOffset: [-16, -16]
        },
        {
          preset: 'islands#blueIcon'
        }
      );

      marker.events.add('click', () => {
        if (onMarkerClick) {
          onMarkerClick(vehicle.id, 'vehicle');
        }
      });

      map.geoObjects.add(marker);
    });
  };

  // Добавление маркеров бронирований
  const addBookingMarkers = (map: any, bookings: any[]) => {
    bookings.forEach(booking => {
      const marker = new (window as any).ymaps.Placemark(
        [booking.coordinates.lng, booking.coordinates.lat],
        {
          balloonContent: `
            <div class="p-2">
              <h3 class="font-bold text-lg">${booking.passengerName}</h3>
              <p class="text-sm text-gray-600">Статус: ${getBookingStatusText(booking.status)}</p>
            </div>
          `,
          iconContent: getBookingIcon(booking.status),
          iconLayout: 'default#imageWithContent',
          iconImageHref: getBookingIconUrl(booking.status),
          iconImageSize: [28, 28],
          iconImageOffset: [-14, -14]
        },
        {
          preset: 'islands#greenIcon'
        }
      );

      marker.events.add('click', () => {
        if (onMarkerClick) {
          onMarkerClick(booking.id, 'booking');
        }
      });

      map.geoObjects.add(marker);
    });
  };

  // Расчет границ карты
  const calculateBounds = (items: any[]) => {
    if (items.length === 0) return null;

    const lats = items.map(item => item.coordinates.lat);
    const lngs = items.map(item => item.coordinates.lng);

    return [
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)]
    ];
  };

  // Получение иконки транспорта
  const getVehicleIcon = (status: string) => {
    switch (status) {
      case 'available': return '🚗';
      case 'busy': return '🚕';
      case 'offline': return '🚙';
      default: return '🚗';
    }
  };

  const getVehicleIconUrl = (status: string) => {
    // В реальном приложении здесь будут URL иконок
    return '/icons/vehicle.png';
  };

  const getVehicleStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Доступен';
      case 'busy': return 'Занят';
      case 'offline': return 'Офлайн';
      default: return 'Неизвестно';
    }
  };

  // Получение иконки бронирования
  const getBookingIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'confirmed': return '✅';
      case 'in_progress': return '🚌';
      default: return '📋';
    }
  };

  const getBookingIconUrl = (status: string) => {
    // В реальном приложении здесь будут URL иконок
    return '/icons/booking.png';
  };

  const getBookingStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Ожидает подтверждения';
      case 'confirmed': return 'Подтверждено';
      case 'in_progress': return 'В пути';
      default: return 'Неизвестно';
    }
  };

  if (error) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-center text-gray-600">
          <p className="text-lg font-semibold mb-2">Ошибка загрузки карты</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!mapLoaded) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-center text-gray-600">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
          <p>Загрузка карты...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div
        ref={mapRef}
        className="w-full rounded-lg shadow-lg"
        style={{ height }}
      />
      
      {/* Легенда карты */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 text-sm">
        <h4 className="font-semibold mb-2">Легенда</h4>
        {showVehicles && (
          <div className="space-y-1">
            <div className="flex items-center">
              <span className="mr-2">🚗</span>
              <span>Доступен</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">🚕</span>
              <span>Занят</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">🚙</span>
              <span>Офлайн</span>
            </div>
          </div>
        )}
        {showBookings && (
          <div className="space-y-1 mt-2">
            <div className="flex items-center">
              <span className="mr-2">⏳</span>
              <span>Ожидает</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">✅</span>
              <span>Подтверждено</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">🚌</span>
              <span>В пути</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Дополнительные компоненты для работы с картой

interface MapControlsProps {
  onCenterChange?: (center: Coordinates) => void;
  onZoomChange?: (zoom: number) => void;
  onLocationRequest?: () => void;
}

export function MapControls({ onCenterChange, onZoomChange, onLocationRequest }: MapControlsProps) {
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);

  const requestUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(coords);
          if (onLocationRequest) {
            onLocationRequest();
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  };

  return (
    <div className="flex space-x-2">
      <button
        onClick={requestUserLocation}
        className="px-3 py-2 bg-gradient-to-r from-blue-400 to-cyan-400 text-gray-900 rounded-lg hover:bg-gradient-to-r from-blue-400 to-cyan-400/90 transition-colors"
      >
        📍 Мое местоположение
      </button>
    </div>
  );
}

export default TransferMap;