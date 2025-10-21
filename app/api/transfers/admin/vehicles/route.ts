import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      operatorId,
      vehicleType,
      make,
      model,
      year,
      capacity,
      features,
      licensePlate,
      isActive = true,
    } = body || {};

    if (!operatorId || !vehicleType || !make || !model || !capacity) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const text = `
      INSERT INTO transfer_vehicles
        (operator_id, vehicle_type, make, model, year, capacity, features, license_plate, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `;

    const res = await query(text, [
      operatorId,
      vehicleType,
      make,
      model,
      year ?? null,
      capacity,
      Array.isArray(features) ? features : null,
      licensePlate ?? null,
      Boolean(isActive),
    ]);

    return NextResponse.json({ success: true, id: res.rows[0]?.id });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Server error' }, { status: 500 });
  }
}
