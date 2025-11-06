import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const result = await query(`
      SELECT * FROM gear_rentals 
      ORDER BY created_at DESC 
      LIMIT 50
    `);

    return NextResponse.json({
      success: true,
      data: { rentals: result.rows }
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
    const { customerInfo, items, startDate, endDate } = body;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    let rentalCost = 0;
    for (const item of items) {
      const gear = await query('SELECT price_per_day FROM gear_items WHERE id = $1', [item.gearId]);
      rentalCost += parseFloat(gear.rows[0].price_per_day) * item.quantity * totalDays;
    }

    const result = await query(`
      INSERT INTO gear_rentals (
        id, customer_info, start_date, end_date, total_days,
        rental_cost, status, created_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, 'pending', NOW()
      ) RETURNING id
    `, [JSON.stringify(customerInfo), startDate, endDate, totalDays, rentalCost]);

    return NextResponse.json({
      success: true,
      data: { rentalId: result.rows[0].id },
      message: 'Бронирование создано'
    } as ApiResponse<any>);
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Ошибка'
    } as ApiResponse<null>, { status: 500 });
  }
}

