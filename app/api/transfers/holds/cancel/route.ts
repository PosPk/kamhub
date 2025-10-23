import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const holdId = body?.holdId as string;
    if (!holdId) return NextResponse.json({ success: false, error: 'holdId обязателен' }, { status: 400 });

    await query('SELECT expire_transfer_seat_holds()');

    const upd = await query(
      `UPDATE transfer_seat_holds SET status = 'cancelled', updated_at = NOW()
       WHERE id = $1 AND status = 'held'`,
      [holdId]
    );

    if (upd.rowCount !== 1) return NextResponse.json({ success: false, error: 'hold уже не активен' }, { status: 409 });

    return NextResponse.json({ success: true, data: { holdId, status: 'cancelled' } });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Server error' }, { status: 500 });
  }
}
