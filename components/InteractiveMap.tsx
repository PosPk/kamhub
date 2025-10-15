'use client';

import React, { useState, useRef } from 'react';
import { useFloatingUI } from '@/lib/hooks/useFloatingUI';
import { EcoPoint } from '@/types';

interface InteractiveMapProps {
  ecoPoints: EcoPoint[];
  onPointClick?: (point: EcoPoint) => void;
}

export function InteractiveMap({ ecoPoints, onPointClick }: InteractiveMapProps) {
  const [selectedPoint, setSelectedPoint] = useState<EcoPoint | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<EcoPoint | null>(null);
  
  const { refs, floatingStyles, context, isMobile, getFloatingProps } = useFloatingUI({
    open: !!hoveredPoint,
    onOpenChange: (open) => !open && setHoveredPoint(null),
    placement: 'right-start',
    interaction: 'hover',
    offset: 10
  });

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      'volcano': '🌋',
      'hot_spring': '♨️',
      'wildlife': '🦌',
      'hiking': '🥾',
      'fishing': '🎣',
      'photography': '📸',
      'culture': '🏛️',
      'nature': '🌿'
    };
    return icons[category] || '📍';
  };

  return (
    <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
      {/* Здесь будет интеграция с Yandex Maps или OpenStreetMap */}
      <div className="absolute inset-0">
        {/* Заглушка для карты */}
        <div className="w-full h-full flex items-center justify-center text-gray-500">
          🗺️ Интерактивная карта Камчатки
        </div>
      </div>
      
      {/* Точки интереса */}
      {ecoPoints.map((point) => (
        <MapMarker
          key={point.id}
          point={point}
          onHover={setHoveredPoint}
          onClick={onPointClick}
          getCategoryIcon={getCategoryIcon}
        />
      ))}
      
      {/* Поповер для точки интереса */}
      {hoveredPoint && (
        <div
          ref={refs.setFloating}
          style={floatingStyles}
          className="eco-point-popover"
          {...getFloatingProps()}
        >
          <EcoPointCard point={hoveredPoint} />
        </div>
      )}
    </div>
  );
}

function MapMarker({ 
  point, 
  onHover, 
  onClick,
  getCategoryIcon
}: { 
  point: EcoPoint; 
  onHover: (point: EcoPoint | null) => void;
  onClick?: (point: EcoPoint) => void;
  getCategoryIcon: (category: string) => string;
}) {
  return (
    <div
      className="absolute w-6 h-6 bg-green-500 rounded-full cursor-pointer hover:bg-green-600 transition-colors"
      style={{
        left: `${point.coordinates.lng * 100}%`,
        top: `${point.coordinates.lat * 100}%`,
        transform: 'translate(-50%, -50%)'
      }}
      onMouseEnter={() => onHover(point)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick?.(point)}
    >
      <div className="w-full h-full flex items-center justify-center text-white text-xs">
        {getCategoryIcon(point.category)}
      </div>
    </div>
  );
}

function EcoPointCard({ point }: { point: EcoPoint }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-3 max-w-xs">
      <h4 className="font-semibold text-sm mb-1">{point.name}</h4>
      <p className="text-gray-600 text-xs mb-2">{point.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-green-600 font-medium text-sm">
          +{point.points} очков
        </span>
        <button className="text-blue-600 text-xs hover:underline">
          Подробнее
        </button>
      </div>
    </div>
  );
}