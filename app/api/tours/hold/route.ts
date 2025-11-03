import { NextRequest, NextResponse } from 'next/server';
import { holdTourSeats, releaseHold } from '@/lib/tours/booking';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// =====================================================
// ВАЛИДАЦИЯ
// =====================================================

const HoldRequestSchema = z.object({
  scheduleId: z.string().uuid(),
  userId: z.string().uuid(),
  participantsCount: z.number().int().min(1).max(50),
  timeoutMinutes: z.number().int().min(5).max(30).optional()
});

const ReleaseRequestSchema = z.object({
  holdId: z.string().uuid()
});

// =====================================================
// POST /api/tours/hold - Временная блокировка мест
// =====================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Валидация
    let validatedData;
    try {
      validatedData = HoldRequestSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({
          success: false,
          error: 'Validation error',
          details: error.errors
        }, { status: 400 });
      }
      throw error;
    }
    
    // Создание временной блокировки
    const holdResult = await holdTourSeats(
      validatedData.scheduleId,
      validatedData.participantsCount,
      validatedData.userId,
      validatedData.timeoutMinutes || 15
    );
    
    if (!holdResult.success) {
      return NextResponse.json(holdResult, { 
        status: holdResult.errorCode === 'LOCK_TIMEOUT' ? 409 : 400 
      });
    }
    
    return NextResponse.json(holdResult, { status: 201 });
    
  } catch (error) {
    console.error('Error in POST /api/tours/hold:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// =====================================================
// DELETE /api/tours/hold - Освобождение блокировки
// =====================================================

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Валидация
    let validatedData;
    try {
      validatedData = ReleaseRequestSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({
          success: false,
          error: 'Validation error',
          details: error.errors
        }, { status: 400 });
      }
      throw error;
    }
    
    // Освобождение блокировки
    const released = await releaseHold(validatedData.holdId);
    
    if (!released) {
      return NextResponse.json({
        success: false,
        error: 'Hold not found or already released'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Hold released successfully'
    });
    
  } catch (error) {
    console.error('Error in DELETE /api/tours/hold:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
