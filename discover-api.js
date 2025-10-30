const https = require('https');

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
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch(e) {
          resolve({ status: res.statusCode, data: body });
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

async function discover() {
  console.log('🔍 ИССЛЕДОВАНИЕ TIMEWEB CLOUD API\n');
  console.log('='.repeat(60));

  // 1. Пресеты для БД
  console.log('\n📊 ПРЕСЕТЫ ДЛЯ БАЗ ДАННЫХ:');
  try {
    const res = await apiRequest('GET', '/api/v1/presets/dbs');
    if (res.status === 200) {
      const presets = res.data.databases_presets || res.data.dbs_presets || [];
      console.log(`Найдено пресетов: ${presets.length}`);
      presets.slice(0, 5).forEach(p => {
        console.log(`  • ID: ${p.id}, Type: ${p.type || 'N/A'}, CPU: ${p.cpu}, RAM: ${p.ram}MB, Disk: ${p.disk}MB, Price: ${p.price}₽/мес`);
      });
    } else {
      console.log('⚠️  Статус:', res.status);
    }
  } catch (e) {
    console.log('❌', e.message);
  }

  // 2. Конфигуратор БД
  console.log('\n⚙️ КОНФИГУРАТОР БД:');
  try {
    const res = await apiRequest('GET', '/api/v1/configurator/databases');
    console.log('Статус:', res.status);
    if (res.status === 200) {
      console.log('Данные:', JSON.stringify(res.data, null, 2).substring(0, 500));
    }
  } catch (e) {
    console.log('❌', e.message);
  }

  // 3. Софт для БД
  console.log('\n💿 СОФТ ДЛЯ БД:');
  try {
    const res = await apiRequest('GET', '/api/v1/software/databases');
    console.log('Статус:', res.status);
    if (res.status === 200) {
      const software = res.data.databases_software || [];
      console.log(`Найдено: ${software.length}`);
      software.slice(0, 10).forEach(s => {
        console.log(`  • ID: ${s.id}, Name: ${s.name}, Version: ${s.version || 'N/A'}`);
      });
    }
  } catch (e) {
    console.log('❌', e.message);
  }

  // 4. Существующие БД (для примера)
  console.log('\n📦 СУЩЕСТВУЮЩИЕ БД:');
  try {
    const res = await apiRequest('GET', '/api/v1/databases');
    if (res.status === 200) {
      const dbs = res.data.dbs || [];
      console.log(`Найдено: ${dbs.length}`);
      dbs.forEach(db => {
        console.log(`  • ${db.name} (${db.type})`);
      });
    }
  } catch (e) {
    console.log('❌', e.message);
  }

  // 5. S3 Storage - попробуем минимальную конфигурацию
  console.log('\n💾 ТЕСТ СОЗДАНИЯ S3 (минимальная конфигурация):');
  try {
    const res = await apiRequest('POST', '/api/v1/storages/buckets', {
      name: 'test-bucket-' + Date.now(),
      type: 'public'
    });
    console.log('Статус:', res.status);
    if (res.status === 201 || res.status === 200) {
      console.log('✅ S3 создаётся с минимальной конфигурацией!');
      console.log('Данные:', JSON.stringify(res.data, null, 2).substring(0, 300));
      
      // Удаляем тестовый bucket
      if (res.data.bucket?.id) {
        try {
          await apiRequest('DELETE', `/api/v1/storages/buckets/${res.data.bucket.id}`);
          console.log('✅ Тестовый bucket удалён');
        } catch (e) {}
      }
    } else {
      console.log('Ошибка:', res.data);
    }
  } catch (e) {
    console.log('❌', e.message);
  }

  // 6. Firewall groups
  console.log('\n🔥 ТЕСТ СОЗДАНИЯ FIREWALL:');
  try {
    const res = await apiRequest('POST', '/api/v1/firewall/groups', {
      name: 'test-firewall-' + Date.now(),
      description: 'Test'
    });
    console.log('Статус:', res.status);
    if (res.status === 201 || res.status === 200) {
      console.log('✅ Firewall создаётся!');
      console.log('Данные:', JSON.stringify(res.data, null, 2).substring(0, 300));
      
      // Удаляем тестовую группу
      if (res.data.firewall_group?.id) {
        try {
          await apiRequest('DELETE', `/api/v1/firewall/groups/${res.data.firewall_group.id}`);
          console.log('✅ Тестовый firewall удалён');
        } catch (e) {}
      }
    } else {
      console.log('Ошибка:', res.data);
    }
  } catch (e) {
    console.log('❌', e.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎯 ИССЛЕДОВАНИЕ ЗАВЕРШЕНО\n');
}

discover();
