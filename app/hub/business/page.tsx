'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Briefcase, Compass, Car, Home, ShoppingBag, 
  ArrowRight, TrendingUp, Users, DollarSign,
  Target, BarChart3, Zap
} from 'lucide-react';

interface BusinessRole {
  id: string;
  icon: any;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  href: string;
  features: string[];
}

export default function BusinessHub() {
  const businessRoles: BusinessRole[] = [
    {
      id: 'operator',
      icon: Briefcase,
      title: 'Туроператор',
      subtitle: 'Управляй турами',
      description: 'Полноценная CRM для управления турами, клиентами и бронированиями',
      color: 'from-purple-400/80 to-pink-400/80',
      href: '/hub/operator',
      features: ['CRM система', 'Бронирования', 'Аналитика', 'Финансы']
    },
    {
      id: 'guide',
      icon: Compass,
      title: 'Гид',
      subtitle: 'Веди за собой',
      description: 'Управление экскурсиями, маршрутами и группами туристов',
      color: 'from-green-400/80 to-emerald-400/80',
      href: '/hub/guide',
      features: ['Расписание', 'Маршруты', 'Группы', 'Отзывы']
    },
    {
      id: 'transfer',
      icon: Car,
      title: 'Трансфер',
      subtitle: 'Перевозки',
      description: 'Сервис заказа и управления трансферами для туристов',
      color: 'from-orange-400/80 to-red-400/80',
      href: '/hub/transfer',
      features: ['Заказы', 'Маршруты', 'Авто', 'График']
    },
    {
      id: 'stay',
      icon: Home,
      title: 'Размещение',
      subtitle: 'Отели и жилье',
      description: 'Управление бронированиями и размещением гостей',
      color: 'from-indigo-400/80 to-blue-400/80',
      href: '/hub/stay',
      features: ['Бронь', 'Номера', 'Цены', 'Гости']
    },
    {
      id: 'souvenirs',
      icon: ShoppingBag,
      title: 'Сувениры',
      subtitle: 'Товары и подарки',
      description: 'Продажа сувениров и местных товаров туристам',
      color: 'from-pink-400/80 to-rose-400/80',
      href: '/hub/souvenirs',
      features: ['Каталог', 'Продажи', 'Склад', 'Заказы']
    }
  ];

  const stats = [
    { icon: Users, label: 'Партнёров', value: '250+', color: 'text-blue-600' },
    { icon: TrendingUp, label: 'Рост', value: '+45%', color: 'text-green-600' },
    { icon: DollarSign, label: 'Оборот', value: '₽15M', color: 'text-purple-600' },
    { icon: Target, label: 'Туров', value: '1500+', color: 'text-orange-600' }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:scale-105 transition-transform">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Турбизнес</h1>
              <p className="text-xs text-gray-600">Kamchatour Hub</p>
            </div>
          </Link>
          
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all text-sm font-medium text-gray-700"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            На главную
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full mb-6">
            <Zap className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Все инструменты в одном месте</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extralight text-gray-900 mb-4">
            Турбизнес на <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-medium">Камчатке</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 font-light max-w-3xl mx-auto mb-8">
            Выберите вашу роль в туристической экосистеме Камчатки. Все необходимые инструменты для развития бизнеса.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white/60 backdrop-blur-xl rounded-2xl p-4 border border-white/40 shadow-lg">
                <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-2`} />
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Business Roles Grid */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extralight text-gray-900 mb-3">
              Выберите направление
            </h2>
            <p className="text-gray-600 font-light">
              Каждая роль — это полноценная CRM система для вашего бизнеса
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businessRoles.map((role) => (
              <Link
                key={role.id}
                href={role.href}
                className="group relative"
              >
                {/* Ripple effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/0 group-hover:from-white/20 group-hover:to-transparent rounded-2xl transition-all duration-700"></div>
                
                <div className="relative bg-white/60 backdrop-blur-2xl rounded-2xl p-6 border border-white/40 hover:bg-white/80 hover:scale-105 hover:-translate-y-2 transition-all duration-300 shadow-lg hover:shadow-2xl h-full overflow-hidden">
                  {/* Shine effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute top-0 -left-full w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 group-hover:left-full transition-all duration-1000"></div>
                  </div>
                  
                  {/* Icon */}
                  <div className={`w-16 h-16 bg-gradient-to-br ${role.color} backdrop-blur-xl rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg relative mx-auto md:mx-0`}>
                    <role.icon className="w-8 h-8 text-white" />
                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/20 rounded-2xl transition-all duration-300"></div>
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl font-light mb-2 text-gray-900 group-hover:text-gray-900 transition-colors text-center md:text-left">
                    {role.title}
                  </h3>
                  <p className="text-sm text-purple-600 font-medium mb-3 text-center md:text-left">
                    {role.subtitle}
                  </p>
                  <p className="text-sm text-gray-600 font-light mb-4">
                    {role.description}
                  </p>
                  
                  {/* Features */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {role.features.map((feature, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gray-100 rounded-lg text-xs text-gray-700"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                  
                  {/* Arrow */}
                  <div className="flex items-center justify-center md:justify-start gap-2 text-purple-600 font-light group-hover:gap-3 transition-all text-sm">
                    <span className="group-hover:font-medium transition-all">Открыть</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 group-hover:scale-125 transition-all" />
                  </div>
                  
                  {/* Corner accent */}
                  <div className={`absolute top-3 right-3 w-3 h-3 bg-gradient-to-br ${role.color} rounded-full opacity-0 group-hover:opacity-100 group-hover:scale-150 transition-all duration-300`}></div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="pb-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-3xl p-8 md:p-12 text-center text-white shadow-2xl">
            <BarChart3 className="w-16 h-16 mx-auto mb-6 opacity-90" />
            <h2 className="text-3xl md:text-4xl font-extralight mb-4">
              Начните развивать бизнес
            </h2>
            <p className="text-lg font-light mb-8 text-white/90">
              Присоединяйтесь к 250+ партнёрам туристической экосистемы Камчатки
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-600 rounded-2xl font-medium hover:scale-105 transition-all shadow-lg"
            >
              Войти в CRM
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
