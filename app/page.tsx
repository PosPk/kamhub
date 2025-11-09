'use client';

import React, { useState, useEffect } from 'react';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  
  const addLog = (message: string) => {
    console.log('🔍 DEBUG:', message);
    setLogs(prev => [...prev, `${new Date().toISOString().split('T')[1].split('.')[0]} - ${message}`]);
  };

  useEffect(() => {
    addLog('1. useEffect started');
    
    try {
      addLog('2. Setting mounted = true');
      setMounted(true);
      addLog('3. Mounted successfully');
      
      addLog('4. Starting data fetch');
      const fetchData = async () => {
        try {
          addLog('5. Fetching tours...');
          const toursResponse = await fetch('/api/tours?limit=6');
          addLog(`6. Tours response status: ${toursResponse.status}`);
          
          const toursData = await toursResponse.json();
          addLog(`7. Tours data received: ${toursData.success ? 'success' : 'failed'}`);
          
          addLog('8. Fetching weather...');
          const weatherResponse = await fetch('/api/weather');
          addLog(`9. Weather response status: ${weatherResponse.status}`);
          
          const weatherData = await weatherResponse.json();
          addLog(`10. Weather data received: ${weatherData.success ? 'success' : 'failed'}`);
          
          addLog('11. All data fetched successfully!');
        } catch (error) {
          addLog(`❌ ERROR in fetchData: ${error instanceof Error ? error.message : String(error)}`);
          console.error('Fetch error:', error);
        }
      };
      
      fetchData();
      addLog('12. fetchData called');
      
    } catch (error) {
      addLog(`❌ ERROR in useEffect: ${error instanceof Error ? error.message : String(error)}`);
      console.error('useEffect error:', error);
    }
    
    addLog('13. useEffect completed');
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
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h1 className="text-4xl font-bold mb-4 text-green-600">
            ✅ React смонтирован успешно!
          </h1>
          <p className="text-gray-600">Если вы видите этот текст, значит базовый React работает.</p>
        </div>

        {/* Debug logs */}
        <div className="bg-gray-900 text-green-400 rounded-lg shadow-lg p-6 mb-6 font-mono text-sm">
          <h2 className="text-xl font-bold mb-4 text-white">🔍 DEBUG LOGS:</h2>
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-yellow-400">Waiting for logs...</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className={log.includes('❌') ? 'text-red-400 font-bold' : ''}>
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-blue-900 mb-4 text-xl">📋 Инструкция:</h3>
          <ol className="space-y-2 text-blue-800">
            <li>✅ <strong>Шаг 1:</strong> Откройте консоль браузера (F12)</li>
            <li>✅ <strong>Шаг 2:</strong> Посмотрите на DEBUG LOGS выше</li>
            <li>✅ <strong>Шаг 3:</strong> Найдите где появляется ❌ ERROR</li>
            <li>✅ <strong>Шаг 4:</strong> Скопируйте ПОЛНЫЙ текст ошибки из консоли</li>
            <li>✅ <strong>Шаг 5:</strong> Сделайте скриншот этой страницы и консоли</li>
          </ol>
        </div>

        {/* Browser info */}
        <div className="bg-gray-100 rounded-lg p-4 mt-6 text-sm">
          <div><strong>User Agent:</strong> {typeof window !== 'undefined' ? window.navigator.userAgent : 'N/A'}</div>
          <div><strong>Window size:</strong> {typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'N/A'}</div>
          <div><strong>Mounted:</strong> {mounted ? 'Yes ✅' : 'No ❌'}</div>
        </div>
      </div>
    </main>
  );
}
