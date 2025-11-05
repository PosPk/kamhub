'use client';

import React, { useState, useEffect } from 'react';

interface MetricsSummary {
  summary: {
    completionRate: number;
    completedTasks: number;
    totalTasks: number;
    satisfactionRate: number;
    satisfiedUsers: number;
    totalFeedbacks: number;
    toolSuccessRate: number;
    toolErrors: number;
    totalToolCalls: number;
    avgEfficiency: number;
    avgLatency: number;
    p95Latency: number;
  };
  topErrors: Array<{
    tool: string;
    count: number;
    totalCalls: number;
    avgLatency: number;
  }>;
  sessions: {
    total: number;
    completed: number;
    avgMessages: number;
  };
  trend: Array<{
    date: string;
    completed: number;
    satisfied: number;
  }>;
  period: string;
}

export default function AIMetricsPage() {
  const [metrics, setMetrics] = useState<MetricsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7');

  useEffect(() => {
    fetchMetrics();
  }, [period]);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/ai-metrics/summary?days=${period}`);
      const data = await response.json();
      if (data.success) {
        setMetrics(data.data);
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const MetricCard = ({ 
    title, 
    value, 
    subtitle, 
    icon, 
    color = 'blue',
    trend 
  }: { 
    title: string; 
    value: string | number; 
    subtitle: string; 
    icon: string;
    color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
    trend?: 'up' | 'down';
  }) => {
    const colorClasses = {
      blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
      green: 'from-green-500/20 to-green-600/10 border-green-500/30',
      yellow: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30',
      red: 'from-red-500/20 to-red-600/10 border-red-500/30',
      purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
    };

    return (
      <div className={`bg-gradient-to-br ${colorClasses[color]} border rounded-2xl p-6`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-white/70 text-sm font-medium mb-2">{title}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold text-white">{value}</h3>
              {trend && (
                <span className={`text-sm ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                  {trend === 'up' ? '↗' : '↘'}
                </span>
              )}
            </div>
            <p className="text-white/50 text-xs mt-1">{subtitle}</p>
          </div>
          <div className="text-4xl opacity-20">{icon}</div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-premium-black p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-premium-gold border-t-transparent"></div>
            <p className="text-white/70 mt-4">Загрузка метрик...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="min-h-screen bg-premium-black p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <p className="text-white/70">Нет данных для отображения</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-premium-black p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                📊 AI Chat Метрики
              </h1>
              <p className="text-white/70">
                Отслеживание производительности и качества AI-ассистента
              </p>
            </div>
            
            {/* Period Selector */}
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-premium-gold"
            >
              <option value="1">Последний день</option>
              <option value="7">Последние 7 дней</option>
              <option value="30">Последние 30 дней</option>
              <option value="90">Последние 90 дней</option>
            </select>
          </div>
        </div>

        {/* Main Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Выполнение задач"
            value={`${metrics.summary.completionRate}%`}
            subtitle={`${metrics.summary.completedTasks} из ${metrics.summary.totalTasks} задач`}
            icon="✅"
            color="green"
          />
          
          <MetricCard
            title="Удовлетворенность"
            value={`${metrics.summary.satisfactionRate}%`}
            subtitle={`${metrics.summary.satisfiedUsers} довольных`}
            icon="😊"
            color="blue"
          />
          
          <MetricCard
            title="Успех инструментов"
            value={`${metrics.summary.toolSuccessRate}%`}
            subtitle={`${metrics.summary.toolErrors} ошибок`}
            icon="🔧"
            color={metrics.summary.toolSuccessRate >= 95 ? 'green' : 'yellow'}
          />
          
          <MetricCard
            title="Эффективность"
            value={`${metrics.summary.avgEfficiency}%`}
            subtitle={`Среднее время: ${metrics.summary.avgLatency}ms`}
            icon="⚡"
            color="purple"
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sessions Stats */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span>💬</span>
              Статистика сессий
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-white/70">Всего сессий:</span>
                <span className="text-white font-bold text-2xl">
                  {metrics.sessions.total}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70">Завершенных:</span>
                <span className="text-white font-bold text-2xl">
                  {metrics.sessions.completed}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70">Среднее сообщений:</span>
                <span className="text-white font-bold text-2xl">
                  {metrics.sessions.avgMessages}
                </span>
              </div>
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="text-sm text-white/50">
                  Коэффициент завершения сессий: {' '}
                  <span className="text-premium-gold font-bold">
                    {metrics.sessions.total > 0 
                      ? Math.round((metrics.sessions.completed / metrics.sessions.total) * 100)
                      : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tool Errors */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span>⚠️</span>
              Топ ошибок инструментов
            </h2>
            
            {metrics.topErrors.length > 0 ? (
              <div className="space-y-3">
                {metrics.topErrors.map((error, index) => (
                  <div 
                    key={index}
                    className="bg-white/5 rounded-xl p-4 border border-white/10"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-white font-medium">{error.tool}</span>
                      <span className="text-red-400 font-bold">{error.count}</span>
                    </div>
                    <div className="flex justify-between text-xs text-white/50">
                      <span>Всего вызовов: {error.totalCalls}</span>
                      <span>~{error.avgLatency}ms</span>
                    </div>
                    <div className="mt-2">
                      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-red-500"
                          style={{ 
                            width: `${(error.count / error.totalCalls) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-white/50">
                <div className="text-4xl mb-2">🎉</div>
                <p>Ошибок не обнаружено!</p>
              </div>
            )}
          </div>
        </div>

        {/* Trend */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>📈</span>
            Тренд за {metrics.period}
          </h2>
          
          <div className="space-y-2">
            {metrics.trend.reverse().map((day, index) => {
              const maxValue = Math.max(
                ...metrics.trend.map(d => Math.max(d.completed, d.satisfied))
              );
              
              return (
                <div key={index} className="flex items-center gap-4">
                  <div className="text-white/70 text-sm w-24">
                    {new Date(day.date).toLocaleDateString('ru-RU', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex gap-2">
                      {/* Completed bar */}
                      <div className="flex-1">
                        <div className="h-8 bg-green-500/20 rounded-lg overflow-hidden">
                          <div 
                            className="h-full bg-green-500 flex items-center justify-end pr-2"
                            style={{ 
                              width: `${(day.completed / maxValue) * 100}%` 
                            }}
                          >
                            {day.completed > 0 && (
                              <span className="text-xs text-white font-medium">
                                {day.completed}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Satisfied bar */}
                      <div className="flex-1">
                        <div className="h-8 bg-blue-500/20 rounded-lg overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 flex items-center justify-end pr-2"
                            style={{ 
                              width: `${(day.satisfied / maxValue) * 100}%` 
                            }}
                          >
                            {day.satisfied > 0 && (
                              <span className="text-xs text-white font-medium">
                                {day.satisfied}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="flex gap-6 mt-6 pt-4 border-t border-white/10 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-white/70">Завершенные задачи</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-white/70">Довольные пользователи</span>
            </div>
          </div>
        </div>

        {/* Performance Details */}
        <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>⚡</span>
            Производительность
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-white/70 text-sm mb-2">Средняя задержка</p>
              <p className="text-3xl font-bold text-white">
                {metrics.summary.avgLatency}ms
              </p>
              <p className="text-white/50 text-xs mt-1">
                {metrics.summary.avgLatency < 2000 ? '🟢 Отлично' : 
                 metrics.summary.avgLatency < 3000 ? '🟡 Хорошо' : '🔴 Требует оптимизации'}
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-white/70 text-sm mb-2">P95 Задержка</p>
              <p className="text-3xl font-bold text-white">
                {metrics.summary.p95Latency}ms
              </p>
              <p className="text-white/50 text-xs mt-1">
                95% запросов быстрее
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-white/70 text-sm mb-2">Всего вызовов API</p>
              <p className="text-3xl font-bold text-white">
                {metrics.summary.totalToolCalls}
              </p>
              <p className="text-white/50 text-xs mt-1">
                За {metrics.period}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-white/50 text-sm">
          <p>Обновлено: {new Date().toLocaleString('ru-RU')}</p>
          <button 
            onClick={fetchMetrics}
            className="mt-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
          >
            🔄 Обновить
          </button>
        </div>
      </div>
    </div>
  );
}
