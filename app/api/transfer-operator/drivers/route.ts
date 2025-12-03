import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { requireRole } from '@/lib/auth/middleware';

/**
 * GET /api/transfer-operator/drivers
 * Получить список водителей трансфер-оператора
 * 
 * Query params:
 * - status: 'active' | 'inactive' | 'on_leave'
 * - date: YYYY-MM-DD (проверить доступность на дату)
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

    // Построение SQL запроса
    let whereClause = 'WHERE d.operator_id = $1';
    const queryParams: any[] = [operatorId];
    let paramIndex = 2;

    if (status) {
      queryParams.push(status);
      whereClause += ` AND d.status = $${paramIndex}`;
      paramIndex++;
    }

    queryParams.push(limit, offset);

    const driversQuery = `
      SELECT 
        d.id,
        d.first_name,
        d.last_name,
        d.phone,
        d.email,
        d.license_number,
        d.license_expiry,
        d.experience,
        d.languages,
        d.rating,
        d.total_trips,
        d.status,
        d.vehicle_id,
        d.emergency_contact,
        d.created_at,
        d.updated_at,
        v.make as vehicle_make,
        v.model as vehicle_model,
        v.license_plate as vehicle_license_plate,
        v.capacity as vehicle_capacity,
        COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'completed' AND t.pickup_date_time >= NOW() - INTERVAL '30 days') as trips_this_month
      FROM drivers d
      LEFT JOIN vehicles v ON d.vehicle_id = v.id
      LEFT JOIN transfers t ON d.id = t.driver_id
      ${whereClause}
      GROUP BY d.id, v.id
      ORDER BY d.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const result = await query(driversQuery, queryParams);

    // Если указана дата, проверяем доступность
    let driversWithAvailability = result.rows;
    if (date) {
      const availabilityQuery = `
        SELECT driver_id, COUNT(*) as scheduled_count
        FROM driver_schedules
        WHERE date = $1
        AND driver_id = ANY($2)
        GROUP BY driver_id
      `;
      const driverIds = result.rows.map(d => d.id);
      const availResult = await query(availabilityQuery, [date, driverIds]);
      
      const unavailableDrivers = new Set(availResult.rows.map(r => r.driver_id));
      
      driversWithAvailability = result.rows.map(driver => ({
        ...driver,
        availableOnDate: !unavailableDrivers.has(driver.id)
      }));
    }

    // Получаем общее количество
    const countQuery = `
      SELECT COUNT(*) as total
      FROM drivers d
      ${whereClause.replace(/\$\d+/g, (match) => {
        const num = parseInt(match.slice(1));
        return num <= queryParams.length - 2 ? match : '';
      })}
    `;
    const countParams = queryParams.slice(0, -2);
    const countResult = await query(countQuery, countParams);
    const total = parseInt(countResult.rows[0]?.total || '0');

    const drivers = driversWithAvailability.map(row => ({
      id: row.id,
      name: `${row.first_name} ${row.last_name}`,
      firstName: row.first_name,
      lastName: row.last_name,
      phone: row.phone,
      email: row.email,
      license: {
        number: row.license_number,
        expiry: row.license_expiry
      },
      experience: row.experience,
      languages: row.languages || [],
      rating: parseFloat(row.rating || '5.0'),
      totalTrips: row.total_trips,
      tripsThisMonth: parseInt(row.trips_this_month || '0'),
      status: row.status,
      vehicle: row.vehicle_id ? {
        id: row.vehicle_id,
        make: row.vehicle_make,
        model: row.vehicle_model,
        licensePlate: row.vehicle_license_plate,
        capacity: row.vehicle_capacity
      } : null,
      emergencyContact: row.emergency_contact,
      availableOnDate: row.availableOnDate,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    return NextResponse.json({
      success: true,
      data: {
        drivers,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total
        }
      }
    });

  } catch (error) {
    console.error('Error fetching drivers:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ошибка при загрузке списка водителей' 
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/transfer-operator/drivers
 * Добавить нового водителя
 * 
 * Body:
 * - firstName: string
 * - lastName: string
 * - phone: string
 * - email?: string
 * - licenseNumber: string
 * - licenseExpiry: string (YYYY-MM-DD)
 * - experience?: number (years)
 * - languages?: string[]
 * - vehicleId?: string
 * - emergencyContact?: { name, phone, relation }
 */
