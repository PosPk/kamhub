/**
 * RACE CONDITION TESTS
 * Тестирование защиты от овербукинга при одновременных запросах
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createBookingWithLock, cancelBooking } from '../lib/transfers/booking';
import { query, transaction } from '../lib/database';

describe('Race Condition Prevention', () => {
  let testScheduleId: string;
  let testUserId: string;

  beforeEach(async () => {
    // Создаем тестовое расписание с 1 местом
    const scheduleResult = await query(`
      INSERT INTO transfer_schedules (
        route_id, vehicle_id, driver_id,
        departure_time, arrival_time,
        price_per_person, available_seats, is_active
      )
      SELECT 
        r.id, v.id, d.id,
        '10:00', '11:00',
        1500, 1, true
      FROM transfer_routes r
      CROSS JOIN transfer_vehicles v
      CROSS JOIN transfer_drivers d
      LIMIT 1
      RETURNING id
    `);
    
    testScheduleId = scheduleResult.rows[0]?.id;
    testUserId = 'test-user-' + Date.now();
  });

  afterEach(async () => {
    // Очистка тестовых данных
    if (testScheduleId) {
      await query('DELETE FROM transfer_bookings WHERE schedule_id = $1', [testScheduleId]);
      await query('DELETE FROM transfer_schedules WHERE id = $1', [testScheduleId]);
    }
  });

  it('должен предотвратить овербукинг при одновременных запросах', async () => {
    if (!testScheduleId) {
      console.log('Skipping test: no test data available');
      return;
    }

    // Создаем 2 одновременных запроса на последнее место
    const booking1 = createBookingWithLock({
      scheduleId: testScheduleId,
      passengersCount: 1,
      userId: testUserId + '-1',
      contactInfo: {
        phone: '+79141234567',
        email: 'test1@example.com'
      }
    });

    const booking2 = createBookingWithLock({
      scheduleId: testScheduleId,
      passengersCount: 1,
      userId: testUserId + '-2',
      contactInfo: {
        phone: '+79141234568',
        email: 'test2@example.com'
      }
    });

    // Ожидаем завершения обоих запросов
    const results = await Promise.allSettled([booking1, booking2]);

    // Проверяем что только 1 успешен
    const successful = results.filter(r => r.status === 'fulfilled' && (r.value as any).success);
    const failed = results.filter(r => 
      r.status === 'fulfilled' && !(r.value as any).success ||
      r.status === 'rejected'
    );

    expect(successful.length).toBe(1);
    expect(failed.length).toBe(1);

    // Проверяем что available_seats = 0
    const scheduleCheck = await query(
      'SELECT available_seats FROM transfer_schedules WHERE id = $1',
      [testScheduleId]
    );
    
    expect(scheduleCheck.rows[0].available_seats).toBe(0);
  });

  it('должен корректно обрабатывать блокировку NOWAIT', async () => {
    if (!testScheduleId) {
      console.log('Skipping test: no test data available');
      return;
    }

    // Первый запрос начинает транзакцию
    let firstBookingFinished = false;
    
    const slowBooking = transaction(async (client) => {
      // Блокируем расписание
      await client.query(
        'SELECT * FROM transfer_schedules WHERE id = $1 FOR UPDATE',
        [testScheduleId]
      );
      
      // Имитируем медленную обработку
      await new Promise(resolve => setTimeout(resolve, 100));
      
      firstBookingFinished = true;
      return { success: true };
    });

    // Даем время первой транзакции заблокировать строку
    await new Promise(resolve => setTimeout(resolve, 10));

    // Второй запрос должен получить LOCK_TIMEOUT
    const fastBooking = createBookingWithLock({
      scheduleId: testScheduleId,
      passengersCount: 1,
      userId: testUserId,
      contactInfo: {
        phone: '+79141234567',
        email: 'test@example.com'
      }
    });

    const result = await fastBooking;
    
    // Второй запрос должен завершиться с ошибкой ДО завершения первого
    expect(result.success).toBe(false);
    expect(result.errorCode).toBe('LOCK_TIMEOUT');
    expect(firstBookingFinished).toBe(false);

    // Ждем завершения первой транзакции
    await slowBooking;
  });

  it('должен атомарно уменьшать available_seats', async () => {
    if (!testScheduleId) {
      console.log('Skipping test: no test data available');
      return;
    }

    // Обновляем расписание на 5 мест
    await query(
      'UPDATE transfer_schedules SET available_seats = 5 WHERE id = $1',
      [testScheduleId]
    );

    // Создаем 3 одновременных бронирования по 2 места
    const bookings = await Promise.allSettled([
      createBookingWithLock({
        scheduleId: testScheduleId,
        passengersCount: 2,
        userId: testUserId + '-1',
        contactInfo: { phone: '+79141234561', email: 'test1@example.com' }
      }),
      createBookingWithLock({
        scheduleId: testScheduleId,
        passengersCount: 2,
        userId: testUserId + '-2',
        contactInfo: { phone: '+79141234562', email: 'test2@example.com' }
      }),
      createBookingWithLock({
        scheduleId: testScheduleId,
        passengersCount: 2,
        userId: testUserId + '-3',
        contactInfo: { phone: '+79141234563', email: 'test3@example.com' }
      })
    ]);

    const successful = bookings.filter(r => 
      r.status === 'fulfilled' && (r.value as any).success
    );

    // Должно быть успешно только 2 бронирования (2*2=4 места из 5)
    expect(successful.length).toBe(2);

    // Проверяем финальное состояние
    const scheduleCheck = await query(
      'SELECT available_seats FROM transfer_schedules WHERE id = $1',
      [testScheduleId]
    );
    
    // Должно остаться 1 место (5 - 4 = 1)
    expect(scheduleCheck.rows[0].available_seats).toBe(1);
  });

  it('должен корректно откатывать транзакцию при ошибке', async () => {
    if (!testScheduleId) {
      console.log('Skipping test: no test data available');
      return;
    }

    const initialSeats = await query(
      'SELECT available_seats FROM transfer_schedules WHERE id = $1',
      [testScheduleId]
    );
    const seatsBefore = initialSeats.rows[0].available_seats;

    // Пытаемся забронировать с невалидными данными
    try {
      await transaction(async (client) => {
        // Уменьшаем места
        await client.query(
          'UPDATE transfer_schedules SET available_seats = available_seats - 1 WHERE id = $1',
          [testScheduleId]
        );
        
        // Генерируем ошибку
        throw new Error('Test error');
      });
    } catch (error) {
      // Ожидаем ошибку
    }

    // Проверяем что места не изменились (транзакция откатилась)
    const seatsAfter = await query(
      'SELECT available_seats FROM transfer_schedules WHERE id = $1',
      [testScheduleId]
    );

    expect(seatsAfter.rows[0].available_seats).toBe(seatsBefore);
  });
});

describe('Booking Cancellation', () => {
  let testScheduleId: string;
  let testBookingId: string;
  let testUserId: string;

  beforeEach(async () => {
    testUserId = 'test-user-' + Date.now();
    
    // Создаем тестовое расписание
    const scheduleResult = await query(`
      INSERT INTO transfer_schedules (
        route_id, vehicle_id, driver_id,
        departure_time, arrival_time,
        price_per_person, available_seats, is_active
      )
      SELECT 
        r.id, v.id, d.id,
        '10:00', '11:00',
        1500, 5, true
      FROM transfer_routes r
      CROSS JOIN transfer_vehicles v
      CROSS JOIN transfer_drivers d
      LIMIT 1
      RETURNING id
    `);
    
    testScheduleId = scheduleResult.rows[0]?.id;
  });

  afterEach(async () => {
    if (testScheduleId) {
      await query('DELETE FROM transfer_bookings WHERE schedule_id = $1', [testScheduleId]);
      await query('DELETE FROM transfer_schedules WHERE id = $1', [testScheduleId]);
    }
  });

  it('должен возвращать места при отмене бронирования', async () => {
    if (!testScheduleId) {
      console.log('Skipping test: no test data available');
      return;
    }

    // Создаем бронирование на 2 места
    const booking = await createBookingWithLock({
      scheduleId: testScheduleId,
      passengersCount: 2,
      userId: testUserId,
      contactInfo: {
        phone: '+79141234567',
        email: 'test@example.com'
      }
    });

    expect(booking.success).toBe(true);
    testBookingId = booking.booking.id;

    // Проверяем что осталось 3 места (5-2)
    const seatsAfterBooking = await query(
      'SELECT available_seats FROM transfer_schedules WHERE id = $1',
      [testScheduleId]
    );
    expect(seatsAfterBooking.rows[0].available_seats).toBe(3);

    // Отменяем бронирование
    const cancellation = await cancelBooking(testBookingId, 'Test cancellation');
    expect(cancellation.success).toBe(true);

    // Проверяем что вернулось 5 мест (3+2)
    const seatsAfterCancellation = await query(
      'SELECT available_seats FROM transfer_schedules WHERE id = $1',
      [testScheduleId]
    );
    expect(seatsAfterCancellation.rows[0].available_seats).toBe(5);
  });
});
