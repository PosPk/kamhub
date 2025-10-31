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
  const snowContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
    getUserLocation();
    createSnowflakes();
    setupScrollAnimations();
  }, []);

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

  // Создаём снежинки/пепел
  const createSnowflakes = () => {
    if (typeof window === 'undefined') return;
    
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 20 : 40;
    const container = snowContainerRef.current;
    
    if (!container) return;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'snowflake';
      particle.innerHTML = Math.random() > 0.5 ? '❄' : '•'; // снег или пепел
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDuration = (Math.random() * 3 + 4) + 's';
      particle.style.animationDelay = Math.random() * 5 + 's';
      particle.style.fontSize = (Math.random() * 0.5 + 0.5) + 'em';
      particle.style.opacity = (Math.random() * 0.3 + 0.3).toString();
      container.appendChild(particle);
    }
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
    <main className="min-h-screen bg-kamchatka-gradient text-white overflow-x-hidden">
      {/* Анимированный фон со снегом/пеплом */}
      <div ref={snowContainerRef} className="snow-container" />
      
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

      {/* Роли - Mobile optimized */}
      <section className="roles-section fade-in-element">
        <h2 className="section-title">Для кого?</h2>
        <div className="roles-grid">
          {[
            ['Турист', '/hub/tourist'],
            ['Туроператор', '/hub/operator'],
            ['Гид', '/hub/guide'],
            ['Трансфер', '/hub/transfer'],
            ['Размещение', '/hub/stay'],
            ['Сувениры', '/hub/souvenirs'],
            ['Снаряжение', '/hub/gear'],
            ['Авто', '/hub/cars'],
          ].map(([title, href]) => (
            <a 
              key={title} 
              href={href} 
              className="role-card glass-card"
            >
              <div className="role-icon">
                {ROLE_ICONS[title] || '🎯'}
              </div>
              <div className="role-title">{title}</div>
            </a>
          ))}
        </div>
      </section>

      {/* Популярные туры - Вертикальный на мобильном */}
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
