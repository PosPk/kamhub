'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Tour, Partner } from '@/types';
import { FloatingNav } from '@/components/FloatingNav';
import Link from 'next/link';

export default function ProfessionalHomePage() {
  const [stats, setStats] = useState({ tours: 0, partners: 0, tourists: 0, rating: 0 });
  const [statsAnimated, setStatsAnimated] = useState(false);
  const [tours, setTours] = useState<Tour[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [searchQuery, setSearchQuery] = useState('');
  
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load theme
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
    
    fetchData();
    setupScrollReveal();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch tours
      const toursRes = await fetch('/api/tours?limit=6');
      const toursData = await toursRes.json();
      if (toursData.success) {
        setTours(toursData.data?.tours || []);
      }

      // Fetch partners
      const partnersRes = await fetch('/api/partners');
      const partnersData = await partnersRes.json();
      if (partnersData.success) {
        setPartners(partnersData.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const setupScrollReveal = () => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          
          if (entry.target === statsRef.current && !statsAnimated) {
            animateStats();
            setStatsAnimated(true);
          }
        }
      });
    }, { threshold: 0.1 });

    setTimeout(() => {
      document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
      });
      
      if (statsRef.current) observer.observe(statsRef.current);
    }, 100);
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

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <main className="professional-homepage">
      {/* Theme Toggle */}
      <button 
        onClick={toggleTheme}
        className="theme-toggle-pro"
        title={theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {theme === 'light' ? (
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          ) : (
            <>
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </>
          )}
        </svg>
      </button>

      {/* HERO SECTION - Туристический */}
      <section className="hero-professional">
        <div className="hero-content-pro">
          <div className="hero-badge">
            🏔️ Экосистема туризма Камчатки
          </div>
          
          <h1 className="hero-title-pro">
            Туры • Трансферы • Размещение
          </h1>
          
          <p className="hero-subtitle-pro">
            Всё для вашего путешествия на Камчатку в одном месте
          </p>

          {/* БОЛЬШОЙ ПОИСК */}
          <div className="search-box-pro">
            <div className="search-container-pro">
              <div className="search-input-wrapper">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Куда вы хотите отправиться? (вулкан, рыбалка, медведи...)"
                  className="search-input-pro"
                />
                <Link href="/search" className="search-btn-pro">
                  Найти туры
                </Link>
              </div>
            </div>
          </div>

          {/* СТАТИСТИКА */}
          <div ref={statsRef} className="hero-stats fade-in">
            <div className="stat-item-pro">
              <div className="stat-value-pro">{stats.tours}+</div>
              <div className="stat-label-pro">Туров</div>
            </div>
            <div className="stat-item-pro">
              <div className="stat-value-pro">{stats.partners}</div>
              <div className="stat-label-pro">Партнёров</div>
            </div>
            <div className="stat-item-pro">
              <div className="stat-value-pro">{stats.tourists}+</div>
              <div className="stat-label-pro">Туристов</div>
            </div>
            <div className="stat-item-pro">
              <div className="stat-value-pro">{stats.rating}</div>
              <div className="stat-label-pro">Рейтинг</div>
            </div>
          </div>
        </div>
      </section>

      {/* ПОПУЛЯРНЫЕ ТУРЫ */}
      <section className="section-pro fade-in">
        <div className="section-header-pro">
          <h2 className="section-title-pro">Популярные туры</h2>
          <p className="section-subtitle-pro">
            Исследуйте вулканы, океан и дикую природу с профессиональными гидами
          </p>
        </div>

        <div className="tours-grid">
          {tours.length > 0 ? (
            tours.map((tour) => (
              <div key={tour.id} className="tour-card-pro">
                <div className="tour-image-pro">
                  <img 
                    src={tour.images[0] || '/placeholder-tour.jpg'} 
                    alt={tour.title}
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-tour.jpg';
                    }}
                  />
                  <div className="tour-badge-pro">Популярный</div>
                  <div className="tour-rating-pro">
                    <img src="/icons/star.svg" alt="rating" width="16" height="16" />
                    {tour.rating}
                  </div>
                </div>
                <div className="tour-content-pro">
                  <h3 className="tour-title-pro">{tour.title}</h3>
                  <p className="tour-description-pro">{tour.description}</p>
                  <div className="tour-footer-pro">
                    <div className="tour-price-pro">от {tour.priceFrom.toLocaleString()} ₽</div>
                    <div className="tour-duration-pro">{tour.duration}</div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <>
              {/* Mock tours for demo */}
              <div className="tour-card-pro">
                <div className="tour-image-pro" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <div className="tour-badge-pro">Хит</div>
                  <div className="tour-rating-pro">
                    <img src="/icons/star.svg" alt="rating" width="16" height="16" />
                    4.9
                  </div>
                </div>
                <div className="tour-content-pro">
                  <h3 className="tour-title-pro">Восхождение на Авачинский вулкан</h3>
                  <p className="tour-description-pro">
                    Незабываемое восхождение на действующий вулкан с потрясающими видами
                  </p>
                  <div className="tour-footer-pro">
                    <div className="tour-price-pro">от 8 500 ₽</div>
                    <div className="tour-duration-pro">1 день</div>
                  </div>
                </div>
              </div>

              <div className="tour-card-pro">
                <div className="tour-image-pro" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                  <div className="tour-badge-pro">Популярный</div>
                  <div className="tour-rating-pro">
                    <img src="/icons/star.svg" alt="rating" width="16" height="16" />
                    5.0
                  </div>
                </div>
                <div className="tour-content-pro">
                  <h3 className="tour-title-pro">Долина гейзеров</h3>
                  <p className="tour-description-pro">
                    Вертолётная экскурсия в одно из чудес России
                  </p>
                  <div className="tour-footer-pro">
                    <div className="tour-price-pro">от 35 000 ₽</div>
                    <div className="tour-duration-pro">1 день</div>
                  </div>
                </div>
              </div>

              <div className="tour-card-pro">
                <div className="tour-image-pro" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                  <div className="tour-badge-pro">Новый</div>
                  <div className="tour-rating-pro">
                    <img src="/icons/star.svg" alt="rating" width="16" height="16" />
                    4.8
                  </div>
                </div>
                <div className="tour-content-pro">
                  <h3 className="tour-title-pro">Наблюдение за медведями</h3>
                  <p className="tour-description-pro">
                    Курильское озеро - встреча с бурыми медведями в дикой природе
                  </p>
                  <div className="tour-footer-pro">
                    <div className="tour-price-pro">от 45 000 ₽</div>
                    <div className="tour-duration-pro">2 дня</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* БИЗНЕС СЕКЦИЯ */}
      <section className="business-section fade-in">
        <div className="section-header-pro">
          <h2 className="section-title-pro">Станьте частью экосистемы</h2>
          <p className="section-subtitle-pro">
            Профессиональные инструменты для роста вашего бизнеса
          </p>
        </div>

        <div className="business-cards">
          <div className="business-card-pro">
            <div className="business-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18M9 21V9" />
              </svg>
            </div>
            <h3 className="business-title">Туроператорам</h3>
            <ul className="business-features">
              <li>CRM система для управления</li>
              <li>Онлайн-бронирования</li>
              <li>Аналитика и отчёты</li>
              <li>Интеграция с партнёрами</li>
              <li>Автоматизация рутины</li>
            </ul>
            <Link href="/auth/login" className="business-cta">
              Начать работу
            </Link>
          </div>

          <div className="business-card-pro">
            <div className="business-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <h3 className="business-title">Партнёрам</h3>
            <ul className="business-features">
              <li>Размещение и отели</li>
              <li>Трансферы и транспорт</li>
              <li>Снаряжение и аренда</li>
              <li>Сувениры и магазины</li>
              <li>Прозрачная комиссия</li>
            </ul>
            <Link href="/partner/register" className="business-cta">
              Подключиться
            </Link>
          </div>
        </div>
      </section>

      {/* ПАРТНЁРЫ */}
      <section className="partners-section fade-in">
        <div className="section-header-pro">
          <h2 className="section-title-pro">Наши партнёры</h2>
        </div>

        <div className="partners-grid">
          {partners.length > 0 ? (
            partners.map((partner) => (
              <div key={partner.id} className="partner-logo">
                <img 
                  src={partner.logo?.url || '/placeholder-logo.png'} 
                  alt={partner.name}
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-logo.png';
                  }}
                />
              </div>
            ))
          ) : (
            <div className="partners-info">
              2 туроператора • 1 размещение • 1 сувениры • Аренда
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer-pro">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Для туристов</h3>
            <ul>
              <li><Link href="/tours">Туры</Link></li>
              <li><Link href="/search">Поиск</Link></li>
              <li><Link href="/transfers">Трансферы</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>Для бизнеса</h3>
            <ul>
              <li><Link href="/auth/login">Операторам</Link></li>
              <li><Link href="/partner/register">Партнёрам</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>О нас</h3>
            <ul>
              <li><Link href="/about">О проекте</Link></li>
              <li><Link href="/contacts">Контакты</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          © 2025 Kamchatka Tour Hub. Экосистема туризма Камчатки.
        </div>
      </footer>

      <FloatingNav />
    </main>
  );
}
