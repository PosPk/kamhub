'use client';

import React, { useState, useEffect, useRef } from 'react';
import './PremiumSearchBar.css';

interface SearchSuggestion {
  id: string;
  type: 'history' | 'popular' | 'suggestion' | 'location';
  text: string;
  icon: string;
  meta?: string; // rating, price, distance
}

interface PremiumSearchBarProps {
  onSearch: (query: string, filters?: any) => void;
  placeholder?: string;
}

export function PremiumSearchBar({ onSearch, placeholder = 'Что ищете?' }: PremiumSearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Popular tags
  const quickTags = [
    { icon: '🌋', label: 'Вулканы', value: 'вулканы' },
    { icon: '🐻', label: 'Медведи', value: 'медведи' },
    { icon: '🎣', label: 'Рыбалка', value: 'рыбалка' },
    { icon: '♨️', label: 'Термальные', value: 'термальные источники' },
    { icon: '🚁', label: 'Вертолёт', value: 'вертолётные туры' },
    { icon: '🏔️', label: 'Экстрим', value: 'экстремальные туры' },
    { icon: '🏨', label: 'Отели', value: 'отели камчатка' },
    { icon: '🚗', label: 'Трансфер', value: 'трансфер' },
  ];

  // Categories
  const categories = [
    { icon: '🏔️', label: 'Экстрим', count: 45 },
    { icon: '🚁', label: 'Вертолёты', count: 23 },
    { icon: '🏨', label: 'Отели', count: 178 },
    { icon: '🚗', label: 'Трансфер', count: 89 },
    { icon: '🎣', label: 'Рыбалка', count: 67 },
    { icon: '♨️', label: 'Термы', count: 34 },
  ];

  // Initialize voice recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'ru-RU';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);
        handleSearch(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    // Load search history
    const history = localStorage.getItem('searchHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  // Auto-suggestions
  useEffect(() => {
    if (query.length > 1) {
      // Simulate API call with mock data
      const mockSuggestions: SearchSuggestion[] = [
        { id: '1', type: 'suggestion', text: 'Авачинский вулкан', icon: '🌋', meta: '⭐ 4.9 · 8500₽ · 30 км' },
        { id: '2', type: 'suggestion', text: 'Долина гейзеров', icon: '🚁', meta: '⭐ 5.0 · 35000₽ · 200 км' },
        { id: '3', type: 'suggestion', text: 'Курильское озеро медведи', icon: '🐻', meta: '⭐ 4.8 · 45000₽ · 150 км' },
        { id: '4', type: 'location', text: 'Термальные источники', icon: '♨️', meta: '⭐ 4.7 · 5000₽ · 12 км' },
        { id: '5', type: 'suggestion', text: 'Рыбалка на реке', icon: '🎣', meta: '⭐ 4.6 · 12000₽ · 50 км' },
      ];
      
      setSuggestions(mockSuggestions.filter(s => 
        s.text.toLowerCase().includes(query.toLowerCase())
      ));
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const handleSearch = (searchQuery?: string) => {
    const finalQuery = searchQuery || query;
    if (finalQuery.trim()) {
      // Save to history
      const newHistory = [finalQuery, ...searchHistory.filter(h => h !== finalQuery)].slice(0, 10);
      setSearchHistory(newHistory);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
      
      onSearch(finalQuery);
      setIsFocused(false);
    }
  };

  const handleVoiceSearch = () => {
    if (recognitionRef.current) {
      if (isListening) {
        recognitionRef.current.stop();
      } else {
        recognitionRef.current.start();
        setIsListening(true);
      }
    }
  };

  const handleTagClick = (value: string) => {
    setQuery(value);
    handleSearch(value);
  };

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  const handlePhotoSearch = () => {
    alert('📷 Поиск по фото будет доступен в следующей версии!');
  };

  const handleMapView = () => {
    alert('🗺️ Поиск на карте будет доступен в следующей версии!');
  };

  return (
    <div className="premium-search-container">
      {/* Main Search Bar */}
      <div className={`premium-search-bar ${isFocused ? 'focused' : ''}`}>
        <div className="search-icon">🔍</div>
        
        <input
          ref={inputRef}
          type="text"
          className="search-input-premium"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />

        {query && (
          <button className="clear-btn" onClick={handleClear} aria-label="Очистить">
            ✕
          </button>
        )}

        <div className="search-actions">
          <button 
            className={`action-btn voice-btn ${isListening ? 'listening' : ''}`}
            onClick={handleVoiceSearch}
            aria-label="Голосовой поиск"
            title="Голосовой поиск"
          >
            {isListening ? '🎙️' : '🎤'}
          </button>
          
          <button 
            className="action-btn photo-btn"
            onClick={handlePhotoSearch}
            aria-label="Поиск по фото"
            title="Поиск по фото"
          >
            📷
          </button>
          
          <button 
            className="action-btn map-btn"
            onClick={handleMapView}
            aria-label="Показать на карте"
            title="Показать на карте"
          >
            🗺️
          </button>
        </div>
      </div>

      {/* Quick Tags */}
      {!isFocused && (
        <div className="quick-tags">
          <div className="tags-label">🔥 ПОПУЛЯРНЫЕ:</div>
          <div className="tags-list">
            {quickTags.map((tag, idx) => (
              <button
                key={idx}
                className="quick-tag"
                onClick={() => handleTagClick(tag.value)}
              >
                <span className="tag-icon">{tag.icon}</span>
                <span className="tag-label">{tag.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions Dropdown */}
      {isFocused && (
        <div className="search-dropdown">
          {/* History */}
          {searchHistory.length > 0 && query.length === 0 && (
            <div className="dropdown-section">
              <div className="section-header">⏱️ НЕДАВНИЕ ЗАПРОСЫ</div>
              {searchHistory.slice(0, 5).map((item, idx) => (
                <button
                  key={idx}
                  className="suggestion-item history-item"
                  onClick={() => handleTagClick(item)}
                >
                  <span className="suggestion-icon">🕐</span>
                  <span className="suggestion-text">{item}</span>
                  <button 
                    className="remove-history"
                    onClick={(e) => {
                      e.stopPropagation();
                      const newHistory = searchHistory.filter((_, i) => i !== idx);
                      setSearchHistory(newHistory);
                      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
                    }}
                  >
                    ✕
                  </button>
                </button>
              ))}
            </div>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="dropdown-section">
              <div className="section-header">💡 ПРЕДЛОЖЕНИЯ</div>
              {suggestions.map((item) => (
                <button
                  key={item.id}
                  className="suggestion-item"
                  onClick={() => handleTagClick(item.text)}
                >
                  <span className="suggestion-icon">{item.icon}</span>
                  <div className="suggestion-content">
                    <span className="suggestion-text">{item.text}</span>
                    {item.meta && <span className="suggestion-meta">{item.meta}</span>}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Categories */}
          {query.length === 0 && (
            <div className="dropdown-section">
              <div className="section-header">📂 КАТЕГОРИИ</div>
              <div className="categories-grid">
                {categories.map((cat, idx) => (
                  <button
                    key={idx}
                    className="category-card"
                    onClick={() => handleTagClick(cat.label.toLowerCase())}
                  >
                    <span className="category-icon">{cat.icon}</span>
                    <div className="category-info">
                      <span className="category-label">{cat.label}</span>
                      <span className="category-count">{cat.count}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {query.length > 1 && suggestions.length === 0 && (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <div className="no-results-text">Ничего не найдено</div>
              <div className="no-results-hint">Попробуйте другой запрос</div>
            </div>
          )}
        </div>
      )}

      {/* Voice Listening Indicator */}
      {isListening && (
        <div className="voice-indicator">
          <div className="voice-wave">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div className="voice-text">Слушаю...</div>
        </div>
      )}
    </div>
  );
}
