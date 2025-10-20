import { NextRequest, NextResponse } from 'next/server';
import { loyaltySystem } from '@/lib/loyalty/loyalty-system';

export const dynamic = 'force-dynamic';

// GET /api/loyalty/levels - Получение всех уровней лояльности
export async function GET(_request: NextRequest) {
  try {
    const levels = loyaltySystem.getAllLevels().map(l => ({
      name: l.name,
      minSpent: l.minSpent,
      discountPercentage: l.discount * 100,
      benefits: l.benefits,
      color: l.color
    }));

    return NextResponse.json({
      success: true,
      data: levels
    });

  } catch (error) {
    console.error('Loyalty levels error:', error);
    return NextResponse.json({
      success: false,
      error: 'Ошибка получения уровней лояльности'
    }, { status: 500 });
  }
}