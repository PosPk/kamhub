'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, Mail, Lock, ArrowRight, Loader2, Check,
  Briefcase, Car, Backpack, Hotel, Gift, Utensils, User
} from 'lucide-react';

interface Role {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

const availableRoles: Role[] = [
  {
    id: 'operator',
    name: 'Туроператор',
    description: 'Организация туров',
    icon: Briefcase,
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'guide',
    name: 'Гид',
    description: 'Проведение экскурсий',
    icon: User,
    color: 'from-green-500 to-green-600'
  },
  {
    id: 'driver',
    name: 'Водитель',
    description: 'Трансферы',
    icon: Car,
    color: 'from-purple-500 to-purple-600'
  },
  {
    id: 'provider',
    name: 'Поставщик',
    description: 'Снаряжение и услуги',
    icon: Backpack,
    color: 'from-orange-500 to-orange-600'
  },
  {
    id: 'hotel_manager',
    name: 'Размещение',
    description: 'Отели и базы',
    icon: Hotel,
    color: 'from-pink-500 to-pink-600'
  },
  {
    id: 'restaurant_owner',
    name: 'Ресторан',
    description: 'Питание',
    icon: Utensils,
    color: 'from-red-500 to-red-600'
  }
];

export default function RegisterBusinessPage() {
  const [step, setStep] = useState(1); // 1: roles, 2: info
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    roles: [] as string[]
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();

  const toggleRole = (roleId: string) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(roleId)
        ? prev.roles.filter(r => r !== roleId)
        : [...prev.roles, roleId]
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleNext = () => {
    if (formData.roles.length === 0) {
      setError('Выберите хотя бы одну роль');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Валидация
    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Пароль должен быть не менее 6 символов');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          companyName: formData.companyName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          roles: formData.roles
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка регистрации');
      }

      // Успешная регистрация - перенаправляем на соответствующий дашборд
      const primaryRole = formData.roles[0];
      const dashboardMap: { [key: string]: string } = {
        operator: '/hub/tour-operator',
        guide: '/hub/guide',
        driver: '/hub/transfer-operator',
        provider: '/hub/operator',
        hotel_manager: '/hub/operator',
        restaurant_owner: '/hub/operator'
      };
      
      router.push(dashboardMap[primaryRole] || '/hub/operator');
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-premium-black via-gray-900 to-premium-black flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-premium-gold to-yellow-600 mb-4">
            <Building2 className="w-8 h-8 text-premium-black" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Регистрация для бизнеса
          </h1>
          <p className="text-gray-400">
            Станьте партнером Kamchatour Hub
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8 gap-4">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-premium-gold' : 'text-gray-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-premium-gold text-premium-black' : 'bg-gray-700 text-gray-400'} font-bold`}>
              {step > 1 ? <Check className="w-5 h-5" /> : '1'}
            </div>
            <span className="text-sm font-medium hidden sm:inline">Выбор ролей</span>
          </div>
          <div className="w-16 h-0.5 bg-gray-700">
            <div className={`h-full bg-premium-gold transition-all duration-300 ${step >= 2 ? 'w-full' : 'w-0'}`}></div>
          </div>
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-premium-gold' : 'text-gray-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-premium-gold text-premium-black' : 'bg-gray-700 text-gray-400'} font-bold`}>
              2
            </div>
            <span className="text-sm font-medium hidden sm:inline">Информация</span>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
          
          {/* STEP 1: Role Selection */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4">
                Выберите одну или несколько ролей
              </h2>
              <p className="text-gray-400 mb-6">
                Вы можете совмещать несколько направлений деятельности
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {availableRoles.map((role) => {
                  const Icon = role.icon;
                  const isSelected = formData.roles.includes(role.id);
                  
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => toggleRole(role.id)}
                      className={`relative p-6 rounded-xl border-2 transition-all duration-300 text-left ${
                        isSelected
                          ? 'border-premium-gold bg-premium-gold/10'
                          : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                      }`}
                    >
                      {/* Checkmark */}
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-premium-gold flex items-center justify-center">
                          <Check className="w-4 h-4 text-premium-black" />
                        </div>
                      )}

                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center mb-3`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>

                      {/* Content */}
                      <h3 className="text-lg font-bold text-white mb-1">
                        {role.name}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {role.description}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Selected Roles Summary */}
              {formData.roles.length > 0 && (
                <div className="mb-6 p-4 bg-premium-gold/10 border border-premium-gold/20 rounded-xl">
                  <p className="text-sm text-gray-300 mb-2">
                    Выбрано ролей: <span className="text-premium-gold font-bold">{formData.roles.length}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {formData.roles.map(roleId => {
                      const role = availableRoles.find(r => r.id === roleId);
                      return (
                        <span key={roleId} className="px-3 py-1 bg-premium-gold/20 text-premium-gold text-sm rounded-full">
                          {role?.name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Next Button */}
              <button
                onClick={handleNext}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-premium-gold to-yellow-600 text-premium-black font-bold rounded-xl hover:from-yellow-600 hover:to-premium-gold transition-all duration-300 shadow-lg shadow-premium-gold/20"
              >
                Далее
                <ArrowRight className="w-5 h-5" />
              </button>

              {/* Back Link */}
              <div className="mt-4 text-center">
                <button
                  onClick={() => router.push('/auth/register-tourist')}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  ← Регистрация как турист
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Contact Information */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">
                  Контактная информация
                </h2>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-gray-400 hover:text-white text-sm"
                >
                  ← Назад
                </button>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ваше имя *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-premium-gold focus:border-transparent transition-all"
                    placeholder="Иван Иванов"
                    required
                  />
                </div>
              </div>

              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Название компании *
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-premium-gold focus:border-transparent transition-all"
                    placeholder="ООО 'Камчатка Тур'"
                    required
                  />
                </div>
              </div>

              {/* Email & Phone Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-premium-gold focus:border-transparent transition-all"
                      placeholder="info@company.ru"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Телефон
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-premium-gold focus:border-transparent transition-all"
                    placeholder="+7 (999) 123-45-67"
                  />
                </div>
              </div>

              {/* Password & Confirm Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Пароль *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-premium-gold focus:border-transparent transition-all"
                      placeholder="Минимум 6 символов"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Подтвердите пароль *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-premium-gold focus:border-transparent transition-all"
                      placeholder="Повторите пароль"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-premium-gold to-yellow-600 text-premium-black font-bold rounded-xl hover:from-yellow-600 hover:to-premium-gold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-premium-gold/20"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Регистрация...
                  </>
                ) : (
                  <>
                    Зарегистрироваться
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        {step === 1 && (
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Уже есть аккаунт?{' '}
              <button
                onClick={() => router.push('/auth/login')}
                className="text-premium-gold hover:text-yellow-400 transition-colors"
              >
                Войти
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
