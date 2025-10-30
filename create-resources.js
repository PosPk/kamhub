const https = require('https');
const fs = require('fs');

const token = 'eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCIsImtpZCI6IjFrYnhacFJNQGJSI0tSbE1xS1lqIn0.eyJ1c2VyIjoicGE0MjIxMDgiLCJ0eXBlIjoiYXBpX2tleSIsImFwaV9rZXlfaWQiOiI0MmZmZTY1MC02OWI4LTRmZmQtYTFkOC02OWRkMjMwM2QyY2MiLCJpYXQiOjE3NjE3ODUzNDl9.SFHpwgy9kr-EH2CwN6K1REkOl7KCpiUnMk5ivTRljEaWl8iE-B-BMjaJxaFhpdB2dqcb33ky2oyfwxkU1Sszrbo-8UINnFO5SothY4P6WC8kSSHxFlLI2i0xGCa3YzgyYZ1Wgn2a0jf__ZcyZi7ZsaJkuold9NAeeGCCrAUbdVsr39-fLDL_EKh0iekq_tuO59f_BCmg7Poe7xKlmNYzu2hy3GnfNp3ueKW52H6kFkGwibixS3tWKCHkPpyTAjRztWKCnDZOOG6xDk4sSiPPMlZOEfFzzkpKkizQ9CykBC06SXwmT2uPRR2NyZJIY-PZd4AVZ34H1jXQ-NGquRPi_aYiywt3LtOVDRarpVErBdk6I0qO0Yf33zICvMN-yFpXuY_oSlE8v3C-02XHnYLsMXcHTsUB4ISkJrhglBkv-hTzuiQxwAEZp0eHOEq8YNz6qOLU3RcaNgg0DWGXMDrMzObYx2NknrZUCMbRFftIU-C1Ilo8Ayy98MwI3J77X62p';

function apiRequest(method, path, data) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.timeweb.cloud',
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(body));
          } catch(e) {
            resolve({ raw: body });
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout'));
    });

    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function createDatabase() {
  console.log('\n🗄️ СОЗДАНИЕ POSTGRESQL БАЗЫ ДАННЫХ...\n');
  
  // Используем найденный пресет ID: 357 (postgres, 1 CPU, 1 GB, 8 GB disk)
  const dbConfig = {
    name: 'kamchatour-db',
    type: 'postgres',
    preset_id: 357
  };

  console.log('Конфигурация:', JSON.stringify(dbConfig, null, 2));

  try {
    const response = await apiRequest('POST', '/api/v1/databases', dbConfig);
    
    console.log('\n✅ БАЗА ДАННЫХ СОЗДАНА!');
    console.log('='.repeat(60));
    
    const db = response.db;
    console.log(`ID: ${db.id}`);
    console.log(`Имя: ${db.name}`);
    console.log(`Тип: ${db.type}`);
    console.log(`Хост: ${db.host || 'создаётся...'}`);
    console.log(`Порт: ${db.port || 5432}`);
    console.log(`Логин: ${db.login || 'создаётся...'}`);
    console.log(`Пароль: ${db.password || 'будет отправлен на email'}`);
    console.log(`Статус: ${db.status}`);
    console.log(`Локация: ${db.location || 'N/A'}`);
    
    return db;
  } catch (error) {
    console.log('\n❌ ОШИБКА СОЗДАНИЯ БД:');
    console.log(error.message);
    return null;
  }
}

