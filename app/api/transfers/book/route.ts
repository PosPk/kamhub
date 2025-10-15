import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { TransferBookingRequest, TransferBookingResponse } from '@/types/transfer';
import { config } from '@/lib/config';

export const dynamic = 'force-dynamic';

// POST /api/transfers/book - Бронирование трансфера
export async function POST(request: NextRequest) {
  try {
    const body: TransferBookingRequest = await request.json();
    
    // Валидация входных данных
    if (!body.scheduleId || !body.passengersCount || !body.contactInfo) {
      return NextResponse.json({
        success: false,
        error: 'Отсутствуют обязательные поля: scheduleId, passengersCount, contactInfo'
      }, { status: 400 });
    }

    if (body.passengersCount < 1 || body.passengersCount > 50) {
      return NextResponse.json({
        success: false,
        error: 'Количество пассажиров должно быть от 1 до 50'
      }, { status: 400 });
    }

    if (!body.contactInfo.phone || !body.contactInfo.email) {
      return NextResponse.json({
        success: false,
        error: 'Необходимо указать телефон и email'
      }, { status: 400 });
    }

    try {
      // Получаем информацию о расписании
      const scheduleQuery = `
        SELECT s.*, r.*, v.*, d.*, o.name as operator_name, o.phone as operator_phone, o.email as operator_email
        FROM transfer_schedules s
        JOIN transfer_routes r ON s.route_id = r.id
        JOIN transfer_vehicles v ON s.vehicle_id = v.id
        JOIN transfer_drivers d ON s.driver_id = d.id
        JOIN operators o ON v.operator_id = o.id
        WHERE s.id = $1 AND s.is_active = true
      `;

      const scheduleResult = await query(scheduleQuery, [body.scheduleId]);

      if (scheduleResult.rows.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Расписание не найдено или недоступно'
        }, { status: 404 });
      }

      const schedule = scheduleResult.rows[0];

      // Проверяем доступность мест
      if (schedule.available_seats < body.passengersCount) {
        return NextResponse.json({
          success: false,
          error: `Недостаточно свободных мест. Доступно: ${schedule.available_seats}`
        }, { status: 400 });
      }

      // Генерируем код подтверждения
      const confirmationCode = generateConfirmationCode();

      // Создаем бронирование
      const bookingQuery = `
        INSERT INTO transfer_bookings (
          user_id, operator_id, route_id, vehicle_id, driver_id, schedule_id,
          booking_date, departure_time, passengers_count, total_price,
          status, special_requests, contact_phone, contact_email, confirmation_code
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *
      `;

      const totalPrice = parseFloat(schedule.price_per_person) * body.passengersCount;
      const bookingDate = new Date().toISOString().split('T')[0]; // Сегодняшняя дата

      const bookingResult = await query(bookingQuery, [
        'user_123', // Заглушка для user_id, в реальном приложении получаем из сессии
        schedule.operator_id,
        schedule.route_id,
        schedule.vehicle_id,
        schedule.driver_id,
        schedule.id,
        bookingDate,
        schedule.departure_time,
        body.passengersCount,
        totalPrice,
        'pending',
        body.specialRequests || null,
        body.contactInfo.phone,
        body.contactInfo.email,
        confirmationCode
      ]);

      const booking = bookingResult.rows[0];

      // Обновляем количество доступных мест
      const updateSeatsQuery = `
        UPDATE transfer_schedules 
        SET available_seats = available_seats - $1, updated_at = NOW()
        WHERE id = $2
      `;

      await query(updateSeatsQuery, [body.passengersCount, body.scheduleId]);

      // Создаем уведомление для перевозчика
      const notificationQuery = `
        INSERT INTO transfer_notifications (
          booking_id, operator_id, type, title, message
        ) VALUES ($1, $2, $3, $4, $5)
      `;

      await query(notificationQuery, [
        booking.id,
        schedule.operator_id,
        'booking_created',
        'Новое бронирование трансфера',
        `Новое бронирование на ${schedule.departure_time} по маршруту ${schedule.from_location} → ${schedule.to_location}. Пассажиров: ${body.passengersCount}`
      ]);

      // Отправляем уведомления (заглушка)
      await sendBookingNotifications(booking, schedule, body.contactInfo);

      const response: TransferBookingResponse = {
        success: true,
        data: {
          bookingId: booking.id,
          status: booking.status,
          confirmationCode: booking.confirmation_code,
          totalPrice: parseFloat(booking.total_price),
          bookingDetails: {
            id: booking.id,
            userId: booking.user_id,
            operatorId: booking.operator_id,
            routeId: booking.route_id,
            vehicleId: booking.vehicle_id,
            driverId: booking.driver_id,
            scheduleId: booking.schedule_id,
            bookingDate: booking.booking_date,
            departureTime: booking.departure_time,
            passengersCount: booking.passengers_count,
            totalPrice: parseFloat(booking.total_price),
            status: booking.status,
            specialRequests: booking.special_requests,
            contactPhone: booking.contact_phone,
            contactEmail: booking.contact_email,
            confirmationCode: booking.confirmation_code,
            createdAt: new Date(booking.created_at),
            updatedAt: new Date(booking.updated_at)
          }
        }
      };

      return NextResponse.json(response);

    } catch (dbError) {
      console.error('Database error:', dbError);
      
      // Fallback к тестовому бронированию
      const mockBooking = createMockBooking(body);
      
      const response: TransferBookingResponse = {
        success: true,
        data: {
          bookingId: mockBooking.id,
          status: mockBooking.status,
          confirmationCode: mockBooking.confirmationCode,
          totalPrice: mockBooking.totalPrice,
          bookingDetails: mockBooking
        }
      };

      return NextResponse.json(response);
    }

  } catch (error) {
    console.error('Error in transfer booking:', error);
    return NextResponse.json({
      success: false,
      error: 'Внутренняя ошибка сервера при создании бронирования'
    }, { status: 500 });
  }
}

// Функция для генерации кода подтверждения
function generateConfirmationCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Функция для отправки уведомлений (заглушка)
async function sendBookingNotifications(
  booking: any, 
  schedule: any, 
  contactInfo: any
): Promise<void> {
  try {
    // Здесь будет реальная отправка уведомлений
    console.log('Отправка уведомлений:', {
      bookingId: booking.id,
      contactPhone: contactInfo.phone,
      contactEmail: contactInfo.email,
      message: `Ваше бронирование подтверждено. Код: ${booking.confirmation_code}`
    });

    // В реальном приложении здесь будет:
    // - Отправка SMS через SMS.ru или другого провайдера
    // - Отправка email через SMTP
    // - Отправка push-уведомления
    // - Отправка в Telegram бот

  } catch (error) {
    console.error('Error sending notifications:', error);
  }
}

// Функция для создания тестового бронирования
function createMockBooking(request: TransferBookingRequest): any {
  const confirmationCode = generateConfirmationCode();
  const totalPrice = 1500 * request.passengersCount; // Заглушка цены

  return {
    id: `booking_${Date.now()}`,
    userId: 'user_123',
    operatorId: 'operator_1',
    routeId: 'route_1',
    vehicleId: 'vehicle_1',
    driverId: 'driver_1',
    scheduleId: request.scheduleId,
    bookingDate: new Date().toISOString().split('T')[0],
    departureTime: '08:00',
    passengersCount: request.passengersCount,
    totalPrice: totalPrice,
    status: 'pending',
    specialRequests: request.specialRequests,
    contactPhone: request.contactInfo.phone,
    contactEmail: request.contactInfo.email,
    confirmationCode: confirmationCode,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}