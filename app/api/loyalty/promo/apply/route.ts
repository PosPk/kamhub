import { NextRequest, NextResponse } from 'next/server';
import { loyaltySystem } from '@/lib/loyalty/loyalty-system';
import { logger } from '@/lib/logger';
import { withCsrfProtection } from '@/lib/middleware/csrf';
import { withRateLimit, RateLimitPresets } from '@/lib/middleware/rate-limit';

export const dynamic = 'force-dynamic';

// POST /api/loyalty/promo/apply - Применение промокода
async function handler(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, userId, orderAmount } = body;

    if (!code || !userId || !orderAmount) {
      return NextResponse.json({
        success: false,
        error: 'Code, userId and orderAmount are required'
      }, { status: 400 });
    }

    const result = await loyaltySystem.applyPromoCode(code, userId, orderAmount);

    return NextResponse.json({
      success: result.success,
      data: {
        discountAmount: result.discountAmount,
        message: result.message
      }
    });

  } catch (error) {
    logger.error('Promo code application error', error, {
      endpoint: '/api/loyalty/promo/apply',
    });
    return NextResponse.json({
      success: false,
      error: 'Ошибка применения промокода'
    }, { status: 500 });
  }
}

export const POST = withRateLimit(
  RateLimitPresets.api, // 100 запросов/15 мин (промокоды могут использоваться чаще)
  withCsrfProtection(handler)
);