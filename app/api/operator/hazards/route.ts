import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { getRequestRolesFromHeaders, requirePermission } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const roles = getRequestRolesFromHeaders(request.headers);
    requirePermission(roles, 'manage_tours');

    const operatorId = request.headers.get('x-operator-id');
    const result = await query(
      `SELECT * FROM hazard_zones WHERE ($1::uuid IS NULL OR operator_id = $1)
       ORDER BY created_at DESC`,
      [operatorId]
    );
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Internal error' }, { status: error?.statusCode || 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const roles = getRequestRolesFromHeaders(request.headers);
    requirePermission(roles, 'manage_tours');

    const body = await request.json();
    const { operatorId, type, severity, area, validFrom, validTo, notes } = body || {};
    if (!type || !area) return NextResponse.json({ success: false, error: 'type, area required' }, { status: 400 });

    const inserted = await query(
      `INSERT INTO hazard_zones (operator_id, type, severity, area, valid_from, valid_to, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
      [operatorId || null, type, severity || 'medium', JSON.stringify(area), validFrom || null, validTo || null, notes || null]
    );
    return NextResponse.json({ success: true, data: { id: inserted.rows[0].id } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Internal error' }, { status: error?.statusCode || 500 });
  }
}
