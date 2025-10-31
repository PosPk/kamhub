'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Tour, Partner, Weather } from '@/types';
import { TourCard } from '@/components/TourCard';
import { PartnerCard } from '@/components/PartnerCard';
import { WeatherWidget } from '@/components/WeatherWidget';
import { EcoPointsWidget } from '@/components/EcoPointsWidget';
import { AIChatWidget } from '@/components/AIChatWidget';
import { FloatingNav } from '@/components/FloatingNav';

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
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [scrollY, setScrollY] = useState(0);
  const [currentReview, setCurrentReview] = useState(0);
  const [stats, setStats] = useState({ tours: 0, partners: 0, tourists: 0, rating: 0 });
  const [statsAnimated, setStatsAnimated] = useState(false);
  
  const snowContainerRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    fetchData();
    getUserLocation();
    loadThemePreference();
    
    // Parallax effect
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
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

  // Auto-rotate reviews
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentReview((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Загружаем тему из localStorage
  const loadThemePreference = () => {
    if (typeof window === 'undefined') return;
    
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
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

  const updateMoodByWeather = (weatherData: Weather) => {
    let moodKey = weatherData.condition;
    
    if (userLocation && Math.abs(userLocation.lat - 53.0195) < 5) {
      if (weatherData.temperature < 0 && weatherData.windSpeed > 20) {
        moodKey = 'volcanic_ash';
      }
    }
    
    const mood = WEATHER_MOODS[moodKey] || WEATHER_MOODS.snow;
    setCurrentMood(mood);
  };

  const createAtmosphericParticles = () => {
    if (typeof window === 'undefined') return;
    
    const container = snowContainerRef.current;
    if (!container) return;

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

  const updateBackgroundGradient = () => {
    if (typeof window === 'undefined') return;
    
    const main = mainRef.current;
    if (!main) return;

    const gradient = `linear-gradient(180deg, ${currentMood.gradient.join(', ')})`;
    main.style.background = gradient;
  };

  const setupScrollAnimations = () => {
    if (typeof window === 'undefined') return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in-visible');
          
          // Animate stats
          if (entry.target === statsRef.current && !statsAnimated) {
            animateStats();
            setStatsAnimated(true);
          }
        }
      });
    }, { threshold: 0.1 });
    
    setTimeout(() => {
      document.querySelectorAll('.fade-in-element').forEach(el => {
        observer.observe(el);
      });
      
      if (statsRef.current) {
        observer.observe(statsRef.current);
      }
    }, 100);
  };

  // Анимация счетчиков
  const animateStats = () => {
    const duration = 2000;
    const frameDuration = 1000 / 60;
    const totalFrames = Math.round(duration / frameDuration);
    
    const targetStats = {
      tours: tours.length || 15,
      partners: partners.length || 42,
      tourists: 150,
      rating: 4.9
    };
    
    let frame = 0;
    const counter = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      
      setStats({
        tours: Math.round(targetStats.tours * easeOutQuart),
        partners: Math.round(targetStats.partners * easeOutQuart),
        tourists: Math.round(targetStats.tourists * easeOutQuart),
        rating: parseFloat((targetStats.rating * easeOutQuart).toFixed(1))
      });
      
      if (frame === totalFrames) {
        clearInterval(counter);
        setStats(targetStats);
      }
    }, frameDuration);
  };

  // Debounced search
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (query.length < 2) {
      setShowSearchResults(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
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
    }, 300);
  };

  // Reviews data
  const reviews = [
    {
      name: 'Анна К.',
      avatar: '👩',
      rating: 5,
      text: 'Невероятные впечатления! Восхождение на вулкан - это космос.',
      tour: 'Авачинский вулкан',
      image: '🌋'
    },
    {
      name: 'Дмитрий М.',
      avatar: '👨',
      rating: 5,
      text: 'Долина гейзеров превзошла все ожидания!',
      tour: 'Долина гейзеров',
      image: '💨'
    },
    {
      name: 'Елена С.',
      avatar: '👩',
      rating: 5,
      text: 'Рыбалка на Камчатке - мечта!',
      tour: 'Рыболовный тур',
      image: '🎣'
    },
  ];

  return (
    <main ref={mainRef} className="min-h-screen text-white overflow-x-hidden weather-animated-bg">
      {/* Атмосферные частицы */}
      <div ref={snowContainerRef} className="weather-particles-container" />
      
      {/* Переключатель темы */}
      <button
        onClick={toggleTheme}
        className="theme-toggle magnetic-button"
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

      {/* HERO SECTION - С ПАРАЛЛАКСОМ */}
      <section 
        ref={heroRef}
        className="hero-section-modern fade-in-element"
        style={{
          transform: `translateY(${scrollY * 0.5}px)`,
          opacity: 1 - scrollY / 500
        }}
      >
        <div className="hero-content-modern">
          {/* Floating Logo */}
          <div 
            className="floating-logo"
            style={{
              transform: `translateY(${Math.sin(Date.now() / 1000) * 10}px)`
            }}
          >
            <img src="/logo-kamchatka.svg" alt="Kamchatka Tour Hub" className="hero-logo" />
          </div>
          
          <h1 className="hero-title-modern">
            <span className="title-line">Откройте</span>
            <span className="title-line gradient-text">Камчатку</span>
          </h1>
          
          <p className="hero-subtitle-modern">
            Вулканы • Океан • Медведи • Приключения
          </p>
          
          {/* Интерактивный поиск с live preview */}
          <div className="hero-search-modern">
            <div className="search-wrapper-modern">
              <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <input 
                placeholder="Найти тур мечты..." 
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="search-input-modern"
                name="q" 
              />
              {showSearchResults && searchResults.length > 0 && (
                <div className="search-results-modern">
                  {searchResults.slice(0, 5).map((tour: any) => (
                    <a
                      key={tour.id}
                      href={`/tours/${tour.id}`}
                      className="search-result-modern"
                    >
                      <div className="result-emoji">{tour.emoji || '🏔️'}</div>
                      <div className="result-content">
                        <div className="result-title-modern">{tour.title}</div>
                        <div className="result-meta">
                          <span className="result-price-modern">от {tour.priceFrom?.toLocaleString()} ₽</span>
                          <span className="result-duration">{tour.duration || '1 день'}</span>
                        </div>
                      </div>
                      <svg className="result-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* CTA кнопки с магнитным эффектом */}
          <div className="cta-buttons-modern">
            <a href="/tours" className="cta-primary-modern magnetic-button ripple-button">
              <span className="btn-icon">🏔️</span>
              <span className="btn-text">Смотреть туры</span>
              <svg className="btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
            <a href="/auth/login" className="cta-secondary-modern magnetic-button ripple-button">
              <span className="btn-text">Стать партнёром</span>
            </a>
          </div>
        </div>

        {/* Animated scroll indicator */}
        <div className="scroll-indicator-modern">
          <div className="scroll-mouse">
            <div className="scroll-wheel"></div>
          </div>
          <span className="scroll-text">Листайте вниз</span>
        </div>
      </section>

      {/* СТАТИСТИКА С АНИМАЦИЕЙ */}
      <section ref={statsRef} className="stats-section-modern fade-in-element">
        <div className="stats-grid-modern">
          <div className="stat-card-modern glass-card-modern">
            <div className="stat-icon">🏔️</div>
            <div className="stat-number-modern">{stats.tours}+</div>
            <div className="stat-label-modern">Туров</div>
            <div className="stat-bar">
              <div className="stat-bar-fill" style={{ width: `${(stats.tours / 15) * 100}%` }}></div>
            </div>
          </div>
          <div className="stat-card-modern glass-card-modern">
            <div className="stat-icon">🤝</div>
            <div className="stat-number-modern">{stats.partners}+</div>
            <div className="stat-label-modern">Партнёров</div>
            <div className="stat-bar">
              <div className="stat-bar-fill" style={{ width: `${(stats.partners / 42) * 100}%` }}></div>
            </div>
          </div>
          <div className="stat-card-modern glass-card-modern">
            <div className="stat-icon">👥</div>
            <div className="stat-number-modern">{stats.tourists}+</div>
            <div className="stat-label-modern">Туристов</div>
            <div className="stat-bar">
              <div className="stat-bar-fill" style={{ width: `${(stats.tourists / 150) * 100}%` }}></div>
            </div>
          </div>
          <div className="stat-card-modern glass-card-modern">
            <div className="stat-icon">⭐</div>
            <div className="stat-number-modern">{stats.rating}</div>
            <div className="stat-label-modern">Рейтинг</div>
            <div className="stat-bar">
              <div className="stat-bar-fill" style={{ width: `${(stats.rating / 5) * 100}%` }}></div>
            </div>
          </div>
        </div>
      </section>

      {/* ПАРТНЕРЫ С 3D ЭФФЕКТОМ */}
      {partners.length > 0 && (
        <section className="partners-section-modern fade-in-element">
          <div className="section-header-modern">
            <h2 className="section-title-modern gradient-text">Партнёры</h2>
            <a href="/partners" className="section-link-modern">
              Все партнёры
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
          
          <div className="partners-grid-modern">
            {partners.slice(0, 6).map((partner, index) => (
              <div 
                key={partner.id} 
                className="partner-card-3d glass-card-modern"
                style={{ 
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                <div className="partner-glow"></div>
                <div className="partner-content-modern">
                  <div className="partner-icon-modern">🏢</div>
                  <div className="partner-name-modern">{partner.name}</div>
                  <div className="partner-meta">
                    <span className="partner-rating-modern">⭐ {partner.rating || '4.5'}</span>
                    <span className="partner-badge">Проверен</span>
                  </div>
                </div>
                <div className="partner-hover-overlay">
                  <button className="partner-view-btn">Подробнее →</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ТУРЫ */}
      <section className="tours-section-modern fade-in-element">
        <div className="section-header-modern">
          <h2 className="section-title-modern gradient-text">Популярные туры</h2>
          <a href="/tours" className="section-link-modern">
            Все туры
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
        </div>
        
        {loading ? (
          <div className="tours-grid-modern">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="tour-skeleton-modern"></div>
            ))}
          </div>
        ) : tours.length > 0 ? (
          <div className="tours-grid-modern">
            {tours.slice(0, 3).map((tour, index) => (
              <div 
                key={tour.id}
                className="tour-card-wrapper"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <TourCard
                  tour={tour}
                  onClick={() => {
                    window.location.href = `/tours/${tour.id}`;
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state-modern">
            <div className="empty-icon">🏔️</div>
            <p>Туры скоро появятся</p>
          </div>
        )}
      </section>

      {/* ОТЗЫВЫ С КАРУСЕЛЬЮ */}
      <section className="reviews-section-modern fade-in-element">
        <h2 className="section-title-modern gradient-text">Отзывы туристов</h2>
        
        <div className="reviews-carousel">
          <div 
            className="reviews-track"
            style={{ transform: `translateX(-${currentReview * 100}%)` }}
          >
            {reviews.map((review, index) => (
              <div key={index} className="review-card-modern glass-card-modern">
                <div className="review-image-badge">{review.image}</div>
                <div className="review-rating-modern">
                  {'⭐'.repeat(review.rating)}
                </div>
                <p className="review-text-modern">&ldquo;{review.text}&rdquo;</p>
                <div className="review-footer-modern">
                  <div className="review-avatar-modern">{review.avatar}</div>
                  <div className="review-info-modern">
                    <div className="review-name-modern">{review.name}</div>
                    <div className="review-tour-modern">{review.tour}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Dots */}
          <div className="reviews-dots">
            {reviews.map((_, index) => (
              <button
                key={index}
                className={`review-dot ${index === currentReview ? 'active' : ''}`}
                onClick={() => setCurrentReview(index)}
                aria-label={`Отзыв ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ПОГОДА */}
      {userLocation && (
        <section className="weather-section-modern fade-in-element">
          <WeatherWidget
            lat={userLocation.lat}
            lng={userLocation.lng}
            location="Камчатка"
            className="weather-widget-modern"
          />
        </section>
      )}

      {/* AI CHAT */}
      <section className="ai-section-modern fade-in-element">
        <h2 className="section-title-modern gradient-text">AI-гид</h2>
        <AIChatWidget userId="demo-user" className="ai-widget-modern" />
      </section>

      {/* ПЛАВАЮЩАЯ НАВИГАЦИЯ */}
      <FloatingNav />

      {/* FOOTER */}
      <footer className="footer-modern">
        <div className="footer-content-modern">
          <div className="footer-brand-modern">
            <img src="/logo-kamchatka.svg" alt="Kamchatka Tour Hub" className="footer-logo-modern" />
            <span className="footer-tagline">Экосистема туризма Камчатки</span>
          </div>
          
          <div className="footer-links-modern">
            <div className="footer-column">
              <h3>Туризм</h3>
              <a href="/tours">Туры</a>
              <a href="/partners">Партнёры</a>
              <a href="/hub/guide">Гиды</a>
            </div>
            <div className="footer-column">
              <h3>Сервисы</h3>
              <a href="/hub/transfer">Трансфер</a>
              <a href="/hub/stay">Размещение</a>
              <a href="/hub/gear">Снаряжение</a>
            </div>
            <div className="footer-column">
              <h3>Компания</h3>
              <a href="/auth/login">Войти</a>
              <a href="/hub/safety">Безопасность</a>
              <a href="/about">О нас</a>
            </div>
          </div>
          
          <div className="footer-contacts-modern">
            <div className="contact-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>Петропавловск-Камчатский</span>
            </div>
            <div className="contact-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
              <span>info@kamchatour.ru</span>
            </div>
          </div>
          
          <div className="footer-bottom">
            <div className="footer-copy">© 2025 Tourhub. Все права защищены.</div>
            <div className="footer-social">
              <a href="#" className="social-link">VK</a>
              <a href="#" className="social-link">TG</a>
              <a href="#" className="social-link">YT</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
