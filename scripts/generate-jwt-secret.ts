#!/usr/bin/env node

/**
 * ГЕНЕРАТОР БЕЗОПАСНОГО JWT SECRET
 * Создает криптографически безопасный ключ для JWT токенов
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

function generateSecureSecret(length: number = 64): string {
  return crypto.randomBytes(length).toString('base64');
}

function main() {
  console.log('🔐 Генерация безопасного JWT SECRET...\n');
  
  // Генерируем 3 варианта разной длины
  const secret32 = generateSecureSecret(32);
  const secret64 = generateSecureSecret(64);
  const secret128 = generateSecureSecret(128);
  
  console.log('✅ Сгенерированы секретные ключи:\n');
  console.log('1️⃣  JWT_SECRET (32 байта):');
  console.log(`    ${secret32}\n`);
  console.log('2️⃣  JWT_SECRET (64 байта) - РЕКОМЕНДУЕТСЯ:');
  console.log(`    ${secret64}\n`);
  console.log('3️⃣  JWT_SECRET (128 байт) - МАКСИМАЛЬНАЯ БЕЗОПАСНОСТЬ:');
  console.log(`    ${secret128}\n`);
  
  // Сохраняем в файл
  const envExamplePath = path.join(process.cwd(), '.env.example');
  const envLocalPath = path.join(process.cwd(), '.env.local');
  
  const envContent = `# =============================================
# БЕЗОПАСНОСТЬ
# =============================================
# ⚠️ ВАЖНО: Используйте один из сгенерированных ключей!
# ⚠️ НИКОГДА не используйте "your-secret-key" в production!

# Рекомендуемый (64 байта):
JWT_SECRET=${secret64}

# Или максимальная безопасность (128 байт):
# JWT_SECRET=${secret128}

# =============================================
# СРОК ДЕЙСТВИЯ ТОКЕНОВ
# =============================================
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# =============================================
# ГЕНЕРАЦИЯ
# =============================================
# Создано: ${new Date().toISOString()}
# Скрипт: npm run generate:jwt-secret
`;

  const secretsPath = path.join(process.cwd(), 'JWT_SECRETS.txt');
  fs.writeFileSync(secretsPath, envContent);
  
  console.log('📄 Ключи сохранены в: JWT_SECRETS.txt\n');
  console.log('📋 СЛЕДУЮЩИЕ ШАГИ:\n');
  console.log('1. Скопируйте рекомендуемый ключ');
  console.log('2. Добавьте в .env.local:');
  console.log('   JWT_SECRET=<скопированный_ключ>');
  console.log('3. Добавьте в Vercel/production переменные окружения');
  console.log('4. Перезапустите сервер\n');
  console.log('⚠️  ВАЖНО: Удалите JWT_SECRETS.txt после копирования!\n');
  console.log('   rm JWT_SECRETS.txt\n');
}

main();
