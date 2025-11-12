/**
 * КРИТИЧНЫЕ ТЕСТЫ - ПЛАТЕЖНАЯ СИСТЕМА
 * Тестируем создание платежей, возвраты, комиссии
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createPayment, confirmPayment, processRefund } from '@/lib/payments/transfer-payments';
import { query } from '@/lib/database';

describe('Payment System - Critical Tests', () => {
  let testBookingId: string;

  beforeEach(async () => {
    // Создаем тестовое бронирование
    const bookingResult = await query(`
      INSERT INTO transfer_bookings (
        transfer_id, user_id, seats, total_price, status, confirmation_code
      ) VALUES (
        uuid_generate_v4(),
        uuid_generate_v4(),
        2,
        2400,
        'pending',
        'KB-TEST01'
      )
      RETURNING id
    `);
    testBookingId = bookingResult.rows[0].id;
  });

  afterEach(async () => {
    // Очистка
    await query(`DELETE FROM transfer_payments WHERE booking_id = $1`, [testBookingId]);
    await query(`DELETE FROM transfer_bookings WHERE id = $1`, [testBookingId]);
  });

  it('должно создавать платеж с корректной комиссией', async () => {
    const payment = await createPayment({
      bookingId: testBookingId,
      amount: 2400,
      paymentMethod: 'card',
    });

    expect(payment).toBeDefined();
    expect(payment.amount).toBe(2400);
    expect(payment.platformFee).toBeGreaterThan(0); // 5% = 120
    expect(payment.operatorAmount).toBeGreaterThan(0);
    expect(payment.status).toBe('pending');
  });

  it('должно подтверждать платеж и обновлять статус бронирования', async () => {
    const payment = await createPayment({
      bookingId: testBookingId,
      amount: 2400,
      paymentMethod: 'card',
    });

    await confirmPayment(payment.id, 'EXTERNAL_123456');

    // Проверяем платеж
    const confirmedPayment = await query(`
      SELECT status, external_id FROM transfer_payments WHERE id = $1
    `, [payment.id]);
    
    expect(confirmedPayment.rows[0].status).toBe('completed');
    expect(confirmedPayment.rows[0].external_id).toBe('EXTERNAL_123456');

    // Проверяем бронирование
    const booking = await query(`
      SELECT status FROM transfer_bookings WHERE id = $1
    `, [testBookingId]);
    
    expect(booking.rows[0].status).toBe('confirmed');
  });

  it('должно корректно обрабатывать возврат средств', async () => {
    // Создаем и подтверждаем платеж
    const payment = await createPayment({
      bookingId: testBookingId,
      amount: 2400,
      paymentMethod: 'card',
    });
    await confirmPayment(payment.id, 'EXTERNAL_123456');

    // Делаем возврат
    const refund = await processRefund({
      paymentId: payment.id,
      amount: 2400,
      reason: 'Отмена пользователем',
    });

    expect(refund.status).toBe('completed');
    expect(refund.amount).toBe(2400);

    // Проверяем что в БД создана запись о возврате
    const refundRecord = await query(`
      SELECT * FROM transfer_payments 
      WHERE booking_id = $1 AND status = 'refunded'
    `, [testBookingId]);
    
    expect(refundRecord.rows.length).toBeGreaterThan(0);
  });

  it('должно правильно рассчитывать комиссии для всех ролей', async () => {
    const amount = 10000;

    const payment = await createPayment({
      bookingId: testBookingId,
      amount,
      paymentMethod: 'card',
      operatorId: 'test-operator-id',
      driverId: 'test-driver-id',
    });

    // Проверяем что сумма комиссий = общей сумме
    const total = payment.platformFee + payment.operatorAmount + payment.driverAmount;
    expect(total).toBe(amount);

    // Проверяем процентное соотношение
    const platformPercent = (payment.platformFee / amount) * 100;
    const operatorPercent = (payment.operatorAmount / amount) * 100;
    const driverPercent = (payment.driverAmount / amount) * 100;

    expect(platformPercent).toBeCloseTo(5, 1); // 5%
    expect(operatorPercent).toBeCloseTo(75, 1); // 75%
    expect(driverPercent).toBeCloseTo(20, 1); // 20%
  });

  it('должно предотвращать двойные возвраты', async () => {
    const payment = await createPayment({
      bookingId: testBookingId,
      amount: 2400,
      paymentMethod: 'card',
    });
    await confirmPayment(payment.id, 'EXTERNAL_123456');

    // Первый возврат
    await processRefund({
      paymentId: payment.id,
      amount: 2400,
      reason: 'Test',
    });

    // Второй возврат должен провалиться
    await expect(
      processRefund({
        paymentId: payment.id,
        amount: 2400,
        reason: 'Duplicate',
      })
    ).rejects.toThrow();
  });
});
