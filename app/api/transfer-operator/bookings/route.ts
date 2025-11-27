import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { requireRole } from '@/lib/auth/middleware';

/**
 * GET /api/transfer-operator/bookings
 * Получить список бронирований трансферов для оператора
 * 
 * Query params:
 * - status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
 * - date: YYYY-MM-DD (фильтр по дате)
 * - limit: number (по умолчанию 50)
 * - offset: number (по умолчанию 0)
 */
export async function GET(request: NextRequest) {
  try {
    // Проверка аутентификации
    const userOrResponse = await requireRole(request, ['transfer_operator', 'admin']);
    if (userOrResponse instanceof NextResponse) {
      return userOrResponse;
    }

    const operatorId = userOrResponse.userId;
    const { searchParams } = new URL(request.url);
    
    const status = searchParams.get('status');
    const date = searchParams.get('date');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Построение SQL запроса с фильтрами
    let whereClause = 'WHERE tb.operator_id = $1';
    const queryParams: any[] = [operatorId];
    let paramIndex = 2;

    if (status) {
      queryParams.push(status);
      whereClause += ` AND tb.status = $${paramIndex}`;
      paramIndex++;
    }

    if (date) {
      queryParams.push(date);
      whereClause += ` AND tb.departure_date = $${paramIndex}`;
      paramIndex++;
    }

    queryParams.push(limit, offset);

    const bookingsQuery = `
      SELECT 
        tb.id,
        tb.departure_date,
        tb.departure_time,
        tb.passengers,
        tb.total_price,
        tb.status,
        tb.payment_status,
        tb.special_requirements,
        tb.created_at,
        u.id as user_id,
        u.name as user_name,
        u.email as user_email,
        tr.from_location,
        tr.to_location,
        tr.distance_km,
        tr.estimated_duration,
        d.id as driver_id,
        d.first_name as driver_first_name,
        d.last_name as driver_last_name,
        d.phone as driver_phone,
        v.id as vehicle_id,
        v.make as vehicle_make,
        v.model as vehicle_model,
        v.license_plate
      FROM transfer_bookings tb
      LEFT JOIN users u ON tb.user_id = u.id
      LEFT JOIN transfer_routes tr ON tb.route_id = tr.id
      LEFT JOIN drivers d ON tb.driver_id = d.id
      LEFT JOIN vehicles v ON tb.vehicle_id = v.id
      ${whereClause}
      ORDER BY tb.departure_date DESC, tb.departure_time DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const result = await query(bookingsQuery, queryParams);

    // Получаем общее количество
    const countQuery = `
      SELECT COUNT(*) as total
      FROM transfer_bookings tb
      ${whereClause.replace(/\$\d+/g, (match) => {
        const num = parseInt(match.slice(1));
        return num <= queryParams.length - 2 ? match : '';
      })}
    `;
    const countParams = queryParams.slice(0, -2);
    const countResult = await query(countQuery, countParams);
    const total = parseInt(countResult.rows[0]?.total || '0');

    const bookings = result.rows.map(row => ({
      id: row.id,
      departure: {
        date: row.departure_date,
        time: row.departure_time
      },
      route: {
        from: row.from_location,
        to: row.to_location,
        distance: row.distance_km,
        duration: row.estimated_duration
      },
      passenger: {
        id: row.user_id,
        name: row.user_name,
        email: row.user_email,
        count: row.passengers
      },
      driver: row.driver_id ? {
        id: row.driver_id,
        name: `${row.driver_first_name} ${row.driver_last_name}`,
        phone: row.driver_phone
      } : null,
      vehicle: row.vehicle_id ? {
        id: row.vehicle_id,
        make: row.vehicle_make,
        model: row.vehicle_model,
        licensePlate: row.license_plate
      } : null,
      price: parseFloat(row.total_price),
      status: row.status,
      paymentStatus: row.payment_status,
      specialRequirements: row.special_requirements,
      createdAt: row.created_at
    }));

    return NextResponse.json({
      success: true,
      data: {
        bookings,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total
        }
      }
    });

  } catch (error) {
    console.error('Error fetching transfer bookings:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ошибка при загрузке бронирований' 
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/transfer-operator/bookings
 * Обновить статус бронирования
 * 
 * Body:
 * - bookingId: string
 * - status: 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
 * - driverId?: string (назначить водителя)
 * - vehicleId?: string (назначить транспорт)
 * - notes?: string (заметки)
 */
export async function PATCH(request: NextRequest) {
  try {
    // Проверка аутентификации
    const userOrResponse = await requireRole(request, ['transfer_operator', 'admin']);
    if (userOrResponse instanceof NextResponse) {
      return userOrResponse;
    }

    const operatorId = userOrResponse.userId;
    const body = await request.json();
    const { bookingId, status, driverId, vehicleId, notes } = body;

    if (!bookingId || !status) {
      return NextResponse.json(
        { success: false, error: 'Необходимо указать bookingId и status' },
        { status: 400 }
      );
    }

    // Проверяем, что бронирование принадлежит этому оператору
    const checkQuery = `
      SELECT id FROM transfer_bookings
      WHERE id = $1 AND operator_id = $2
    `;
    const checkResult = await query(checkQuery, [bookingId, operatorId]);

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Бронирование не найдено' },
        { status: 404 }
      );
    }

    // Обновляем бронирование
    const updateFields = ['status = $3', 'updated_at = NOW()'];
    const updateParams: any[] = [bookingId, operatorId, status];
    let paramIndex = 4;

    if (driverId !== undefined) {
      updateFields.push(`driver_id = $${paramIndex}`);
      updateParams.push(driverId);
      paramIndex++;
    }

    if (vehicleId !== undefined) {
      updateFields.push(`vehicle_id = $${paramIndex}`);
      updateParams.push(vehicleId);
      paramIndex++;
    }

    if (notes !== undefined) {
      updateFields.push(`notes = $${paramIndex}`);
      updateParams.push(notes);
      paramIndex++;
    }

    const updateQuery = `
      UPDATE transfer_bookings
      SET ${updateFields.join(', ')}
      WHERE id = $1 AND operator_id = $2
      RETURNING *
    `;

    const result = await query(updateQuery, updateParams);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Не удалось обновить бронирование' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        booking: result.rows[0]
      }
    });

  } catch (error) {
    console.error('Error updating transfer booking:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ошибка при обновлении бронирования' 
      },
      { status: 500 }
    );
  }
}
