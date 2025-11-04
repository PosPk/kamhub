'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Tour, Partner } from '@/types';
// import { FloatingNav } from '@/components/FloatingNav';
// import { ThemeToggle } from '@/components/ThemeToggle';
import Link from 'next/link';
import './samsung-elegant.css';

export default function ElegantHomePage() {
  const [stats, setStats] = useState({ tours: 0, partners: 0, tourists: 0, rating: 0 });
  const [tours, setTours] = useState<Tour[]>([]);
  const [particles, setParticles] = useState<Array<{id: number; left: number; delay: number; duration: number; size: number}>>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: 'all',
    priceRange: 'all',
    duration: 'all',
    difficulty: 'all',
    season: 'all',
    groupSize: 'all',
    transportation: 'all',
    meals: 'all'
  });
  const [weatherData, setWeatherData] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
    fetchWeather();
    createParticles();
    setTimeout(() => animateStats(), 500);
    
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Update time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timeInterval);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const fetchData = async () => {
    try {
      const toursRes = await fetch('/api/tours?limit=6');
      const toursData = await toursRes.json();
      if (toursData.success) {
        setTours(toursData.data?.tours || []);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchWeather = async () => {
    try {
      // Petropavlovsk-Kamchatsky coordinates
      const lat = 53.0241;
      const lon = 158.6445;
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode,is_day&timezone=auto`);
      const data = await res.json();
      setWeatherData(data.current);
    } catch (error) {
      console.error('Weather error:', error);
    }
  };

  const getThemeFromWeatherAndTime = () => {
    if (!weatherData) return 'default';
    
    const isDay = weatherData.is_day === 1;
    const code = weatherData.weathercode;
    
    // 0 - Clear
    // 1-3 - Partly cloudy
    // 45,48 - Fog
    // 51-67 - Rain/Drizzle
    // 71-77 - Snow
    // 80-99 - Rain showers/Thunderstorm
    
    if (code >= 71 && code <= 77) {
      return 'snow';
    } else if (code >= 51 && code <= 67) {
      return 'rain';
    } else if (code >= 80) {
      return 'storm';
    } else if (!isDay) {
      return 'night';
    } else if (code === 0) {
      return 'clear-day';
    } else {
      return 'cloudy-day';
    }
  };

  const themeGradients: Record<string, string> = {
    'default': 'linear-gradient(135deg, #0f172a 0%, #1e293b 20%, #334155 40%, #1e293b 60%, #0f172a 100%)',
    'clear-day': 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 20%, #0369a1 40%, #0284c7 60%, #0ea5e9 100%)',
    'cloudy-day': 'linear-gradient(135deg, #475569 0%, #64748b 20%, #94a3b8 40%, #64748b 60%, #475569 100%)',
    'night': 'linear-gradient(135deg, #0c4a6e 0%, #075985 20%, #0e7490 40%, #075985 60%, #0c4a6e 100%)',
    'rain': 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 20%, #3b82f6 40%, #1e40af 60%, #1e3a8a 100%)',
    'snow': 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 20%, #64748b 40%, #94a3b8 60%, #cbd5e1 100%)',
    'storm': 'linear-gradient(135deg, #1e1b4b 0%, #312e81 20%, #4338ca 40%, #312e81 60%, #1e1b4b 100%)'
  };

  const currentTheme = getThemeFromWeatherAndTime();

  const createParticles = () => {
    const particlesArray = [];
    for (let i = 0; i < 50; i++) {
      particlesArray.push({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 5 + Math.random() * 10,
        size: 2 + Math.random() * 4
      });
    }
    setParticles(particlesArray);
  };

  const animateStats = () => {
    const targets = { tours: 25, partners: 52, tourists: 350, rating: 4.9 };
    const duration = 2000;
    const frames = 60;
    let frame = 0;

    const interval = setInterval(() => {
      frame++;
      const progress = frame / frames;
      const eased = 1 - Math.pow(1 - progress, 4);

      setStats({
        tours: Math.round(targets.tours * eased),
        partners: Math.round(targets.partners * eased),
        tourists: Math.round(targets.tourists * eased),
        rating: parseFloat((targets.rating * eased).toFixed(1)),
      });

      if (frame === frames) {
        clearInterval(interval);
        setStats(targets);
      }
    }, duration / frames);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <>
      {/* ANIMATED BACKGROUND */}
      <div 
        className="weather-background" 
        style={{ background: themeGradients[currentTheme] || themeGradients.default }}
      ></div>
      
      {/* WEATHER PARTICLES */}
      <div className="weather-particles">
        {particles.map(p => (
          <div
            key={p.id}
            className="particle"
            style={{
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`
            }}
          />
        ))}
      </div>

      <main style={{ position: 'relative', zIndex: 2 }}>
        {/* THEME TOGGLE BUTTON */}
        <button 
          onClick={toggleTheme}
          className="theme-toggle-btn"
          title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
        >
          {theme === 'dark' ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>

        {/* HERO SECTION */}
        <section className="hero-elegant">
          <div className="hero-content-elegant">
            <h1 className="hero-title-elegant">
              Камчатка ждёт вас
            </h1>
            <p className="hero-subtitle-elegant">
              Туры, трансферы, размещение — всё для вашего путешествия в одном месте
            </p>

            <div className="search-elegant">
              <div className="search-box-elegant glass-card">
                <button className="search-function-btn" title="Голосовой поиск">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" y1="19" x2="12" y2="23"/>
                    <line x1="8" y1="23" x2="16" y2="23"/>
                  </svg>
                </button>
                <button className="search-function-btn" title="Поиск по фото">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <path d="M21 15l-5-5L5 21"/>
                  </svg>
                </button>
                <button className="search-function-btn" title="Поиск на карте">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </button>
                <input
                  type="text"
                  className="search-input-elegant"
                  placeholder="Куда вы хотите отправиться?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button 
                  className="search-btn-elegant"
                  onClick={handleSearch}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35"/>
                  </svg>
                  Найти
                </button>
                <button 
                  className="filter-btn-elegant"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="4" y1="21" x2="4" y2="14"/>
                    <line x1="4" y1="10" x2="4" y2="3"/>
                    <line x1="12" y1="21" x2="12" y2="12"/>
                    <line x1="12" y1="8" x2="12" y2="3"/>
                    <line x1="20" y1="21" x2="20" y2="16"/>
                    <line x1="20" y1="12" x2="20" y2="3"/>
                    <line x1="1" y1="14" x2="7" y2="14"/>
                    <line x1="9" y1="8" x2="15" y2="8"/>
                    <line x1="17" y1="16" x2="23" y2="16"/>
                  </svg>
                  Фильтры
                </button>
              </div>

              {showFilters && (
                <div className="filters-panel-elegant glass-card">
                  <div className="filter-group">
                    <label>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12" style={{ display: 'inline', marginRight: '4px' }}>
                        <path d="M12 2L2 12h3v8h6v-6h2v6h6v-8h3L12 2z"/>
                      </svg>
                      Категория
                    </label>
                    <select value={filters.category} onChange={(e) => setFilters({...filters, category: e.target.value})}>
                      <option value="all">Все категории</option>
                      <option value="volcano">Вулканы</option>
                      <option value="wildlife">Медведи и природа</option>
                      <option value="fishing">Рыбалка</option>
                      <option value="hot-springs">Термальные источники</option>
                      <option value="ocean">Океан и побережье</option>
                    </select>
                  </div>

                  <div className="filter-group">
                    <label>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12" style={{ display: 'inline', marginRight: '4px' }}>
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 6v6l4 2"/>
                      </svg>
                      Длительность
                    </label>
                    <select value={filters.duration} onChange={(e) => setFilters({...filters, duration: e.target.value})}>
                      <option value="all">Любая</option>
                      <option value="1">1 день</option>
                      <option value="2-3">2-3 дня</option>
                      <option value="week">Неделя+</option>
                    </select>
                  </div>

                  <div className="filter-group">
                    <label>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12" style={{ display: 'inline', marginRight: '4px' }}>
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 8v8M8 12h8"/>
                      </svg>
                      Сложность
                    </label>
                    <select value={filters.difficulty} onChange={(e) => setFilters({...filters, difficulty: e.target.value})}>
                      <option value="all">Любая</option>
                      <option value="easy">Легкая</option>
                      <option value="medium">Средняя</option>
                      <option value="hard">Сложная</option>
                    </select>
                  </div>

                  <div className="filter-group">
                    <label>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12" style={{ display: 'inline', marginRight: '4px' }}>
                        <path d="M20 7h-4V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v3H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
                      </svg>
                      Цена
                    </label>
                    <select value={filters.priceRange} onChange={(e) => setFilters({...filters, priceRange: e.target.value})}>
                      <option value="all">Любая</option>
                      <option value="budget">До 10 000 ₽</option>
                      <option value="mid">10 000 - 30 000 ₽</option>
                      <option value="premium">От 30 000 ₽</option>
                    </select>
                  </div>

                  <div className="filter-group">
                    <label>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12" style={{ display: 'inline', marginRight: '4px' }}>
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 2v10l5 3"/>
                      </svg>
                      Сезон
                    </label>
                    <select value={filters.season} onChange={(e) => setFilters({...filters, season: e.target.value})}>
                      <option value="all">Любой</option>
                      <option value="summer">Лето</option>
                      <option value="winter">Зима</option>
                      <option value="spring">Весна</option>
                      <option value="autumn">Осень</option>
                    </select>
                  </div>

                  <div className="filter-group">
                    <label>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12" style={{ display: 'inline', marginRight: '4px' }}>
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                      Группа
                    </label>
                    <select value={filters.groupSize} onChange={(e) => setFilters({...filters, groupSize: e.target.value})}>
                      <option value="all">Любая</option>
                      <option value="solo">Индивидуально</option>
                      <option value="small">Малая (2-6)</option>
                      <option value="large">Большая (7+)</option>
                    </select>
                  </div>

                  <div className="filter-group">
                    <label>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12" style={{ display: 'inline', marginRight: '4px' }}>
                        <circle cx="12" cy="12" r="2"/>
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83"/>
                        <path d="M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                      </svg>
                      Транспорт
                    </label>
                    <select value={filters.transportation} onChange={(e) => setFilters({...filters, transportation: e.target.value})}>
                      <option value="all">Любой</option>
                      <option value="helicopter">Вертолет</option>
                      <option value="car">Авто</option>
                      <option value="boat">Катер</option>
                      <option value="hiking">Пеший</option>
                    </select>
                  </div>

                  <div className="filter-group">
                    <label>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12" style={{ display: 'inline', marginRight: '4px' }}>
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                      Питание
                    </label>
                    <select value={filters.meals} onChange={(e) => setFilters({...filters, meals: e.target.value})}>
                      <option value="all">Любое</option>
                      <option value="included">Включено</option>
                      <option value="partial">Частично</option>
                      <option value="none">Не включено</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* ИКОНКИ АКТИВНОСТЕЙ */}
            <div className="activity-icons-carousel">
              {/* 1. Вулканы - треугольная гора с лавой */}
              <div className="activity-icon-item">
                <svg className="activity-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 3L3 18h18L12 3z" fill="rgba(255,255,255,0.1)"/>
                  <path d="M12 3L3 18h18L12 3z"/>
                  <path d="M12 6l-4 8h8l-4-8z" fill="rgba(255,255,255,0.15)"/>
                  <circle cx="12" cy="4" r="1.5" fill="currentColor"/>
                  <path d="M10 4c0-1 1-1.5 2-1.5s2 .5 2 1.5"/>
                </svg>
                <span className="activity-icon-label">Вулканы</span>
              </div>

              {/* 2. Медведи - узнаваемый силуэт медведя */}
              <div className="activity-icon-item">
                <svg className="activity-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="7" cy="6" r="2.5"/>
                  <circle cx="17" cy="6" r="2.5"/>
                  <ellipse cx="12" cy="11" rx="6" ry="5" fill="rgba(255,255,255,0.1)"/>
                  <path d="M9 15c0 2 1 3 3 3s3-1 3-3"/>
                  <circle cx="10" cy="10" r="0.8" fill="currentColor"/>
                  <circle cx="14" cy="10" r="0.8" fill="currentColor"/>
                  <path d="M12 11v1.5" strokeWidth="1.5"/>
                  <path d="M6 17c1 2 2 3 3 4M18 17c-1 2-2 3-3 4" strokeWidth="2"/>
                </svg>
                <span className="activity-icon-label">Медведи</span>
              </div>

              {/* 3. Гейзеры - фонтан воды */}
              <div className="activity-icon-item">
                <svg className="activity-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <ellipse cx="12" cy="20" rx="5" ry="2" fill="rgba(255,255,255,0.1)"/>
                  <path d="M12 20V10" strokeWidth="2.5"/>
                  <path d="M9 8c0-2 1-3 3-3s3 1 3 3"/>
                  <path d="M8 12c0-1.5 1-2.5 2-2.5"/>
                  <path d="M16 12c0-1.5-1-2.5-2-2.5"/>
                  <path d="M10 6c-1-1-1-2 0-3M14 6c1-1 1-2 0-3"/>
                  <path d="M12 4V2"/>
                </svg>
                <span className="activity-icon-label">Гейзеры</span>
              </div>

              {/* 4. Рыбалка - удочка с рыбой */}
              <div className="activity-icon-item">
                <svg className="activity-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M3 3l16 8" strokeWidth="1.5"/>
                  <circle cx="20" cy="12" r="1" fill="currentColor"/>
                  <path d="M19 12c1 3 1 6-2 7" strokeWidth="1.5"/>
                  <ellipse cx="16" cy="18" rx="3" ry="2" fill="rgba(255,255,255,0.15)"/>
                  <circle cx="15" cy="17.5" r="0.5" fill="currentColor"/>
                  <path d="M13 18l1-1" strokeWidth="1"/>
                </svg>
                <span className="activity-icon-label">Рыбалка</span>
              </div>

              {/* 5. Термальные источники - пар над водой */}
              <div className="activity-icon-item">
                <svg className="activity-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <ellipse cx="12" cy="17" rx="8" ry="4" fill="rgba(255,255,255,0.15)"/>
                  <path d="M7 5c0 2-0.5 3-0.5 4s1 2 1.5 2"/>
                  <path d="M12 4c0 2-0.5 3-0.5 4s1 2 1.5 2"/>
                  <path d="M17 5c0 2-0.5 3-0.5 4s1 2 1.5 2"/>
                  <path d="M4 13c0 2 3 4 8 4s8-2 8-4"/>
                </svg>
                <span className="activity-icon-label">Термальные источники</span>
              </div>

              {/* 6. Океан - волны */}
              <div className="activity-icon-item">
                <svg className="activity-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M2 14c2-2 4-3 6-2s4 3 6 2 4-3 6-2" fill="none"/>
                  <path d="M2 18c2-2 4-3 6-2s4 3 6 2 4-3 6-2" fill="none"/>
                  <circle cx="18" cy="7" r="3" fill="rgba(255,255,255,0.1)" strokeWidth="1.5"/>
                  <path d="M16 7h4M18 5v4"/>
                </svg>
                <span className="activity-icon-label">Океан</span>
              </div>

              {/* 7. Вертолёт - с винтом */}
              <div className="activity-icon-item">
                <svg className="activity-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M5 8h14" strokeWidth="2"/>
                  <ellipse cx="12" cy="13" rx="6" ry="4" fill="rgba(255,255,255,0.1)"/>
                  <path d="M12 17v3"/>
                  <path d="M9 20h6" strokeWidth="2"/>
                  <circle cx="10" cy="13" r="1" fill="currentColor"/>
                  <circle cx="14" cy="13" r="1" fill="currentColor"/>
                  <path d="M12 8V6" strokeWidth="1.5"/>
                </svg>
                <span className="activity-icon-label">Вертолёт</span>
              </div>

              {/* 8. Горы - три пика */}
              <div className="activity-icon-item">
                <svg className="activity-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M2 20L8 10l4 4 4-8 6 14z" fill="rgba(255,255,255,0.1)"/>
                  <path d="M2 20L8 10l4 4 4-8 6 14"/>
                  <path d="M12 6l3 7h-6l3-7z" fill="rgba(255,255,255,0.15)"/>
                </svg>
                <span className="activity-icon-label">Горы</span>
              </div>

              {/* 9. Снегоход - вид сбоку */}
              <div className="activity-icon-item">
                <svg className="activity-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="8" y="10" width="10" height="5" rx="1" fill="rgba(255,255,255,0.1)"/>
                  <path d="M8 12h10"/>
                  <circle cx="10" cy="17" r="2"/>
                  <circle cx="16" cy="17" r="2"/>
                  <path d="M6 17h2M14 17h2M18 17h2"/>
                  <path d="M13 10V7h2"/>
                </svg>
                <span className="activity-icon-label">Снегоходы</span>
              </div>

              {/* 10. Каякинг - лодка с вёслами */}
              <div className="activity-icon-item">
                <svg className="activity-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <ellipse cx="12" cy="14" rx="9" ry="3" fill="rgba(255,255,255,0.1)"/>
                  <path d="M3 14l2-3 2 3"/>
                  <path d="M17 14l2-3 2 3"/>
                  <circle cx="7" cy="8" r="1.5" fill="currentColor"/>
                  <circle cx="17" cy="8" r="1.5" fill="currentColor"/>
                  <path d="M7 10v2M17 10v2"/>
                </svg>
                <span className="activity-icon-label">Каякинг</span>
              </div>

              {/* 11. Сёрфинг - человек на доске */}
              <div className="activity-icon-item">
                <svg className="activity-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="5" r="2" fill="rgba(255,255,255,0.2)"/>
                  <path d="M12 7v4l-2 2"/>
                  <path d="M12 11l2 2"/>
                  <path d="M4 15c3-2 5-2 8-2s5 0 8 2" strokeWidth="2.5"/>
                  <path d="M3 19c3-1 6-1.5 9-1.5s6 .5 9 1.5"/>
                </svg>
                <span className="activity-icon-label">Сёрфинг</span>
              </div>

              {/* 12. Фототур - камера */}
              <div className="activity-icon-item">
                <svg className="activity-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="2" y="8" width="20" height="12" rx="2" fill="rgba(255,255,255,0.1)"/>
                  <circle cx="13" cy="14" r="3"/>
                  <circle cx="13" cy="14" r="1.5" fill="currentColor"/>
                  <rect x="6" y="5" width="4" height="3" rx="0.5"/>
                  <circle cx="18" cy="11" r="0.8" fill="currentColor"/>
                </svg>
                <span className="activity-icon-label">Фототуры</span>
              </div>

              {/* 13. Этнотуры - чум/яранга */}
              <div className="activity-icon-item">
                <svg className="activity-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M4 20L12 4l8 16z" fill="rgba(255,255,255,0.1)"/>
                  <path d="M4 20L12 4l8 16"/>
                  <path d="M8 20l4-8 4 8"/>
                  <circle cx="12" cy="16" r="1.5" fill="currentColor"/>
                  <path d="M12 8v3"/>
                </svg>
                <span className="activity-icon-label">Этнотуры</span>
              </div>

              {/* 14. Дайвинг - маска и трубка */}
              <div className="activity-icon-item">
                <svg className="activity-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="10" cy="10" r="5" fill="rgba(255,255,255,0.1)"/>
                  <path d="M14 8h4c1 0 2 1 2 2v3"/>
                  <path d="M2 16c2-1 4-2 6-2s4 1 6 2"/>
                  <path d="M3 19c2-0.5 4-1 5-1s3 0.5 5 1"/>
                  <circle cx="8" cy="9" r="1" fill="currentColor"/>
                  <circle cx="12" cy="9" r="1" fill="currentColor"/>
                </svg>
                <span className="activity-icon-label">Дайвинг</span>
              </div>

              {/* 15. Альпинизм - человек на скале */}
              <div className="activity-icon-item">
                <svg className="activity-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M3 22L9 8l6 6 5-10" strokeWidth="2"/>
                  <circle cx="15" cy="6" r="1.5" fill="currentColor"/>
                  <path d="M15 8v2l-1 2"/>
                  <path d="M15 10l2 1"/>
                  <path d="M10 22l2-4M18 22l-2-6"/>
                </svg>
                <span className="activity-icon-label">Альпинизм</span>
              </div>

              {/* 16. Треккинг - рюкзак и палка */}
              <div className="activity-icon-item">
                <svg className="activity-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="8" y="6" width="8" height="10" rx="1" fill="rgba(255,255,255,0.1)"/>
                  <path d="M10 6V4h4v2"/>
                  <circle cx="12" cy="11" r="1.5" fill="currentColor"/>
                  <path d="M8 16v6M16 16v6"/>
                  <path d="M5 10l-2 12"/>
                </svg>
                <span className="activity-icon-label">Треккинг</span>
              </div>

              {/* 17. Собачьи упряжки */}
              <div className="activity-icon-item">
                <svg className="activity-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <ellipse cx="8" cy="10" rx="3" ry="2.5" fill="rgba(255,255,255,0.1)"/>
                  <circle cx="7" cy="8" r="1.5"/>
                  <circle cx="9" cy="8" r="1.5"/>
                  <path d="M8 12v2l-1 2M8 14l1 2"/>
                  <path d="M11 12h10"/>
                  <rect x="18" y="10" width="4" height="4" rx="0.5"/>
                </svg>
                <span className="activity-icon-label">Собачьи упряжки</span>
              </div>

              {/* 18. Лыжи/Сноуборд */}
              <div className="activity-icon-item">
                <svg className="activity-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="5" r="1.5" fill="currentColor"/>
                  <path d="M12 7v3l-2 2"/>
                  <path d="M12 10l2 2"/>
                  <path d="M4 22l5-8M20 22l-5-8" strokeWidth="2.5"/>
                  <path d="M8 16l8-2"/>
                </svg>
                <span className="activity-icon-label">Лыжи</span>
              </div>
            </div>

            {/* ГАЛЕРЕЯ ФОТО */}
            <div className="photos-gallery-elegant">
              <div className="photos-carousel-elegant">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="photo-card-elegant glass-card">
                    <img src={`/photos/kamchatka-${i}.svg`} alt={`Камчатка ${i}`} />
                  </div>
                ))}
              </div>
            </div>

            <div className="stats-elegant" ref={statsRef}>
              <div className="stat-item-elegant glass-card">
                <div className="stat-value-elegant">{stats.tours}+</div>
                <div className="stat-label-elegant">Туров</div>
              </div>
              <div className="stat-item-elegant glass-card">
                <div className="stat-value-elegant">{stats.partners}</div>
                <div className="stat-label-elegant">Партнёров</div>
              </div>
              <div className="stat-item-elegant glass-card">
                <div className="stat-value-elegant">{stats.tourists}+</div>
                <div className="stat-label-elegant">Туристов</div>
              </div>
              <div className="stat-item-elegant glass-card">
                <div className="stat-value-elegant">{stats.rating}</div>
                <div className="stat-label-elegant">Рейтинг</div>
              </div>
            </div>
          </div>
        </section>

        {/* 5 ИННОВАЦИЙ */}
        <section className="section-elegant">
          <div className="section-header-elegant">
            <h2 className="section-title-elegant">5 уникальных возможностей</h2>
            <p className="section-subtitle-elegant">Технологии, которых нет у конкурентов</p>
          </div>

          <div className="innovations-elegant">
            <div className="innovation-card-elegant glass-card">
              <div className="innovation-icon-elegant">
                <img src="/icons/ai-chip.svg" alt="AI" width="26" height="26" />
              </div>
              <h3 className="innovation-title-elegant">AI-Powered Matching</h3>
              <p className="innovation-description-elegant">
                Умный подбор водителей по 5 критериям: рейтинг (30%), цена (25%), расстояние (20%), доступность (15%), опыт (10%)
              </p>
              <div className="innovation-badges-elegant">
                <span className="badge-elegant">&lt;500ms</span>
                <span className="badge-elegant">Топ-5 водителей</span>
                <span className="badge-elegant">95%+ точность</span>
              </div>
            </div>

            <div className="innovation-card-elegant glass-card">
              <div className="innovation-icon-elegant">
                <img src="/icons/gift.svg" alt="Loyalty" width="26" height="26" />
              </div>
              <h3 className="innovation-title-elegant">Multi-Level Loyalty</h3>
              <p className="innovation-description-elegant">
                5 уровней лояльности (Новичок → Платина) с прогрессивной скидкой 0-15%, автоначисление 1% от заказа
              </p>
              <div className="innovation-badges-elegant">
                <span className="badge-elegant">5 уровней</span>
                <span className="badge-elegant">До 15% скидка</span>
                <span className="badge-elegant">Промокоды</span>
              </div>
            </div>

            <div className="innovation-card-elegant glass-card">
              <div className="innovation-icon-elegant">
                <img src="/icons/bell-ring.svg" alt="Notifications" width="26" height="26" />
              </div>
              <h3 className="innovation-title-elegant">Multi-Channel Notifications</h3>
              <p className="innovation-description-elegant">
                3 канала уведомлений одновременно: SMS (SMS.ru), Email (AWS SES), Telegram (Bot API) с 6 автотриггерами
              </p>
              <div className="innovation-badges-elegant">
                <span className="badge-elegant">SMS</span>
                <span className="badge-elegant">Email</span>
                <span className="badge-elegant">Telegram</span>
              </div>
            </div>

            <div className="innovation-card-elegant glass-card">
              <div className="innovation-icon-elegant">
                <img src="/icons/leaf.svg" alt="Eco" width="26" height="26" />
              </div>
              <h3 className="innovation-title-elegant">Eco-Gamification</h3>
              <p className="innovation-description-elegant">
                4 категории эко-точек, 5 достижений (10→1000 баллов), QR-сканирование, геолокация через PostGIS
              </p>
              <div className="innovation-badges-elegant">
                <span className="badge-elegant">4 категории</span>
                <span className="badge-elegant">QR-код</span>
                <span className="badge-elegant">Геймификация</span>
              </div>
            </div>

            <div className="innovation-card-elegant glass-card">
              <div className="innovation-icon-elegant">
                <img src="/icons/cloud-sun.svg" alt="Weather" width="26" height="26" />
              </div>
              <h3 className="innovation-title-elegant">Weather-Driven Safety</h3>
              <p className="innovation-description-elegant">
                4 уровня безопасности, проверка каждый час, межоператорские автозамены при опасной погоде
              </p>
              <div className="innovation-badges-elegant">
                <span className="badge-elegant">Авточеки</span>
                <span className="badge-elegant">Автозамены</span>
                <span className="badge-elegant">Возврат средств</span>
              </div>
            </div>
          </div>
        </section>

        {/* ПОПУЛЯРНЫЕ ТУРЫ */}
        <section className="section-elegant">
          <div className="section-header-elegant">
            <h2 className="section-title-elegant">Популярные туры</h2>
            <p className="section-subtitle-elegant">Исследуйте вулканы, океан и дикую природу</p>
          </div>

          <div className="carousel-elegant-wrapper">
            <button 
              className="carousel-btn-elegant carousel-prev-elegant"
              onClick={() => {
                const carousel = document.querySelector('.carousel-elegant');
                if (carousel) carousel.scrollBy({ left: -320, behavior: 'smooth' });
              }}
            >
              ‹
            </button>

            <div className="carousel-elegant">
              {tours.length > 0 ? (
                tours.map((tour) => (
                  <div key={tour.id} className="tour-card-elegant glass-card">
                    <div className="tour-image-elegant">
                      <img src={tour.images[0] || '/placeholder-tour.jpg'} alt={tour.title} />
                      <div className="tour-badge-elegant">Популярный</div>
                      <div className="tour-rating-elegant">
                        <img src="/icons/star.svg" alt="rating" width="14" height="14" />
                        {tour.rating}
                      </div>
                    </div>
                    <div className="tour-content-elegant">
                      <h3 className="tour-title-elegant">{tour.title}</h3>
                      <p className="tour-description-elegant">{tour.description}</p>
                      <div className="tour-footer-elegant">
                        <div className="tour-price-elegant">от {tour.priceFrom.toLocaleString()} ₽</div>
                        <div className="tour-duration-elegant">{tour.duration}</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <>
                  {[
                    { title: 'Восхождение на Авачинский вулкан', desc: 'Незабываемое восхождение на действующий вулкан', price: '8 500', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
                    { title: 'Долина гейзеров', desc: 'Вертолётная экскурсия в одно из чудес России', price: '35 000', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
                    { title: 'Наблюдение за медведями', desc: 'Курильское озеро - встреча с бурыми медведями', price: '45 000', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
                    { title: 'Камчатка с вертолёта', desc: 'Воздушное путешествие над вулканами', price: '65 000', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }
                  ].map((tour, i) => (
                    <div key={i} className="tour-card-elegant glass-card">
                      <div className="tour-image-elegant" style={{ background: tour.gradient }}>
                        <div className="tour-badge-elegant">Хит</div>
                        <div className="tour-rating-elegant">
                          <img src="/icons/star.svg" alt="rating" width="14" height="14" />
                          4.9
                        </div>
                      </div>
                      <div className="tour-content-elegant">
                        <h3 className="tour-title-elegant">{tour.title}</h3>
                        <p className="tour-description-elegant">{tour.desc}</p>
                        <div className="tour-footer-elegant">
                          <div className="tour-price-elegant">от {tour.price} ₽</div>
                          <div className="tour-duration-elegant">1 день</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            <button 
              className="carousel-btn-elegant carousel-next-elegant"
              onClick={() => {
                const carousel = document.querySelector('.carousel-elegant');
                if (carousel) carousel.scrollBy({ left: 320, behavior: 'smooth' });
              }}
            >
              ›
            </button>
          </div>
        </section>

        {/* <FloatingNav /> */}
      </main>
    </>
  );
}
