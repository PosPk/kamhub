import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const routes = Array.isArray(body.routes) ? body.routes : [];
    const vehicles = Array.isArray(body.vehicles) ? body.vehicles : [];
    const drivers = Array.isArray(body.drivers) ? body.drivers : [];
    const schedules = Array.isArray(body.schedules) ? body.schedules : [];

    let created = { routes: 0, vehicles: 0, drivers: 0, schedules: 0 };

    // Транзакция на уровне соединения: простая последовательная вставка
    for (const r of routes) {
      const fx = Number(r.fromCoordinates?.lng);
      const fy = Number(r.fromCoordinates?.lat);
      const tx = Number(r.toCoordinates?.lng);
      const ty = Number(r.toCoordinates?.lat);
      if ([fx, fy, tx, ty].some((v) => Number.isNaN(v))) continue;
      await query(
        `INSERT INTO transfer_routes (name, from_location, to_location, from_coordinates, to_coordinates, distance_km, estimated_duration_minutes, is_active)
         VALUES ($1,$2,$3,POINT($4,$5),POINT($6,$7),$8,$9,$10) ON CONFLICT DO NOTHING`,
        [
          r.name,
          r.fromLocation,
          r.toLocation,
          fx,
          fy,
          tx,
          ty,
          r.distanceKm ?? null,
          r.estimatedDurationMinutes ?? null,
          r.isActive ?? true,
        ]
      );
      created.routes++;
    }

    for (const v of vehicles) {
      await query(
        `INSERT INTO transfer_vehicles (operator_id, vehicle_type, make, model, year, capacity, features, license_plate, is_active)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT DO NOTHING`,
        [
          v.operatorId,
          v.vehicleType,
          v.make,
          v.model,
          v.year ?? null,
          v.capacity,
          Array.isArray(v.features) ? v.features : null,
          v.licensePlate ?? null,
          v.isActive ?? true,
        ]
      );
      created.vehicles++;
    }

    for (const d of drivers) {
      await query(
        `INSERT INTO transfer_drivers (operator_id, name, phone, email, license_number, languages, rating, total_trips, is_active)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT DO NOTHING`,
        [
          d.operatorId,
          d.name,
          d.phone,
          d.email ?? null,
          d.licenseNumber ?? null,
          Array.isArray(d.languages) ? d.languages : null,
          d.rating ?? null,
          d.totalTrips ?? 0,
          d.isActive ?? true,
        ]
      );
      created.drivers++;
    }

    for (const s of schedules) {
      await query(
        `INSERT INTO transfer_schedules (route_id, vehicle_id, driver_id, departure_time, arrival_time, price_per_person, available_seats, is_active)
         VALUES ($1,$2,$3,$4::time,$5::time,$6,$7,$8) ON CONFLICT DO NOTHING`,
        [
          s.routeId,
          s.vehicleId,
          s.driverId,
          s.departureTime,
          s.arrivalTime,
          s.pricePerPerson,
          s.availableSeats,
          s.isActive ?? true,
        ]
      );
      created.schedules++;
    }

    return NextResponse.json({ success: true, summary: created });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Server error' }, { status: 500 });
  }
}
