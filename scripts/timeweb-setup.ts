#!/usr/bin/env tsx

/**
 * Автоматическая настройка Timeweb Cloud для проекта KamchaTour Hub
 * 
 * Использование:
 * 1. Получите API token в панели Timeweb Cloud
 * 2. Экспортируйте: export TIMEWEB_TOKEN=your_token
 * 3. Запустите: tsx scripts/timeweb-setup.ts
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';

const execAsync = promisify(exec);

interface TimewebConfig {
  apiToken: string;
  apiUrl: string;
  project: {
    name: string;
    region: string;
  };
  vds: {
    os: string;
    cpu: number;
    ram: number;
    disk: number;
    preset?: string;
  };
  database: {
    type: string;
    version: string;
    cpu: number;
    ram: number;
    disk: number;
  };
  s3: {
    bucketName: string;
    region: string;
  };
}

class TimewebCloudSetup {
  private config: TimewebConfig;
  private headers: Record<string, string>;

  constructor(config: TimewebConfig) {
    this.config = config;
    this.headers = {
      'Authorization': `Bearer ${config.apiToken}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Проверка доступности API
   */
  async checkAPI(): Promise<boolean> {
    console.log('🔍 Проверка доступности Timeweb Cloud API...');
    
    try {
      const response = await this.apiRequest('GET', '/api/v1/account');
      console.log('✅ API доступен');
      console.log(`   Аккаунт: ${response.email || 'N/A'}`);
      return true;
    } catch (error) {
      console.error('❌ Ошибка доступа к API:', error.message);
      return false;
    }
  }

  /**
   * Получение списка доступных регионов
   */
  async getRegions(): Promise<any[]> {
    console.log('🌍 Получение списка регионов...');
    
    try {
      const response = await this.apiRequest('GET', '/api/v1/locations');
      console.log(`✅ Доступно регионов: ${response.locations?.length || 0}`);
      return response.locations || [];
    } catch (error) {
      console.error('❌ Ошибка получения регионов:', error.message);
      return [];
    }
  }

  /**
   * Получение списка доступных пресетов для VDS
   */
  async getVDSPresets(): Promise<any[]> {
    console.log('💻 Получение пресетов VDS...');
    
    try {
      const response = await this.apiRequest('GET', '/api/v1/presets/vds');
      console.log(`✅ Доступно пресетов: ${response.presets?.length || 0}`);
      return response.presets || [];
    } catch (error) {
      console.error('❌ Ошибка получения пресетов:', error.message);
      return [];
    }
  }

  /**
   * Создание VDS сервера
   */
  async createVDS(): Promise<any> {
    console.log('\n📦 Создание VDS сервера...');
    console.log(`   OS: ${this.config.vds.os}`);
    console.log(`   CPU: ${this.config.vds.cpu} vCPU`);
    console.log(`   RAM: ${this.config.vds.ram} GB`);
    console.log(`   Disk: ${this.config.vds.disk} GB`);
    
    try {
      const payload = {
        name: `${this.config.project.name}-vds`,
        comment: `VDS сервер для ${this.config.project.name}`,
        os_id: this.config.vds.os,
        preset_id: this.config.vds.preset,
        location: this.config.project.region,
        // Альтернативно, если нет preset_id:
        configurator: {
          cpu: this.config.vds.cpu,
          ram: this.config.vds.ram * 1024, // MB
          disk: this.config.vds.disk * 1024, // MB
        },
      };

      const response = await this.apiRequest('POST', '/api/v1/servers', payload);
      
      console.log('✅ VDS сервер создан');
      console.log(`   ID: ${response.server?.id}`);
      console.log(`   IP: ${response.server?.main_ipv4}`);
      console.log(`   Пароль: ${response.server?.password || 'Отправлен на email'}`);
      
      return response.server;
    } catch (error) {
      console.error('❌ Ошибка создания VDS:', error.message);
      throw error;
    }
  }

  /**
   * Создание PostgreSQL базы данных
   */
  async createDatabase(): Promise<any> {
    console.log('\n🗄️ Создание PostgreSQL базы данных...');
    console.log(`   Версия: ${this.config.database.version}`);
    console.log(`   CPU: ${this.config.database.cpu} vCPU`);
    console.log(`   RAM: ${this.config.database.ram} GB`);
    
    try {
      const payload = {
        name: `${this.config.project.name}-db`,
        type: this.config.database.type,
        version: this.config.database.version,
        location: this.config.project.region,
        configurator: {
          cpu: this.config.database.cpu,
          ram: this.config.database.ram * 1024,
          disk: this.config.database.disk * 1024,
        },
      };

      const response = await this.apiRequest('POST', '/api/v1/databases', payload);
      
      console.log('✅ База данных создана');
      console.log(`   ID: ${response.database?.id}`);
      console.log(`   Host: ${response.database?.host}`);
      console.log(`   Port: ${response.database?.port}`);
      console.log(`   User: ${response.database?.login}`);
      console.log(`   Password: ${response.database?.password || 'Отправлен на email'}`);
      
      return response.database;
    } catch (error) {
      console.error('❌ Ошибка создания БД:', error.message);
      throw error;
    }
  }

  /**
   * Создание S3 бакета
   */
  async createS3Bucket(): Promise<any> {
    console.log('\n💾 Создание S3 bucket...');
    console.log(`   Имя: ${this.config.s3.bucketName}`);
    
    try {
      const payload = {
        name: this.config.s3.bucketName,
        location: this.config.s3.region,
        type: 'public', // или 'private'
      };

      const response = await this.apiRequest('POST', '/api/v1/storages/buckets', payload);
      
      console.log('✅ S3 bucket создан');
      console.log(`   ID: ${response.bucket?.id}`);
      console.log(`   Endpoint: ${response.bucket?.hostname}`);
      console.log(`   Access Key: ${response.bucket?.access_key}`);
      console.log(`   Secret Key: ${response.bucket?.secret_key}`);
      
      return response.bucket;
    } catch (error) {
      console.error('❌ Ошибка создания S3 bucket:', error.message);
      throw error;
    }
  }

  /**
   * Настройка Firewall правил
   */
  async setupFirewall(serverId: string): Promise<any> {
    console.log('\n🔥 Настройка Firewall...');
    
    const rules = [
      { protocol: 'tcp', port: 22, direction: 'ingress', description: 'SSH' },
      { protocol: 'tcp', port: 80, direction: 'ingress', description: 'HTTP' },
      { protocol: 'tcp', port: 443, direction: 'ingress', description: 'HTTPS' },
      { protocol: 'tcp', port: 3000, direction: 'ingress', description: 'Next.js (temporary)' },
    ];

    try {
      // Создаем группу правил
      const groupPayload = {
        name: `${this.config.project.name}-firewall`,
        description: `Firewall rules for ${this.config.project.name}`,
      };

      const groupResponse = await this.apiRequest('POST', '/api/v1/firewall/groups', groupPayload);
      const groupId = groupResponse.group?.id;

      console.log(`✅ Firewall группа создана (ID: ${groupId})`);

      // Добавляем правила
      for (const rule of rules) {
        await this.apiRequest('POST', `/api/v1/firewall/groups/${groupId}/rules`, rule);
        console.log(`   ✅ Правило добавлено: ${rule.description} (${rule.port})`);
      }

      // Применяем к серверу
      await this.apiRequest('POST', `/api/v1/servers/${serverId}/firewall`, {
        group_id: groupId,
      });

      console.log(`✅ Firewall применен к серверу`);
      
      return groupResponse.group;
    } catch (error) {
      console.error('❌ Ошибка настройки Firewall:', error.message);
      throw error;
    }
  }

  /**
   * Генерация .env файла с настройками
   */
  async generateEnvFile(resources: any): Promise<void> {
    console.log('\n📝 Генерация .env.production файла...');
    
    const envContent = `
# Сгенерировано автоматически: ${new Date().toISOString()}
# Timeweb Cloud Configuration для ${this.config.project.name}

# Основные настройки
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_APP_URL=http://${resources.vds?.main_ipv4}

# База данных PostgreSQL
DATABASE_URL=postgresql://${resources.database?.login}:${resources.database?.password}@${resources.database?.host}:${resources.database?.port}/${resources.database?.name}?sslmode=require

# S3 Object Storage
S3_ACCESS_KEY_ID=${resources.s3?.access_key}
S3_SECRET_ACCESS_KEY=${resources.s3?.secret_key}
S3_BUCKET_NAME=${resources.s3?.name}
S3_ENDPOINT=https://${resources.s3?.hostname}
S3_REGION=${this.config.s3.region}

# Сервер
SERVER_IP=${resources.vds?.main_ipv4}
SERVER_PASSWORD=${resources.vds?.password}

# AI провайдеры (нужно добавить вручную)
GROQ_API_KEY=your_groq_api_key_here
DEEPSEEK_API_KEY=your_deepseek_api_key_here
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Карты
YANDEX_MAPS_API_KEY=your_yandex_maps_key_here
YANDEX_WEATHER_API_KEY=your_yandex_weather_key_here

# Auth
JWT_SECRET=${this.generateRandomString(32)}
NEXTAUTH_SECRET=${this.generateRandomString(32)}
NEXTAUTH_URL=http://${resources.vds?.main_ipv4}

# Telegram Bot (если используется)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_WEBHOOK_URL=http://${resources.vds?.main_ipv4}/api/telegram/webhook

# Платежи (если используются)
CLOUDPAYMENTS_PUBLIC_ID=your_cloudpayments_id
CLOUDPAYMENTS_API_SECRET=your_cloudpayments_secret

# Мониторинг
SENTRY_DSN=your_sentry_dsn_here
`.trim();

    await fs.writeFile('.env.production.timeweb', envContent);
    console.log('✅ Файл .env.production.timeweb создан');
    console.log('   ⚠️  Не забудьте добавить API ключи для внешних сервисов!');
  }

  /**
   * Сохранение информации о созданных ресурсах
   */
  async saveResourceInfo(resources: any): Promise<void> {
    console.log('\n💾 Сохранение информации о ресурсах...');
    
    const info = {
      timestamp: new Date().toISOString(),
      project: this.config.project.name,
      resources: {
        vds: {
          id: resources.vds?.id,
          ip: resources.vds?.main_ipv4,
          name: resources.vds?.name,
          status: resources.vds?.status,
        },
        database: {
          id: resources.database?.id,
          host: resources.database?.host,
          port: resources.database?.port,
          name: resources.database?.name,
          type: this.config.database.type,
        },
        s3: {
          id: resources.s3?.id,
          name: resources.s3?.name,
          endpoint: resources.s3?.hostname,
        },
        firewall: {
          id: resources.firewall?.id,
          name: resources.firewall?.name,
        },
      },
      nextSteps: [
        '1. Подключитесь к серверу через SSH',
        '2. Запустите скрипт setup-timeweb-server.sh',
        '3. Скопируйте .env.production.timeweb в .env.production',
        '4. Добавьте недостающие API ключи',
        '5. Разверните приложение с помощью deploy-to-timeweb.sh',
      ],
    };

    await fs.writeFile(
      'timeweb-resources.json',
      JSON.stringify(info, null, 2)
    );
    
    console.log('✅ Информация сохранена в timeweb-resources.json');
  }

  /**
   * Основной процесс настройки
   */
  async setup(): Promise<void> {
    console.log('🚀 Начинаем настройку Timeweb Cloud для KamchaTour Hub\n');
    console.log('=' .repeat(60));

    const resources: any = {};

    try {
      // 1. Проверка API
      const apiOk = await this.checkAPI();
      if (!apiOk) {
        throw new Error('API недоступен. Проверьте токен.');
      }

      // 2. Получение информации о регионах
      await this.getRegions();

      // 3. Создание VDS сервера
      resources.vds = await this.createVDS();
      await this.sleep(2000);

      // 4. Создание базы данных
      resources.database = await this.createDatabase();
      await this.sleep(2000);

      // 5. Создание S3 bucket
      resources.s3 = await this.createS3Bucket();
      await this.sleep(2000);

      // 6. Настройка Firewall
      if (resources.vds?.id) {
        resources.firewall = await this.setupFirewall(resources.vds.id);
      }

      // 7. Генерация .env файла
      await this.generateEnvFile(resources);

      // 8. Сохранение информации
      await this.saveResourceInfo(resources);

      console.log('\n' + '='.repeat(60));
      console.log('🎉 Настройка завершена успешно!');
      console.log('='.repeat(60));
      
      console.log('\n📋 Следующие шаги:');
      console.log('1. SSH подключение к серверу:');
      console.log(`   ssh root@${resources.vds?.main_ipv4}`);
      console.log('   Пароль: см. в timeweb-resources.json');
      console.log('\n2. Запустите настройку сервера:');
      console.log('   bash scripts/setup-timeweb-server.sh');
      console.log('\n3. Настройте переменные окружения:');
      console.log('   mv .env.production.timeweb .env.production');
      console.log('   nano .env.production  # добавьте API ключи');
      console.log('\n4. Разверните приложение:');
      console.log('   bash scripts/deploy-to-timeweb.sh');

    } catch (error) {
      console.error('\n❌ Ошибка при настройке:', error.message);
      console.error('\n💡 Совет: Проверьте API токен и доступность сервисов');
      throw error;
    }
  }

  /**
   * Вспомогательные методы
   */

  private async apiRequest(
    method: string,
    endpoint: string,
    data?: any
  ): Promise<any> {
    const url = `${this.config.apiUrl}${endpoint}`;
    
    const options: any = {
      method,
      headers: this.headers,
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    // Используем curl для запросов (более надежно в этой среде)
    const curlCmd = this.buildCurlCommand(method, url, data);
    
    try {
      const { stdout } = await execAsync(curlCmd);
      return JSON.parse(stdout);
    } catch (error) {
      throw new Error(`API Request failed: ${error.message}`);
    }
  }

  private buildCurlCommand(method: string, url: string, data?: any): string {
    let cmd = `curl -X ${method} "${url}"`;
    
    Object.entries(this.headers).forEach(([key, value]) => {
      cmd += ` -H "${key}: ${value}"`;
    });

    if (data) {
      cmd += ` -d '${JSON.stringify(data)}'`;
    }

    cmd += ' 2>/dev/null';
    
    return cmd;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

/**
 * Главная функция
 */
async function main() {
  // Проверка наличия API токена
  const apiToken = process.env.TIMEWEB_TOKEN;
  
  if (!apiToken) {
    console.error('❌ Ошибка: API токен не найден');
    console.error('\n📋 Как получить API токен:');
    console.error('1. Войдите в панель Timeweb Cloud: https://timeweb.cloud/my');
    console.error('2. Перейдите в раздел "API"');
    console.error('3. Создайте новый токен');
    console.error('4. Экспортируйте: export TIMEWEB_TOKEN=your_token');
    console.error('5. Запустите снова: tsx scripts/timeweb-setup.ts');
    process.exit(1);
  }

  // Конфигурация по умолчанию для KamchaTour Hub
  const config: TimewebConfig = {
    apiToken,
    apiUrl: 'https://api.timeweb.cloud',
    project: {
      name: 'kamchatour-hub',
      region: 'ru-1', // Москва
    },
    vds: {
      os: 'ubuntu-22.04',
      cpu: 2,
      ram: 4,
      disk: 60,
    },
    database: {
      type: 'postgres',
      version: '15',
      cpu: 2,
      ram: 4,
      disk: 50,
    },
    s3: {
      bucketName: 'kamchatour-media',
      region: 'ru-1',
    },
  };

  const setup = new TimewebCloudSetup(config);
  await setup.setup();
}

// Запуск
if (require.main === module) {
  main().catch((error) => {
    console.error('💥 Критическая ошибка:', error);
    process.exit(1);
  });
}

export { TimewebCloudSetup, TimewebConfig };
