/**
 * 🔒 БЕЗОПАСНОЕ БРОНИРОВАНИЕ ТУРОВ
 * 
 * Решает проблему race conditions с помощью:
 * 1. PostgreSQL транзакций
 * 2. SELECT FOR UPDATE NOWAIT блокировок
 * 3. Атомарных операций
 * 
 * @author Cursor AI Agent
 * @date 2025-11-03
 * @critical Критически важный модуль - не изменять без review!
 * 
 * Архитектура основана на /lib/transfers/booking.ts (proven approach)
 */

import { PoolClient } from 'pg';
import { transaction, query as dbQuery } from '@/lib/database';

// =====================================================
// ТИПЫ
// =====================================================

export interface TourBookingRequest {
  scheduleId: string;
  userId: string;
  participantsCount: number;
  adultsCount?: number;
  childrenCount?: number;
  
  contactInfo: {
    name: string;
    phone: string;
    email: string;
  };
  
  participantsDetails?: ParticipantDetails[];
  
  specialRequests?: string;
  dietaryRequirements?: string[];
  medicalConditions?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
  
  source?: string; // web, mobile, agent
}

export interface ParticipantDetails {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: string;
  passportNumber?: string;
  phone?: string;
  email?: string;
  medicalInfo?: {
    bloodType?: string;
    allergies?: string[];
    medications?: string;
  };
}

export interface TourBookingResult {
  success: boolean;
  booking?: {
    id: string;
    bookingNumber: string;
    confirmationCode: string;
    totalPrice: number;
    status: string;
    paymentStatus: string;
    scheduleInfo: {
      tourTitle: string;
      startDate: string;
      departureTime: string;
      meetingPoint: string;
      slotsLeft: number;
    };
    qrCode?: string;
  };
  error?: string;
  errorCode?: string;
}

export interface HoldResult {
  success: boolean;
  hold?: {
    id: string;
    scheduleId: string;
    slotsCount: number;
    expiresAt: Date;
    expiresInMinutes: number;
  };
  error?: string;
  errorCode?: string;
}

export interface AvailabilityResult {
  available: boolean;
  slotsLeft: number;
  activeHolds: number;
  scheduleInfo?: {
    maxParticipants: number;
    minParticipants: number;
    currentBookings: number;
    status: string;
    pricePerPerson: number;
  };
}

// =====================================================
// СОЗДАНИЕ БРОНИРОВАНИЯ С ЗАЩИТОЙ ОТ RACE CONDITIONS
// =====================================================

/**
 * Создает бронирование тура с защитой от race conditions
 * 
 * Алгоритм:
 * 1. BEGIN transaction
 * 2. SELECT ... FOR UPDATE NOWAIT - блокировка расписания
 * 3. Проверка доступности мест
 * 4. UPDATE available_slots (атомарная операция)
 * 5. INSERT booking
 * 6. INSERT participants (опционально)
 * 7. COMMIT
 * 
 * Если блокировка недоступна → возвращает ошибку немедленно (NOWAIT)
 */
