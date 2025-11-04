'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Zap, TrendingUp, Star, Play, MapPin, Calendar, Users, 
  Search, Mountain, Flame, Shield, Phone, Award, Target, Rocket,
  Bot, Cloud, Heart, ChevronRight, X
} from 'lucide-react';
import { TourCard } from '@/components/TourCard';
import { AIChatWidget } from '@/components/AIChatWidget';
import { WeatherWidget } from '@/components/WeatherWidget';
import { EcoPointsWidget } from '@/components/EcoPointsWidget';
import type { Tour } from '@/types';

export default function Home() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAIChat, setShowAIChat] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setMounted(true);
    fetchTours();
    
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchTours = async () => {
    try {
      const response = await fetch('/api/tours?limit=12');
      const data = await response.json();
      if (data.success && data.data?.data) {
        setTours(data.data.data);
      }
    } catch (error) {
      console.error('Error fetching tours:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  const parallaxOffset = scrollY * 0.5;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      
      {/* HERO с видео фоном + 3D эффект */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Видео фон (fallback - градиент) */}
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-teal-900"
            style={{ transform: `translateY(${parallaxOffset}px)` }}
          />
          {/* Animated overlay */}
          <div className="absolute inset-0 bg-black/40" />
          
          {/* Floating particles */}
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white/20 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `float ${5 + Math.random() * 10}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 5}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Hero Content с Glassmorphism */}
        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
          <div 
            className="animate-fade-in-up"
            style={{ animationDelay: '0.2s' }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full mb-8 shadow-2xl">
              <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
              <span className="text-white font-semibold">AI-powered туристическая платформа</span>
              <Zap className="w-5 h-5 text-blue-400 animate-pulse" />
            </div>

            {/* Main Title с градиентом */}
            <h1 className="text-6xl md:text-8xl font-black mb-6 leading-tight">
              <span className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent animate-glow">
                Камчатка
              </span>
              <br />
              <span className="text-white drop-shadow-2xl">
                как в кино
              </span>
            </h1>

            <p className="text-xl md:text-3xl text-white/90 mb-12 max-w-3xl mx-auto drop-shadow-lg font-light">
              AI планирует маршрут, дроны снимают ваш трип, блокчейн хранит воспоминания
            </p>

            {/* CTA Buttons с микроанимациями */}
            <div className="flex flex-wrap gap-4 justify-center">
              <button 
                onClick={() => setShowAIChat(true)}
                className="group px-8 py-5 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-2xl hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-pink-500/50 flex items-center gap-3"
              >
                <Bot className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                Спросить AI-гида
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button className="group px-8 py-5 bg-white/10 backdrop-blur-xl border border-white/20 text-white font-bold rounded-2xl hover:bg-white/20 transition-all duration-300 shadow-2xl flex items-center gap-3">
                <Play className="w-6 h-6" />
                Смотреть видео
              </button>
            </div>

            {/* Stats с анимацией */}
            <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
              {[
                { value: '500+', label: 'AI-туров', icon: Rocket },
                { value: '50K+', label: 'Туристов', icon: Users },
                { value: '4.9★', label: 'Рейтинг', icon: Star },
              ].map((stat, i) => (
                <div 
                  key={i}
                  className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300 animate-scale-in"
                  style={{ animationDelay: `${0.5 + i * 0.1}s` }}
                >
                  <stat.icon className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                  <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-white/70">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-white/50 rounded-full" />
          </div>
        </div>
      </section>

      {/* AI Chat Overlay */}
      {showAIChat && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="relative w-full max-w-2xl animate-scale-in">
            <button
              onClick={() => setShowAIChat(false)}
              className="absolute -top-4 -right-4 z-10 p-2 bg-white rounded-full shadow-xl hover:scale-110 transition-transform"
            >
              <X className="w-6 h-6 text-gray-900" />
            </button>
            <AIChatWidget 
              userId="demo-user" 
              onClose={() => setShowAIChat(false)}
            />
          </div>
        </div>
      )}

      {/* Dashboard Section - 3 колонки */}
      <section className="container mx-auto px-4 py-20 relative">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Погода - Real-time */}
          <div className="lg:col-span-1 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="sticky top-24">
              <WeatherWidget 
                lat={53.0} 
                lng={158.65} 
                location="Петропавловск-Камчатский"
                className="shadow-xl hover:shadow-2xl transition-shadow"
              />
            </div>
          </div>

          {/* Featured Tours - центральная колонка */}
          <div className="lg:col-span-2 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-2">
                  AI подобрал для вас
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  На основе ваших интересов и погоды
                </p>
              </div>
              <Bot className="w-12 h-12 text-purple-600 animate-pulse" />
            </div>

            {/* Tours Grid */}
            {loading ? (
              <div className="grid gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-48 bg-white dark:bg-gray-800 rounded-3xl animate-pulse" />
                ))}
              </div>
            ) : tours.length > 0 ? (
              <div className="grid gap-6">
                {tours.slice(0, 4).map((tour, i) => (
                  <div 
                    key={tour.id}
                    className="animate-scale-in"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <TourCard
                      tour={tour}
                      onClick={() => console.log('Tour:', tour.id)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl">
                <Rocket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  AI создает туры...
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Подождите немного, мы генерируем маршруты специально для вас
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Eco-Points - Геймификация */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
              <Heart className="w-5 h-5 text-green-600 animate-pulse" />
              <span className="text-green-900 dark:text-green-300 font-semibold">Экология</span>
            </div>
            <h2 className="text-5xl font-black text-gray-900 dark:text-white mb-4">
              Зарабатывай баллы за заботу о природе
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Сортируй мусор, сажай деревья, получай скидки на туры
            </p>
          </div>

          <EcoPointsWidget 
            userId="demo-user"
            className="shadow-2xl hover:shadow-3xl transition-shadow"
          />
        </div>
      </section>

      {/* Features - Что делает платформу крутой */}
      <section className="bg-gradient-to-br from-purple-900 via-blue-900 to-teal-900 py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/30" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-6xl font-black text-white mb-6">
              Это не просто сайт.<br />Это экосистема будущего.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Bot,
                title: 'AI-планировщик',
                description: 'Искусственный интеллект создает маршрут под вашу физподготовку, бюджет и погоду',
                color: 'from-purple-500 to-pink-600',
              },
              {
                icon: Cloud,
                title: 'Real-time погода',
                description: 'Данные с метеостанций Камчатки обновляются каждые 10 минут',
                color: 'from-blue-500 to-cyan-600',
              },
              {
                icon: Mountain,
                title: 'Мониторинг вулканов',
                description: 'Интеграция с KVERT - следим за активностью вулканов 24/7',
                color: 'from-orange-500 to-red-600',
              },
              {
                icon: Award,
                title: 'Геймификация',
                description: 'Достижения, бейджи, рейтинги - превратили туризм в игру',
                color: 'from-green-500 to-teal-600',
              },
              {
                icon: Shield,
                title: 'Блокчейн-безопасность',
                description: 'Ваши данные и бронирования защищены распределенной сетью',
                color: 'from-indigo-500 to-purple-600',
              },
              {
                icon: Target,
                title: 'AR/VR туры',
                description: 'Виртуальные туры в 360° - посмотрите маршрут до поездки',
                color: 'from-pink-500 to-rose-600',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group p-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl hover:bg-white/20 transition-all duration-500 animate-scale-in"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-3">
                  {feature.title}
                </h3>
                
                <p className="text-white/70 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 py-32">
        <div className="max-w-4xl mx-auto text-center">
          <Rocket className="w-24 h-24 text-purple-600 mx-auto mb-8 animate-float" />
          
          <h2 className="text-6xl font-black text-gray-900 dark:text-white mb-6">
            Начнем?
          </h2>
          
          <p className="text-2xl text-gray-600 dark:text-gray-400 mb-12">
            AI уже готовит ваш идеальный маршрут
          </p>
          
          <button 
            onClick={() => setShowAIChat(true)}
            className="group px-16 py-6 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white font-black text-xl rounded-3xl hover:scale-110 transition-all duration-500 shadow-2xl hover:shadow-purple-500/50 flex items-center gap-4 mx-auto"
          >
            <Sparkles className="w-8 h-8 group-hover:rotate-12 transition-transform" />
            Начать приключение
            <ChevronRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
      </section>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes glow {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.2); }
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-glow {
          animation: glow 3s ease-in-out infinite;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        .animate-scale-in {
          animation: scale-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          opacity: 0;
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
