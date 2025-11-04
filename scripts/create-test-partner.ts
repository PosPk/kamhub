#!/usr/bin/env tsx

/**
 * Создание тестового партнера с множественными ролями
 * для полного тестирования системы
 */

import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// Загружаем переменные окружения
dotenv.config({ path: '.env.test' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true'
});

async function createTestPartner() {
  console.log('🧪 Создание тестового партнера...\n');

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Создаем пользователя-партнера
    console.log('1️⃣  Создание пользователя...');
    const userResult = await client.query(`
      INSERT INTO users (
        email,
        name,
        roles,
        preferences
      ) VALUES (
        'kamchatka.all@test.ru',
        'Алексей Петрович',
        '["operator", "driver", "hotel_manager", "provider"]'::jsonb,
        '{
          "language": "ru",
          "notifications": true,
          "companyName": "Камчатка Всё Включено",
          "phone": "+7 (924) 555-01-01"
        }'::jsonb
      )
      ON CONFLICT (email) DO UPDATE
      SET roles = EXCLUDED.roles
      RETURNING id, email, name, roles
    `);
    
    const userId = userResult.rows[0].id;
    console.log(`✅ Пользователь создан: ${userResult.rows[0].email}`);
    console.log(`   ID: ${userId}`);
    console.log(`   Роли: ${JSON.stringify(userResult.rows[0].roles)}\n`);

    // 2. Создаем партнера (operator)
    console.log('2️⃣  Создание партнера (туроператор)...');
    const partnerResult = await client.query(`
      INSERT INTO partners (
        name,
        category,
        description,
        contact,
        is_verified
      ) VALUES (
        'Камчатка Всё Включено',
        'operator',
        'Полный спектр туристических услуг: туры, трансферы, размещение, аренда снаряжения',
        '{
          "email": "kamchatka.all@test.ru",
          "phone": "+7 (924) 555-01-01",
          "website": "kamchatka-all.ru",
          "address": "г. Петропавловск-Камчатский, ул. Ленинская, 15"
        }'::jsonb,
        true
      )
      ON CONFLICT DO NOTHING
      RETURNING id, name, category
    `);
    
    if (partnerResult.rows.length > 0) {
      console.log(`✅ Партнер создан: ${partnerResult.rows[0].name}\n`);
    }

    // 3. Создаем туры
    console.log('3️⃣  Создание тестовых туров...');
    const tours = [
      {
        name: 'Восхождение на Авачинский вулкан',
        description: 'Однодневное восхождение на действующий вулкан высотой 2741 м. Маршрут средней сложности.',
        short_description: 'Однодневное восхождение на вулкан',
        difficulty: 'medium',
        duration: 8,
        price: 15000,
        max_group_size: 10,
        season: '["summer", "autumn"]',
        included: '["Трансфер", "Гид", "Треккинговые палки", "Обед"]',
        not_included: '["Личное снаряжение", "Страховка"]'
      },
      {
        name: 'Долина гейзеров на вертолете',
        description: 'Вертолетная экскурсия в единственную в Евразии Долину гейзеров. Незабываемое приключение!',
        short_description: 'Вертолетная экскурсия в Долину гейзеров',
        difficulty: 'easy',
        duration: 6,
        price: 35000,
        max_group_size: 24,
        season: '["summer", "autumn", "spring"]',
        included: '["Вертолет", "Гид-экскурсовод", "Обед на природе", "Фото и видео"]',
        not_included: '["Теплая одежда", "Страховка"]'
      },
      {
        name: 'Камчатка - 3 дня приключений',
        description: 'Комплексный тур на 3 дня: вулканы, гейзеры, рыбалка. Включает размещение на базе отдыха.',
        short_description: 'Трехдневный комплексный тур',
        difficulty: 'medium',
        duration: 72,
        price: 45000,
        max_group_size: 12,
        season: '["summer", "autumn"]',
        included: '["Трансфер (3 дня)", "Размещение (2 ночи)", "Все снаряжение", "Питание", "Гид"]',
        not_included: '["Личные расходы", "Страховка"]'
      }
    ];

    for (const tour of tours) {
      await client.query(`
        INSERT INTO tours (
          name, description, short_description, difficulty, duration, price,
          max_group_size, season, included, not_included, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9::jsonb, $10::jsonb, true)
        ON CONFLICT DO NOTHING
      `, [
        tour.name, tour.description, tour.short_description, tour.difficulty,
        tour.duration, tour.price, tour.max_group_size, tour.season,
        tour.included, tour.not_included
      ]);
      console.log(`   ✅ ${tour.name}`);
    }
    console.log('');

    // 4. Создаем партнера-перевозчика (для больших групп)
    console.log('4️⃣  Создание партнера-перевозчика...');
    await client.query(`
      INSERT INTO partners (
        name,
        category,
        description,
        contact,
        is_verified
      ) VALUES (
        'Камчатка Транс',
        'transfer',
        'Транспортные услуги: автобусы и микроавтобусы для больших групп',
        '{
          "email": "kamtrans@test.ru",
          "phone": "+7 (924) 555-02-02",
          "address": "г. Петропавловск-Камчатский"
        }'::jsonb,
        true
      )
      ON CONFLICT DO NOTHING
    `);
    console.log(`   ✅ Камчатка Транс\n`);

    await client.query('COMMIT');

    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ ТЕСТОВЫЙ ПАРТНЕР УСПЕШНО СОЗДАН!\n');
    console.log('📋 Данные для входа:');
    console.log('   Email: kamchatka.all@test.ru');
    console.log('   Пароль: test123456 (установите при первом входе)');
    console.log('');
    console.log('🎯 Роли партнера:');
    console.log('   • operator - Туроператор');
    console.log('   • driver - Трансферы');
    console.log('   • hotel_manager - Размещение');
    console.log('   • provider - Снаряжение');
    console.log('');
    console.log('📦 Созданные ресурсы:');
    console.log('   • 3 тура');
    console.log('   • 1 партнер-перевозчик (для больших групп)');
    console.log('');
    console.log('🚀 Следующие шаги:');
    console.log('   1. Войти в систему: /auth/login');
    console.log('   2. Добавить свой транспорт (УАЗ)');
    console.log('   3. Создать базу отдыха (10 номеров)');
    console.log('   4. Добавить снаряжение');
    console.log('   5. Начать тестирование!');
    console.log('═══════════════════════════════════════════════════════════\n');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Ошибка:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Запуск
if (require.main === module) {
  createTestPartner().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { createTestPartner };
