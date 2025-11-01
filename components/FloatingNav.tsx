'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import './FloatingNavElegant.css';

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
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      )
    },
    {
      id: 'search',
      label: 'Поиск',
      href: '/search',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
      )
    },
    {
      id: 'ai',
      label: 'AI.Kam',
      href: '#',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10"/>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
          <path d="M12 17h.01"/>
        </svg>
      ),
      badge: 1
    },
    {
      id: 'tours',
      label: 'Туры',
      href: '/tours',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        </svg>
      )
    },
    {
      id: 'profile',
      label: 'Профиль',
      href: '/auth/login',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
      {/* ЭЛЕГАНТНАЯ НАВИГАЦИЯ */}
      <nav className="floating-nav-elegant">
        <div className="floating-nav-elegant-container">
          {navItems.map((item) => (
            item.id === 'ai' ? (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`nav-item-elegant ${activeTab === item.id ? 'active' : ''}`}
              >
                <div className="nav-icon-elegant">
                  {item.icon}
                  {item.badge && (
                    <span className="nav-badge-elegant">{item.badge}</span>
                  )}
                </div>
                <span className="nav-label-elegant">{item.label}</span>
              </button>
            ) : (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setActiveTab(item.id)}
                className={`nav-item-elegant ${activeTab === item.id ? 'active' : ''}`}
              >
                <div className="nav-icon-elegant">
                  {item.icon}
                </div>
                <span className="nav-label-elegant">{item.label}</span>
              </Link>
            )
          ))}
        </div>
      </nav>

      {/* AI MODAL */}
      {showAI && (
        <div className="ai-modal-overlay-elegant" onClick={() => setShowAI(false)}>
          <div className="ai-modal-elegant" onClick={(e) => e.stopPropagation()}>
            <div className="ai-modal-header-elegant">
              <div className="ai-title-elegant">
                <div className="ai-avatar-elegant">✨</div>
                <div>
                  <h3>AI.Kam</h3>
                  <p>Умный помощник</p>
                </div>
              </div>
              <button onClick={() => setShowAI(false)} className="ai-close-elegant">×</button>
            </div>
            
            <div className="ai-suggestions-elegant">
              <button className="ai-suggestion-elegant">🗻 Вулканы</button>
              <button className="ai-suggestion-elegant">🎣 Рыбалка</button>
              <button className="ai-suggestion-elegant">🐻 Медведи</button>
              <button className="ai-suggestion-elegant">🌡️ Погода</button>
            </div>
            
            <div className="ai-input-wrapper-elegant">
              <input type="text" placeholder="Спросите о Камчатке..." className="ai-input-elegant" />
              <button className="ai-send-elegant">→</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
