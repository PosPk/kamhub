import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { getRequestRolesFromHeaders, requirePermission } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const roles = getRequestRolesFromHeaders(request.headers);
    requirePermission(roles, 'manage_notifications');

    const body = await request.json();
    const { operatorId, routeId, type, payload, priority, channels } = body || {};
    if (!operatorId || !type) return NextResponse.json({ success: false, error: 'operatorId, type required' }, { status: 400 });

    const inserted = await query(
      `INSERT INTO alerts (operator_id, route_id, type, payload, priority)
       VALUES ($1,$2,$3,$4,$5) RETURNING id`,
      [operatorId, routeId || null, type, JSON.stringify(payload || {}), priority || 'normal']
    );
    const alertId = inserted.rows[0].id;

    // Планируем доставки по каналам
    if (Array.isArray(channels) && channels.length > 0) {
      const values: any[] = [];
      const rows = channels.map((ch: string, i: number) => {
        values.push(alertId, ch);
        const idx = i * 2;
        return `($${idx + 1}, $${idx + 2})`;
      }).join(',');
      await query(`INSERT INTO alert_deliveries (alert_id, channel) VALUES ${rows}`, values);
    }

    return NextResponse.json({ success: true, data: { id: alertId } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Internal error' }, { status: error?.statusCode || 500 });
  }
}
