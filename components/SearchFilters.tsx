'use client';

import React, { useState } from 'react';
import { CloseIcon } from './SearchIcons';
import './SearchFilters.css';

interface FilterValues {
  priceMin: string;
  priceMax: string;
  dateFrom: string;
  dateTo: string;
  people: string;
  difficulty: string;
  duration: string;
  category: string;
  hasFood: boolean;
  hasTransport: boolean;
  minRating: string;
}

interface SearchFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterValues) => void;
}

export function SearchFilters({ isOpen, onClose, onApply }: SearchFiltersProps) {
  const [filters, setFilters] = useState<FilterValues>({
    priceMin: '',
    priceMax: '',
    dateFrom: '',
    dateTo: '',
    people: '1',
    difficulty: 'all',
    duration: 'all',
    category: 'all',
    hasFood: false,
    hasTransport: false,
    minRating: '0'
  });

  const handleReset = () => {
    setFilters({
      priceMin: '',
      priceMax: '',
      dateFrom: '',
      dateTo: '',
      people: '1',
      difficulty: 'all',
      duration: 'all',
      category: 'all',
      hasFood: false,
      hasTransport: false,
      minRating: '0'
    });
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="filters-overlay" onClick={onClose}>
      <div className="filters-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="filters-header">
          <h3 className="filters-title">Фильтры</h3>
          <button className="filters-close" onClick={onClose}>
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Filters Content */}
        <div className="filters-content">
          {/* Price Range */}
          <div className="filter-group">
            <label className="filter-label">💰 Цена</label>
            <div className="filter-row">
              <input
                type="number"
                className="filter-input"
                placeholder="От"
                value={filters.priceMin}
                onChange={(e) => setFilters({ ...filters, priceMin: e.target.value })}
              />
              <span className="filter-separator">—</span>
              <input
                type="number"
                className="filter-input"
                placeholder="До"
                value={filters.priceMax}
                onChange={(e) => setFilters({ ...filters, priceMax: e.target.value })}
              />
            </div>
          </div>

          {/* Dates */}
          <div className="filter-group">
            <label className="filter-label">📅 Даты</label>
            <div className="filter-row">
              <input
                type="date"
                className="filter-input"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              />
              <span className="filter-separator">—</span>
              <input
                type="date"
                className="filter-input"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              />
            </div>
          </div>

          {/* People */}
          <div className="filter-group">
            <label className="filter-label">👥 Количество человек</label>
            <input
              type="number"
              className="filter-input-full"
              min="1"
              max="50"
              value={filters.people}
              onChange={(e) => setFilters({ ...filters, people: e.target.value })}
            />
          </div>

          {/* Difficulty */}
          <div className="filter-group">
            <label className="filter-label">⚡ Сложность</label>
            <div className="filter-chips">
              {['all', 'easy', 'medium', 'hard', 'extreme'].map((level) => (
                <button
                  key={level}
                  className={`filter-chip ${filters.difficulty === level ? 'active' : ''}`}
                  onClick={() => setFilters({ ...filters, difficulty: level })}
                >
                  {level === 'all' && 'Все'}
                  {level === 'easy' && 'Легко'}
                  {level === 'medium' && 'Средне'}
                  {level === 'hard' && 'Сложно'}
                  {level === 'extreme' && 'Экстрим'}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div className="filter-group">
            <label className="filter-label">⏱️ Длительность</label>
            <select
              className="filter-select"
              value={filters.duration}
              onChange={(e) => setFilters({ ...filters, duration: e.target.value })}
            >
              <option value="all">Любая</option>
              <option value="1-3h">1-3 часа</option>
              <option value="half-day">Полдня</option>
              <option value="full-day">Целый день</option>
              <option value="2-3d">2-3 дня</option>
              <option value="week">Неделя</option>
              <option value="week+">Больше недели</option>
            </select>
          </div>

          {/* Category */}
          <div className="filter-group">
            <label className="filter-label">🏷️ Категория</label>
            <select
              className="filter-select"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="all">Все категории</option>
              <option value="volcano">Вулканы</option>
              <option value="wildlife">Дикая природа</option>
              <option value="water">Водные туры</option>
              <option value="winter">Зимние виды</option>
              <option value="extreme">Экстрим</option>
              <option value="fishing">Рыбалка</option>
              <option value="camping">Кемпинг</option>
              <option value="culture">Экскурсии</option>
            </select>
          </div>

          {/* Rating */}
          <div className="filter-group">
            <label className="filter-label">⭐ Минимальный рейтинг</label>
            <div className="rating-slider">
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={filters.minRating}
                onChange={(e) => setFilters({ ...filters, minRating: e.target.value })}
                className="slider"
              />
              <span className="rating-value">{filters.minRating} звёзд</span>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="filter-group">
            <label className="filter-label">✅ Дополнительно</label>
            <div className="filter-checks">
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.hasFood}
                  onChange={(e) => setFilters({ ...filters, hasFood: e.target.checked })}
                />
                <span>С питанием</span>
              </label>
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.hasTransport}
                  onChange={(e) => setFilters({ ...filters, hasTransport: e.target.checked })}
                />
                <span>С трансфером</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="filters-footer">
          <button className="filters-btn-reset" onClick={handleReset}>
            Сбросить
          </button>
          <button className="filters-btn-apply" onClick={handleApply}>
            Применить
          </button>
        </div>
      </div>
    </div>
  );
}
