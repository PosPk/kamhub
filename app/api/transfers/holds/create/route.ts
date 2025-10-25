import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const scheduleId = body?.scheduleId as string;
    const requestedSeats = Number(body?.requestedSeats);
    const ttlSec = Number(body?.ttlSec ?? 600); // 10 минут по умолчанию
    const idempotencyKey = (body?.idempotencyKey as string) || null;
    const clientFingerprint = (body?.clientFingerprint as string) || null;

    if (!scheduleId || !requestedSeats || requestedSeats <= 0) {
      return NextResponse.json({ success: false, error: 'scheduleId и requestedSeats обязательны' }, { status: 400 });
    }

    // Помечаем протухшие холды
    await query('SELECT expire_transfer_seat_holds()');

    // Проверим доступные места с учётом активных холдов
    const seatsRes = await query<{ available_seats: number }>(
      'SELECT available_seats FROM transfer_schedules WHERE id = $1',
      [scheduleId]
    );
    if (!seatsRes.rowCount) {
      return NextResponse.json({ success: false, error: 'schedule не найден' }, { status: 404 });
    }

    const holdsRes = await query<{ sum: number }>(
      `SELECT COALESCE(SUM(requested_seats),0) AS sum
       FROM transfer_seat_holds
       WHERE schedule_id = $1 AND status = 'held' AND expires_at > NOW()`,
      [scheduleId]
    );

    const available = seatsRes.rows[0].available_seats - Number(holdsRes.rows[0].sum);
    if (requestedSeats > available) {
      return NextResponse.json({ success: false, error: 'Недостаточно мест' }, { status: 409 });
    }

    const expiresAt = new Date(Date.now() + ttlSec * 1000);

    // Идемпотентность: если задан ключ, пробуем найти существующий hold
    if (idempotencyKey) {
      const ex = await query<{ id: string }>(
        'SELECT id FROM transfer_seat_holds WHERE idempotency_key = $1',
        [idempotencyKey]
      );
      if (ex.rowCount) {
        return NextResponse.json({ success: true, data: { holdId: ex.rows[0].id, status: 'exists' } });
      }
    }

    const ins = await query<{ id: string }>(
      `INSERT INTO transfer_seat_holds (schedule_id, requested_seats, status, expires_at, idempotency_key, client_fingerprint)
       VALUES ($1,$2,'held',$3,$4,$5) RETURNING id`,
      [scheduleId, requestedSeats, expiresAt, idempotencyKey, clientFingerprint]
    );

    return NextResponse.json({ success: true, data: { holdId: ins.rows[0].id, status: 'held', expiresAt } });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Server error' }, { status: 500 });
  }
}
