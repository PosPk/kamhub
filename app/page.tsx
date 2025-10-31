'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Tour, Partner, Weather } from '@/types';
import { TourCard } from '@/components/TourCard';
import { PartnerCard } from '@/components/PartnerCard';
import { WeatherWidget } from '@/components/WeatherWidget';
import { EcoPointsWidget } from '@/components/EcoPointsWidget';
import { AIChatWidget } from '@/components/AIChatWidget';

// Иконки для ролей
const ROLE_ICONS: Record<string, string> = {
  'Турист': '🏃',
  'Туроператор': '🎯',
  'Гид': '🗺️',
  'Трансфер': '🚗',
  'Размещение': '🏠',
  'Сувениры': '🎁',
  'Прокат снаряжения': '🎣',
  'Прокат авто': '🚙',
};

// Погодные настроения
interface WeatherMood {
  particles: string;
  particleCount: number;
  particleSpeed: number;
  gradient: string[];
  name: string;
}

const WEATHER_MOODS: Record<string, WeatherMood> = {
  snow: {
    particles: '❄',
    particleCount: 40,
    particleSpeed: 5,
    gradient: ['#1a2a4e', '#0f1729', '#0a0a0a', '#000000'],
    name: 'Снег'
  },
  rain: {
    particles: '💧',
    particleCount: 50,
    particleSpeed: 2,
    gradient: ['#2d3748', '#1a202c', '#0a0a0a', '#000000'],
    name: 'Дождь'
  },
  drizzle: {
    particles: '💧',
    particleCount: 30,
    particleSpeed: 3,
    gradient: ['#374151', '#1f2937', '#111827', '#000000'],
    name: 'Морось'
  },
  fog: {
    particles: '•',
    particleCount: 20,
    particleSpeed: 8,
    gradient: ['#4a5568', '#2d3748', '#1a202c', '#000000'],
    name: 'Туман'
  },
  clear: {
    particles: '✨',
    particleCount: 15,
    particleSpeed: 6,
    gradient: ['#e6c149', '#d4af37', '#0f1729', '#000000'],
    name: 'Ясно'
  },
  mostly_clear: {
    particles: '✨',
    particleCount: 10,
    particleSpeed: 7,
    gradient: ['#d4af37', '#1a2a4e', '#0f1729', '#000000'],
    name: 'Ясно'
  },
  partly_cloudy: {
    particles: '•',
    particleCount: 15,
    particleSpeed: 6,
    gradient: ['#4a5568', '#1a2a4e', '#0a0a0a', '#000000'],
    name: 'Облачно'
  },
  overcast: {
    particles: '•',
    particleCount: 25,
    particleSpeed: 7,
    gradient: ['#374151', '#1f2937', '#0a0a0a', '#000000'],
    name: 'Пасмурно'
  },
  thunderstorm: {
    particles: '⚡',
    particleCount: 35,
    particleSpeed: 1.5,
    gradient: ['#1e3a5f', '#0f1f3a', '#0a0a0a', '#000000'],
    name: 'Гроза'
  },
  volcanic_ash: {
    particles: '•',
    particleCount: 60,
    particleSpeed: 4,
    gradient: ['#4a1515', '#2d0f0f', '#1a0a0a', '#000000'],
    name: 'Вулканический пепел'
  },
};

