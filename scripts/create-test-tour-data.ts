#!/usr/bin/env tsx

/**
 * Создание тестовых данных для Tour System
 */

import { Pool } from 'pg';

const pool = new Pool({
  host: '51e6e5ca5d967b8e81fc9b75.twc1.net',
  port: 5432,
  database: 'default_db',
  user: 'gen_user',
  password: 'q;3U+PY7XCz@Br',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  console.log('🎯 Creating test data for Tour System');
  console.log('=====================================\n');

  try {
    // 1. Создаем тестового оператора (если нет)
    console.log('1️⃣ Creating test operator...');
    const operatorResult = await pool.query(`
      INSERT INTO partners (name, category, description, contact, rating, is_verified)
      VALUES (
        'Камчатские приключения',
        'operator',
        'Ведущий туроператор Камчатки с опытом более 15 лет',
        '{"phone": "+7 (4152) 123-456", "email": "info@kamchatka-adventures.ru", "website": "https://kamchatka-adventures.ru"}',
        4.9,
        true
      )
      ON CONFLICT DO NOTHING
      RETURNING id
    `);
    
    let operatorId;
    if (operatorResult.rows.length > 0) {
      operatorId = operatorResult.rows[0].id;
      console.log(`   ✅ Operator created: ${operatorId}\n`);
    } else {
      const existing = await pool.query(`SELECT id FROM partners WHERE category = 'operator' LIMIT 1`);
      operatorId = existing.rows[0].id;
      console.log(`   ℹ️  Using existing operator: ${operatorId}\n`);
    }

    // 2. Создаем тестовый тур
    console.log('2️⃣ Creating test tour...');
    const tourResult = await pool.query(`
      INSERT INTO tours (
        name, description, short_description, difficulty, duration, price,
        season, requirements, included, operator_id, max_group_size, min_group_size, is_active
      ) VALUES (
        'Восхождение на Авачинский вулкан',
        'Классический маршрут на один из самых доступных вулканов Камчатки. Потрясающие виды на Петропавловск-Камчатский и Тихий океан.',
        'Однодневное восхождение на действующий вулкан',
        'medium',
        10,
        15000.00,
        '["summer", "autumn"]',
        '["Опыт горных походов", "Физическая подготовка"]',
        '["Трекинговые палки", "Каска", "Рация", "Обед"]',
        $1,
        12,
        2,
        true
      )
      RETURNING id
    `, [operatorId]);
    
    const tourId = tourResult.rows[0].id;
    console.log(`   ✅ Tour created: ${tourId}\n`);

    // 3. Создаем расписание на ближайшие 7 дней
    console.log('3️⃣ Creating tour schedules...');
    
    const schedules = [];
    for (let i = 1; i <= 7; i++) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + i);
      
      const scheduleResult = await pool.query(`
        INSERT INTO tour_schedules (
          tour_id,
          operator_id,
          start_date,
          departure_time,
          return_time,
          max_participants,
          min_participants,
          available_slots,
          base_price,
          price_per_person,
          status,
          weather_dependent,
          meeting_point,
          cancellation_deadline
        ) VALUES (
          $1, $2, $3, '07:00', '17:00', 12, 2, 12, 15000.00, 15000.00,
          'scheduled', true, 'Площадь Ленина, Петропавловск-Камчатский', '24 hours'
        )
        RETURNING id, start_date
      `, [tourId, operatorId, startDate.toISOString().split('T')[0]]);
      
      schedules.push(scheduleResult.rows[0]);
      console.log(`   ✅ Schedule ${i}: ${scheduleResult.rows[0].start_date} (id: ${scheduleResult.rows[0].id})`);
    }
    
    console.log('');

    // 4. Создаем тестового пользователя
    console.log('4️⃣ Creating test user...');
    const userResult = await pool.query(`
      INSERT INTO users (email, name, role, preferences)
      VALUES (
        'test@kamchatour.ru',
        'Тестовый Пользователь',
        'tourist',
        '{"interests": ["hiking", "volcanoes"], "budget": {"min": 10000, "max": 50000}}'
      )
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `);
    
    const userId = userResult.rows[0].id;
    console.log(`   ✅ User: ${userId}\n`);

    // 5. Создаем тестовое бронирование
    console.log('5️⃣ Creating test booking...');
    const testScheduleId = schedules[2].id; // 3й день
    
    const bookingResult = await pool.query(`
      INSERT INTO tour_bookings_v2 (
        user_id, operator_id, tour_id, schedule_id,
        booking_number, confirmation_code,
        booking_date, tour_start_date,
        participants_count, adults_count, children_count,
        base_price, total_price,
        contact_name, contact_phone, contact_email,
        status, payment_status
      ) VALUES (
        $1, $2, $3, $4,
        'TKH-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-0001',
        'TEST123456',
        NOW(), $5,
        2, 2, 0,
        15000.00, 30000.00,
        'Иван Тестовый', '+7 999 123-4567', 'test@kamchatour.ru',
        'confirmed', 'paid'
      )
      RETURNING id, booking_number
    `, [userId, operatorId, tourId, testScheduleId, schedules[2].start_date]);
    
    console.log(`   ✅ Booking: ${bookingResult.rows[0].booking_number}\n`);

    // 6. Обновляем доступные места
    await pool.query(`
      UPDATE tour_schedules
      SET available_slots = available_slots - 2
      WHERE id = $1
    `, [testScheduleId]);

    // Summary
    console.log('📊 Summary:');
    const summary = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM partners WHERE category = 'operator') as operators,
        (SELECT COUNT(*) FROM tours) as tours,
        (SELECT COUNT(*) FROM tour_schedules) as schedules,
        (SELECT COUNT(*) FROM tour_bookings_v2) as bookings,
        (SELECT COUNT(*) FROM users) as users
    `);
    
    const stats = summary.rows[0];
    console.log(`   👥 Users: ${stats.users}`);
    console.log(`   🏢 Operators: ${stats.operators}`);
    console.log(`   🎒 Tours: ${stats.tours}`);
    console.log(`   📅 Schedules: ${stats.schedules}`);
    console.log(`   🎫 Bookings: ${stats.bookings}`);

    console.log('\n🎉 Test data created successfully!\n');
    
    console.log('🧪 Test commands:');
    console.log('   curl "http://localhost:3002/api/tours/availability?scheduleId=' + schedules[0].id + '&participantsCount=2"');
    console.log('\n✅ Ready to test!');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    console.error('   Code:', error.code);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
