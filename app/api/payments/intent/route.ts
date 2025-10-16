import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { ApiResponse } from '@/types';
import { getRequestRolesFromHeaders, requirePermission } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

// POST /api/payments/intent - создание PaymentIntent (заглушка интеграции)
export async function POST(request: NextRequest) {
  try {
    const roles = getRequestRolesFromHeaders(request.headers);
    requirePermission(roles, 'payments');

    const body = await request.json();
    const { bookingId, amount, currency, idempotencyKey, provider, metadata } = body || {};

    if (!bookingId || !amount || !currency) {
      return NextResponse.json({ success: false, error: 'bookingId, amount, currency required' } as ApiResponse<null>, { status: 400 });
    }

    const idem = idempotencyKey || `pi_${bookingId}_${amount}_${currency}`;

    // Идемпотентно создаем/находим intent
    const upsert = await query(
      `INSERT INTO payment_intents (booking_id, provider, amount, currency, status, idempotency_key, metadata)
       VALUES ($1, $2, $3, $4, 'created', $5, $6)
       ON CONFLICT (idempotency_key) DO UPDATE SET amount = EXCLUDED.amount
       RETURNING *`,
      [bookingId, provider || 'cloudpayments', amount, currency, idem, JSON.stringify(metadata || {})]
    );

    const intent = upsert.rows[0];

    // Заглушка редиректа на оплату
    const redirectUrl = `https://pay.example.com/mock?pi=${intent.id}`;

    return NextResponse.json({ success: true, data: { intent, redirectUrl } } as ApiResponse<any>);
  } catch (error: any) {
    const status = error?.statusCode || 500;
    return NextResponse.json({ success: false, error: error?.message || 'Internal error' } as ApiResponse<null>, { status });
  }
}
