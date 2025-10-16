import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { getRequestRolesFromHeaders, requirePermission } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const roles = getRequestRolesFromHeaders(request.headers);
    // Позволяем и гидам и операторам
    if (!(roles.includes('guide') || roles.includes('operator') || roles.includes('admin'))) {
      const err: any = new Error('Forbidden');
      err.statusCode = 403;
      throw err;
    }

    const body = await request.json();
    const { entityType, entityId, location, altitudeM, speedKmh, batteryPercent, capturedAt } = body || {};
    if (!entityType || !entityId || !location || !capturedAt) {
      return NextResponse.json({ success: false, error: 'entityType, entityId, location, capturedAt required' }, { status: 400 });
    }

    await query(
      `INSERT INTO tracking_points (entity_type, entity_id, location, altitude_m, speed_kmh, battery_percent, captured_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [entityType, entityId, JSON.stringify(location), altitudeM || null, speedKmh || null, batteryPercent || null, capturedAt]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Internal error' }, { status: error?.statusCode || 500 });
  }
}
