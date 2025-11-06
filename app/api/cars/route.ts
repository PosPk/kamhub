import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const result = await query('SELECT * FROM cars WHERE is_active = true ORDER BY created_at DESC');
    return NextResponse.json({
      success: true,
      data: { cars: result.rows }
    } as ApiResponse<any>);
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Ошибка'
    } as ApiResponse<null>, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await query(`
      INSERT INTO cars (id, name, brand, price_per_day, is_active, created_at)
      VALUES (gen_random_uuid(), $1, $2, $3, true, NOW())
      RETURNING id
    `, [body.name, body.brand, body.pricePerDay]);

    return NextResponse.json({
      success: true,
      data: { carId: result.rows[0].id }
    } as ApiResponse<any>);
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Ошибка'
    } as ApiResponse<null>, { status: 500 });
  }
}

