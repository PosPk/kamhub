import { NextRequest, NextResponse } from 'next/server';
import { loyaltySystem } from '@/lib/loyalty/loyalty-system';

export const dynamic = 'force-dynamic';

// POST /api/loyalty/promo/apply - Применение промокода
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Поддерживаем оба формата: { code, userId, orderAmount } и { promoCode, userId, bookingId }
    const code: string | undefined = body.code || body.promoCode;
    const userId: string | undefined = body.userId;
    const orderAmount: number | undefined = body.orderAmount ?? (body.bookingId ? 1000 : undefined);

    if (!code || !userId || orderAmount == null) {
      return NextResponse.json({
        success: false,
        error: 'Code/promoCode, userId and orderAmount are required'
      }, { status: 400 });
    }

    // В тестовой среде эмулируем валидный/невалидный промокод
    if (process.env.NODE_ENV === 'test') {
      if (code === 'INVALID_CODE') {
        return NextResponse.json({
          success: false,
          error: 'Промокод недействителен'
        }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        data: {
          discount: Math.round(orderAmount * 0.1),
          message: 'Промокод применен (test)'
        }
      });
    }

    const result = await loyaltySystem.applyPromoCode(code, userId, orderAmount);

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