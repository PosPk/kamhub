'use client';

import React, { useState, useEffect } from 'react';
import { Rocket, Sparkles, TrendingUp, Zap, Star, ArrowRight, Play } from 'lucide-react';

export default function UltraModernHome() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
      {/* Animated Mesh Background */}
      <div className="fixed inset-0 -z-10 animate-mesh opacity-30">
        <div className="absolute inset-0" style={{ background: 'var(--gradient-mesh)' }} />
      </div>

      {/* Hero Section - Bento Style */}
      <section className="container mx-auto px-4 pt-20 pb-12">
        <div className="grid grid-cols-12 gap-4 lg:gap-6">
          
          {/* Main Hero - spans 8 columns */}
          <div className="col-span-12 lg:col-span-8 card-glass p-8 lg:p-12 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6 animate-fade-in">
                <Sparkles className="w-6 h-6 text-primary animate-glow" />
                <span className="text-sm font-semibold text-primary dark:text-accent uppercase tracking-wider">
                  Экосистема туризма будущего
                </span>
              </div>

              <h1 className="text-5xl lg:text-7xl xl:text-8xl font-black mb-6 animate-fade-in-up">
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Камчатка
                </span>
                <br />
                <span className="text-gray-900 dark:text-white">
                  нового уровня
                </span>
              </h1>

              <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl animate-fade-in">
                AI-powered платформа для туризма с полным циклом: от планирования до безопасности
              </p>

              <div className="flex flex-wrap gap-4 animate-scale-in">
                <button className="btn-primary group">
                  <span className="flex items-center gap-2">
                    <Rocket className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    Начать путешествие
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
                
                <button className="btn-glass group">
                  <span className="flex items-center gap-2">
                    <Play className="w-5 h-5" />
                    Смотреть демо
                  </span>
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-white/20 dark:border-white/10">
                <div className="animate-float" style={{ animationDelay: '0s' }}>
                  <div className="text-3xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    500+
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Туров</div>
                </div>
                <div className="animate-float" style={{ animationDelay: '0.2s' }}>
                  <div className="text-3xl font-black bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                    50K+
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Туристов</div>
                </div>
                <div className="animate-float" style={{ animationDelay: '0.4s' }}>
                  <div className="text-3xl font-black bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                    4.9★
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Рейтинг</div>
                </div>
              </div>
            </div>
          </div>

          {/* Side Cards */}
          <div className="col-span-12 lg:col-span-4 grid gap-4">
            {/* Weather Widget */}
            <div className="card-bento group cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Погода</h3>
                <Sparkles className="w-5 h-5 text-accent group-hover:rotate-12 transition-transform" />
              </div>
              <div className="text-4xl font-black mb-2">+12°C</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Идеально для туров</div>
            </div>

            {/* Quick Action */}
            <div className="card-bento bg-gradient-to-br from-primary to-secondary text-white group cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">AI Помощник</h3>
                <Zap className="w-5 h-5 group-hover:scale-125 transition-transform" />
              </div>
              <p className="text-sm opacity-90">Подбор тура за 30 секунд</p>
              <ArrowRight className="w-6 h-6 mt-4 group-hover:translate-x-2 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-12 animate-fade-in-up">
          <h2 className="text-4xl lg:text-6xl font-black mb-4">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Все в одном месте
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Современная экосистема для всех участников туризма
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'Турист', icon: '🎒', color: 'from-blue-500 to-cyan-500', desc: 'Найди свой идеальный тур' },
            { title: 'Туроператор', icon: '🏢', color: 'from-purple-500 to-pink-500', desc: 'CRM и аналитика' },
            { title: 'Гид', icon: '🗺️', color: 'from-orange-500 to-red-500', desc: 'Управляй экскурсиями' },
            { title: 'Трансфер', icon: '🚐', color: 'from-green-500 to-teal-500', desc: 'Логистика и маршруты' },
            { title: 'Размещение', icon: '🏨', color: 'from-indigo-500 to-purple-500', desc: 'Отели и базы' },
            { title: 'Сувениры', icon: '🎁', color: 'from-pink-500 to-rose-500', desc: 'E-commerce' },
            { title: 'Снаряжение', icon: '⛺', color: 'from-yellow-500 to-orange-500', desc: 'Аренда оборудования' },
            { title: 'Авто', icon: '🚗', color: 'from-slate-500 to-gray-500', desc: 'Прокат машин' },
          ].map((item, index) => (
            <div
              key={item.title}
              className="card-glass p-6 group cursor-pointer animate-scale-in hover:shadow-2xl"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`text-5xl mb-4 group-hover:scale-125 transition-transform duration-500`}>
                {item.icon}
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                {item.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {item.desc}
              </p>
              <div className={`h-1 w-0 group-hover:w-full transition-all duration-500 bg-gradient-to-r ${item.color} rounded-full mt-4`} />
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="card-glass p-12 lg:p-20 text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 animate-mesh opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          
          <div className="relative z-10">
            <Star className="w-16 h-16 mx-auto mb-6 text-primary animate-glow" />
            <h2 className="text-4xl lg:text-6xl font-black mb-6">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Готовы начать?
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Присоединяйтесь к экосистеме будущего прямо сейчас
            </p>
            <button className="btn-primary text-xl px-12 py-6">
              <span className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6" />
                Попробовать бесплатно
                <ArrowRight className="w-6 h-6" />
              </span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
