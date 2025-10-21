import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      routeId,
      vehicleId,
      driverId,
      departureTime,
      arrivalTime,
      pricePerPerson,
      availableSeats,
      isActive = true,
    } = body || {};

    if (!routeId || !vehicleId || !driverId || !departureTime || !arrivalTime || !pricePerPerson || availableSeats == null) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const text = `
      INSERT INTO transfer_schedules
        (route_id, vehicle_id, driver_id, departure_time, arrival_time, price_per_person, available_seats, is_active)
      VALUES ($1, $2, $3, $4::time, $5::time, $6, $7, $8)
      RETURNING id
    `;

    const res = await query(text, [
      routeId,
      vehicleId,
      driverId,
      departureTime,
      arrivalTime,
      pricePerPerson,
      availableSeats,
      Boolean(isActive),
    ]);

    return NextResponse.json({ success: true, id: res.rows[0]?.id });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Server error' }, { status: 500 });
  }
}
