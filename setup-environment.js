const https = require('https');

const token = 'eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCIsImtpZCI6IjFrYnhacFJNQGJSI0tSbE1xS1lqIn0.eyJ1c2VyIjoicGE0MjIxMDgiLCJ0eXBlIjoiYXBpX2tleSIsImFwaV9rZXlfaWQiOiI0MmZmZTY1MC02OWI4LTRmZmQtYTFkOC02OWRkMjMwM2QyY2MiLCJpYXQiOjE3NjE3ODUzNDl9.SFHpwgy9kr-EH2CwN6K1REkOl7KCpiUnMk5ivTRljEaWl8iE-B-BMjaJxaFhpdB2dqcb33ky2oyfwxkU1Sszrbo-8UINnFO5SothY4P6WC8kSSHxFlLI2i0xGCa3YzgyYZ1Wgn2a0jf__ZcyZi7ZsaJkuold9NAeeGCCrAUbdVsr39-fLDL_EKh0iekq_tuO59f_BCmg7Poe7xKlmNYzu2hy3GnfNp3ueKW52H6kFkGwibixS3tWKCHkPpyTAjRztWKCnDZOOG6xDk4sSiPPMlZOEfFzzkpKkizQ9CykBC06SXwmT2uPRR2NyZJIY-PZd4AVZ34H1jXQ-NGquRPi_aYiywt3LtOVDRarpVErBdk6I0qO0Yf33zICvMN-yFpXuY_oSlE8v3C-02XHnYLsMXcHTsUB4ISkJrhglBkv-hTzuiQxwAEZp0eHOEq8YNz6qOLU3RcaNgg0DWGXMDrMzObYx2NknrZUCMbRFftIU-C1Ilo8Ayy98MwI3J77X62p';

const fs = require('fs');

console.log('🚀 НАСТРОЙКА ОКРУЖЕНИЯ KAMCHATOUR HUB НА TIMEWEB CLOUD\n');
console.log('='.repeat(70));

const resources = {
  database: null,
  s3: null,
  firewall: null,
  existingServer: null
};

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
      reject(new Error('Request timeout'));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function getExistingServer() {
  console.log('\n📦 Проверка существующего VDS сервера...');
  try {
    const response = await apiRequest('GET', '/api/v1/servers');
    const servers = response.servers || [];
    
    if (servers.length > 0) {
      const server = servers[0];
      console.log(`✅ Найден сервер: ${server.name}`);
      console.log(`   ID: ${server.id}`);
      console.log(`   IP: ${server.main_ipv4 || 'N/A'}`);
      console.log(`   Регион: ${server.location}`);
      console.log(`   Статус: ${server.status}`);
      resources.existingServer = server;
      return server;
    } else {
      console.log('⚠️  Серверы не найдены');
      return null;
    }
  } catch (error) {
    console.log('❌ Ошибка получения серверов:', error.message);
    return null;
  }
}

async function createDatabase() {
  console.log('\n🗄️ Создание PostgreSQL базы данных...');
  
  const dbConfig = {
    name: 'kamchatour-db',
    type: 'postgres',
    hash_type: 'caching_sha2',
    preset_id: 1, // Попробуем с минимальным preset
    comment: 'PostgreSQL база для KamchaTour Hub',
    is_only_local_ip_access: false,
    availability_zone: resources.existingServer?.availability_zone || 'nsk-1'
  };

  console.log('Конфигурация:', JSON.stringify(dbConfig, null, 2));

  try {
    const response = await apiRequest('POST', '/api/v1/databases', dbConfig);
    
    if (response.db) {
      console.log('✅ База данных создана!');
      console.log(`   ID: ${response.db.id}`);
      console.log(`   Имя: ${response.db.name}`);
      console.log(`   Host: ${response.db.host || 'создаётся...'}`);
      console.log(`   Port: ${response.db.port || 5432}`);
      console.log(`   Статус: ${response.db.status || 'creating'}`);
      resources.database = response.db;
      return response.db;
    } else {
      throw new Error('Некорректный ответ от API');
    }
  } catch (error) {
    console.log('❌ Ошибка создания БД:', error.message);
    
    // Пробуем альтернативную конфигурацию
    console.log('\n⚙️ Пробую альтернативную конфигурацию...');
    
    try {
      const altConfig = {
        name: 'kamchatour-db',
        type: 'postgres',
        preset_id: 1
      };
      
      const response = await apiRequest('POST', '/api/v1/databases', altConfig);
      if (response.db) {
        console.log('✅ База данных создана (альтернативная конфигурация)!');
        resources.database = response.db;
        return response.db;
      }
    } catch (err) {
      console.log('❌ Альтернативная конфигурация тоже не сработала:', err.message);
    }
    
    return null;
  }
}

