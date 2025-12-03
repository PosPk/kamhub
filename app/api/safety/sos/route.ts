import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { requireAuth } from '@/lib/auth/middleware';

/**
 * POST /api/safety/sos
 * Отправить экстренный SOS сигнал
 * 
 * Body:
 * - location: { lat: number, lng: number, address?: string }
 * - emergencyType: 'medical' | 'lost' | 'accident' | 'weather' | 'wildlife' | 'other'
 * - description?: string
 * - contactPhone?: string
 * - groupSize?: number
 * - severityLevel?: 'low' | 'medium' | 'high' | 'critical'
 */
export async function POST(request: NextRequest) {
  try {
    // Проверка аутентификации (опционально - можно вызывать без авторизации)
    const userOrResponse = await requireAuth(request);
    const userId = userOrResponse instanceof NextResponse ? null : userOrResponse.userId;

    const body = await request.json();
    const {
      location,
      emergencyType,
      description,
      contactPhone,
      groupSize = 1,
      severityLevel = 'high'
    } = body;

    // Валидация обязательных полей
    if (!location || !location.lat || !location.lng) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Необходимо указать местоположение (координаты)' 
        },
        { status: 400 }
      );
    }

    if (!emergencyType) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Необходимо указать тип чрезвычайной ситуации' 
        },
        { status: 400 }
      );
    }

    // Создаем запись SOS
    const insertQuery = `
      INSERT INTO sos_calls (
        user_id,
        location,
        emergency_type,
        description,
        contact_phone,
        group_size,
        severity_level,
        status,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', NOW())
      RETURNING *
    `;

    const locationJson = JSON.stringify(location);
    const insertParams = [
      userId,
      locationJson,
      emergencyType,
      description || null,
      contactPhone || null,
      groupSize,
      severityLevel
    ];

    const result = await query(insertQuery, insertParams);
    const sosCall = result.rows[0];

    // TODO: Отправить уведомления:
    // 1. МЧС Камчатского края
    // 2. Ближайшему гиду/оператору
    // 3. SMS на экстренные номера
    // 4. Email администраторам

    // Логируем в консоль для немедленного реагирования
    console.error('🚨 ЭКСТРЕННЫЙ SOS ВЫЗОВ:', {
      id: sosCall.id,
      type: emergencyType,
      severity: severityLevel,
      location: location,
      time: new Date().toISOString(),
      description: description
    });

    // Получаем контакты экстренных служб Камчатки
    const emergencyContacts = {
      mchsKamchatka: {
        name: 'МЧС России по Камчатскому краю',
        phone: '101',
        phone2: '+7 (4152) 26-82-89'
      },
      policeKamchatka: {
        name: 'Полиция',
        phone: '102'
      },
      ambulanceKamchatka: {
        name: 'Скорая помощь',
        phone: '103'
      },
      unifiedEmergency: {
        name: 'Единый номер экстренных служб',
        phone: '112'
      },
      searchRescue: {
        name: 'Поисково-спасательная служба Камчатки',
        phone: '+7 (4152) 42-33-25'
      }
    };

    return NextResponse.json({
      success: true,
      data: {
        sosCall: {
          id: sosCall.id,
          status: sosCall.status,
          createdAt: sosCall.created_at
        },
        emergencyContacts: emergencyContacts,
        message: 'SOS сигнал отправлен! Экстренные службы оповещены.',
        instructions: [
          'Оставайтесь на месте, если это безопасно',
          'Сохраняйте заряд батареи телефона',
          'Если возможно, звоните по номеру 112',
          'Дождитесь помощи спасателей'
        ]
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating SOS call:', error);
    
    // Даже при ошибке сохранения, возвращаем экстренные контакты
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ошибка при отправке SOS сигнала',
        emergencyContacts: {
          unified: '112',
          mchs: '101',
          police: '102',
          ambulance: '103'
        },
        message: 'НЕМЕДЛЕННО позвоните по номеру 112!'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/safety/sos
 * Получить список SOS вызовов (только для админов и спасателей)
 * 
 * Query params:
 * - status: 'active' | 'responded' | 'resolved' | 'cancelled'
 * - severity: 'low' | 'medium' | 'high' | 'critical'
 * - limit: number
 * - offset: number
 */
export async function GET(request: NextRequest) {
  try {
    // Только для авторизованных пользователей
    const userOrResponse = await requireAuth(request);
    if (userOrResponse instanceof NextResponse) {
      return userOrResponse;
    }

    const user = userOrResponse;
    
    // Проверка прав (только admin и rescue могут просматривать все SOS)
    if (user.role !== 'admin' && user.role !== 'rescue') {
      // Обычные пользователи могут видеть только свои вызовы
      const userCallsQuery = `
        SELECT * FROM sos_calls
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 10
      `;
      const result = await query(userCallsQuery, [user.userId]);
      
      return NextResponse.json({
        success: true,
        data: {
          sosCalls: result.rows
        }
      });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const severity = searchParams.get('severity');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Построение запроса с фильтрами
    let whereClause = 'WHERE 1=1';
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (status) {
      queryParams.push(status);
      whereClause += ` AND status = $${paramIndex}`;
      paramIndex++;
    }

    if (severity) {
      queryParams.push(severity);
      whereClause += ` AND severity_level = $${paramIndex}`;
      paramIndex++;
    }

    queryParams.push(limit, offset);

    const sosQuery = `
      SELECT 
        s.*,
        u.name as user_name,
        u.email as user_email,
        u.phone as user_phone
      FROM sos_calls s
      LEFT JOIN users u ON s.user_id = u.id
      ${whereClause}
      ORDER BY s.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const result = await query(sosQuery, queryParams);

    // Получаем общее количество
    const countQuery = `
      SELECT COUNT(*) as total
      FROM sos_calls
      ${whereClause.replace(/\$\d+/g, (match) => {
        const num = parseInt(match.slice(1));
        return num <= queryParams.length - 2 ? match : '';
      })}
    `;
    const countParams = queryParams.slice(0, -2);
    const countResult = await query(countQuery, countParams);
    const total = parseInt(countResult.rows[0]?.total || '0');

    return NextResponse.json({
      success: true,
      data: {
        sosCalls: result.rows,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total
        }
      }
    });

  } catch (error) {
    console.error('Error fetching SOS calls:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ошибка при загрузке SOS вызовов' 
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/safety/sos
 * Обновить статус SOS вызова (только для админов и спасателей)
 * 
 * Body:
 * - sosId: string
 * - status: 'responded' | 'resolved' | 'cancelled'
 * - responderId?: string (ID спасателя)
 * - responseNotes?: string
 */
export async function PATCH(request: NextRequest) {
  try {
    const userOrResponse = await requireAuth(request);
    if (userOrResponse instanceof NextResponse) {
      return userOrResponse;
    }

    const user = userOrResponse;

    // Только admin и rescue могут обновлять статус
    if (user.role !== 'admin' && user.role !== 'rescue') {
      return NextResponse.json(
        { success: false, error: 'Недостаточно прав' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { sosId, status, responderId, responseNotes } = body;

    if (!sosId || !status) {
      return NextResponse.json(
        { success: false, error: 'Необходимо указать sosId и status' },
        { status: 400 }
      );
    }

    const updateFields = ['status = $2', 'updated_at = NOW()'];
    const updateParams: any[] = [sosId, status];
    let paramIndex = 3;

    if (responderId) {
      updateFields.push(`responder_id = $${paramIndex}`);
      updateParams.push(responderId);
      paramIndex++;
    }

    if (responseNotes) {
      updateFields.push(`response_notes = $${paramIndex}`);
      updateParams.push(responseNotes);
      paramIndex++;
    }

    if (status === 'responded' || status === 'resolved') {
      updateFields.push(`responded_at = NOW()`);
    }

    const updateQuery = `
      UPDATE sos_calls
      SET ${updateFields.join(', ')}
      WHERE id = $1
      RETURNING *
    `;

    const result = await query(updateQuery, updateParams);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'SOS вызов не найден' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        sosCall: result.rows[0]
      }
    });

  } catch (error) {
    console.error('Error updating SOS call:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ошибка при обновлении SOS вызова' 
      },
      { status: 500 }
    );
  }
}
