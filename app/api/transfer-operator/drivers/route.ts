import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { ApiResponse, Driver, DriverFormData } from '@/types';
import { requireTransferOperator } from '@/lib/auth/middleware';

export const dynamic = 'force-dynamic';

/**
 * GET /api/transfer-operator/drivers - Получить список водителей
 */
export async function GET(request: NextRequest) {
  try {
    const userOrResponse = await requireTransferOperator(request);
    if (userOrResponse instanceof NextResponse) return userOrResponse;
    
    const operatorId = userOrResponse.userId;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const limit = parseInt(searchParams.get('limit') || '50');

    let whereClause = 'WHERE operator_id = $1';
    const params = [operatorId];

    if (status !== 'all') {
      whereClause += ` AND status = $${params.length + 1}`;
      params.push(status);
    }

    const driversQuery = `
      SELECT
        id,
        first_name,
        last_name,
        phone,
        email,
        license_number,
        license_expiry,
        experience,
        languages,
        rating,
        total_trips,
        status,
        vehicle_id,
        emergency_contact,
        created_at,
        updated_at
      FROM drivers
      ${whereClause}
      ORDER BY rating DESC, total_trips DESC
      LIMIT $${params.length + 1}
    `;

    params.push(limit);
    const driversResult = await query(driversQuery, params);

    const drivers: Driver[] = driversResult.rows.map(row => {
      const emergencyContact = JSON.parse(row.emergency_contact || '{}');
      return {
        id: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        phone: row.phone,
        email: row.email,
        licenseNumber: row.license_number,
        licenseExpiry: row.license_expiry,
        experience: row.experience,
        languages: JSON.parse(row.languages || '[]'),
        rating: parseFloat(row.rating),
        totalTrips: parseInt(row.total_trips),
        status: row.status,
        vehicleId: row.vehicle_id,
        documents: [], // TODO: загрузить документы
        emergencyContact: {
          name: emergencyContact.name || '',
          phone: emergencyContact.phone || '',
          relation: emergencyContact.relation || ''
        },
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        drivers,
        total: drivers.length
      }
    } as ApiResponse<any>);

  } catch (error) {
    console.error('Error fetching drivers:', error);
    return NextResponse.json({
      success: false,
      error: 'Ошибка при получении списка водителей'
    } as ApiResponse<null>, { status: 500 });
  }
}

/**
 * POST /api/transfer-operator/drivers - Создать нового водителя
 */
export async function POST(request: NextRequest) {
  try {
    const userOrResponse = await requireTransferOperator(request);
    if (userOrResponse instanceof NextResponse) return userOrResponse;
    
    const operatorId = userOrResponse.userId;

    const body: DriverFormData = await request.json();
    const {
      firstName,
      lastName,
      phone,
      email,
      licenseNumber,
      licenseExpiry,
      experience,
      languages,
      vehicleId,
      emergencyContact
    } = body;

    if (!firstName || !lastName || !phone || !licenseNumber || !licenseExpiry) {
      return NextResponse.json({
        success: false,
        error: 'Необходимо указать имя, фамилию, телефон, номер лицензии и срок действия'
      } as ApiResponse<null>, { status: 400 });
    }

    // Проверяем уникальность номера телефона и email
    const existingDriverQuery = `
      SELECT id FROM drivers WHERE phone = $1 OR email = $2
    `;

    const existingResult = await query(existingDriverQuery, [phone, email || '']);
    if (existingResult.rows.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Водитель с таким телефоном или email уже существует'
      } as ApiResponse<null>, { status: 400 });
    }

    // Создаем водителя
    const createDriverQuery = `
      INSERT INTO drivers (
        id,
        operator_id,
        first_name,
        last_name,
        phone,
        email,
        license_number,
        license_expiry,
        experience,
        languages,
        rating,
        total_trips,
        status,
        vehicle_id,
        emergency_contact,
        created_at,
        updated_at
      ) VALUES (
        gen_random_uuid(),
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW()
      )
      RETURNING id, created_at
    `;

    const driverResult = await query(createDriverQuery, [
      operatorId,
      firstName,
      lastName,
      phone,
      email || null,
      licenseNumber,
      licenseExpiry,
      experience || 0,
      JSON.stringify(languages || []),
      5.0, // начальный рейтинг
      0, // total_trips
      'active', // status
      vehicleId || null,
      JSON.stringify(emergencyContact || {})
    ]);

    const newDriver = driverResult.rows[0];

    return NextResponse.json({
      success: true,
      data: {
        driverId: newDriver.id,
        createdAt: newDriver.created_at
      },
      message: 'Водитель успешно создан'
    } as ApiResponse<any>);

  } catch (error) {
    console.error('Error creating driver:', error);
    return NextResponse.json({
      success: false,
      error: 'Ошибка при создании водителя'
    } as ApiResponse<null>, { status: 500 });
  }
}