async function createS3Bucket() {
  console.log('\n💾 Создание S3 Storage bucket...');
  
  const bucketConfig = {
    name: 'kamchatour-media',
    type: 'private',
    location: resources.existingServer?.location || 'ru-2'
  };

  console.log('Конфигурация:', JSON.stringify(bucketConfig, null, 2));

  try {
    const response = await apiRequest('POST', '/api/v1/storages/buckets', bucketConfig);
    
    if (response.bucket) {
      console.log('✅ S3 bucket создан!');
      console.log(`   ID: ${response.bucket.id}`);
      console.log(`   Имя: ${response.bucket.name}`);
      console.log(`   Endpoint: ${response.bucket.hostname || 'N/A'}`);
      console.log(`   Access Key: ${response.bucket.access_key || 'будет в email'}`);
      console.log(`   Secret Key: ${response.bucket.secret_key ? '***' : 'будет в email'}`);
      resources.s3 = response.bucket;
      return response.bucket;
    } else {
      throw new Error('Некорректный ответ от API');
    }
  } catch (error) {
    console.log('❌ Ошибка создания S3:', error.message);
    return null;
  }
}

async function setupFirewall() {
  console.log('\n🔥 Настройка Firewall...');
  
  if (!resources.existingServer) {
    console.log('⚠️  Нет сервера для применения Firewall');
    return null;
  }

  // Создаём группу правил
  const groupConfig = {
    name: 'kamchatour-firewall',
    comment: 'Firewall для KamchaTour Hub'
  };

  try {
    console.log('Создание группы правил...');
    const groupResponse = await apiRequest('POST', '/api/v1/firewall/groups', groupConfig);
    
    if (!groupResponse.firewall_group) {
      throw new Error('Не удалось создать группу Firewall');
    }

    const groupId = groupResponse.firewall_group.id;
    console.log(`✅ Группа создана (ID: ${groupId})`);

    // Добавляем правила
    const rules = [
      { protocol: 'tcp', port_from: 22, port_to: 22, direction: 'ingress', cidr: '0.0.0.0/0', description: 'SSH' },
      { protocol: 'tcp', port_from: 80, port_to: 80, direction: 'ingress', cidr: '0.0.0.0/0', description: 'HTTP' },
      { protocol: 'tcp', port_from: 443, port_to: 443, direction: 'ingress', cidr: '0.0.0.0/0', description: 'HTTPS' },
      { protocol: 'tcp', port_from: 3000, port_to: 3000, direction: 'ingress', cidr: '0.0.0.0/0', description: 'Next.js' }
    ];

    console.log('Добавление правил...');
    for (const rule of rules) {
      try {
        await apiRequest('POST', `/api/v1/firewall/groups/${groupId}/rules`, rule);
        console.log(`   ✅ ${rule.description} (${rule.port_from})`);
      } catch (e) {
        console.log(`   ⚠️  ${rule.description}: ${e.message}`);
      }
    }

    // Применяем к серверу
    console.log('Применение к серверу...');
    try {
      await apiRequest('POST', `/api/v1/servers/${resources.existingServer.id}/firewall`, {
        group_id: groupId
      });
      console.log('✅ Firewall применён к серверу');
    } catch (e) {
      console.log('⚠️  Не удалось применить к серверу:', e.message);
    }

    resources.firewall = { id: groupId, name: 'kamchatour-firewall' };
    return resources.firewall;
    
  } catch (error) {
    console.log('❌ Ошибка настройки Firewall:', error.message);
    return null;
  }
}

