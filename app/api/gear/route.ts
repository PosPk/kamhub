import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE is_active = true';
    const params: any[] = [];

    if (category) {
      whereClause += ` AND category = $${params.length + 1}`;
      params.push(category);
    }

    const gearQuery = `
      SELECT * FROM gear_items ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    
    params.push(limit, offset);
    const result = await query(gearQuery, params);

    return NextResponse.json({
      success: true,
      data: { gear: result.rows }
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
    const { name, category, pricePerDay, quantity } = body;

    const result = await query(`
      INSERT INTO gear_items (
        id, name, category, price_per_day, currency, 
        quantity, available_quantity, is_active, created_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, 'RUB', $4, $4, true, NOW()
      ) RETURNING id
    `, [name, category, pricePerDay, quantity]);

    return NextResponse.json({
      success: true,
      data: { gearId: result.rows[0].id }
    } as ApiResponse<any>);
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Ошибка'
    } as ApiResponse<null>, { status: 500 });
  }
}