export default function Home() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyEcoPoints, setNearbyEcoPoints] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [currentMood, setCurrentMood] = useState<WeatherMood>(WEATHER_MOODS.snow);
  const [theme, setTheme] = useState<'light' | 'dark'>('light'); // Белая по умолчанию
  const snowContainerRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    fetchData();
    getUserLocation();
    loadThemePreference();
  }, []);

  useEffect(() => {
    if (userLocation) {
      fetchWeather();
    }
  }, [userLocation]);

  useEffect(() => {
    if (weather) {
      updateMoodByWeather(weather);
    }
  }, [weather]);

  useEffect(() => {
    if (currentMood) {
      createAtmosphericParticles();
      updateBackgroundGradient();
    }
  }, [currentMood]);

  useEffect(() => {
    setupScrollAnimations();
  }, []);

  // Загружаем тему из localStorage
  const loadThemePreference = () => {
    if (typeof window === 'undefined') return;
    
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      // По умолчанию белая тема
      document.documentElement.setAttribute('data-theme', 'light');
    }
  };

  // Переключаем тему
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const toursResponse = await fetch('/api/tours?limit=6');
      const toursData = await toursResponse.json();
      if (toursData.success && toursData.data?.tours) {
        setTours(toursData.data.tours);
      }

      const partnersResponse = await fetch('/api/partners?limit=6');
      const partnersData = await partnersResponse.json();
      if (partnersData.success && partnersData.data?.data) {
        setPartners(partnersData.data.data);
      }

      const ecoPointsResponse = await fetch('/api/eco-points?limit=10');
      const ecoPointsData = await ecoPointsResponse.json();
      if (ecoPointsData.success && ecoPointsData.data) {
        setNearbyEcoPoints(ecoPointsData.data);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Камчатка по умолчанию
          setUserLocation({
            lat: 53.0195,
            lng: 158.6505,
          });
        }
      );
    } else {
      setUserLocation({
        lat: 53.0195,
        lng: 158.6505,
      });
    }
  };

  const fetchWeather = async () => {
    if (!userLocation) return;

    try {
      const response = await fetch(`/api/weather?lat=${userLocation.lat}&lng=${userLocation.lng}`);
      const data = await response.json();
      if (data.success && data.data) {
        setWeather(data.data);
      }
    } catch (error) {
      console.error('Weather fetch error:', error);
    }
  };

  // Обновляем настроение сайта по погоде
  const updateMoodByWeather = (weatherData: Weather) => {
    let moodKey = weatherData.condition;
    
    // Проверяем особые условия для Камчатки
    if (userLocation && Math.abs(userLocation.lat - 53.0195) < 5) {
      // Если температура низкая и ветрено - возможно пепел от вулкана
      if (weatherData.temperature < 0 && weatherData.windSpeed > 20) {
        moodKey = 'volcanic_ash';
      }
    }
    
    const mood = WEATHER_MOODS[moodKey] || WEATHER_MOODS.snow;
    setCurrentMood(mood);
  };

  // Создаём атмосферные частицы (снег/дождь/пепел)
  const createAtmosphericParticles = () => {
    if (typeof window === 'undefined') return;
    
    const container = snowContainerRef.current;
    if (!container) return;

    // Очищаем старые частицы
    container.innerHTML = '';

    const isMobile = window.innerWidth < 768;
    const count = isMobile ? Math.floor(currentMood.particleCount / 2) : currentMood.particleCount;

    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.className = 'weather-particle';
      particle.innerHTML = currentMood.particles;
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDuration = (Math.random() * 2 + currentMood.particleSpeed - 1) + 's';
      particle.style.animationDelay = Math.random() * 5 + 's';
      particle.style.fontSize = (Math.random() * 0.5 + 0.5) + 'em';
      particle.style.opacity = (Math.random() * 0.4 + 0.3).toString();
      container.appendChild(particle);
    }
  };

  // Обновляем градиент фона
  const updateBackgroundGradient = () => {
    if (typeof window === 'undefined') return;
    
    const main = mainRef.current;
    if (!main) return;

    const gradient = `linear-gradient(180deg, ${currentMood.gradient.join(', ')})`;
    main.style.background = gradient;
  };

  // Fade-in анимации при скролле
  const setupScrollAnimations = () => {
    if (typeof window === 'undefined') return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in-visible');
        }
      });
    }, { threshold: 0.1 });
    
    setTimeout(() => {
      document.querySelectorAll('.fade-in-element').forEach(el => {
        observer.observe(el);
      });
    }, 100);
  };

  // Поиск
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setShowSearchResults(false);
      return;
    }

    try {
      const response = await fetch(`/api/tours?search=${encodeURIComponent(query)}`);
      const data = await response.json();
      if (data.success && data.data?.tours) {
        setSearchResults(data.data.tours);
        setShowSearchResults(true);
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  return (
    <main ref={mainRef} className="min-h-screen text-white overflow-x-hidden weather-animated-bg">
      {/* Атмосферные частицы (снег/дождь/пепел) */}
      <div ref={snowContainerRef} className="weather-particles-container" />
      
      {/* Переключатель темы */}
      <button
        onClick={toggleTheme}
        className="theme-toggle"
        aria-label="Переключить тему"
      >
        <span className="theme-toggle-icon">
          {theme === 'dark' ? '☀️' : '🌙'}
        </span>
        <span className="theme-toggle-text">
          {theme === 'dark' ? 'Светлая' : 'Темная'}
        </span>
      </button>
      
      {/* Индикатор погоды */}
      {weather && (
        <div className="weather-indicator">
          {currentMood.particles} {currentMood.name} • {weather.temperature}°C
        </div>
      )}

      {/* Hero Section - MOBILE FIRST, SAMSUNG STYLE */}
      <section className="hero-section fade-in-element">
        <div className="hero-content">
          <h1 className="hero-title">
            Камчатка
          </h1>
          <p className="hero-subtitle">
            Вулканы • Океан • Медведи
          </p>
          
          {/* Поиск - Touch Friendly */}
          <div className="hero-search-container">
            <div className="search-wrapper">
              <input 
                placeholder="Найти тур..." 
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="search-input"
                name="q" 
              />
              {showSearchResults && searchResults.length > 0 && (
                <div className="search-results">
                  {searchResults.slice(0, 5).map((tour: any) => (
                    <a
                      key={tour.id}
                      href={`/tours/${tour.id}`}
                      className="search-result-item"
                    >
                      <div className="result-title">{tour.title}</div>
                      <div className="result-price">от {tour.priceFrom?.toLocaleString()} ₽</div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* CTA кнопки - Touch Friendly (56px height) */}
          <div className="cta-buttons">
            <a href="/tours" className="cta-primary">
              🏔️ Смотреть туры
            </a>
            <a href="/auth/login" className="cta-secondary">
              Стать партнёром
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="scroll-indicator">
          <div className="scroll-arrow">↓</div>
        </div>
      </section>

      {/* Статистика - GLASSMORPHISM */}
      <section className="stats-section fade-in-element">
        <div className="stats-grid">
          <div className="stat-card glass-card">
            <div className="stat-number">{tours.length || 5}</div>
            <div className="stat-label">Туров</div>
          </div>
          <div className="stat-card glass-card">
            <div className="stat-number">{partners.length || 10}</div>
            <div className="stat-label">Партнёров</div>
          </div>
          <div className="stat-card glass-card">
            <div className="stat-number">150+</div>
            <div className="stat-label">Туристов</div>
          </div>
          <div className="stat-card glass-card">
            <div className="stat-number">4.9</div>
            <div className="stat-label">⭐ Рейтинг</div>
          </div>
        </div>
      </section>

      {/* Роли убраны - теперь в форме регистрации */}

      {/* Погода - Встроенный виджет */}
      {userLocation && (
        <section className="weather-section fade-in-element">
          <WeatherWidget
            lat={userLocation.lat}
            lng={userLocation.lng}
            location="Камчатка"
            className="weather-widget-custom"
          />
        </section>
      )}

      {/* Популярные туры */}
      <section className="tours-section fade-in-element">
        <div className="section-header">
          <h2 className="section-title">Популярные туры</h2>
          <a href="/tours" className="section-link">Все →</a>
        </div>
        
        {loading ? (
          <div className="tours-grid">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="tour-skeleton"></div>
            ))}
          </div>
        ) : tours.length > 0 ? (
          <div className="tours-grid">
            {tours.slice(0, 3).map((tour) => (
              <TourCard
                key={tour.id}
                tour={tour}
                onClick={() => {
                  window.location.href = `/tours/${tour.id}`;
                }}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🏔️</div>
            <p>Туры скоро появятся</p>
          </div>
        )}
      </section>

      {/* Партнёры */}
      {partners.length > 0 && (
        <section className="partners-section fade-in-element">
          <div className="section-header">
            <h2 className="section-title">Партнёры</h2>
            <a href="/partners" className="section-link">Все →</a>
          </div>
          
          <div className="partners-grid">
            {partners.slice(0, 6).map((partner) => (
              <div key={partner.id} className="partner-card glass-card">
                <div className="partner-icon">🏢</div>
                <div className="partner-name">{partner.name}</div>
                <div className="partner-rating">⭐ {partner.rating || '4.5'}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Отзывы */}
      <section className="reviews-section fade-in-element">
        <h2 className="section-title">Отзывы</h2>
        <div className="reviews-grid">
          {[
            {
              name: 'Анна К.',
              avatar: '👩',
              rating: 5,
              text: 'Невероятные впечатления! Восхождение на вулкан - это космос.',
              tour: 'Авачинский вулкан',
            },
            {
              name: 'Дмитрий М.',
              avatar: '👨',
              rating: 5,
              text: 'Долина гейзеров превзошла все ожидания!',
              tour: 'Долина гейзеров',
            },
            {
              name: 'Елена С.',
              avatar: '👩',
              rating: 5,
              text: 'Рыбалка на Камчатке - мечта!',
              tour: 'Рыболовный тур',
            },
          ].map((review, index) => (
            <div key={index} className="review-card glass-card">
              <div className="review-header">
                <div className="review-avatar">{review.avatar}</div>
                <div className="review-info">
                  <div className="review-name">{review.name}</div>
                  <div className="review-rating">
                    {'⭐'.repeat(review.rating)}
                  </div>
                </div>
              </div>
              <p className="review-text">&ldquo;{review.text}&rdquo;</p>
              <div className="review-tour">{review.tour}</div>
            </div>
          ))}
        </div>
      </section>

      {/* AI Chat - Компактный на мобильном */}
      <section className="ai-section fade-in-element">
        <h2 className="section-title">AI-гид</h2>
        <AIChatWidget userId="demo-user" className="ai-widget" />
      </section>

      {/* Footer - Мобильный */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">🏔️</div>
            <span className="footer-brand-name">Kamchatour Hub</span>
          </div>
          
          <div className="footer-links">
            <a href="/tours">Туры</a>
            <a href="/partners">Партнёры</a>
            <a href="/auth/login">Войти</a>
            <a href="/hub/safety">Безопасность</a>
          </div>
          
          <div className="footer-contacts">
            <div>📍 Петропавловск-Камчатский</div>
            <div>📧 info@kamchatour.ru</div>
          </div>
          
          <div className="footer-copy">
            © 2025 Kamchatour Hub
          </div>
        </div>
      </footer>
    </main>
  );
}
