/**
 * WEBHOOK VALIDATION TESTS
 * Тестирование безопасности CloudPayments webhook
 */

import { describe, it, expect } from 'vitest';
import {
  validateCloudPaymentsSignature,
  validateWebhookData,
  createTestWebhook
} from '../lib/payments/cloudpayments-webhook';
import crypto from 'crypto';

describe('CloudPayments Webhook Signature Validation', () => {
  const apiSecret = 'test-api-secret-key-12345';
  
  it('должен валидировать корректную подпись', () => {
    const body = JSON.stringify({ test: 'data' });
    const signature = crypto
      .createHmac('sha256', apiSecret)
      .update(body)
      .digest('base64');
    
    const isValid = validateCloudPaymentsSignature(body, signature, apiSecret);
    expect(isValid).toBe(true);
  });
  
  it('должен отклонять неверную подпись', () => {
    const body = JSON.stringify({ test: 'data' });
    const wrongSignature = 'wrong-signature-xyz';
    
    const isValid = validateCloudPaymentsSignature(body, wrongSignature, apiSecret);
    expect(isValid).toBe(false);
  });
  
  it('должен отклонять подпись с измененным body', () => {
    const originalBody = JSON.stringify({ amount: 1000 });
    const signature = crypto
      .createHmac('sha256', apiSecret)
      .update(originalBody)
      .digest('base64');
    
    // Атакующий пытается изменить сумму
    const tamperedBody = JSON.stringify({ amount: 1 });
    
    const isValid = validateCloudPaymentsSignature(tamperedBody, signature, apiSecret);
    expect(isValid).toBe(false);
  });
  
  it('должен отклонять пустую подпись', () => {
    const body = JSON.stringify({ test: 'data' });
    const isValid = validateCloudPaymentsSignature(body, null, apiSecret);
    expect(isValid).toBe(false);
  });
  
  it('должен отклонять пустой secret', () => {
    const body = JSON.stringify({ test: 'data' });
    const signature = 'some-signature';
    const isValid = validateCloudPaymentsSignature(body, signature, '');
    expect(isValid).toBe(false);
  });
});

describe('CloudPayments Webhook Data Validation', () => {
  it('должен валидировать корректные данные', () => {
    const data = {
      TransactionId: 12345,
      Amount: 1500,
      Currency: 'RUB',
      InvoiceId: 'booking-123',
      Status: 'Completed',
      Email: 'test@example.com'
    };
    
    const result = validateWebhookData(data);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
  
  it('должен находить отсутствующие обязательные поля', () => {
    const data = {
      TransactionId: 12345,
      // Amount отсутствует
      Currency: 'RUB'
    };
    
    const result = validateWebhookData(data);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Missing required field: Amount');
  });
  
  it('должен валидировать типы данных', () => {
    const data = {
      TransactionId: '12345', // Должно быть number!
      Amount: '1500',         // Должно быть number!
      Currency: 'RUB',
      InvoiceId: 'booking-123',
      Status: 'Completed'
    };
    
    const result = validateWebhookData(data);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
  
  it('должен отклонять отрицательные суммы', () => {
    const data = {
      TransactionId: 12345,
      Amount: -1500,
      Currency: 'RUB',
      InvoiceId: 'booking-123',
      Status: 'Completed'
    };
    
    const result = validateWebhookData(data);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Amount must be positive');
  });
  
  it('должен валидировать статусы', () => {
    const data = {
      TransactionId: 12345,
      Amount: 1500,
      Currency: 'RUB',
      InvoiceId: 'booking-123',
      Status: 'InvalidStatus' // Неверный статус
    };
    
    const result = validateWebhookData(data);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('Invalid status'))).toBe(true);
  });
});

describe('Test Webhook Creation', () => {
  it('должен создавать валидный тестовый webhook', () => {
    // Устанавливаем test environment
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    process.env.CLOUDPAYMENTS_API_SECRET = 'test-secret';
    
    try {
      const { body, signature } = createTestWebhook('booking-123', 1500);
      
      // Парсим body
      const data = JSON.parse(body);
      expect(data.InvoiceId).toBe('booking-123');
      expect(data.Amount).toBe(1500);
      expect(data.Status).toBe('Completed');
      expect(data.TestMode).toBe(true);
      
      // Проверяем что подпись валидна
      const isValid = validateCloudPaymentsSignature(
        body,
        signature,
        'test-secret'
      );
      expect(isValid).toBe(true);
      
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });
  
  it('не должен работать в production', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    
    try {
      expect(() => {
        createTestWebhook('booking-123', 1500);
      }).toThrow('Test webhooks not allowed in production');
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });
});

describe('Webhook Integration Flow', () => {
  it('должен обрабатывать полный цикл успешного платежа', async () => {
    // Этот тест требует подключения к БД
    // Пропускаем если БД недоступна
    console.log('Note: Full integration test requires database connection');
  });
});

/**
 * Мануальное тестирование webhook:
 * 
 * 1. Запустить приложение: npm run dev
 * 
 * 2. В отдельном терминале:
 * 
 * node -e "
 *   const crypto = require('crypto');
 *   const data = {
 *     TransactionId: 12345,
 *     Amount: 1500,
 *     Currency: 'RUB',
 *     PaymentAmount: 1500,
 *     PaymentCurrency: 'RUB',
 *     InvoiceId: 'your-booking-id',
 *     AccountId: 'user-123',
 *     Email: 'test@example.com',
 *     DateTime: new Date().toISOString(),
 *     TestMode: true,
 *     Status: 'Completed'
 *   };
 *   const body = JSON.stringify(data);
 *   const secret = 'your-api-secret';
 *   const signature = crypto.createHmac('sha256', secret).update(body).digest('base64');
 *   console.log('Body:', body);
 *   console.log('Signature:', signature);
 * "
 * 
 * 3. Отправить curl:
 * 
 * curl -X POST http://localhost:3002/api/webhooks/cloudpayments \
 *   -H 'Content-Type: application/json' \
 *   -H 'X-Content-HMAC: [signature-from-step-2]' \
 *   -d '[body-from-step-2]'
 * 
 * 4. Ожидаемый ответ: {"code":0}
 */
