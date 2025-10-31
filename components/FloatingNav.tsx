'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: number;
}

export function FloatingNav() {
  const [activeTab, setActiveTab] = useState('home');
  const [showAI, setShowAI] = useState(false);

  const navItems: NavItem[] = [
    {
      id: 'home',
      label: 'Главная',
      href: '/',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      )
    },
    {
      id: 'tours',
      label: 'Туры',
      href: '/tours',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 2 7 12 12 22 7 12 2"/>
          <polyline points="2 17 12 22 22 17"/>
          <polyline points="2 12 12 17 22 12"/>
        </svg>
      )
    },
    {
      id: 'ai',
      label: 'AI.Kam',
      href: '#',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Z"/>
          <path d="M12 6v12M6 12h12"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      ),
      badge: 1
    },
    {
      id: 'partners',
      label: 'Партнёры',
      href: '/partners',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      )
    },
    {
      id: 'profile',
      label: 'Профиль',
      href: '/auth/login',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      )
    }
  ];

  const handleNavClick = (item: NavItem) => {
    setActiveTab(item.id);
    if (item.id === 'ai') {
      setShowAI(true);
    }
  };

  return (
    <>
      {/* Плавающая навигация */}
      <nav className="floating-nav">
        <div className="floating-nav-container">
          {navItems.map((item) => (
            item.id === 'ai' ? (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              >
                <div className="nav-icon-wrapper">
                  {item.icon}
                  {item.badge && (
                    <span className="nav-badge">{item.badge}</span>
                  )}
                </div>
                <span className="nav-label">{item.label}</span>
              </button>
            ) : (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setActiveTab(item.id)}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              >
                <div className="nav-icon-wrapper">
                  {item.icon}
                  {item.badge && (
                    <span className="nav-badge">{item.badge}</span>
                  )}
                </div>
                <span className="nav-label">{item.label}</span>
              </Link>
            )
          ))}
        </div>
      </nav>

      {/* AI Помощник ai.kam */}
      {showAI && (
        <div className="ai-modal-overlay" onClick={() => setShowAI(false)}>
          <div className="ai-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ai-modal-header">
              <div className="ai-modal-title">
                <div className="ai-avatar">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 16v-4M12 8h.01"/>
                  </svg>
                </div>
                <div>
                  <h3>AI.Kam</h3>
                  <p>Умный помощник по Камчатке</p>
                </div>
              </div>
              <button onClick={() => setShowAI(false)} className="ai-modal-close">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            
            <div className="ai-modal-content">
              <div className="ai-welcome">
                <div className="ai-welcome-icon">🏔️</div>
                <h4>Привет! Я AI.Kam</h4>
                <p>Ваш личный помощник по Камчатке с искусственным интеллектом</p>
              </div>
              
              <div className="ai-suggestions">
                <button className="ai-suggestion">
                  <span className="suggestion-icon">🗻</span>
                  <span>Какие вулканы можно посетить?</span>
                </button>
                <button className="ai-suggestion">
                  <span className="suggestion-icon">🎣</span>
                  <span>Где лучшая рыбалка?</span>
                </button>
                <button className="ai-suggestion">
                  <span className="suggestion-icon">🐻</span>
                  <span>Где увидеть медведей?</span>
                </button>
                <button className="ai-suggestion">
                  <span className="suggestion-icon">🌡️</span>
                  <span>Какая сейчас погода?</span>
                </button>
              </div>
            </div>
            
            <div className="ai-modal-footer">
              <input
                type="text"
                placeholder="Спросите что-нибудь о Камчатке..."
                className="ai-input"
              />
              <button className="ai-send-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m22 2-7 20-4-9-9-4Z"/>
                  <path d="M22 2 11 13"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
