'use client';

import React, { useState, useEffect } from 'react';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState('');

  useEffect(() => {
    setMounted(true);
    setTime(new Date().toLocaleTimeString('ru-RU'));
    
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('ru-RU'));
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  if (!mounted) {
    return (
      <main className="min-h-screen relative flex items-center justify-center">
        <div className="text-2xl opacity-50">Загрузка...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen relative p-8 bg-gradient-to-br from-blue-50 to-cyan-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="weather-card p-8 mb-6">
          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            ✅ Сайт работает!
          </h1>
          <p className="text-xl text-gray-600">Kamchatour Hub - Тестовая версия</p>
        </div>

        {/* Time */}
        <div className="weather-card p-6 mb-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <div className="text-center">
            <div className="text-sm opacity-80 mb-2">Текущее время</div>
            <div className="text-4xl font-bold">{time}</div>
          </div>
        </div>

        {/* Tests */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="weather-card p-6">
            <div className="text-2xl mb-2">✅</div>
            <h3 className="font-bold mb-2">React работает</h3>
            <p className="text-sm text-gray-600">Клиентский JavaScript загружен и выполняется</p>
          </div>

          <div className="weather-card p-6">
            <div className="text-2xl mb-2">✅</div>
            <h3 className="font-bold mb-2">useState работает</h3>
            <p className="text-sm text-gray-600">Счетчик обновляется каждую секунду</p>
          </div>

          <div className="weather-card p-6">
            <div className="text-2xl mb-2">✅</div>
            <h3 className="font-bold mb-2">useEffect работает</h3>
            <p className="text-sm text-gray-600">Хуки React выполняются корректно</p>
          </div>

          <div className="weather-card p-6">
            <div className="text-2xl mb-2">✅</div>
            <h3 className="font-bold mb-2">CSS работает</h3>
            <p className="text-sm text-gray-600">Tailwind и custom стили применяются</p>
          </div>
        </div>

        {/* Info */}
        <div className="weather-card p-6 bg-green-50 border-2 border-green-200">
          <h3 className="font-bold text-green-800 mb-4 text-xl">🎉 Если вы видите этот текст:</h3>
          <ul className="space-y-2 text-green-700">
            <li>✓ Сервер работает корректно</li>
            <li>✓ Next.js рендерит страницы</li>
            <li>✓ React гидрация прошла успешно</li>
            <li>✓ JavaScript выполняется в браузере</li>
            <li>✓ Нет ошибок в консоли (проверьте F12)</li>
          </ul>
        </div>

        {/* Debug info */}
        <div className="weather-card p-4 mt-6 bg-gray-50 text-xs text-gray-600">
          <div>Build: N37HJ20R_5tAxGA4Apj5F</div>
          <div>Commit: ea6ac04</div>
          <div>Layout: Minimal (без провайдеров)</div>
          <div>Mounted: {mounted ? 'Yes' : 'No'}</div>
        </div>
      </div>
    </main>
  );
}
