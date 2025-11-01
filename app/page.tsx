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
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
    createParticles();
    setTimeout(() => animateStats(), 500);
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
      <div className="weather-background"></div>
      
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
