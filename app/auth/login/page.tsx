'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Sparkles, LogIn, UserPlus, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isSignUp) {
        await signUp(email, password, name);
      } else {
        await signIn(email, password);
      }
      router.push('/hub/tourist');
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  const hours = currentTime.getHours();
  const isNight = hours >= 23 || hours < 5;
  
  const getBackgroundGradient = () => {
    if (hours >= 5 && hours < 7) return 'from-rose-200 via-orange-100 to-amber-100';
    if (hours >= 7 && hours < 12) return 'from-sky-100 via-blue-50 to-indigo-100';
    if (hours >= 12 && hours < 18) return 'from-blue-100 via-sky-50 to-cyan-100';
    if (hours >= 18 && hours < 21) return 'from-orange-100 via-pink-100 to-purple-200';
    if (hours >= 21 && hours < 23) return 'from-indigo-300 via-purple-200 to-pink-200';
    return 'from-slate-800 via-blue-900 to-indigo-900';
  };

  const textColor = isNight ? 'text-white' : 'text-gray-800';
  const textSecondary = isNight ? 'text-white/70' : 'text-gray-600';
  const inputBg = isNight ? 'bg-white/10' : 'bg-white/60';
  const inputBorder = isNight ? 'border-white/20' : 'border-gray-300/50';
  const inputText = isNight ? 'text-white' : 'text-gray-900';
  const inputPlaceholder = isNight ? 'placeholder-white/50' : 'placeholder-gray-500';

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getBackgroundGradient()} transition-colors duration-1000 flex items-center justify-center px-4 py-8`}>
      <div className="max-w-md w-full">
        {/* Лого + Назад */}
        <Link 
          href="/" 
          className={`flex items-center justify-center gap-2 mb-8 ${textColor} hover:scale-105 transition-transform`}
        >
          <div className={`w-12 h-12 rounded-xl ${isNight ? 'bg-white/20' : 'bg-gray-800/20'} backdrop-blur-xl border ${isNight ? 'border-white/30' : 'border-gray-800/30'} flex items-center justify-center shadow-lg`}>
            <span className="text-xl font-bold">K</span>
          </div>
          <div>
            <div className="font-light text-sm">Kamchatour Hub</div>
          </div>
        </Link>

        {/* Форма */}
        <div className={`${isNight ? 'bg-white/10' : 'bg-white/60'} backdrop-blur-xl rounded-3xl p-8 border ${isNight ? 'border-white/20' : 'border-white/40'} shadow-2xl`}>
          {/* Header */}
          <div className="text-center mb-8">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${isNight ? 'from-blue-400 to-purple-400' : 'from-blue-500 to-purple-500'} mx-auto mb-4 flex items-center justify-center shadow-lg`}>
              {isSignUp ? <UserPlus className="w-8 h-8 text-white" /> : <LogIn className="w-8 h-8 text-white" />}
            </div>
            <h1 className={`text-3xl font-extralight ${textColor} mb-2`}>
              {isSignUp ? 'Регистрация' : 'Вход'}
            </h1>
            <p className={`${textSecondary} font-light text-sm`}>
              {isSignUp ? 'Создайте аккаунт для доступа' : 'Войдите в свой аккаунт'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <div>
                <label className={`block text-sm font-light ${textColor} mb-2`}>
                  Имя
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-4 py-3 ${inputBg} backdrop-blur-xl border ${inputBorder} rounded-xl ${inputText} ${inputPlaceholder} focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition-all font-light`}
                  placeholder="Введите ваше имя"
                  required
                />
              </div>
            )}

            <div>
              <label className={`block text-sm font-light ${textColor} mb-2`}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-3 ${inputBg} backdrop-blur-xl border ${inputBorder} rounded-xl ${inputText} ${inputPlaceholder} focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition-all font-light`}
                placeholder="example@mail.ru"
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-light ${textColor} mb-2`}>
                Пароль
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-3 ${inputBg} backdrop-blur-xl border ${inputBorder} rounded-xl ${inputText} ${inputPlaceholder} focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition-all font-light`}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="bg-red-400/20 border border-red-400/40 backdrop-blur-xl rounded-xl p-3">
                <p className="text-red-600 dark:text-red-300 text-sm font-light">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-xl font-light text-white shadow-lg transition-all ${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 hover:scale-[1.02]'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                {isLoading ? 'Загрузка...' : (isSignUp ? 'Зарегистрироваться' : 'Войти')}
                {!isLoading && <ArrowRight className="w-4 h-4" />}
              </span>
            </button>
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className={`${textSecondary} hover:${textColor} transition-colors font-light text-sm`}
            >
              {isSignUp ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
            </button>
          </div>

          {/* Demo Mode */}
          <div className={`mt-6 pt-6 border-t ${isNight ? 'border-white/10' : 'border-gray-300/30'}`}>
            <div className="text-center">
              <p className={`${textSecondary} text-sm mb-3 font-light`}>Или попробуйте демо-режим</p>
              <Link
                href="/demo"
                className={`inline-flex items-center gap-2 px-6 py-2 ${isNight ? 'bg-white/10 border-white/20' : 'bg-gray-800/10 border-gray-800/20'} backdrop-blur-xl border rounded-xl ${textColor} hover:scale-105 transition-all font-light shadow-lg`}
              >
                <Sparkles className="w-4 h-4" />
                Демо-режим
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}