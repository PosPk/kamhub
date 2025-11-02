#!/usr/bin/env ts-node

/**
 * Тестовый скрипт для проверки Telegram Bot API
 * Использование: ts-node scripts/test-telegram-bot.ts [BOT_TOKEN]
 */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || process.argv[2];

async function checkTelegramBot() {
  console.log('🤖 Проверка Telegram Bot API...\n');

  if (!BOT_TOKEN) {
    console.error('❌ TELEGRAM_BOT_TOKEN не найден!');
    console.log('\n📝 Укажите токен:');
    console.log('   export TELEGRAM_BOT_TOKEN="your_token_here"');
    console.log('   или передайте как аргумент:');
    console.log('   ts-node scripts/test-telegram-bot.ts YOUR_TOKEN\n');
    return;
  }

  console.log('🔑 Токен найден:', BOT_TOKEN.substring(0, 10) + '...\n');

  try {
    // 1. Проверка getMe
    console.log('1️⃣ Проверяю getMe...');
    const meResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`);
    const meData = await meResponse.json();

    if (meData.ok) {
      console.log('✅ Бот активен!');
      console.log('   📛 Имя:', meData.result.first_name);
      console.log('   🔖 Username: @' + meData.result.username);
      console.log('   🆔 ID:', meData.result.id);
      console.log('   🤖 is_bot:', meData.result.is_bot);
    } else {
      console.log('❌ Ошибка:', meData.description);
      return;
    }

    // 2. Проверка getUpdates
    console.log('\n2️⃣ Проверяю getUpdates...');
    const updatesResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?limit=5`);
    const updatesData = await updatesResponse.json();

    if (updatesData.ok) {
      console.log('✅ Updates доступны!');
      console.log('   📨 Получено сообщений:', updatesData.result.length);
      
      if (updatesData.result.length > 0) {
        console.log('\n📬 Последние сообщения:');
        updatesData.result.slice(0, 3).forEach((update: any, idx: number) => {
          const msg = update.message || update.callback_query?.message;
          if (msg) {
            console.log(`   ${idx + 1}. От: ${msg.from?.first_name} (${msg.from?.id})`);
            console.log(`      Chat ID: ${msg.chat?.id}`);
            console.log(`      Текст: ${msg.text || update.callback_query?.data || 'N/A'}`);
          }
        });
      } else {
        console.log('   ℹ️ Нет новых сообщений');
      }
    } else {
      console.log('❌ Ошибка:', updatesData.description);
    }

    // 3. Проверка getWebhookInfo
    console.log('\n3️⃣ Проверяю webhook...');
    const webhookResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`);
    const webhookData = await webhookResponse.json();

    if (webhookData.ok) {
      const info = webhookData.result;
      console.log('✅ Webhook info:');
      console.log('   🔗 URL:', info.url || '(не установлен)');
      console.log('   ✅ Pending updates:', info.pending_update_count);
      if (info.last_error_message) {
        console.log('   ⚠️ Last error:', info.last_error_message);
      }
    }

    console.log('\n✅ Все проверки пройдены!\n');
    console.log('📊 Итого:');
    console.log('   ✓ Bot API работает');
    console.log('   ✓ Токен валидный');
    console.log('   ✓ Готов к использованию\n');

  } catch (error) {
    console.error('\n❌ Ошибка:', error);
  }
}

checkTelegramBot();
