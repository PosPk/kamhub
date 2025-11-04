'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Tour, Partner, Weather } from '@/types';
import { FloatingNav } from '@/components/FloatingNav';
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage2025() {
  const [stats, setStats] = useState({ tours: 0, partners: 0, tourists: 0, rating: 0 });
  const [statsAnimated, setStatsAnimated] = useState(false);
  const [tours, setTours] = useState<Tour[]>([]);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  const statsRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
    
    fetchData();
    setupScrollReveal();
    setupCursorFollower();
    
    // Auto-rotate testimonials
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % 3);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
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
    } finally {
      setLoading(false);
    }
  };

  const setupScrollReveal = () => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          
          if (entry.target === statsRef.current && !statsAnimated) {
            animateStats();
            setStatsAnimated(true);
          }
        }
      });
    }, { threshold: 0.1 });

    setTimeout(() => {
      document.querySelectorAll('.reveal-element, .reveal-slide-left, .reveal-slide-right, .reveal-scale').forEach(el => {
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

  const setupCursorFollower = () => {
    if (typeof window === 'undefined') return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      
      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX}px`;
        cursorRef.current.style.top = `${e.clientY}px`;
        cursorRef.current.classList.add('active');
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  };

  const handleCardHover = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;

    card.style.setProperty('--rotate-x', `${rotateX}deg`);
    card.style.setProperty('--rotate-y', `${rotateY}deg`);
  };

  const handleCardLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    card.style.setProperty('--rotate-x', '0deg');
    card.style.setProperty('--rotate-y', '0deg');
  };

  const testimonials = [
    {
      name: 'Анна Иванова',
      role: 'Путешественник',
      text: 'Невероятные впечатления! Восхождение на Авачинский вулкан - это что-то космическое. Вид сверху просто захватывает дух!',
      rating: 5,
      tour: 'Авачинский вулкан',
      avatar: 'АИ'
    },
    {
      name: 'Дмитрий Смирнов',
      role: 'Фотограф',
      text: 'Долина гейзеров превзошла все ожидания. Такой природы больше нет нигде в мире. Потрясающие кадры и эмоции!',
      rating: 5,
      tour: 'Долина гейзеров',
      avatar: 'ДС'
    },
    {
      name: 'Елена Петрова',
      role: 'Рыболов',
      text: 'Рыбалка на Камчатке - это мечта! Поймала кижуча на 12 кг. Организация на высшем уровне, гиды супер профессиональные.',
      rating: 5,
      tour: 'Рыболовный тур',
      avatar: 'ЕП'
    }
  ];

  return (
    <main className="homepage-2025">
      {/* Theme Toggle */}
      <button 
        onClick={toggleTheme}
        className="theme-toggle-2025"
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
      
      {/* Cursor Follower */}
      <div ref={cursorRef} className="cursor-follower" />
      
      {/* Particles Background */}
      <div className="particles-2025">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              '--duration': `${Math.random() * 10 + 10}s`,
              '--x-end': `${Math.random() * 200 - 100}px`,
              '--opacity': Math.random() * 0.5 + 0.3,
              animationDelay: `${Math.random() * 10}s`
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* HERO SECTION 2025 */}
      <section className="hero-2025">
        <div className="gradient-mesh" />
        <div className="morphing-shape" style={{ top: '10%', left: '5%' } as React.CSSProperties} />
        <div className="morphing-shape" style={{ top: '20%', right: '10%' } as React.CSSProperties} />
        <div className="morphing-shape" style={{ bottom: '20%', left: '10%' } as React.CSSProperties} />

        <div className="hero-content-2025">
          <div className="logo-interactive">
            <img src="/logo-kamchatka.svg" alt="Kamchatka" className="logo-2025" />
          </div>

          <h1 className="title-2025">
            Откройте Камчатку
          </h1>

          <p className="subtitle-2025">
            Вулканы • Океан • Медведи • Приключения
          </p>

          <div className="search-2025">
            <div className="search-container-2025">
              <Link href="/search" className="btn-2025 btn-primary-2025" style={{ width: '100%', justifyContent: 'center' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 24, height: 24 }}>
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
                <span>Найти тур мечты</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20 }}>
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
            </div>
          </div>

          <div className="cta-2025">
            <Link href="/tours" className="btn-2025 btn-primary-2025 magnetic-element">
              <span>🏔️ Смотреть туры</span>
            </Link>
            <Link href="/auth/login" className="btn-2025 btn-secondary-2025 magnetic-element">
              <span>Стать партнёром</span>
            </Link>
          </div>
        </div>

        <div className="scroll-indicator-2025">
          <div className="scroll-wheel-2025">
            <div className="scroll-wheel-inner" />
          </div>
          <span className="scroll-text-2025">Листайте вниз</span>
        </div>
      </section>

      {/* STATS 2025 */}
      <section ref={statsRef} className="section-2025 reveal-element">
        <div className="stats-2025">
          {[
            { icon: '/icons/tours.svg', value: stats.tours, label: 'Туров', color: '#3b82f6' },
            { icon: '/icons/partners.svg', value: stats.partners, label: 'Партнёров', color: '#8b5cf6' },
            { icon: '/icons/tourists.svg', value: stats.tourists, label: 'Туристов', color: '#e6c149' },
            { icon: '/icons/star.svg', value: stats.rating, label: 'Рейтинг', color: '#f59e0b' }
          ].map((stat, i) => (
            <div 
              key={i}
              className="stat-card-2025 card-3d hover-glow"
              onMouseMove={handleCardHover}
              onMouseLeave={handleCardLeave}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="card-3d-bg" />
              <div className="card-3d-content">
                <div className="stat-icon-2025">
                  <svg width="48" height="48" style={{ color: stat.color }}>
                    <use href={`${stat.icon}#root`} />
                  </svg>
                  <img src={stat.icon} alt={stat.label} width="48" height="48" style={{ color: stat.color }} />
                </div>
                <div className="stat-number-2025">{stat.value}+</div>
                <div className="stat-label-2025">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* BENTO GRID - Туры */}
      <section className="section-2025 reveal-element">
        <div className="section-header-2025">
          <span className="section-tag">Популярные</span>
          <h2 className="section-title-2025">Туры Камчатки</h2>
          <p className="section-description-2025">
            Исследуйте вулканы, океан и дикую природу с лучшими гидами
          </p>
        </div>

        <div className="bento-grid">
          {/* Large featured tour */}
          <div className="bento-item bento-large card-3d glass-2025" onMouseMove={handleCardHover} onMouseLeave={handleCardLeave}>
            <div className="card-3d-bg" />
            <div className="card-3d-content">
              <h3 style={{ fontSize: 32, fontWeight: 900, marginBottom: 16 }}>
                Авачинский вулкан
              </h3>
              <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 24 }}>
                Восхождение на действующий вулкан с потрясающими видами
              </p>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <span style={{ fontSize: 28, fontWeight: 900, color: 'var(--accent-primary)' }}>
                  от 8 500 ₽
                </span>
                <span style={{ color: 'var(--text-secondary)' }}>1 день</span>
              </div>
            </div>
          </div>

          {/* Medium cards */}
          <div className="bento-item bento-medium card-3d glass-2025" onMouseMove={handleCardHover} onMouseLeave={handleCardLeave}>
            <div className="card-3d-bg" />
            <div className="card-3d-content">
              <img src="/icons/fishing.svg" alt="Рыбалка" width="48" height="48" style={{ marginBottom: 16, color: 'var(--accent-primary)' }} />
              <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Рыбалка</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Лучшие места для трофейной рыбалки</p>
            </div>
          </div>

          <div className="bento-item bento-small card-3d glass-2025" onMouseMove={handleCardHover} onMouseLeave={handleCardLeave}>
            <div className="card-3d-bg" />
            <img src="/icons/geyser.svg" alt="Гейзеры" width="40" height="40" style={{ marginBottom: 12, color: 'var(--accent-primary)' }} />
            <h4 style={{ fontSize: 18, fontWeight: 700 }}>Гейзеры</h4>
          </div>

          <div className="bento-item bento-small card-3d glass-2025" onMouseMove={handleCardHover} onMouseLeave={handleCardLeave}>
            <div className="card-3d-bg" />
            <img src="/icons/hot-spring.svg" alt="Термы" width="40" height="40" style={{ marginBottom: 12, color: 'var(--accent-primary)' }} />
            <h4 style={{ fontSize: 18, fontWeight: 700 }}>Термы</h4>
          </div>

          <div className="bento-item bento-tall card-3d glass-2025" onMouseMove={handleCardHover} onMouseLeave={handleCardLeave}>
            <div className="card-3d-bg" />
            <div className="card-3d-content">
              <img src="/icons/bear.svg" alt="Медведи" width="56" height="56" style={{ marginBottom: 20, color: 'var(--accent-primary)' }} />
              <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Наблюдение за медведями</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                Курильское озеро - уникальное место встречи с бурыми медведями
              </p>
            </div>
          </div>

          <div className="bento-item bento-medium card-3d glass-2025" onMouseMove={handleCardHover} onMouseLeave={handleCardLeave}>
            <div className="card-3d-bg" />
            <div className="card-3d-content">
              <img src="/icons/hiking.svg" alt="Треккинг" width="48" height="48" style={{ marginBottom: 16, color: 'var(--accent-primary)' }} />
              <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Треккинг</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Пешие походы по живописным маршрутам</p>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS 2025 */}
      <section className="section-2025 reveal-element">
        <div className="section-header-2025">
          <span className="section-tag">Отзывы</span>
          <h2 className="section-title-2025">Что говорят туристы</h2>
        </div>

        <div className="testimonials-2025">
          <div className="testimonial-stack">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="testimonial-card-2025 glass-2025"
                style={{
                  zIndex: 10 - index,
                  display: index < 3 ? 'block' : 'none'
                }}
              >
                <div style={{ display: 'flex', gap: 4, marginBottom: 24, opacity: 0.8 }}>
                  {[...Array(5)].map((_, i) => (
                    <img key={i} src="/icons/star.svg" alt="star" width="24" height="24" style={{ color: 'var(--accent-secondary)' }} />
                  ))}
                </div>
                <p style={{ fontSize: 20, lineHeight: 1.6, marginBottom: 32, color: 'var(--text-primary)' }}>
                  &ldquo;{testimonial.text}&rdquo;
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ 
                    width: 56, 
                    height: 56, 
                    borderRadius: '50%', 
                    background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                    fontWeight: 700,
                    color: 'white'
                  }}>
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>
                      {testimonial.name}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                      {testimonial.tour}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 40 }}>
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentTestimonial(i)}
                style={{
                  width: i === currentTestimonial ? 40 : 12,
                  height: 12,
                  borderRadius: 6,
                  border: 'none',
                  background: i === currentTestimonial ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.3)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-2025 reveal-scale" style={{ textAlign: 'center' }}>
        <div className="glass-2025" style={{ 
          padding: 80, 
          borderRadius: 48,
          maxWidth: 900,
          margin: '0 auto'
        }}>
          <h2 style={{ 
            fontSize: 'clamp(32px, 5vw, 56px)', 
            fontWeight: 900, 
            marginBottom: 24,
            background: 'linear-gradient(135deg, #ffffff, #e6c149)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Готовы к приключению?
          </h2>
          <p style={{ 
            fontSize: 20, 
            color: 'var(--text-secondary)', 
            marginBottom: 40,
            maxWidth: 600,
            margin: '0 auto 40px'
          }}>
            Начните своё путешествие на Камчатку прямо сейчас
          </p>
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/search" className="btn-2025 btn-primary-2025 magnetic-element">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 24, height: 24 }}>
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <span>Найти тур</span>
            </Link>
            <Link href="/auth/login" className="btn-2025 btn-secondary-2025 magnetic-element">
              <span>Стать партнёром</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer 2025 */}
      <footer style={{ 
        padding: '80px 20px 120px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        background: 'rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
          <img src="/logo-kamchatka.svg" alt="Kamchatka" style={{ height: 60, marginBottom: 24 }} />
          <p style={{ color: 'var(--text-secondary)', marginBottom: 40 }}>
            Экосистема туризма Камчатки
          </p>
          <div style={{ display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
            <Link href="/tours" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.3s' }}>Туры</Link>
            <Link href="/partners" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Партнёры</Link>
            <Link href="/search" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Поиск</Link>
            <Link href="/auth/login" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Войти</Link>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            © 2025 Kamchatka Tour Hub. Все права защищены.
          </p>
        </div>
      </footer>

      <FloatingNav />
    </main>
  );
}
