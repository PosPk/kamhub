import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      operatorId,
      name,
      phone,
      email,
      licenseNumber,
      languages,
      rating,
      totalTrips,
      isActive = true,
    } = body || {};

    if (!operatorId || !name || !phone) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const text = `
      INSERT INTO transfer_drivers
        (operator_id, name, phone, email, license_number, languages, rating, total_trips, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `;

    const res = await query(text, [
      operatorId,
      name,
      phone,
      email ?? null,
      licenseNumber ?? null,
      Array.isArray(languages) ? languages : null,
      rating ?? null,
      totalTrips ?? 0,
      Boolean(isActive),
    ]);

    return NextResponse.json({ success: true, id: res.rows[0]?.id });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Server error' }, { status: 500 });
  }
}
