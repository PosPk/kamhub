'use client';

import React from 'react';
import Link from 'next/link';
import { PageLayout } from '@/components/PageLayout';
import { GlassCard } from '@/components/GlassCard';
import {
  User,
  Briefcase,
  Car,
  MapPin,
  Building2,
  Shield,
  ShoppingBag,
  Backpack,
  Map,
  Users,
  TrendingUp
} from 'lucide-react';

interface HubSection {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  gradient: string;
}

export default function HubPage() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const hours = new Date().getHours();
  const isNight = hours >= 23 || hours < 5;
  const textColor = isNight ? 'text-white' : 'text-gray-800';
  const textSecondary = isNight ? 'text-white/80' : 'text-gray-600';

  const sections: HubSection[] = [
    {
      title: 'Турист',
      description: 'Туры, трансферы, AI-ассистент',
      href: '/hub/tourist',
      icon: <User className="w-8 h-8" />,
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Турбизнес',
      description: 'Все бизнес-роли в одном месте',
      href: '/hub/business',
      icon: <Briefcase className="w-8 h-8" />,
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Туроператор',
      description: 'Управление турами и бронированиями',
      href: '/hub/operator',
      icon: <TrendingUp className="w-8 h-8" />,
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      title: 'Гид',
      description: 'Расписание и управление группами',
      href: '/hub/guide',
      icon: <Users className="w-8 h-8" />,
      gradient: 'from-emerald-500 to-teal-500'
    },
    {
      title: 'Трансфер',
      description: 'Заказы и маршруты',
      href: '/hub/transfer',
      icon: <Car className="w-8 h-8" />,
      gradient: 'from-orange-500 to-red-500'
    },
    {
      title: 'Оператор трансферов',
      description: 'Управление водителями',
      href: '/hub/transfer-operator',
      icon: <MapPin className="w-8 h-8" />,
      gradient: 'from-amber-500 to-orange-500'
    },
    {
      title: 'Жильё',
      description: 'Бронирования и управление',
      href: '/hub/stay',
      icon: <Building2 className="w-8 h-8" />,
      gradient: 'from-rose-500 to-pink-500'
    },
    {
      title: 'Безопасность SOS',
      description: 'Экстренная помощь и контакты',
      href: '/hub/safety',
      icon: <Shield className="w-8 h-8" />,
      gradient: 'from-red-500 to-rose-500'
    },
    {
      title: 'Туры',
      description: 'Каталог туров по Камчатке',
      href: '/hub/tours',
      icon: <Map className="w-8 h-8" />,
      gradient: 'from-sky-500 to-blue-500'
    },
    {
      title: 'Сувениры',
      description: 'Камчатские сувениры и подарки',
      href: '/hub/souvenirs',
      icon: <ShoppingBag className="w-8 h-8" />,
      gradient: 'from-violet-500 to-purple-500'
    },
    {
      title: 'Прокат авто',
      description: 'Аренда транспорта',
      href: '/hub/cars',
      icon: <Car className="w-8 h-8" />,
      gradient: 'from-cyan-500 to-blue-500'
    },
    {
      title: 'Снаряжение',
      description: 'Прокат туристического снаряжения',
      href: '/hub/gear',
      icon: <Backpack className="w-8 h-8" />,
      gradient: 'from-teal-500 to-emerald-500'
    }
  ];

  return (
    <PageLayout title="Kamchatour Hub" backLink="/">
      <div className="space-y-6">
        {/* Intro */}
        <GlassCard className="p-6" isNight={isNight}>
          <h2 className={`text-2xl font-light ${textColor} mb-2`}>
            Все сервисы Камчатки
          </h2>
          <p className={`${textSecondary} text-sm`}>
            Выберите нужный раздел для работы или планирования путешествия
          </p>
        </GlassCard>

        {/* Grid of sections */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((section) => (
            <Link key={section.href} href={section.href}>
              <GlassCard 
                className="p-6 h-full group cursor-pointer"
                isNight={isNight}
              >
                <div className="flex flex-col items-start gap-4">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${section.gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    {section.icon}
                  </div>
                  <div>
                    <h3 className={`text-lg font-medium ${textColor} mb-1 group-hover:translate-x-1 transition-transform duration-300`}>
                      {section.title}
                    </h3>
                    <p className={`${textSecondary} text-sm`}>
                      {section.description}
                    </p>
                  </div>
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
