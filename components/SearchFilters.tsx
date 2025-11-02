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
          <div className="filters-title-group">
            <div className="filters-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
              </svg>
            </div>
            <h3 className="filters-title">Фильтры поиска</h3>
          </div>
          <button className="filters-close" onClick={onClose}>
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Filters Content */}
        <div className="filters-content">
          {/* Price Range */}
          <div className="filter-group">
            <label className="filter-label">
              <span className="filter-label-icon">💰</span>
              <span>Диапазон цен</span>
            </label>
            <div className="filter-row">
              <div className="input-wrapper">
                <input
                  type="number"
                  className="filter-input"
                  placeholder="От"
                  value={filters.priceMin}
                  onChange={(e) => setFilters({ ...filters, priceMin: e.target.value })}
                />
                <span className="input-suffix">₽</span>
              </div>
              <span className="filter-separator">—</span>
              <div className="input-wrapper">
                <input
                  type="number"
                  className="filter-input"
                  placeholder="До"
                  value={filters.priceMax}
                  onChange={(e) => setFilters({ ...filters, priceMax: e.target.value })}
                />
                <span className="input-suffix">₽</span>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="filter-group">
            <label className="filter-label">
              <span className="filter-label-icon">📅</span>
              <span>Даты поездки</span>
            </label>
            <div className="filter-row">
              <input
                type="date"
                className="filter-input filter-input-date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              />
              <span className="filter-separator">—</span>
              <input
                type="date"
                className="filter-input filter-input-date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              />
            </div>
          </div>

          {/* People */}
          <div className="filter-group">
            <label className="filter-label">
              <span className="filter-label-icon">👥</span>
              <span>Количество человек</span>
            </label>
            <div className="counter-control">
              <button 
                className="counter-btn"
                onClick={() => setFilters({ ...filters, people: Math.max(1, parseInt(filters.people) - 1).toString() })}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
              <input
                type="number"
                className="filter-input-full counter-input"
                min="1"
                max="50"
                value={filters.people}
                onChange={(e) => setFilters({ ...filters, people: e.target.value })}
              />
              <button 
                className="counter-btn"
                onClick={() => setFilters({ ...filters, people: Math.min(50, parseInt(filters.people) + 1).toString() })}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
            </div>
          </div>

          {/* Difficulty */}
          <div className="filter-group">
            <label className="filter-label">
              <span className="filter-label-icon">⚡</span>
              <span>Уровень сложности</span>
            </label>
            <div className="filter-chips">
              {[
                { value: 'all', label: 'Все', emoji: '🎯' },
                { value: 'easy', label: 'Легко', emoji: '🌱' },
                { value: 'medium', label: 'Средне', emoji: '⚡' },
                { value: 'hard', label: 'Сложно', emoji: '🔥' },
                { value: 'extreme', label: 'Экстрим', emoji: '💪' }
              ].map((level) => (
                <button
                  key={level.value}
                  className={`filter-chip ${filters.difficulty === level.value ? 'active' : ''}`}
                  onClick={() => setFilters({ ...filters, difficulty: level.value })}
                >
                  <span className="chip-emoji">{level.emoji}</span>
                  <span>{level.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div className="filter-group">
            <label className="filter-label">
              <span className="filter-label-icon">⏱️</span>
              <span>Длительность тура</span>
            </label>
            <div className="select-wrapper">
              <select
                className="filter-select"
                value={filters.duration}
                onChange={(e) => setFilters({ ...filters, duration: e.target.value })}
              >
                <option value="all">Любая длительность</option>
                <option value="1-3h">1-3 часа</option>
                <option value="half-day">Полдня (4-6 часов)</option>
                <option value="full-day">Целый день</option>
                <option value="2-3d">2-3 дня</option>
                <option value="week">Неделя</option>
                <option value="week+">Больше недели</option>
              </select>
              <svg className="select-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>

          {/* Category */}
          <div className="filter-group">
            <label className="filter-label">
              <span className="filter-label-icon">🏷️</span>
              <span>Категория активности</span>
            </label>
            <div className="select-wrapper">
              <select
                className="filter-select"
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              >
                <option value="all">Все категории</option>
                <option value="volcano">🌋 Вулканы</option>
                <option value="wildlife">🐻 Дикая природа</option>
                <option value="water">🌊 Водные туры</option>
                <option value="winter">❄️ Зимние виды</option>
                <option value="extreme">⚡ Экстрим</option>
                <option value="fishing">🎣 Рыбалка</option>
                <option value="camping">⛺ Кемпинг</option>
                <option value="culture">📚 Экскурсии</option>
              </select>
              <svg className="select-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>

          {/* Rating */}
          <div className="filter-group">
            <label className="filter-label">
              <span className="filter-label-icon">⭐</span>
              <span>Минимальный рейтинг</span>
            </label>
            <div className="rating-slider">
              <div className="rating-display">
                <div className="rating-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill={star <= parseFloat(filters.minRating) ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      strokeWidth="2"
                      className="star-icon"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                  ))}
                </div>
                <span className="rating-value">{filters.minRating} и выше</span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={filters.minRating}
                onChange={(e) => setFilters({ ...filters, minRating: e.target.value })}
                className="slider"
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="filter-group">
            <label className="filter-label">
              <span className="filter-label-icon">✨</span>
              <span>Дополнительные услуги</span>
            </label>
            <div className="filter-checks">
              <label className="filter-checkbox-elegant">
                <input
                  type="checkbox"
                  checked={filters.hasFood}
                  onChange={(e) => setFilters({ ...filters, hasFood: e.target.checked })}
                />
                <span className="checkbox-custom"></span>
                <span className="checkbox-label">
                  <span className="checkbox-icon">🍽️</span>
                  <span>Питание включено</span>
                </span>
              </label>
              <label className="filter-checkbox-elegant">
                <input
                  type="checkbox"
                  checked={filters.hasTransport}
                  onChange={(e) => setFilters({ ...filters, hasTransport: e.target.checked })}
                />
                <span className="checkbox-custom"></span>
                <span className="checkbox-label">
                  <span className="checkbox-icon">🚗</span>
                  <span>Трансфер включен</span>
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="filters-footer">
          <button className="filters-btn-reset" onClick={handleReset}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="1 4 1 10 7 10"></polyline>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
            </svg>
            <span>Сбросить</span>
          </button>
          <button className="filters-btn-apply" onClick={handleApply}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Применить фильтры</span>
          </button>
        </div>
      </div>
    </div>
  );
}