async function saveResults() {
  console.log('\n💾 Сохранение результатов...');
  
  const result = {
    timestamp: new Date().toISOString(),
    project: 'kamchatour-hub',
    server: resources.existingServer ? {
      id: resources.existingServer.id,
      name: resources.existingServer.name,
      ip: resources.existingServer.main_ipv4,
      location: resources.existingServer.location
    } : null,
    database: resources.database ? {
      id: resources.database.id,
      name: resources.database.name,
      host: resources.database.host,
      port: resources.database.port,
      login: resources.database.login,
      password: resources.database.password
    } : null,
    s3: resources.s3 ? {
      id: resources.s3.id,
      name: resources.s3.name,
      endpoint: resources.s3.hostname,
      access_key: resources.s3.access_key,
      secret_key: resources.s3.secret_key
    } : null,
    firewall: resources.firewall
  };

  fs.writeFileSync('timeweb-setup-result.json', JSON.stringify(result, null, 2));
  console.log('✅ Результаты сохранены в timeweb-setup-result.json');

  // Генерируем .env файл
  if (result.database || result.s3) {
    let envContent = '# Timeweb Cloud Configuration\n';
    envContent += `# Создано: ${new Date().toLocaleString()}\n\n`;
    
    if (result.server) {
      envContent += `# VDS Server\n`;
      envContent += `SERVER_IP=${result.server.ip}\n\n`;
    }
    
    if (result.database) {
      envContent += `# PostgreSQL Database\n`;
      envContent += `DATABASE_URL=postgresql://${result.database.login}:${result.database.password}@${result.database.host}:${result.database.port}/${result.database.name}\n`;
      envContent += `DB_HOST=${result.database.host}\n`;
      envContent += `DB_PORT=${result.database.port}\n`;
      envContent += `DB_USER=${result.database.login}\n`;
      envContent += `DB_PASSWORD=${result.database.password}\n`;
      envContent += `DB_NAME=${result.database.name}\n\n`;
    }
    
    if (result.s3) {
      envContent += `# S3 Storage\n`;
      envContent += `S3_ENDPOINT=https://${result.s3.endpoint}\n`;
      envContent += `S3_BUCKET=${result.s3.name}\n`;
      envContent += `S3_ACCESS_KEY=${result.s3.access_key}\n`;
      envContent += `S3_SECRET_KEY=${result.s3.secret_key}\n`;
    }

    fs.writeFileSync('.env.timeweb', envContent);
    console.log('✅ .env файл создан: .env.timeweb');
  }
}

async function run() {
  try {
    console.log('\n🔍 ЭТАП 1: Проверка существующих ресурсов');
    await getExistingServer();

    console.log('\n🏗️ ЭТАП 2: Создание новых ресурсов');
    await createDatabase();
    await createS3Bucket();
    await setupFirewall();

    console.log('\n📊 ЭТАП 3: Сохранение результатов');
    await saveResults();

    console.log('\n' + '='.repeat(70));
    console.log('🎉 НАСТРОЙКА ЗАВЕРШЕНА!\n');
    
    console.log('📋 СОЗДАННЫЕ РЕСУРСЫ:');
    console.log(`   • VDS: ${resources.existingServer ? '✅ Использован существующий' : '❌ Не найден'}`);
    console.log(`   • PostgreSQL: ${resources.database ? '✅ Создана' : '❌ Не создана'}`);
    console.log(`   • S3 Storage: ${resources.s3 ? '✅ Создан' : '❌ Не создан'}`);
    console.log(`   • Firewall: ${resources.firewall ? '✅ Настроен' : '❌ Не настроен'}`);
    
    console.log('\n📂 ФАЙЛЫ:');
    console.log('   • timeweb-setup-result.json - детальная информация');
    console.log('   • .env.timeweb - переменные окружения\n');
    
    console.log('🚀 СЛЕДУЮЩИЕ ШАГИ:');
    console.log('   1. Проверьте файлы timeweb-setup-result.json и .env.timeweb');
    console.log('   2. Скопируйте .env.timeweb в .env.production на сервере');
    console.log('   3. Подключитесь к серверу: ssh root@' + (resources.existingServer?.main_ipv4 || 'IP'));
    console.log('   4. Разверните приложение');
    
  } catch (error) {
    console.error('\n💥 КРИТИЧЕСКАЯ ОШИБКА:', error);
    process.exit(1);
  }
}

run();
