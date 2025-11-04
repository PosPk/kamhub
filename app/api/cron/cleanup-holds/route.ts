import { NextRequest, NextResponse } from 'next/server';
import { cleanupExpiredHolds as cleanupTourHolds } from '@/lib/tours/booking';
import { cleanupExpiredHolds as cleanupTransferHolds } from '@/lib/transfers/booking';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/cron/cleanup-holds
 * 
 * Cron endpoint для автоматической очистки истекших holds
 * Должен вызываться каждую минуту
 * 
 * Защита: X-Cron-Secret header
 */
export async function GET(request: NextRequest) {
  try {
    // Проверка секретного ключа
    const secret = request.headers.get('X-Cron-Secret');
    const expectedSecret = process.env.CRON_SECRET;
    
    if (!expectedSecret) {
      return NextResponse.json({
        success: false,
        error: 'CRON_SECRET not configured'
      }, { status: 500 });
    }
    
    if (secret !== expectedSecret) {
      console.warn('[CRON] Unauthorized cleanup attempt');
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }
    
    // Очистка tour holds
    const toursCleanedCount = await cleanupTourHolds();
    
    // Очистка transfer holds
    const transfersCleanedCount = await cleanupTransferHolds();
    
    const totalCleaned = toursCleanedCount + transfersCleanedCount;
    
    console.log(`[CRON] Cleanup completed: ${toursCleanedCount} tour holds, ${transfersCleanedCount} transfer holds`);
    
    return NextResponse.json({
      success: true,
      data: {
        cleaned: {
          tours: toursCleanedCount,
          transfers: transfersCleanedCount,
          total: totalCleaned
        },
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error: any) {
    console.error('[CRON] Cleanup error:', error);
    return NextResponse.json({
      success: false,
      error: 'Cleanup failed',
      details: error.message
    }, { status: 500 });
  }
}
