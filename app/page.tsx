'use client';

import React, { useState, useEffect } from 'react';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setMounted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, []);

  if (!mounted) {
    return (
      <main className="min-h-screen relative flex items-center justify-center">
        <div className="text-2xl opacity-50">Загрузка...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen relative flex items-center justify-center">
        <div className="text-2xl text-red-500">Ошибка: {error}</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen relative p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">✅ Сайт работает!</h1>
        
        <div className="space-y-4">
          <div className="weather-card p-6">
            <h2 className="text-2xl font-bold mb-2">Тест 1: Простой блок</h2>
            <p>Этот блок отображается корректно</p>
          </div>

          <div className="weather-card p-6">
            <h2 className="text-2xl font-bold mb-2">Тест 2: Градиент</h2>
            <div className="bg-gradient-to-r from-blue-400 to-cyan-400 p-4 rounded-xl text-white">
              Градиент работает
            </div>
          </div>

          <div className="weather-card p-6">
            <h2 className="text-2xl font-bold mb-2">Тест 3: Состояние React</h2>
            <p>Mounted: {mounted ? 'Да ✓' : 'Нет ✗'}</p>
            <p>Время: {new Date().toLocaleTimeString('ru-RU')}</p>
          </div>
        </div>

        <div className="mt-8 p-4 bg-green-500/20 border border-green-500/40 rounded-xl">
          <p className="font-bold">🎉 Если вы видите этот текст, то React работает!</p>
          <p className="text-sm mt-2">Можно начинать добавлять компоненты один за другим</p>
        </div>
      </div>
    </main>
  );
}
