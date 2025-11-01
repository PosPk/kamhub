'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Tour, Partner } from '@/types';
import { FloatingNav } from '@/components/FloatingNav';
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
    difficulty: 'all'
  });
  const [weatherData, setWeatherData] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
    fetchWeather();
    createParticles();
    setTimeout(() => animateStats(), 500);
    
    // Update time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timeInterval);
  }, []);

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
                <input
                  type="text"
                  className="search-input-elegant"
                  placeholder="Куда вы хотите отправиться?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
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
                    <label>Категория</label>
                    <select value={filters.category} onChange={(e) => setFilters({...filters, category: e.target.value})}>
                      <option value="all">Все</option>
                      <option value="volcano">Вулканы</option>
                      <option value="wildlife">Медведи и природа</option>
                      <option value="fishing">Рыбалка</option>
                      <option value="hot-springs">Термальные источники</option>
                    </select>
                  </div>

                  <div className="filter-group">
                    <label>Цена</label>
                    <select value={filters.priceRange} onChange={(e) => setFilters({...filters, priceRange: e.target.value})}>
                      <option value="all">Любая</option>
                      <option value="budget">До 10 000 ₽</option>
                      <option value="mid">10 000 - 30 000 ₽</option>
                      <option value="premium">От 30 000 ₽</option>
                    </select>
                  </div>

                  <div className="filter-group">
                    <label>Длительность</label>
                    <select value={filters.duration} onChange={(e) => setFilters({...filters, duration: e.target.value})}>
                      <option value="all">Любая</option>
                      <option value="1">1 день</option>
                      <option value="2-3">2-3 дня</option>
                      <option value="week">Неделя+</option>
                    </select>
                  </div>

                  <div className="filter-group">
                    <label>Сложность</label>
                    <select value={filters.difficulty} onChange={(e) => setFilters({...filters, difficulty: e.target.value})}>
                      <option value="all">Любая</option>
                      <option value="easy">Легкая</option>
                      <option value="medium">Средняя</option>
                      <option value="hard">Сложная</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* ГАЛЕРЕЯ ФОТО */}
            <div className="photos-gallery-elegant">
              <div className="photos-carousel-elegant">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="photo-card-elegant glass-card">
                    <img src={`/photos/kamchatka-${i}.jpg`} alt={`Камчатка ${i}`} />
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

        <FloatingNav />
      </main>
    </>
  );
}
