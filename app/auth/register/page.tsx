'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Building2, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-premium-black via-gray-900 to-premium-black flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Присоединяйтесь к Kamchatour Hub
          </h1>
          <p className="text-gray-400 text-lg">
            Выберите тип регистрации
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Tourist Card */}
          <button
            onClick={() => router.push('/auth/register-tourist')}
            className="group bg-white/5 backdrop-blur-xl rounded-2xl p-8 border-2 border-white/10 hover:border-premium-gold transition-all duration-300 text-left shadow-xl hover:shadow-2xl hover:shadow-premium-gold/10 transform hover:-translate-y-1"
          >
            <div className="flex flex-col h-full">
              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <User className="w-8 h-8 text-white" />
              </div>

              {/* Content */}
              <h2 className="text-2xl font-bold text-white mb-3">
                Я турист
              </h2>
              <p className="text-gray-400 mb-6 flex-grow">
                Забронируйте туры, трансферы и размещение. 
                Получите доступ к программе лояльности и персональным рекомендациям.
              </p>

              {/* Features */}
              <ul className="space-y-2 mb-6 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-premium-gold"></div>
                  Бронирование туров и трансферов
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-premium-gold"></div>
                  Программа лояльности
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-premium-gold"></div>
                  AI-рекомендации
                </li>
              </ul>

              {/* Button */}
              <div className="flex items-center justify-between text-premium-gold group-hover:text-yellow-400 transition-colors">
                <span className="font-semibold">Зарегистрироваться</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </button>

          {/* Business Card */}
          <button
            onClick={() => router.push('/auth/register-business')}
            className="group bg-white/5 backdrop-blur-xl rounded-2xl p-8 border-2 border-white/10 hover:border-premium-gold transition-all duration-300 text-left shadow-xl hover:shadow-2xl hover:shadow-premium-gold/10 transform hover:-translate-y-1"
          >
            <div className="flex flex-col h-full">
              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-premium-gold to-yellow-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Building2 className="w-8 h-8 text-premium-black" />
              </div>

              {/* Content */}
              <h2 className="text-2xl font-bold text-white mb-3">
                Для бизнеса
              </h2>
              <p className="text-gray-400 mb-6 flex-grow">
                Станьте партнером платформы. Управляйте турами, трансферами, 
                размещением или другими услугами.
              </p>

              {/* Features */}
              <ul className="space-y-2 mb-6 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-premium-gold"></div>
                  Множественные роли
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-premium-gold"></div>
                  Панель управления
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-premium-gold"></div>
                  Аналитика и отчеты
                </li>
              </ul>

              {/* Button */}
              <div className="flex items-center justify-between text-premium-gold group-hover:text-yellow-400 transition-colors">
                <span className="font-semibold">Стать партнером</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            Уже есть аккаунт?{' '}
            <button
              onClick={() => router.push('/auth/login')}
              className="text-premium-gold hover:text-yellow-400 transition-colors font-semibold"
            >
              Войти
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