async function createFirewall() {
  console.log('\n🔥 СОЗДАНИЕ FIREWALL...\n');
  
  try {
    // 1. Создаём группу
    console.log('Шаг 1: Создание группы правил...');
    const groupRes = await apiRequest('POST', '/api/v1/firewall/groups', {
      name: 'kamchatour-firewall',
      description: 'Firewall для KamchaTour Hub'
    });
    
    const groupId = groupRes.group.id;
    console.log(`✅ Группа создана (ID: ${groupId})`);
    
    // 2. Добавляем правила
    console.log('\nШаг 2: Добавление правил...');
    const rules = [
      { protocol: 'tcp', port_from: 22, port_to: 22, direction: 'ingress', cidr: '0.0.0.0/0' },
      { protocol: 'tcp', port_from: 80, port_to: 80, direction: 'ingress', cidr: '0.0.0.0/0' },
      { protocol: 'tcp', port_from: 443, port_to: 443, direction: 'ingress', cidr: '0.0.0.0/0' },
      { protocol: 'tcp', port_from: 3000, port_to: 3000, direction: 'ingress', cidr: '0.0.0.0/0' }
    ];

    for (const rule of rules) {
      try {
        await apiRequest('POST', `/api/v1/firewall/groups/${groupId}/resources/rules`, rule);
        console.log(`✅ Правило добавлено: порт ${rule.port_from}`);
      } catch (e) {
        console.log(`⚠️  Порт ${rule.port_from}: ${e.message}`);
      }
    }
    
    // 3. Применяем к серверу
    console.log('\nШаг 3: Применение к серверу...');
    const servers = await apiRequest('GET', '/api/v1/servers');
    if (servers.servers && servers.servers.length > 0) {
      const serverId = servers.servers[0].id;
      try {
        await apiRequest('PATCH', `/api/v1/servers/${serverId}`, {
          firewall_group_id: groupId
        });
        console.log(`✅ Firewall применён к серверу ${serverId}`);
      } catch (e) {
        console.log(`⚠️  Не удалось применить к серверу: ${e.message}`);
      }
    }
    
    console.log('\n✅ FIREWALL НАСТРОЕН!');
    console.log('='.repeat(60));
    
    return { id: groupId, name: 'kamchatour-firewall' };
  } catch (error) {
    console.log('\n❌ ОШИБКА НАСТРОЙКИ FIREWALL:');
    console.log(error.message);
    return null;
  }
}

async function saveResults(db, firewall) {
  console.log('\n💾 СОХРАНЕНИЕ РЕЗУЛЬТАТОВ...\n');
  
  const result = {
    timestamp: new Date().toISOString(),
    project: 'kamchatour-hub',
    database: db ? {
      id: db.id,
      name: db.name,
      type: db.type,
      host: db.host,
      port: db.port,
      login: db.login,
      password: db.password,
      status: db.status
    } : null,
    firewall: firewall
  };

  fs.writeFileSync('kamchatour-timeweb.json', JSON.stringify(result, null, 2));
  console.log('✅ Результаты: kamchatour-timeweb.json');

  // .env файл
  if (db) {
    let env = '# KamchaTour Hub - Timeweb Cloud\n';
    env += `# Создано: ${new Date().toLocaleString()}\n\n`;
    env += `# PostgreSQL Database\n`;
    env += `DATABASE_URL=postgresql://${db.login}:${db.password}@${db.host}:${db.port}/${db.name}\n`;
    env += `DB_HOST=${db.host}\n`;
    env += `DB_PORT=${db.port}\n`;
    env += `DB_USER=${db.login}\n`;
    env += `DB_PASSWORD=${db.password}\n`;
    env += `DB_NAME=${db.name}\n`;
    
    fs.writeFileSync('.env.kamchatour', env);
    console.log('✅ .env файл: .env.kamchatour');
  }
}

async function run() {
  console.log('🚀 СОЗДАНИЕ РЕСУРСОВ KAMCHATOUR HUB');
  console.log('='.repeat(60));

  const db = await createDatabase();
  const firewall = await createFirewall();
  
  await saveResults(db, firewall);

  console.log('\n' + '='.repeat(60));
  console.log('🎉 ГОТОВО!\n');
  
  console.log('📋 СОЗДАННЫЕ РЕСУРСЫ:');
  console.log(`   • PostgreSQL: ${db ? '✅ Создана' : '❌ Ошибка'}`);
  console.log(`   • Firewall: ${firewall ? '✅ Настроен' : '❌ Ошибка'}`);
  console.log(`   • S3: ⚠️  Требует активации тарифа\n`);
  
  if (db) {
    console.log('🔗 ПОДКЛЮЧЕНИЕ К БД:');
    console.log(`   postgresql://${db.login}:${db.password}@${db.host}:${db.port}/${db.name}\n`);
  }
  
  console.log('📂 ФАЙЛЫ:');
  console.log('   • kamchatour-timeweb.json - детали');
  console.log('   • .env.kamchatour - переменные окружения\n');
  
  console.log('⚠️  НЕ ЗАБУДЬТЕ:');
  console.log('   1. ОТОЗВАТЬ временный токен!');
  console.log('   2. Проверить email для паролей');
  console.log('   3. Активировать S3 Storage в панели Timeweb');
}

run();
