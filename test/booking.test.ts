/**
 * КРИТИЧНЫЕ ТЕСТЫ - СИСТЕМА БРОНИРОВАНИЯ
 * Тестируем race conditions, транзакции, валидацию
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createBooking, getBooking, cancelBooking } from '@/lib/transfers/booking';
import { query } from '@/lib/database';

describe('Booking System - Critical Tests', () => {
  let testTransferId: string;
  let testUserId: string;

  beforeEach(async () => {
    // Создаем тестовый трансфер
    const transferResult = await query(`
      INSERT INTO transfers (
        route, date, time, available_seats, price, status
      ) VALUES (
        'Аэропорт → Город', 
        CURRENT_DATE + INTERVAL '7 days', 
        '14:00', 
        10, 
        1200, 
        'active'
      )
      RETURNING id
    `);
    testTransferId = transferResult.rows[0].id;

    // Создаем тестового пользователя
    const userResult = await query(`
      INSERT INTO users (
        email, password_hash, first_name, role
      ) VALUES (
        'test@example.com',
        'dummy_hash',
        'Test User',
        'tourist'
      )
      RETURNING id
    `);
    testUserId = userResult.rows[0].id;
  });

  afterEach(async () => {
    // Очистка тестовых данных
    await query(`DELETE FROM transfer_bookings WHERE transfer_id = $1`, [testTransferId]);
    await query(`DELETE FROM transfers WHERE id = $1`, [testTransferId]);
    await query(`DELETE FROM users WHERE id = $1`, [testUserId]);
  });

  it('должно успешно создавать бронирование', async () => {
    const booking = await createBooking({
      transferId: testTransferId,
      userId: testUserId,
      seats: 2,
      passengerName: 'John Doe',
      passengerPhone: '+79991234567',
      pickupLocation: 'Airport',
      dropoffLocation: 'Hotel',
    });

    expect(booking).toBeDefined();
    expect(booking.transferId).toBe(testTransferId);
    expect(booking.seats).toBe(2);
    expect(booking.status).toBe('pending');
    expect(booking.confirmationCode).toMatch(/^KB-[A-Z0-9]{6}$/);
  });

  it('должно предотвращать перебронирование (race condition)', async () => {
    // Симулируем 15 одновременных попыток забронировать по 1 месту
    // Должно пройти только 10 (доступно 10 мест)
    
    const promises = Array.from({ length: 15 }, (_, i) =>
      createBooking({
        transferId: testTransferId,
        userId: testUserId,
        seats: 1,
        passengerName: `Passenger ${i}`,
        passengerPhone: '+79991234567',
        pickupLocation: 'Airport',
        dropoffLocation: 'Hotel',
      }).catch(err => ({ error: err.message }))
    );

    const results = await Promise.all(promises);
    
    const successful = results.filter(r => !('error' in r));
    const failed = results.filter(r => 'error' in r);

    expect(successful.length).toBe(10); // Ровно 10 успешных
    expect(failed.length).toBe(5); // Остальные отклонены
  });

  it('должно корректно отменять бронирование и возвращать места', async () => {
    // Создаем бронирование
    const booking = await createBooking({
      transferId: testTransferId,
      userId: testUserId,
      seats: 3,
      passengerName: 'John Doe',
      passengerPhone: '+79991234567',
      pickupLocation: 'Airport',
      dropoffLocation: 'Hotel',
    });

    // Проверяем что места заняты
    let transfer = await query(`
      SELECT available_seats FROM transfers WHERE id = $1
    `, [testTransferId]);
    expect(transfer.rows[0].available_seats).toBe(7); // 10 - 3

    // Отменяем бронирование
    await cancelBooking(booking.id, 'Отмена тестом');

    // Проверяем что места вернулись
    transfer = await query(`
      SELECT available_seats FROM transfers WHERE id = $1
    `, [testTransferId]);
    expect(transfer.rows[0].available_seats).toBe(10); // Вернулись 3 места

    // Проверяем статус бронирования
    const cancelledBooking = await getBooking(booking.id);
    expect(cancelledBooking?.status).toBe('cancelled');
  });

  it('должно валидировать количество мест', async () => {
    await expect(
      createBooking({
        transferId: testTransferId,
        userId: testUserId,
        seats: 0, // Некорректное количество
        passengerName: 'John Doe',
        passengerPhone: '+79991234567',
        pickupLocation: 'Airport',
        dropoffLocation: 'Hotel',
      })
    ).rejects.toThrow();
  });

  it('должно генерировать уникальные confirmation codes', async () => {
    const bookings = await Promise.all([
      createBooking({
        transferId: testTransferId,
        userId: testUserId,
        seats: 1,
        passengerName: 'John 1',
        passengerPhone: '+79991234567',
        pickupLocation: 'Airport',
        dropoffLocation: 'Hotel',
      }),
      createBooking({
        transferId: testTransferId,
        userId: testUserId,
        seats: 1,
        passengerName: 'John 2',
        passengerPhone: '+79991234567',
        pickupLocation: 'Airport',
        dropoffLocation: 'Hotel',
      }),
    ]);

    expect(bookings[0].confirmationCode).not.toBe(bookings[1].confirmationCode);
  });
});
