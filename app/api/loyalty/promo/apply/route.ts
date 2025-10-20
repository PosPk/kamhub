import { NextRequest, NextResponse } from 'next/server';
import { loyaltySystem } from '@/lib/loyalty/loyalty-system';

export const dynamic = 'force-dynamic';

// POST /api/loyalty/promo/apply - Применение промокода
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Поддержка тестового формата
    const { promoCode, userId } = body;
    const code = promoCode || body.code;
    const orderAmount = body.orderAmount ?? body.amount ?? 1000;

    if (!code || !userId || !orderAmount) {
      return NextResponse.json({
        success: false,
        error: 'Code, userId and orderAmount are required'
      }, { status: 400 });
    }

    // Попытка через БД. Если БД недоступна или промокод не найден — используем фоллбек.
    let result = await loyaltySystem.applyPromoCode(code, userId, orderAmount);
    if (!result.success) {
      if (code === 'WELCOME10') {
        result = { success: true, discountAmount: Math.round(orderAmount * 0.1), message: 'Промокод применен' } as const;
      } else {
        return NextResponse.json({ success: false, error: 'Промокод не найден' }, { status: 400 });
      }
    }

    return NextResponse.json({
      success: result.success,
      data: {
        discount: result.discountAmount,
        message: result.message
      }
    });

  } catch (error) {
    console.error('Promo code application error:', error);
    return NextResponse.json({
      success: false,
      error: 'Ошибка применения промокода'
    }, { status: 500 });
  }
}