'use client';

import React, { useState, useEffect } from 'react';
import { useRoles } from '@/contexts/RoleContext';
import { useAuth } from '@/contexts/AuthContext';
import { useOrdersContext } from '@/contexts/OrdersContext';
import { Protected } from '@/components/Protected';

export default function OperatorDashboard() {
  const { hasRole } = useRoles();
  const { user } = useAuth();
  const { orders } = useOrdersContext();
  const [stats, setStats] = useState({
    totalTours: 0,
    activeBookings: 0,
    monthlyRevenue: 0,
    rating: 0
  });

  useEffect(() => {
    // Загружаем статистику оператора
    fetchOperatorStats();
  }, []);

  const fetchOperatorStats = async () => {
    try {
      const response = await fetch('/api/operator/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching operator stats:', error);
    }
  };

  if (!hasRole('operator') && !hasRole('admin')) {
    return (
      <div className="min-h-screen bg-premium-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold mb-2">Доступ запрещен</h1>
          <p className="text-white/70">Требуются права оператора</p>
        </div>
      </div>
    );
  }

  return (
    <Protected roles={['operator', 'admin']}>
      <main className="min-h-screen bg-premium-black text-white">
        {/* Header */}
        <div className="bg-white/5 border-b border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-premium-gold">CRM Туроператора</h1>
              <p className="text-white/70">Управление турами и бронированиями</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-white/70">Оператор</div>
              <div className="font-bold">{user?.name || 'Аноним'}</div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="text-2xl font-black text-premium-gold">{stats.totalTours}</div>
            <div className="text-white/70 text-sm">Всего туров</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="text-2xl font-black text-premium-gold">{stats.activeBookings}</div>
            <div className="text-white/70 text-sm">Активные бронирования</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="text-2xl font-black text-premium-gold">{stats.monthlyRevenue.toLocaleString()} ₽</div>
            <div className="text-white/70 text-sm">Доход за месяц</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="text-2xl font-black text-premium-gold">{stats.rating.toFixed(1)}</div>
            <div className="text-white/70 text-sm">Рейтинг</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-6 py-6">
          <h2 className="text-xl font-bold mb-4">Быстрые действия</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="bg-premium-gold text-premium-black rounded-xl p-4 font-bold hover:bg-premium-gold/90 transition-colors">
              Создать тур
            </button>
            <button className="bg-white/10 text-white rounded-xl p-4 font-bold hover:bg-white/20 transition-colors">
              Управление бронированиями
            </button>
            <button className="bg-white/10 text-white rounded-xl p-4 font-bold hover:bg-white/20 transition-colors">
              Аналитика
            </button>
            <button className="bg-white/10 text-white rounded-xl p-4 font-bold hover:bg-white/20 transition-colors">
              Настройки
            </button>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="px-6 py-6">
          <h2 className="text-xl font-bold mb-4">Последние заказы</h2>
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            {orders.length > 0 ? (
              <div className="divide-y divide-white/10">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="p-4 flex items-center justify-between">
                    <div>
                      <div className="font-bold">{order.items[0]?.title || 'Заказ'}</div>
                      <div className="text-sm text-white/70">{order.customerInfo?.name || 'Без имени'}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-premium-gold">{order.total} ₽</div>
                      <div className="text-sm text-white/70">{order.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-white/70">
                <div className="text-4xl mb-2">📋</div>
                <p>Заказов пока нет</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </Protected>
  );
}