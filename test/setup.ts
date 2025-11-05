import { beforeAll, afterAll, afterEach } from 'vitest';
import { query } from '../lib/database';
import * as dotenv from 'dotenv';

// Загружаем тестовую конфигурацию
dotenv.config({ path: '.env.test' });

// Флаг для проверки доступности БД
let dbAvailable = false;

beforeAll(async () => {
  // Настройка тестовой базы данных
  console.log('🔧 Настройка тестового окружения...');
  
  // Проверяем подключение к БД
  try {
    const result = await query('SELECT NOW()');
    dbAvailable = true;
    console.log('✅ Подключение к тестовой БД установлено');
  } catch (error) {
    console.warn('⚠️  БД недоступна, тесты будут пропущены');
    console.warn('   Запустите: npm run db:test:init для инициализации тестовой БД');
    dbAvailable = false;
  }
});

afterEach(async () => {
  // Очистка данных после каждого теста
  if (!dbAvailable) return;
  
  try {
    // Очищаем таблицы в правильном порядке (из-за внешних ключей)
    const tables = [
      'tour_weather_alerts',
      'tour_cancellations', 
      'tour_waitlist',
      'tour_checkins',
      'tour_participants',
      'tour_bookings_v2',
      'tour_seat_holds',
      'transfer_payments',
      'transfer_bookings',
      'loyalty_transactions',
      'reviews',
      'bookings'
    ];
    
    for (const table of tables) {
      try {
        await query(`TRUNCATE TABLE ${table} CASCADE`);
      } catch (err: any) {
        // Игнорируем если таблица не существует
        if (!err.message.includes('does not exist')) {
          console.warn(`Failed to truncate ${table}:`, err.message);
        }
      }
    }
  } catch (error) {
    console.warn('Failed to clean up test data:', error);
  }
});

afterAll(async () => {
  // Закрытие соединения с базой данных
  if (!dbAvailable) return;
  
  try {
    // Закрываем пул соединений
    const { closePool } = await import('../lib/database');
    await closePool();
    console.log('✅ Соединение с тестовой БД закрыто');
  } catch (error) {
    console.warn('Failed to close database connection:', error);
  }
});

// Экспортируем для использования в тестах
export { dbAvailable };