export async function createTourBookingWithLock(
  request: TourBookingRequest
): Promise<TourBookingResult> {
  try {
    return await transaction(async (client: PoolClient) => {
      // 1. Блокируем расписание для чтения и обновления
      // FOR UPDATE NOWAIT - не ждем освобождения блокировки
      const lockQuery = `
        SELECT 
          s.id,
          s.tour_id,
          s.operator_id,
          s.available_slots,
          s.max_participants,
          s.min_participants,
          s.price_per_person,
          s.base_price,
          s.start_date,
          s.end_date,
          s.departure_time,
          s.return_time,
          s.meeting_point,
          s.status,
          s.weather_status,
          s.cancellation_deadline,
          t.title as tour_title,
          t.description as tour_description,
          o.name as operator_name
        FROM tour_schedules s
        JOIN tours t ON s.tour_id = t.id
        JOIN partners o ON s.operator_id = o.id
        WHERE s.id = $1 
          AND s.status IN ('scheduled', 'confirmed')
        FOR UPDATE NOWAIT
      `;

      let scheduleResult;
      try {
        scheduleResult = await client.query(lockQuery, [request.scheduleId]);
      } catch (error: any) {
        // NOWAIT вернет ошибку если строка уже заблокирована
        if (error.code === '55P03') { // lock_not_available
          return {
            success: false,
            error: 'Это расписание сейчас бронируется другим пользователем. Попробуйте еще раз через несколько секунд.',
            errorCode: 'LOCK_TIMEOUT'
          };
        }
        throw error;
      }

      if (scheduleResult.rows.length === 0) {
        return {
          success: false,
          error: 'Расписание не найдено или недоступно для бронирования',
          errorCode: 'SCHEDULE_NOT_FOUND'
        };
      }

      const schedule = scheduleResult.rows[0];

      // 2. Проверяем статус погоды (если зависим от погоды)
      if (schedule.weather_status === 'dangerous') {
        return {
          success: false,
          error: 'Тур отменен из-за неблагоприятных погодных условий',
          errorCode: 'WEATHER_DANGEROUS'
        };
      }

      // 3. Проверяем доступность мест
      if (schedule.available_slots < request.participantsCount) {
        return {
          success: false,
          error: `Недостаточно свободных мест. Доступно: ${schedule.available_slots}, требуется: ${request.participantsCount}`,
          errorCode: 'INSUFFICIENT_SLOTS'
        };
      }

      // 4. Проверяем минимальное/максимальное количество участников
      if (request.participantsCount > schedule.max_participants) {
        return {
          success: false,
          error: `Превышено максимальное количество участников (${schedule.max_participants})`,
          errorCode: 'EXCEEDS_MAX_PARTICIPANTS'
        };
      }

      // 5. Атомарно уменьшаем количество мест
      const updateSlotsQuery = `
        UPDATE tour_schedules 
        SET 
          available_slots = available_slots - $1,
          status = CASE 
            WHEN (available_slots - $1) = 0 THEN 'full'
            WHEN (available_slots - $1) >= min_participants THEN 'confirmed'
            ELSE status
          END,
          updated_at = NOW()
        WHERE id = $2 
          AND available_slots >= $1
          AND status IN ('scheduled', 'confirmed')
        RETURNING available_slots, status
      `;

      const updateResult = await client.query(updateSlotsQuery, [
        request.participantsCount,
        request.scheduleId
      ]);

      if (updateResult.rowCount === 0) {
        return {
          success: false,
          error: 'Места были заняты другим пользователем',
          errorCode: 'SLOTS_TAKEN'
        };
      }

      const newAvailableSlots = updateResult.rows[0].available_slots;

      // 6. Генерируем уникальные коды
      const bookingNumberResult = await client.query('SELECT generate_booking_number()');
      const bookingNumber = bookingNumberResult.rows[0].generate_booking_number;
      
      const confirmationCodeResult = await client.query('SELECT generate_confirmation_code()');
      const confirmationCode = confirmationCodeResult.rows[0].generate_confirmation_code;

      // 7. Рассчитываем цену (можно добавить динамическое ценообразование)
      const totalPrice = schedule.price_per_person * request.participantsCount;

      // 8. Создаем бронирование
      const bookingQuery = `
        INSERT INTO tour_bookings_v2 (
          user_id,
          operator_id,
          tour_id,
          schedule_id,
          booking_number,
          confirmation_code,
          booking_date,
          tour_start_date,
          tour_end_date,
          participants_count,
          adults_count,
          children_count,
          base_price,
          total_price,
          status,
          payment_status,
          contact_name,
          contact_phone,
          contact_email,
          special_requests,
          dietary_requirements,
          medical_conditions,
          emergency_contact,
          source,
          created_at,
          updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, NOW(), $7, $8, $9, $10, $11,
          $12, $13, 'pending', 'pending', $14, $15, $16, $17,
          $18, $19, $20, $21, NOW(), NOW()
        )
        RETURNING *
      `;

      const bookingResult = await client.query(bookingQuery, [
        request.userId,
        schedule.operator_id,
        schedule.tour_id,
        request.scheduleId,
        bookingNumber,
        confirmationCode,
        schedule.start_date,
        schedule.end_date,
        request.participantsCount,
        request.adultsCount || request.participantsCount,
        request.childrenCount || 0,
        schedule.base_price,
        totalPrice,
        request.contactInfo.name,
        request.contactInfo.phone,
        request.contactInfo.email,
        request.specialRequests || null,
        request.dietaryRequirements ? JSON.stringify(request.dietaryRequirements) : null,
        request.medicalConditions ? JSON.stringify(request.medicalConditions) : null,
        request.emergencyContact ? JSON.stringify(request.emergencyContact) : null,
        request.source || 'web'
      ]);

      const booking = bookingResult.rows[0];

      // 9. Создаем участников (если предоставлены детали)
      if (request.participantsDetails && request.participantsDetails.length > 0) {
        for (const participant of request.participantsDetails) {
          const participantQuery = `
            INSERT INTO tour_participants (
              booking_id,
              first_name,
              last_name,
              date_of_birth,
              gender,
              passport_number,
              phone,
              email,
              blood_type,
              allergies,
              medical_conditions,
              qr_code,
              created_at,
              updated_at
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW()
            )
          `;

          // Генерируем уникальный QR код для участника
          const qrCode = `${confirmationCode}-${participant.firstName.substring(0, 3).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

          await client.query(participantQuery, [
            booking.id,
            participant.firstName,
            participant.lastName,
            participant.dateOfBirth || null,
            participant.gender || null,
            participant.passportNumber || null,
            participant.phone || null,
            participant.email || null,
            participant.medicalInfo?.bloodType || null,
            participant.medicalInfo?.allergies ? JSON.stringify(participant.medicalInfo.allergies) : null,
            participant.medicalInfo?.medications || null,
            qrCode
          ]);
        }
      }

      // 10. Конвертируем hold в booking если он существовал
      await client.query(`
        UPDATE tour_seat_holds
        SET status = 'converted'
        WHERE schedule_id = $1 
          AND user_id = $2 
          AND status = 'active'
      `, [request.scheduleId, request.userId]);

      // Транзакция успешно завершена
      return {
        success: true,
        booking: {
          id: booking.id,
          bookingNumber,
          confirmationCode,
          totalPrice,
          status: booking.status,
          paymentStatus: booking.payment_status,
          scheduleInfo: {
            tourTitle: schedule.tour_title,
            startDate: schedule.start_date,
            departureTime: schedule.departure_time,
            meetingPoint: schedule.meeting_point || 'Будет указано позже',
            slotsLeft: newAvailableSlots
          },
          qrCode: confirmationCode // можно генерировать QR код на клиенте
        }
      };
    });

  } catch (error: any) {
    console.error('Critical error in createTourBookingWithLock:', error);
    
    return {
      success: false,
      error: 'Внутренняя ошибка при создании бронирования',
      errorCode: 'INTERNAL_ERROR'
    };
  }
}

// =====================================================
// ВРЕМЕННАЯ БЛОКИРОВКА МЕСТ (HOLD)
// =====================================================

/**
 * Временная блокировка мест (hold)
 * Используется когда пользователь находится на странице оплаты
 * 
 * Автоматически освобождается через timeout (15 минут по умолчанию)
 */
export async function holdTourSeats(
  scheduleId: string,
  participantsCount: number,
  userId: string,
  timeoutMinutes: number = 15
): Promise<HoldResult> {
  try {
    return await transaction(async (client: PoolClient) => {
      // Блокируем расписание
      const lockQuery = `
        SELECT available_slots, max_participants, status
        FROM tour_schedules
        WHERE id = $1 AND status IN ('scheduled', 'confirmed')
        FOR UPDATE NOWAIT
      `;

      let scheduleResult;
      try {
        scheduleResult = await client.query(lockQuery, [scheduleId]);
      } catch (error: any) {
        if (error.code === '55P03') {
          return {
            success: false,
            error: 'Расписание занято другим пользователем',
            errorCode: 'LOCK_TIMEOUT'
          };
        }
        throw error;
      }

      if (scheduleResult.rows.length === 0) {
        return {
          success: false,
          error: 'Расписание не найдено',
          errorCode: 'SCHEDULE_NOT_FOUND'
        };
      }

      const availableSlots = scheduleResult.rows[0].available_slots;

      if (availableSlots < participantsCount) {
        return {
          success: false,
          error: 'Недостаточно мест',
          errorCode: 'INSUFFICIENT_SLOTS'
        };
      }

      // Проверяем, нет ли уже активной блокировки для этого пользователя
      const existingHold = await client.query(`
        SELECT id, expires_at FROM tour_seat_holds
        WHERE schedule_id = $1 
          AND user_id = $2 
          AND status = 'active'
          AND expires_at > NOW()
      `, [scheduleId, userId]);

      if (existingHold.rows.length > 0) {
        // Продлеваем существующую блокировку
        const extendQuery = `
          UPDATE tour_seat_holds
          SET 
            slots_count = $1,
            expires_at = NOW() + INTERVAL '${timeoutMinutes} minutes'
          WHERE id = $2
          RETURNING *
        `;
        
        const result = await client.query(extendQuery, [
          participantsCount,
          existingHold.rows[0].id
        ]);

        const hold = result.rows[0];
        return {
          success: true,
          hold: {
            id: hold.id,
            scheduleId: hold.schedule_id,
            slotsCount: hold.slots_count,
            expiresAt: hold.expires_at,
            expiresInMinutes: timeoutMinutes
          }
        };
      }

      // Создаем новую блокировку
      const holdQuery = `
        INSERT INTO tour_seat_holds (
          schedule_id,
          user_id,
          slots_count,
          expires_at,
          status,
          created_at
        ) VALUES ($1, $2, $3, NOW() + INTERVAL '${timeoutMinutes} minutes', 'active', NOW())
        RETURNING *
      `;

      const holdResult = await client.query(holdQuery, [
        scheduleId,
        userId,
        participantsCount
      ]);

      const hold = holdResult.rows[0];

      return {
        success: true,
        hold: {
          id: hold.id,
          scheduleId: hold.schedule_id,
          slotsCount: hold.slots_count,
          expiresAt: hold.expires_at,
          expiresInMinutes: timeoutMinutes
        }
      };
    });

  } catch (error: any) {
    console.error('Error in holdTourSeats:', error);
    return {
      success: false,
      error: 'Ошибка блокировки мест',
      errorCode: 'HOLD_ERROR'
    };
  }
}

// =====================================================
// ОСВОБОЖДЕНИЕ БЛОКИРОВКИ
// =====================================================

/**
 * Освобождение временной блокировки
 */
export async function releaseHold(holdId: string): Promise<boolean> {
  try {
    const query = `
      UPDATE tour_seat_holds
      SET status = 'released'
      WHERE id = $1 AND status = 'active'
      RETURNING id
    `;

    const result = await dbQuery(query, [holdId]);
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error('Error releasing hold:', error);
    return false;
  }
}

// =====================================================
// ОЧИСТКА ИСТЕКШИХ БЛОКИРОВОК
// =====================================================

/**
 * Очистка истекших блокировок (запускать по cron каждые 5 минут)
 */
export async function cleanupExpiredHolds(): Promise<number> {
  try {
    const result = await dbQuery(`
      SELECT cleanup_expired_tour_holds()
    `);
    
    return result.rows[0].cleanup_expired_tour_holds || 0;
  } catch (error) {
    console.error('Error cleaning up expired holds:', error);
    return 0;
  }
}

// =====================================================
// ПРОВЕРКА ДОСТУПНОСТИ
// =====================================================

/**
 * Проверка доступности мест без блокировки (для отображения в UI)
 */
export async function checkTourAvailability(
  scheduleId: string,
  participantsCount: number
): Promise<AvailabilityResult> {
  try {
    const result = await dbQuery(`
      SELECT * FROM check_tour_availability($1, $2)
    `, [scheduleId, participantsCount]);

    if (result.rows.length === 0) {
      return {
        available: false,
        slotsLeft: 0,
        activeHolds: 0
      };
    }

    const row = result.rows[0];
    
    // Получаем дополнительную информацию о расписании
    const scheduleInfo = await dbQuery(`
      SELECT 
        max_participants,
        min_participants,
        status,
        price_per_person,
        (max_participants - available_slots) as current_bookings
      FROM tour_schedules
      WHERE id = $1
    `, [scheduleId]);

    return {
      available: row.available,
      slotsLeft: row.slots_left,
      activeHolds: row.active_holds,
      scheduleInfo: scheduleInfo.rows.length > 0 ? {
        maxParticipants: scheduleInfo.rows[0].max_participants,
        minParticipants: scheduleInfo.rows[0].min_participants,
        currentBookings: scheduleInfo.rows[0].current_bookings,
        status: scheduleInfo.rows[0].status,
        pricePerPerson: parseFloat(scheduleInfo.rows[0].price_per_person)
      } : undefined
    };
  } catch (error) {
    console.error('Error checking tour availability:', error);
    return {
      available: false,
      slotsLeft: 0,
      activeHolds: 0
    };
  }
}

// =====================================================
// ОТМЕНА БРОНИРОВАНИЯ
// =====================================================

/**
 * Отмена бронирования с возвратом мест и расчетом возврата средств
 */
export async function cancelTourBooking(
  bookingId: string,
  cancelledBy: string,
  cancelledByRole: string,
  reason: string,
  cancellationType: string = 'user_request'
): Promise<TourBookingResult> {
  try {
    return await transaction(async (client: PoolClient) => {
      // Получаем информацию о бронировании
      const bookingQuery = `
        SELECT 
          b.*,
          s.start_date,
          s.departure_time,
          s.cancellation_deadline,
          s.refund_percent as schedule_refund_percent
        FROM tour_bookings_v2 b
        JOIN tour_schedules s ON b.schedule_id = s.id
        WHERE b.id = $1 AND b.status NOT IN ('cancelled', 'refunded')
        FOR UPDATE
      `;

      const bookingResult = await client.query(bookingQuery, [bookingId]);

      if (bookingResult.rows.length === 0) {
        return {
          success: false,
          error: 'Бронирование не найдено или уже отменено',
          errorCode: 'BOOKING_NOT_FOUND'
        };
      }

      const booking = bookingResult.rows[0];

      // Рассчитываем время до начала тура
      const tourStart = new Date(`${booking.start_date} ${booking.departure_time}`);
      const now = new Date();
      const hoursUntilTour = (tourStart.getTime() - now.getTime()) / (1000 * 60 * 60);

      // Рассчитываем процент возврата
      let refundPercent = 0;
      if (cancellationType === 'weather' || cancellationType === 'force_majeure') {
        refundPercent = 100; // Полный возврат
      } else if (hoursUntilTour >= 72) {
        refundPercent = 90; // За 3+ дня
      } else if (hoursUntilTour >= 48) {
        refundPercent = 75; // За 2-3 дня
      } else if (hoursUntilTour >= 24) {
        refundPercent = 50; // За 1-2 дня
      } else {
        refundPercent = 0; // Менее 24 часов - без возврата
      }

      const refundAmount = (booking.paid_amount * refundPercent) / 100;

      // Возвращаем места в расписание
      await client.query(`
        UPDATE tour_schedules
        SET 
          available_slots = available_slots + $1,
          status = CASE 
            WHEN status = 'full' THEN 'confirmed'
            ELSE status
          END,
          updated_at = NOW()
        WHERE id = $2
      `, [booking.participants_count, booking.schedule_id]);

      // Обновляем статус бронирования
      await client.query(`
        UPDATE tour_bookings_v2
        SET 
          status = 'cancelled',
          payment_status = CASE 
            WHEN $1 > 0 THEN 'refunded'
            ELSE payment_status
          END,
          cancelled_at = NOW(),
          cancellation_reason = $2,
          refund_amount = $1,
          updated_at = NOW()
        WHERE id = $3
      `, [refundAmount, reason, bookingId]);

      // Создаем запись об отмене
      await client.query(`
        INSERT INTO tour_cancellations (
          booking_id,
          schedule_id,
          cancelled_by,
          cancelled_by_role,
          cancellation_type,
          reason,
          refund_amount,
          refund_percent,
          cancellation_time_hours,
          cancelled_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      `, [
        bookingId,
        booking.schedule_id,
        cancelledBy,
        cancelledByRole,
        cancellationType,
        reason,
        refundAmount,
        refundPercent,
        hoursUntilTour
      ]);

      return {
        success: true,
        booking: {
          id: booking.id,
          bookingNumber: booking.booking_number,
          confirmationCode: booking.confirmation_code,
          totalPrice: booking.total_price,
          status: 'cancelled',
          paymentStatus: refundAmount > 0 ? 'refunded' : booking.payment_status,
          scheduleInfo: {
            tourTitle: '',
            startDate: booking.start_date,
            departureTime: booking.departure_time,
            meetingPoint: '',
            slotsLeft: 0
          }
        }
      };
    });

  } catch (error) {
    console.error('Error cancelling tour booking:', error);
    return {
      success: false,
      error: 'Ошибка отмены бронирования',
      errorCode: 'CANCEL_ERROR'
    };
  }
}

// =====================================================
// ПОДТВЕРЖДЕНИЕ БРОНИРОВАНИЯ
// =====================================================

/**
 * Подтверждение бронирования оператором
 */
export async function confirmTourBooking(
  bookingId: string,
  operatorId: string
): Promise<TourBookingResult> {
  try {
    const result = await dbQuery(`
      UPDATE tour_bookings_v2
      SET 
        status = 'confirmed',
        updated_at = NOW()
      WHERE id = $1 
        AND operator_id = $2
        AND status = 'pending'
      RETURNING *
    `, [bookingId, operatorId]);

    if (result.rowCount === 0) {
      return {
        success: false,
        error: 'Бронирование не найдено или уже обработано',
        errorCode: 'BOOKING_NOT_FOUND'
      };
    }

    const booking = result.rows[0];

    return {
      success: true,
      booking: {
        id: booking.id,
        bookingNumber: booking.booking_number,
        confirmationCode: booking.confirmation_code,
        totalPrice: parseFloat(booking.total_price),
        status: booking.status,
        paymentStatus: booking.payment_status,
        scheduleInfo: {
          tourTitle: '',
          startDate: booking.tour_start_date,
          departureTime: '',
          meetingPoint: '',
          slotsLeft: 0
        }
      }
    };
  } catch (error) {
    console.error('Error confirming tour booking:', error);
    return {
      success: false,
      error: 'Ошибка подтверждения бронирования',
      errorCode: 'CONFIRM_ERROR'
    };
  }
}

// Экспорты
export {
  type TourBookingRequest,
  type TourBookingResult,
  type HoldResult,
  type AvailabilityResult,
  type ParticipantDetails
};
