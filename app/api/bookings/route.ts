import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/database';
import { ApiResponse } from '@/types';
import { getRequestRolesFromHeaders, requirePermission } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

// GET /api/bookings - список бронирований пользователя (по заголовкам)
export async function GET(request: NextRequest) {
  try {
    const roles = getRequestRolesFromHeaders(request.headers);
    requirePermission(roles, 'book_tours');

    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ success: false, error: 'x-user-id header required' } as ApiResponse<null>, { status: 400 });
    }

    const result = await query(
      `SELECT b.*, t.name as tour_name FROM bookings b JOIN tours t ON b.tour_id = t.id WHERE b.user_id = $1 ORDER BY b.created_at DESC`,
      [userId]
    );

    return NextResponse.json({ success: true, data: result.rows } as ApiResponse<any[]>);
  } catch (error: any) {
    const status = error?.statusCode || 500;
    return NextResponse.json({ success: false, error: error?.message || 'Internal error' } as ApiResponse<null>, { status });
  }
}

// POST /api/bookings - создать бронирование с удержанием слота (без оплаты)
export async function POST(request: NextRequest) {
  try {
    const roles = getRequestRolesFromHeaders(request.headers);
    requirePermission(roles, 'book_tours');

    const body = await request.json();
    const { userId, tourId, slotId, participants, idempotencyKey } = body || {};

    if (!userId || !tourId || !slotId || !participants) {
      return NextResponse.json({ success: false, error: 'userId, tourId, slotId, participants required' } as ApiResponse<null>, { status: 400 });
    }

    const holdTtlMinutes = 15;

    const data = await transaction(async (client) => {
      // Проверяем слот и доступную вместимость
      const slotRes = await client.query(`SELECT id, capacity, start_at, end_at, price, currency, status FROM tour_slots WHERE id = $1 FOR UPDATE`, [slotId]);
      if (slotRes.rows.length === 0) {
        throw Object.assign(new Error('Slot not found'), { statusCode: 404 });
      }
      const slot = slotRes.rows[0];
      if (slot.status !== 'open') {
        throw Object.assign(new Error('Slot is not open'), { statusCode: 400 });
      }

      // Подсчитываем уже удержанное + брони
      const capacityRes = await client.query(
        `SELECT 
           COALESCE((SELECT SUM(quantity) FROM inventory_holds WHERE slot_id = $1 AND status = 'active' AND expires_at > NOW()), 0) as held,
           COALESCE((SELECT SUM(participants) FROM bookings WHERE tour_id = $2 AND date BETWEEN $3::TIMESTAMPTZ AND $4::TIMESTAMPTZ AND status IN ('pending','confirmed')), 0) as booked`,
        [slotId, tourId, slot.start_at, slot.end_at]
      );
      const { held, booked } = capacityRes.rows[0];
      const remaining = Number(slot.capacity) - Number(held) - Number(booked);
      if (participants > remaining) {
        throw Object.assign(new Error('Not enough capacity'), { statusCode: 409 });
      }

      // Создаем удержание (идемпотентно)
      const holdRes = await client.query(
        `INSERT INTO inventory_holds (slot_id, user_id, quantity, expires_at, status, idempotency_key)
         VALUES ($1, $2, $3, NOW() + INTERVAL '${holdTtlMinutes} minutes', 'active', $4)
         ON CONFLICT (slot_id, user_id, idempotency_key) DO UPDATE SET expires_at = EXCLUDED.expires_at
         RETURNING *`,
        [slotId, userId, participants, idempotencyKey || `hold_${userId}_${slotId}`]
      );

      // Создаем бронирование (pending)
      const totalPrice = Number(slot.price) * Number(participants);
      const bookingRes = await client.query(
        `INSERT INTO bookings (user_id, tour_id, date, participants, total_price, status, payment_status)
         VALUES ($1, $2, $3, $4, $5, 'pending', 'pending') RETURNING *`,
        [userId, tourId, slot.start_at, participants, totalPrice]
      );

      return { booking: bookingRes.rows[0], hold: holdRes.rows[0], slot };
    });

    return NextResponse.json({ success: true, data } as ApiResponse<any>);
  } catch (error: any) {
    const status = error?.statusCode || 500;
    return NextResponse.json({ success: false, error: error?.message || 'Internal error' } as ApiResponse<null>, { status });
  }
}
