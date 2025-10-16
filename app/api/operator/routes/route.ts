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
      `SELECT r.*, COALESCE(json_agg(w.*) FILTER (WHERE w.id IS NOT NULL), '[]') AS waypoints
       FROM routes r
       LEFT JOIN waypoints w ON w.route_id = r.id
       WHERE ($1::uuid IS NULL OR r.operator_id = $1)
       GROUP BY r.id
       ORDER BY r.created_at DESC`,
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
    const { operatorId, name, difficulty, description, path, season, waypoints } = body || {};
    if (!operatorId || !name) return NextResponse.json({ success: false, error: 'operatorId, name required' }, { status: 400 });

    const insert = await query(
      `INSERT INTO routes (operator_id, name, difficulty, description, path, season)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
      [operatorId, name, difficulty || null, description || null, JSON.stringify(path || []), JSON.stringify(season || [])]
    );
    const routeId = insert.rows[0].id;

    if (Array.isArray(waypoints) && waypoints.length > 0) {
      const values: any[] = [];
      const rows = waypoints.map((wp: any, i: number) => {
        values.push(routeId, i + 1, JSON.stringify(wp.location || {}), wp.name || null, wp.notes || null);
        const idx = i * 5;
        return `($${idx + 1}, $${idx + 2}, $${idx + 3}, $${idx + 4}, $${idx + 5})`;
      }).join(',');
      await query(
        `INSERT INTO waypoints (route_id, seq, location, name, notes) VALUES ${rows}`,
        values
      );
    }

    return NextResponse.json({ success: true, data: { id: routeId } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Internal error' }, { status: error?.statusCode || 500 });
  }
}
