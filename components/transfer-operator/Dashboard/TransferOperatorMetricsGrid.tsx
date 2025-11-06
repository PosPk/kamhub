'use client';

import React, { useState, useEffect } from 'react';
import { MetricCard } from '../../admin/shared/MetricCard';
import { LoadingSpinner } from '../../admin/shared/LoadingSpinner';

interface TransferOperatorMetrics {
  totalVehicles: number;
  activeVehicles: number;
  totalDrivers: number;
  activeDrivers: number;
  totalTransfers: number;
  completedTransfers: number;
  pendingTransfers: number;
  cancelledTransfers: number;
  totalRevenue: number;
  monthlyRevenue: number;
  averageTransferPrice: number;
  occupancyRate: number;
  customerSatisfaction: number;
}

interface TransferOperatorMetricsGridProps {
  period?: string;
}

export function TransferOperatorMetricsGrid({ period = '30' }: TransferOperatorMetricsGridProps) {
  const [metrics, setMetrics] = useState<TransferOperatorMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMetrics();
  }, [period]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ period });
      const response = await fetch(`/api/transfer-operator/dashboard?${params}`);
      const result = await response.json();

      if (result.success) {
        setMetrics(result.data.metrics);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error fetching transfer operator metrics:', err);
      setError('Ошибка загрузки метрик');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner message="Загрузка метрик транспортного оператора..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center">
        <p className="text-red-400 mb-4">Ошибка загрузки метрик</p>
        <button
          onClick={fetchMetrics}
          className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
        >
          Повторить
        </button>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Транспорт"
        value={`${metrics.activeVehicles}/${metrics.totalVehicles}`}
        subtitle="активный/всего"
        icon="🚗"
        trend={metrics.activeVehicles > 0 ? 'up' : 'neutral'}
      />

      <MetricCard
        title="Водители"
        value={`${metrics.activeDrivers}/${metrics.totalDrivers}`}
        subtitle="активные/всего"
        icon="👨‍🚗"
        trend={metrics.activeDrivers > 0 ? 'up' : 'neutral'}
      />

      <MetricCard
        title="Трансферы"
        value={metrics.totalTransfers.toString()}
        subtitle={`${metrics.completedTransfers} завершено`
        icon="🚐"
        trend={metrics.totalTransfers > 0 ? 'up' : 'neutral'}
      />

      <MetricCard
        title="Доход"
        value={`${metrics.totalRevenue.toLocaleString('ru-RU')} ₽`}
        subtitle={`за ${period} дней`}
        icon="💰"
        trend={metrics.totalRevenue > 0 ? 'up' : 'neutral'}
      />

      <MetricCard
        title="Средний чек"
        value={`${metrics.averageTransferPrice.toLocaleString('ru-RU')} ₽`}
        subtitle="на трансфер"
        icon="📊"
        trend={metrics.averageTransferPrice > 5000 ? 'up' : 'neutral'}
      />

      <MetricCard
        title="Заполняемость"
        value={`${metrics.occupancyRate.toFixed(1)}%`}
        subtitle="парка транспорта"
        icon="📈"
        trend={metrics.occupancyRate > 70 ? 'up' : 'down'}
      />

      <MetricCard
        title="Рейтинг"
        value={metrics.customerSatisfaction.toFixed(1)}
        subtitle="от клиентов (1-5)"
        icon="⭐"
        trend={metrics.customerSatisfaction >= 4.0 ? 'up' : 'down'}
      />

      <MetricCard
        title="Ожидают"
        value={metrics.pendingTransfers.toString()}
        subtitle="трансферов"
        icon="⏳"
        trend={metrics.pendingTransfers > 10 ? 'down' : 'neutral'}
      />
    </div>
  );
}

