import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // В реальном приложении здесь будет запрос к базе данных
    // Пока возвращаем тестовые данные
    const stats = {
      totalTours: 12,
      activeBookings: 8,
      monthlyRevenue: 450000,
      rating: 4.8
    };

    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching operator stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch operator stats' },
      { status: 500 }
    );
  }
}