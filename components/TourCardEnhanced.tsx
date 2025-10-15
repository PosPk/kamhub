'use client';

import React, { useState } from 'react';
import { Tour } from '@/types';
import { TourCard } from './TourCard';
import { useFloatingUI } from '@/lib/hooks/useFloatingUI';
import { formatDuration, formatRating } from '@/lib/utils';

interface TourCardEnhancedProps {
  tour: Tour;
  className?: string;
  onClick?: () => void;
}

export function TourCardEnhanced({ tour, className, onClick }: TourCardEnhancedProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  
  const { refs, floatingStyles, context, isMobile, arrowRef, getReferenceProps, getFloatingProps } = useFloatingUI({
    open: isPopoverOpen,
    onOpenChange: setIsPopoverOpen,
    placement: 'right-start',
    interaction: 'hover',
    arrow: true,
    offset: 15
  });

  return (
    <>
      <div
        ref={refs.setReference}
        {...getReferenceProps()}
        className="tour-card-container"
      >
        <TourCard 
          tour={tour} 
          className={className}
          onClick={onClick}
        />
      </div>
      
      {isPopoverOpen && (
        <div
          ref={refs.setFloating}
          style={floatingStyles}
          className="tour-popover"
          {...getFloatingProps()}
        >
          <TourQuickView tour={tour} />
          <div ref={arrowRef} className="popover-arrow" />
        </div>
      )}
    </>
  );
}

// Компонент быстрого просмотра тура
function TourQuickView({ tour }: { tour: Tour }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 max-w-sm">
      <h3 className="font-semibold text-lg mb-2">{tour.name}</h3>
      <p className="text-gray-600 text-sm mb-3">{tour.shortDescription}</p>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm">
          <span className="mr-2">⏱️</span>
          <span>{formatDuration(tour.duration)}</span>
        </div>
        <div className="flex items-center text-sm">
          <span className="mr-2">👥</span>
          <span>{tour.minGroupSize}-{tour.maxGroupSize} чел.</span>
        </div>
        <div className="flex items-center text-sm">
          <span className="mr-2">⭐</span>
          <span>{formatRating(tour.rating)} ({tour.reviewCount} отзывов)</span>
        </div>
      </div>
      
      <div className="flex space-x-2">
        <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm">
          Забронировать
        </button>
        <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded text-sm">
          Подробнее
        </button>
      </div>
    </div>
  );
}