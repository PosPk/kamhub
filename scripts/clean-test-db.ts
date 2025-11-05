#!/usr/bin/env tsx
/**
 * Очистка тестовой базы данных
 * Удаляет все данные из тестовых таблиц
 */

import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// Загружаем тестовую конфигурацию
dotenv.config({ path: '.env.test' });

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/kamchatour_hub_test';

async function cleanTestDatabase() {
  console.log('🧹 Очистка тестовой базы данных...\n');

  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: false
  });

  try {
    // Проверяем что это точно тестовая БД
    if (!DATABASE_URL.includes('test')) {
      throw new Error('❌ ОШИБКА: Попытка очистить не-тестовую БД! URL должен содержать "test"');
    }

    // Отключаем внешние ключи для быстрой очистки
    await pool.query('SET session_replication_role = replica;');

    // Список таблиц для очистки
    const tables = [
      'tour_weather_alerts',
      'tour_cancellations',
      'tour_waitlist',
      'tour_checkins',
      'tour_participants',
      'tour_bookings_v2',
      'tour_seat_holds',
      'tour_schedules',
      'transfer_payments',
      'transfer_bookings',
      'loyalty_transactions',
      'reviews',
      'bookings',
      'chat_messages',
      'chat_sessions',
      'eco_points',
      'partners',
      'tours',
      'users'
    ];

    for (const table of tables) {
      try {
        await pool.query(`TRUNCATE TABLE ${table} CASCADE;`);
        console.log(`✅ Очищена таблица: ${table}`);
      } catch (error: any) {
        if (!error.message.includes('does not exist')) {
          console.warn(`⚠️  Не удалось очистить ${table}: ${error.message}`);
        }
      }
    }

    // Включаем внешние ключи обратно
    await pool.query('SET session_replication_role = DEFAULT;');

    console.log('\n✅ Тестовая база данных очищена!');

  } catch (error) {
    console.error('\n❌ Ошибка при очистке БД:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Запускаем если вызван напрямую
if (require.main === module) {
  cleanTestDatabase().catch(console.error);
}

export { cleanTestDatabase };
