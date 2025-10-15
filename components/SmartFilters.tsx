'use client';

import React, { useState, useRef } from 'react';
import { useFloatingUI } from '@/lib/hooks/useFloatingUI';

interface TourFilters {
  difficulty: string[];
  season: string[];
  priceRange: [number, number];
  duration: [number, number];
}

interface SmartFiltersProps {
  filters: TourFilters;
  onFiltersChange: (filters: TourFilters) => void;
}

export function SmartFilters({ filters, onFiltersChange }: SmartFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  
  const { refs, floatingStyles, context, isMobile, getReferenceProps, getFloatingProps } = useFloatingUI({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: 'bottom-start',
    interaction: 'click',
    offset: 5
  });

  const filterTypes = [
    { key: 'difficulty', label: 'Сложность', icon: '🏔️' },
    { key: 'season', label: 'Сезон', icon: '🌿' },
    { key: 'priceRange', label: 'Цена', icon: '💰' },
    { key: 'duration', label: 'Длительность', icon: '⏱️' }
  ];

  return (
    <div className="filters-section">
      <div className="flex flex-wrap gap-2">
        {filterTypes.map((filter) => (
          <FilterButton
            key={filter.key}
            filter={filter}
            isActive={activeFilter === filter.key}
            onClick={() => setActiveFilter(
              activeFilter === filter.key ? null : filter.key
            )}
            getReferenceProps={getReferenceProps}
            refs={refs}
          />
        ))}
      </div>
      
      {activeFilter && (
        <div
          ref={refs.setFloating}
          style={floatingStyles}
          className="filter-dropdown"
          {...getFloatingProps()}
        >
          <FilterContent
            type={activeFilter}
            value={filters[activeFilter as keyof TourFilters]}
            onChange={(value) => onFiltersChange({
              ...filters,
              [activeFilter]: value
            })}
            onClose={() => setActiveFilter(null)}
          />
        </div>
      )}
    </div>
  );
}

function FilterButton({ 
  filter, 
  isActive, 
  onClick,
  getReferenceProps,
  refs
}: { 
  filter: { key: string; label: string; icon: string };
  isActive: boolean;
  onClick: () => void;
  getReferenceProps: () => any;
  refs: any;
}) {
  return (
    <button
      ref={refs.setReference}
      onClick={onClick}
      className={`filter-button ${isActive ? 'active' : ''}`}
      {...getReferenceProps()}
    >
      <span className="mr-1">{filter.icon}</span>
      {filter.label}
      <span className="ml-1">▾</span>
    </button>
  );
}

function FilterContent({ 
  type, 
  value, 
  onChange, 
  onClose 
}: { 
  type: string;
  value: any;
  onChange: (value: any) => void;
  onClose: () => void;
}) {
  switch (type) {
    case 'difficulty':
      return (
        <DifficultyFilter 
          value={value} 
          onChange={onChange} 
          onClose={onClose}
        />
      );
    case 'season':
      return (
        <SeasonFilter 
          value={value} 
          onChange={onChange} 
          onClose={onClose}
        />
      );
    case 'priceRange':
      return (
        <PriceRangeFilter 
          value={value} 
          onChange={onChange} 
          onClose={onClose}
        />
      );
    case 'duration':
      return (
        <DurationFilter 
          value={value} 
          onChange={onChange} 
          onClose={onClose}
        />
      );
    default:
      return null;
  }
}

// Компоненты фильтров
function DifficultyFilter({ value, onChange, onClose }: { value: string[]; onChange: (value: string[]) => void; onClose: () => void }) {
  const difficulties = ['easy', 'medium', 'hard', 'expert'];
  
  return (
    <div className="p-4 min-w-48">
      <h3 className="font-semibold mb-3">Сложность</h3>
      <div className="space-y-2">
        {difficulties.map((diff) => (
          <label key={diff} className="flex items-center">
            <input
              type="checkbox"
              checked={value.includes(diff)}
              onChange={(e) => {
                if (e.target.checked) {
                  onChange([...value, diff]);
                } else {
                  onChange(value.filter(d => d !== diff));
                }
              }}
              className="mr-2"
            />
            <span className="capitalize">{diff}</span>
          </label>
        ))}
      </div>
      <button
        onClick={onClose}
        className="mt-3 w-full bg-blue-600 text-white py-2 px-3 rounded text-sm"
      >
        Применить
      </button>
    </div>
  );
}

function SeasonFilter({ value, onChange, onClose }: { value: string[]; onChange: (value: string[]) => void; onClose: () => void }) {
  const seasons = ['spring', 'summer', 'autumn', 'winter'];
  
  return (
    <div className="p-4 min-w-48">
      <h3 className="font-semibold mb-3">Сезон</h3>
      <div className="space-y-2">
        {seasons.map((season) => (
          <label key={season} className="flex items-center">
            <input
              type="checkbox"
              checked={value.includes(season)}
              onChange={(e) => {
                if (e.target.checked) {
                  onChange([...value, season]);
                } else {
                  onChange(value.filter(s => s !== season));
                }
              }}
              className="mr-2"
            />
            <span className="capitalize">{season}</span>
          </label>
        ))}
      </div>
      <button
        onClick={onClose}
        className="mt-3 w-full bg-blue-600 text-white py-2 px-3 rounded text-sm"
      >
        Применить
      </button>
    </div>
  );
}

function PriceRangeFilter({ value, onChange, onClose }: { value: [number, number]; onChange: (value: [number, number]) => void; onClose: () => void }) {
  return (
    <div className="p-4 min-w-48">
      <h3 className="font-semibold mb-3">Цена</h3>
      <div className="space-y-3">
        <div>
          <label className="block text-sm mb-1">От: {value[0]}₽</label>
          <input
            type="range"
            min="0"
            max="100000"
            step="1000"
            value={value[0]}
            onChange={(e) => onChange([Number(e.target.value), value[1]])}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">До: {value[1]}₽</label>
          <input
            type="range"
            min="0"
            max="100000"
            step="1000"
            value={value[1]}
            onChange={(e) => onChange([value[0], Number(e.target.value)])}
            className="w-full"
          />
        </div>
      </div>
      <button
        onClick={onClose}
        className="mt-3 w-full bg-blue-600 text-white py-2 px-3 rounded text-sm"
      >
        Применить
      </button>
    </div>
  );
}

function DurationFilter({ value, onChange, onClose }: { value: [number, number]; onChange: (value: [number, number]) => void; onClose: () => void }) {
  return (
    <div className="p-4 min-w-48">
      <h3 className="font-semibold mb-3">Длительность (часы)</h3>
      <div className="space-y-3">
        <div>
          <label className="block text-sm mb-1">От: {value[0]}ч</label>
          <input
            type="range"
            min="1"
            max="24"
            step="1"
            value={value[0]}
            onChange={(e) => onChange([Number(e.target.value), value[1]])}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">До: {value[1]}ч</label>
          <input
            type="range"
            min="1"
            max="24"
            step="1"
            value={value[1]}
            onChange={(e) => onChange([value[0], Number(e.target.value)])}
            className="w-full"
          />
        </div>
      </div>
      <button
        onClick={onClose}
        className="mt-3 w-full bg-blue-600 text-white py-2 px-3 rounded text-sm"
      >
        Применить
      </button>
    </div>
  );
}