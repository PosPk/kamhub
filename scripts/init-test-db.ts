#!/usr/bin/env tsx
/**
 * Инициализация тестовой базы данных
 * Создает структуру БД для тестов
 */

import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Загружаем тестовую конфигурацию
dotenv.config({ path: '.env.test' });

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/kamchatour_hub_test';

async function initTestDatabase() {
  console.log('🔧 Инициализация тестовой базы данных...\n');

  // Подключаемся к PostgreSQL
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: false
  });

  try {
    // Проверяем подключение
    await pool.query('SELECT NOW()');
    console.log('✅ Подключение к БД установлено');

    // Создаем расширение uuid-ossp если нужно
    try {
      await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
      console.log('✅ Расширение uuid-ossp создано');
    } catch (error) {
      console.log('⚠️  Расширение uuid-ossp уже существует или нет прав');
    }

    // Применяем базовую схему (без PostGIS)
    console.log('\n📋 Применяем базовую схему...');
    const schemaPath = path.join(__dirname, '../lib/database/schema_simple.sql');
    
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
      
      // Разбиваем на отдельные команды (по точке с запятой)
      const commands = schemaSql
        .split(';')
        .map(cmd => cmd.trim())
        .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

      for (const command of commands) {
        try {
          await pool.query(command);
        } catch (error: any) {
          // Игнорируем ошибки "already exists"
          if (!error.message.includes('already exists')) {
            console.warn(`⚠️  Предупреждение при выполнении команды: ${error.message}`);
          }
        }
      }
      
      console.log('✅ Базовая схема применена');
    } else {
      console.log('⚠️  Файл schema_simple.sql не найден, используем fallback');
      
      // Minimal schema для тестов
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          email VARCHAR(255) UNIQUE NOT NULL,
          name VARCHAR(255),
          role VARCHAR(50) DEFAULT 'tourist',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS tours (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          title VARCHAR(500) NOT NULL,
          description TEXT,
          difficulty VARCHAR(50),
          duration VARCHAR(100),
          price_from DECIMAL(10,2),
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS transfer_bookings (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES users(id),
          status VARCHAR(50) DEFAULT 'pending',
          total_price DECIMAL(10,2),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS transfer_payments (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          booking_id UUID REFERENCES transfer_bookings(id),
          amount DECIMAL(10,2),
          status VARCHAR(50) DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS loyalty_transactions (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES users(id),
          points INTEGER NOT NULL,
          type VARCHAR(50),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('✅ Минимальная схема создана');
    }

    // Применяем схему системы туров
    console.log('\n📋 Применяем схему системы туров...');
    const tourSchemaPath = path.join(__dirname, '../lib/database/tour_system_schema.sql');
    
    if (fs.existsSync(tourSchemaPath)) {
      let tourSchemaSql = fs.readFileSync(tourSchemaPath, 'utf-8');
      
      // Убираем комментарии к схеме (они могут вызвать ошибки прав)
      tourSchemaSql = tourSchemaSql.replace(/COMMENT ON SCHEMA.+;/g, '');
      
      const commands = tourSchemaSql
        .split(';')
        .map(cmd => cmd.trim())
        .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

      for (const command of commands) {
        try {
          await pool.query(command);
        } catch (error: any) {
          if (!error.message.includes('already exists')) {
            console.warn(`⚠️  Предупреждение: ${error.message.substring(0, 100)}...`);
          }
        }
      }
      
      console.log('✅ Схема системы туров применена');
    } else {
      console.log('ℹ️  Файл tour_system_schema.sql не найден, пропускаем');
    }

    // Создаем тестовые данные
    console.log('\n📊 Создаем тестовые данные...');
    
    // Тестовый пользователь
    await pool.query(`
      INSERT INTO users (id, email, name, role)
      VALUES 
        ('00000000-0000-0000-0000-000000000001', 'test@example.com', 'Test User', 'tourist'),
        ('00000000-0000-0000-0000-000000000002', 'operator@example.com', 'Test Operator', 'operator')
      ON CONFLICT (email) DO NOTHING;
    `);

    // Тестовый тур
    await pool.query(`
      INSERT INTO tours (id, title, description, difficulty, duration, price_from)
      VALUES 
        ('00000000-0000-0000-0000-000000000001', 'Тестовый тур', 'Описание тестового тура', 'easy', '1 день', 5000)
      ON CONFLICT (id) DO NOTHING;
    `);

    console.log('✅ Тестовые данные созданы');

    console.log('\n✅ Тестовая база данных успешно инициализирована!');
    console.log(`📍 URL: ${DATABASE_URL.replace(/:[^:@]*@/, ':****@')}`);

  } catch (error) {
    console.error('\n❌ Ошибка при инициализации БД:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Запускаем если вызван напрямую
if (require.main === module) {
  initTestDatabase().catch(console.error);
}

export { initTestDatabase };
