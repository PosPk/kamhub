import { beforeAll, afterAll, afterEach } from 'vitest';
import { query } from '../lib/database';

// Мок для базы данных в тестах
beforeAll(async () => {
  // Настройка тестовой базы данных
  // NODE_ENV устанавливается через vitest.config.ts, не изменяем здесь
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/kamchatour_hub_test';
  }
});

afterEach(async () => {
  // Очистка данных после каждого теста
  try {
    await query('TRUNCATE TABLE transfer_bookings CASCADE');
    await query('TRUNCATE TABLE transfer_payments CASCADE');
    await query('TRUNCATE TABLE loyalty_transactions CASCADE');
  } catch (error) {
    console.warn('Failed to clean up test data:', error);
  }
});

afterAll(async () => {
  // Закрытие соединения с базой данных
  try {
    // await query('DROP SCHEMA IF EXISTS test CASCADE');
  } catch (error) {
    console.warn('Failed to clean up test database:', error);
  }
});