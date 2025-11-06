import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types';

// GET /api/admin/stats - Получение статистики для админ-панели
export async function GET(request: NextRequest) {
  try {
    // TODO: Проверка прав администратора
    // TODO: Реальные запросы к БД для получения статистики

    // Моковые данные
    const stats = {
      totalUsers: 1547,
      totalTours: 234,
      totalBookings: 892,
      totalRevenue: 15730000,
      activeTransfers: 45,
      todayBookings: 12,
      monthlyGrowth: 24,
      
      // Распределение по ролям
      usersByRole: {
        tourist: 1234,
        operator: 156,
        guide: 89,
        transfer: 45,
        agent: 18,
        admin: 5,
      },

      // Статистика за период
      dailyBookings: [12, 15, 8, 22, 18, 25, 12], // Последние 7 дней
      dailyRevenue: [45000, 67000, 34000, 89000, 76000, 123000, 56000],

      // Топ туры
      topTours: [
        { id: '1', name: 'Восхождение на Авачинский вулкан', bookings: 45 },
        { id: '2', name: 'Долина гейзеров', bookings: 38 },
        { id: '3', name: 'Халактырский пляж', bookings: 32 },
      ],

      // Топ операторы
      topOperators: [
        { id: '1', name: 'Камчатка Тревел', revenue: 3450000, bookings: 156 },
        { id: '2', name: 'Вулкан Тур', revenue: 2890000, bookings: 128 },
        { id: '3', name: 'Дикая природа', revenue: 2340000, bookings: 98 },
      ],

      // Системные метрики
      system: {
        uptime: 99.8,
        avgResponseTime: 145, // мс
        errorRate: 0.2, // %
        activeConnections: 234,
      },
    };

    return NextResponse.json({
      success: true,
      data: stats,
    } as ApiResponse<any>);

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка при получении статистики' } as ApiResponse<null>,
      { status: 500 }
    );
  }
}



