import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      fromLocation,
      toLocation,
      fromCoordinates,
      toCoordinates,
      distanceKm,
      estimatedDurationMinutes,
      isActive = true,
    } = body || {};

    if (!name || !fromLocation || !toLocation || !fromCoordinates || !toCoordinates) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const fx = Number(fromCoordinates?.lng);
    const fy = Number(fromCoordinates?.lat);
    const tx = Number(toCoordinates?.lng);
    const ty = Number(toCoordinates?.lat);

    if ([fx, fy, tx, ty].some((v) => Number.isNaN(v))) {
      return NextResponse.json({ success: false, error: 'Invalid coordinates' }, { status: 400 });
    }

    const text = `
      INSERT INTO transfer_routes
        (name, from_location, to_location, from_coordinates, to_coordinates, distance_km, estimated_duration_minutes, is_active)
      VALUES ($1, $2, $3, POINT($4, $5), POINT($6, $7), $8, $9, $10)
      RETURNING id
    `;

    const res = await query(text, [
      name,
      fromLocation,
      toLocation,
      fx,
      fy,
      tx,
      ty,
      distanceKm ?? null,
      estimatedDurationMinutes ?? null,
      Boolean(isActive),
    ]);

    return NextResponse.json({ success: true, id: res.rows[0]?.id });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Server error' }, { status: 500 });
  }
}
