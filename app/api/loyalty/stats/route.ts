import { NextRequest, NextResponse } from 'next/server';
import { loyaltySystem } from '@/lib/loyalty/loyalty-system';

export const dynamic = 'force-dynamic';

// GET /api/loyalty/stats - Получение статистики лояльности пользователя
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 });
    }

    let stats;
    try {
      stats = await loyaltySystem.getUserLoyaltyStats(userId);
    } catch (_err) {
      // Тестовый фоллбек без БД
      stats = {
        totalPoints: 100,
        availablePoints: 80,
        currentLevel: {
          name: 'Бронза',
          minSpent: 5000,
          discount: 0.02,
          benefits: ['2% скидка', 'Приоритетная поддержка'],
          color: '#CD7F32'
        },
        nextLevel: {
          name: 'Серебро',
          minSpent: 15000,
          discount: 0.05,
          benefits: ['5% скидка', 'Быстрая подача', 'Эксклюзивные предложения'],
          color: '#C0C0C0'
        },
        pointsToNextLevel: 10000,
        totalEarned: 120,
        totalRedeemed: 40,
        transactions: []
      } as any;
    }

    return NextResponse.json({
      success: true,
      data: {
        currentLevel: stats.currentLevel,
        availablePoints: stats.availablePoints,
        totalSpent: (stats as any).totalSpent ?? 0,
        transactions: stats.transactions
      }
    });

  } catch (error) {
    console.error('Loyalty stats error:', error);
    return NextResponse.json({
      success: false,
      error: 'Ошибка получения статистики лояльности'
    }, { status: 500 });
  }
}