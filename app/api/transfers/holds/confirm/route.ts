import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const holdId = body?.holdId as string;
    if (!holdId) return NextResponse.json({ success: false, error: 'holdId обязателен' }, { status: 400 });

    // Обновим просроки
    await query('SELECT expire_transfer_seat_holds()');

    const holdRes = await query<{ schedule_id: string; requested_seats: number; status: string }>(
      'SELECT schedule_id, requested_seats, status FROM transfer_seat_holds WHERE id = $1',
      [holdId]
    );
    if (!holdRes.rowCount) return NextResponse.json({ success: false, error: 'hold не найден' }, { status: 404 });
    const hold = holdRes.rows[0];
    if (hold.status !== 'held') return NextResponse.json({ success: false, error: 'hold не активен' }, { status: 409 });

    // Декремент мест в расписании и пометка hold как consumed в одной транзакции
    const decRes = await query(
      `WITH dec AS (
         UPDATE transfer_schedules
         SET available_seats = available_seats - $1
         WHERE id = $2 AND available_seats >= $1
         RETURNING id
       ), upd AS (
         UPDATE transfer_seat_holds SET status = 'consumed', updated_at = NOW()
         WHERE id = $3 AND status = 'held'
         RETURNING id
       )
       SELECT (SELECT COUNT(*) FROM dec) AS dec_count, (SELECT COUNT(*) FROM upd) AS upd_count` ,
      [hold.requested_seats, hold.schedule_id, holdId]
    );

    const row = (decRes as any).rows?.[0];
    if (!row || Number(row.dec_count) !== 1 || Number(row.upd_count) !== 1) {
      return NextResponse.json({ success: false, error: 'Не удалось подтвердить hold' }, { status: 409 });
    }

    return NextResponse.json({ success: true, data: { holdId, status: 'consumed' } });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Server error' }, { status: 500 });
  }
}