export async function POST(request: NextRequest) {
  try {
    // Проверка аутентификации
    const userOrResponse = await requireRole(request, ['transfer_operator', 'admin']);
    if (userOrResponse instanceof NextResponse) {
      return userOrResponse;
    }

    const operatorId = userOrResponse.userId;
    const body = await request.json();
    
    const {
      firstName,
      lastName,
      phone,
      email,
      licenseNumber,
      licenseExpiry,
      experience = 0,
      languages = [],
      vehicleId,
      emergencyContact
    } = body;

    // Валидация обязательных полей
    if (!firstName || !lastName || !phone || !licenseNumber || !licenseExpiry) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Необходимо заполнить все обязательные поля' 
        },
        { status: 400 }
      );
    }

    // Проверка уникальности номера лицензии
    const checkLicenseQuery = `
      SELECT id FROM drivers
      WHERE license_number = $1 AND operator_id = $2
    `;
    const checkResult = await query(checkLicenseQuery, [licenseNumber, operatorId]);

    if (checkResult.rows.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Водитель с таким номером лицензии уже существует' 
        },
        { status: 400 }
      );
    }

    // Вставка нового водителя
    const insertQuery = `
      INSERT INTO drivers (
        operator_id,
        first_name,
        last_name,
        phone,
        email,
        license_number,
        license_expiry,
        experience,
        languages,
        vehicle_id,
        emergency_contact,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'active')
      RETURNING *
    `;

    const insertParams = [
      operatorId,
      firstName,
      lastName,
      phone,
      email || null,
      licenseNumber,
      licenseExpiry,
      experience,
      JSON.stringify(languages),
      vehicleId || null,
      emergencyContact ? JSON.stringify(emergencyContact) : null
    ];

    const result = await query(insertQuery, insertParams);

    return NextResponse.json({
      success: true,
      data: {
        driver: result.rows[0]
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating driver:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ошибка при создании водителя' 
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/transfer-operator/drivers
 * Обновить информацию о водителе
 * 
 * Body:
 * - driverId: string
 * - status?: 'active' | 'inactive' | 'on_leave'
 * - vehicleId?: string
 * - phone?: string
 * - email?: string
 * - emergencyContact?: { name, phone, relation }
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
    const { driverId, status, vehicleId, phone, email, emergencyContact } = body;

    if (!driverId) {
      return NextResponse.json(
        { success: false, error: 'Необходимо указать driverId' },
        { status: 400 }
      );
    }

    // Проверяем, что водитель принадлежит этому оператору
    const checkQuery = `
      SELECT id FROM drivers
      WHERE id = $1 AND operator_id = $2
    `;
    const checkResult = await query(checkQuery, [driverId, operatorId]);

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Водитель не найден' },
        { status: 404 }
      );
    }

    // Обновляем водителя
    const updateFields: string[] = ['updated_at = NOW()'];
    const updateParams: any[] = [driverId, operatorId];
    let paramIndex = 3;

    if (status !== undefined) {
      updateFields.push(`status = $${paramIndex}`);
      updateParams.push(status);
      paramIndex++;
    }

    if (vehicleId !== undefined) {
      updateFields.push(`vehicle_id = $${paramIndex}`);
      updateParams.push(vehicleId);
      paramIndex++;
    }

    if (phone !== undefined) {
      updateFields.push(`phone = $${paramIndex}`);
      updateParams.push(phone);
      paramIndex++;
    }

    if (email !== undefined) {
      updateFields.push(`email = $${paramIndex}`);
      updateParams.push(email);
      paramIndex++;
    }

    if (emergencyContact !== undefined) {
      updateFields.push(`emergency_contact = $${paramIndex}`);
      updateParams.push(JSON.stringify(emergencyContact));
      paramIndex++;
    }

    const updateQuery = `
      UPDATE drivers
      SET ${updateFields.join(', ')}
      WHERE id = $1 AND operator_id = $2
      RETURNING *
    `;

    const result = await query(updateQuery, updateParams);

    return NextResponse.json({
      success: true,
      data: {
        driver: result.rows[0]
      }
    });

  } catch (error) {
    console.error('Error updating driver:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ошибка при обновлении водителя' 
      },
      { status: 500 }
    );
  }
}
