'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const ROLES = [
  { id: 'operator', name: 'Туры', icon: '🎣', description: 'Рыболовные туры' },
  { id: 'transfer', name: 'Трансфер', icon: '🚗', description: 'Доставка к местам рыбалки' },
  { id: 'stay', name: 'Размещение', icon: '🏠', description: 'Базы и домики' },
  { id: 'gear', name: 'Аренда снаряжения', icon: '🎣', description: 'Удочки, лодки, экипировка' },
];

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Login form
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  // Register form
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    description: '',
    address: '',
    website: '',
    roles: [] as string[],
    logoUrl: '',
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState('');

  const handleRoleToggle = (roleId: string) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(roleId)
        ? prev.roles.filter(r => r !== roleId)
        : [...prev.roles, roleId]
    }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Размер файла не должен превышать 5 МБ');
        return;
      }
      
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Временно: демо-вход
      if (loginData.email && loginData.password) {
        router.push('/partner/dashboard');
      } else {
        throw new Error('Заполните все поля');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (formData.roles.length === 0) {
        throw new Error('Выберите хотя бы одно направление деятельности');
      }

      const submitData = {
        ...formData,
        logoUrl: logoPreview || '',
      };

      const response = await fetch('/api/partners/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Ошибка при регистрации');
      }

      setSuccess(true);
      
      // Перенаправляем через 2 секунды
      setTimeout(() => {
        router.push('/partner/dashboard');
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-premium-black flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white/5 border border-premium-gold rounded-2xl p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold text-premium-gold mb-2">Успешно!</h1>
          <p className="text-white/70 mb-4">
            Ваша заявка принята. Ожидайте подтверждения администратора.
          </p>
          <div className="text-sm text-white/50">
            Перенаправление в личный кабинет...
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-premium-black text-white">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-gold-gradient mx-auto mb-4"></div>
          <h1 className="text-4xl font-bold text-premium-gold mb-2">
            Kamchatour Hub
          </h1>
          <p className="text-white/70">
            Экосистема туризма Камчатки
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="max-w-md mx-auto mb-8">
          <div className="bg-white/5 border border-white/10 rounded-xl p-1 flex gap-1">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-3 rounded-lg font-bold transition-colors ${
                mode === 'login'
                  ? 'bg-premium-gold text-premium-black'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Вход
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-3 rounded-lg font-bold transition-colors ${
                mode === 'register'
                  ? 'bg-premium-gold text-premium-black'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Регистрация партнера
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-4xl mx-auto mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
            ❌ {error}
          </div>
        )}

        {/* LOGIN FORM */}
        {mode === 'login' && (
          <div className="max-w-md mx-auto">
            <form onSubmit={handleLogin} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-premium-gold text-white"
                  placeholder="info@kamchatka-fishing.ru"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Пароль</label>
                <input
                  type="password"
                  required
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-premium-gold text-white"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-premium-gold text-premium-black font-bold rounded-xl hover:bg-premium-gold/90 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Вход...' : 'Войти'}
              </button>
            </form>

            <div className="text-center mt-6">
              <a href="/demo" className="text-blue-400 hover:text-blue-300 text-sm">
                🚀 Демо-режим (без регистрации)
              </a>
            </div>
          </div>
        )}

        {/* REGISTER FORM */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="max-w-4xl mx-auto space-y-6">
            {/* Основная информация */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-2xl font-bold mb-6 text-premium-gold">📋 Основная информация</h2>
              
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Название компании <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-premium-gold text-white"
                    placeholder="Камчатская рыбалка"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-premium-gold text-white"
                      placeholder="info@kamchatka-fishing.ru"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Телефон <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-premium-gold text-white"
                      placeholder="+7 (999) 123-45-67"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Описание компании
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-premium-gold resize-none text-white"
                    placeholder="Расскажите о вашей компании, опыте работы, преимуществах..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Адрес
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-premium-gold text-white"
                    placeholder="г. Петропавловск-Камчатский, ул. Ленинская, 1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Веб-сайт
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-premium-gold text-white"
                    placeholder="https://kamchatka-fishing.ru"
                  />
                </div>
              </div>
            </div>

            {/* Направления деятельности */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-2xl font-bold mb-2 text-premium-gold">
                🎯 Направления деятельности <span className="text-red-400">*</span>
              </h2>
              <p className="text-sm text-white/70 mb-6">
                Выберите все подходящие направления (можно несколько)
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                {ROLES.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleRoleToggle(role.id)}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${
                      formData.roles.includes(role.id)
                        ? 'border-premium-gold bg-premium-gold/10 shadow-lg shadow-premium-gold/20'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl">{role.icon}</span>
                      <span className="text-xl font-bold">{role.name}</span>
                    </div>
                    <p className="text-sm text-white/70">{role.description}</p>
                    
                    {formData.roles.includes(role.id) && (
                      <div className="mt-3 text-premium-gold font-bold text-sm">
                        ✓ Выбрано
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {formData.roles.length === 0 && (
                <p className="text-red-400 text-sm mt-4">
                  ⚠️ Выберите хотя бы одно направление
                </p>
              )}

              {formData.roles.length > 0 && (
                <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                  <p className="text-green-400 text-sm">
                    ✓ Выбрано направлений: <strong>{formData.roles.length}</strong>
                  </p>
                </div>
              )}
            </div>

            {/* Логотип */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-2xl font-bold mb-6 text-premium-gold">📸 Логотип компании</h2>

              <div className="flex flex-col md:flex-row items-center gap-6">
                {logoPreview ? (
                  <div className="w-40 h-40 rounded-xl border-2 border-premium-gold overflow-hidden flex-shrink-0 shadow-lg shadow-premium-gold/20">
                    <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-40 h-40 rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center bg-white/5 flex-shrink-0">
                    <div className="text-center">
                      <span className="text-5xl">📷</span>
                      <p className="text-xs text-white/50 mt-2">Нет логотипа</p>
                    </div>
                  </div>
                )}

                <div className="flex-1 w-full">
                  <label className="block">
                    <span className="px-6 py-3 bg-premium-gold text-premium-black font-bold rounded-xl cursor-pointer hover:bg-premium-gold/90 transition-colors inline-block">
                      📁 Выбрать файл
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                  </label>
                  <div className="mt-4 text-sm text-white/70 space-y-1">
                    <p>✓ Форматы: PNG, JPG, WEBP</p>
                    <p>✓ Максимальный размер: 5 МБ</p>
                    <p>✓ Рекомендуемый размер: 512x512px</p>
                  </div>
                  
                  {logoFile && (
                    <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <p className="text-green-400 text-sm">
                        ✓ Загружен: {logoFile.name} ({(logoFile.size / 1024).toFixed(1)} КБ)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Кнопка отправки */}
            <div className="sticky bottom-6 bg-premium-black/80 backdrop-blur border border-white/10 rounded-2xl p-4">
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="flex-1 px-6 py-4 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-colors font-bold"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={loading || formData.roles.length === 0}
                  className="flex-1 px-6 py-4 bg-premium-gold text-premium-black rounded-xl hover:bg-premium-gold/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold text-lg shadow-lg shadow-premium-gold/20"
                >
                  {loading ? '⏳ Регистрация...' : '✓ Зарегистрироваться'}
                </button>
              </div>
              
              {formData.roles.length === 0 && (
                <p className="text-red-400 text-xs text-center mt-2">
                  Выберите хотя бы одно направление деятельности
                </p>
              )}
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="text-center mt-12 text-white/50 text-sm">
          <p>🏔️ Kamchatour Hub — экосистема туризма Камчатки</p>
        </div>
      </div>
    </main>
  );
}
