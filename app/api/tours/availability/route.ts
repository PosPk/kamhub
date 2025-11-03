import { NextRequest, NextResponse } from 'next/server';
import { checkTourAvailability } from '@/lib/tours/booking';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// =====================================================
// GET /api/tours/availability - Проверка доступности
// =====================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const scheduleId = searchParams.get('scheduleId');
    const participantsCount = searchParams.get('participantsCount');
    
    // Валидация параметров
    if (!scheduleId || !participantsCount) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: scheduleId, participantsCount'
      }, { status: 400 });
    }
    
    // Проверка UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(scheduleId)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid scheduleId format'
      }, { status: 400 });
    }
    
    const participantsCountNum = parseInt(participantsCount);
    if (isNaN(participantsCountNum) || participantsCountNum < 1 || participantsCountNum > 50) {
      return NextResponse.json({
        success: false,
        error: 'Invalid participantsCount (must be 1-50)'
      }, { status: 400 });
    }
    
    // Проверка доступности
    const availability = await checkTourAvailability(scheduleId, participantsCountNum);
    
    return NextResponse.json({
      success: true,
      data: availability
    });
    
  } catch (error) {
    console.error('Error in GET /api/tours/availability:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
