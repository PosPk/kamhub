import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const result = await query(`
      SELECT * FROM souvenir_orders 
      ORDER BY created_at DESC 
      LIMIT 50
    `);

    return NextResponse.json({
      success: true,
      data: { orders: result.rows }
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
    const { customerInfo, items, shippingMethod, paymentMethod } = body;

    const orderNumber = `ORD-${Date.now()}`;
    const subtotal = items.reduce((sum: number, item: any) => 
      sum + item.totalPrice, 0
    );

    const result = await query(`
      INSERT INTO souvenir_orders (
        id, order_number, customer_info, pricing, 
        status, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, 'pending', NOW(), NOW()
      ) RETURNING id
    `, [
      orderNumber,
      JSON.stringify(customerInfo),
      JSON.stringify({ subtotal, total: subtotal })
    ]);

    return NextResponse.json({
      success: true,
      data: { orderId: result.rows[0].id, orderNumber },
      message: 'Заказ создан'
    } as ApiResponse<any>);
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Ошибка'
    } as ApiResponse<null>, { status: 500 });
  }
}

