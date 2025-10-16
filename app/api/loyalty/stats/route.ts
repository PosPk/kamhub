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

    const stats = await loyaltySystem.getUserLoyaltyStats(userId);

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Loyalty stats error:', error);
    return NextResponse.json({
      success: false,
      error: 'Ошибка получения статистики лояльности'
    }, { status: 500 });
  }
}