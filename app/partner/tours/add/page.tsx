'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const DIFFICULTY_LEVELS = [
  { id: 'easy', name: 'Легкий', icon: '🟢', description: 'Для новичков' },
  { id: 'medium', name: 'Средний', icon: '🟡', description: 'Требуется подготовка' },
  { id: 'hard', name: 'Сложный', icon: '🔴', description: 'Для опытных' },
];

const SEASONS = [
  { id: 'spring', name: 'Весна', icon: '🌸' },
  { id: 'summer', name: 'Лето', icon: '☀️' },
  { id: 'autumn', name: 'Осень', icon: '🍂' },
  { id: 'winter', name: 'Зима', icon: '❄️' },
];

export default function AddTourPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    operatorId: '', // В реальном проекте берется из сессии
    name: '',
    description: '',
    shortDescription: '',
    difficulty: '' as 'easy' | 'medium' | 'hard' | '',
    duration: 8,
    price: 0,
    currency: 'RUB',
    maxGroupSize: 10,
    minGroupSize: 2,
    season: [] as string[],
    requirements: [] as string[],
    included: [] as string[],
    notIncluded: [] as string[],
    images: [] as string[],
  });

  const [currentRequirement, setCurrentRequirement] = useState('');
  const [currentIncluded, setCurrentIncluded] = useState('');
  const [currentNotIncluded, setCurrentNotIncluded] = useState('');
  const [currentImage, setCurrentImage] = useState('');

  const handleSeasonToggle = (seasonId: string) => {
    setFormData(prev => ({
      ...prev,
      season: prev.season.includes(seasonId)
        ? prev.season.filter(s => s !== seasonId)
        : [...prev.season, seasonId]
    }));
  };

  const addItem = (type: 'requirements' | 'included' | 'notIncluded', value: string) => {
    if (!value.trim()) return;
    setFormData(prev => ({
      ...prev,
      [type]: [...prev[type], value.trim()]
    }));
    if (type === 'requirements') setCurrentRequirement('');
    if (type === 'included') setCurrentIncluded('');
    if (type === 'notIncluded') setCurrentNotIncluded('');
  };

  const removeItem = (type: 'requirements' | 'included' | 'notIncluded' | 'images', index: number) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const addImage = () => {
    if (!currentImage.trim()) return;
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, currentImage.trim()]
    }));
    setCurrentImage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // В реальном проекте operatorId берется из сессии
      // Для демо используем временный ID
      const submitData = {
        ...formData,
        operatorId: formData.operatorId || 'demo-operator-id',
      };

      const response = await fetch('/api/tours/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Ошибка при создании тура');
      }

      setSuccess(true);
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
        <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-white mb-2">Тур добавлен!</h1>
          <p className="text-white/70 mb-4">
            Тур успешно создан и доступен для бронирования.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-premium-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Добавить тур</h1>
          <p className="text-white/70">
            Заполните информацию о новом туре
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Основная информация */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4">Основная информация</h2>
            
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Название тура <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-premium-gold"
                  placeholder="Рыбалка на реке Быстрая"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Краткое описание
                </label>
                <input
                  type="text"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-premium-gold"
                  placeholder="Незабываемая рыбалка в горной реке"
                  maxLength={100}
                />
                <p className="text-xs text-white/50 mt-1">Макс. 100 символов</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Полное описание <span className="text-red-400">*</span>
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-premium-gold resize-none"
                  placeholder="Детальное описание тура, маршрута, особенностей..."
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Длительность (часов) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-premium-gold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Цена (₽) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="100"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-premium-gold"
                    placeholder="15000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Макс. группа
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.maxGroupSize}
                    onChange={(e) => setFormData({ ...formData, maxGroupSize: parseInt(e.target.value) || 10 })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-premium-gold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Сложность */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4">
              Уровень сложности <span className="text-red-400">*</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {DIFFICULTY_LEVELS.map((level) => (
                <button
                  key={level.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, difficulty: level.id as any })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.difficulty === level.id
                      ? 'border-premium-gold bg-premium-gold/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="text-3xl mb-2">{level.icon}</div>
                  <div className="font-bold mb-1">{level.name}</div>
                  <div className="text-sm text-white/70">{level.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Сезоны */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4">Сезоны проведения</h2>
            <div className="grid grid-cols-4 gap-4">
              {SEASONS.map((season) => (
                <button
                  key={season.id}
                  type="button"
                  onClick={() => handleSeasonToggle(season.id)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.season.includes(season.id)
                      ? 'border-premium-gold bg-premium-gold/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="text-2xl mb-1">{season.icon}</div>
                  <div className="text-sm font-bold">{season.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Что включено */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4">Что включено в стоимость</h2>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={currentIncluded}
                onChange={(e) => setCurrentIncluded(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('included', currentIncluded))}
                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-premium-gold"
                placeholder="Трансфер, обед, снаряжение..."
              />
              <button
                type="button"
                onClick={() => addItem('included', currentIncluded)}
                className="px-4 py-2 bg-premium-gold text-premium-black font-bold rounded-xl hover:bg-premium-gold/90"
              >
                Добавить
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.included.map((item, index) => (
                <span key={index} className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg text-sm flex items-center gap-2">
                  ✅ {item}
                  <button
                    type="button"
                    onClick={() => removeItem('included', index)}
                    className="hover:text-red-400"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Что НЕ включено */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4">Что НЕ включено</h2>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={currentNotIncluded}
                onChange={(e) => setCurrentNotIncluded(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('notIncluded', currentNotIncluded))}
                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-premium-gold"
                placeholder="Личные расходы, алкоголь..."
              />
              <button
                type="button"
                onClick={() => addItem('notIncluded', currentNotIncluded)}
                className="px-4 py-2 bg-premium-gold text-premium-black font-bold rounded-xl hover:bg-premium-gold/90"
              >
                Добавить
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.notIncluded.map((item, index) => (
                <span key={index} className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-sm flex items-center gap-2">
                  ❌ {item}
                  <button
                    type="button"
                    onClick={() => removeItem('notIncluded', index)}
                    className="hover:text-white"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Фотографии */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4">Фотографии</h2>
            <div className="flex gap-2 mb-3">
              <input
                type="url"
                value={currentImage}
                onChange={(e) => setCurrentImage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-premium-gold"
                placeholder="https://example.com/image.jpg"
              />
              <button
                type="button"
                onClick={addImage}
                className="px-4 py-2 bg-premium-gold text-premium-black font-bold rounded-xl hover:bg-premium-gold/90"
              >
                Добавить
              </button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {formData.images.map((url, index) => (
                <div key={index} className="relative group">
                  <img src={url} alt="" className="w-full h-24 object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => removeItem('images', index)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Кнопки */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-colors font-bold"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading || !formData.difficulty}
              className="flex-1 px-6 py-3 bg-premium-gold text-premium-black rounded-xl hover:bg-premium-gold/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold"
            >
              {loading ? 'Создание...' : 'Создать тур'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
