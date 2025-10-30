#!/usr/bin/env tsx

/**
 * Управление ресурсами Timeweb Cloud для проекта KamchaTour Hub
 * 
 * Команды:
 * - list: Показать все ресурсы
 * - status: Статус конкретного ресурса
 * - delete: Удалить ресурс
 * - restart: Перезагрузить VDS
 * - backup: Создать резервную копию
 * 
 * Использование:
 * tsx scripts/timeweb-manage.ts list
 * tsx scripts/timeweb-manage.ts status vds 12345678
 * tsx scripts/timeweb-manage.ts restart 12345678
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';

const execAsync = promisify(exec);

// Helper для получения сообщения об ошибке
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

class TimewebManager {
  private apiToken: string;
  private apiUrl: string = 'https://api.timeweb.cloud';
  private headers: Record<string, string>;

  constructor(apiToken: string) {
    this.apiToken = apiToken;
    this.headers = {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Список всех VDS серверов
   */
  async listServers(): Promise<void> {
    console.log('\n📦 VDS Серверы:');
    console.log('═'.repeat(80));
    
    try {
      const response = await this.apiRequest('GET', '/api/v1/servers');
      const servers = response.servers || [];

      if (servers.length === 0) {
        console.log('   Нет серверов');
        return;
      }

      servers.forEach((server: any, index: number) => {
        console.log(`\n${index + 1}. ${server.name || server.id}`);
        console.log(`   ID: ${server.id}`);
        console.log(`   IP: ${server.main_ipv4 || 'N/A'}`);
        console.log(`   Status: ${this.getStatusEmoji(server.status)} ${server.status}`);
        console.log(`   OS: ${server.os?.name || 'N/A'}`);
        console.log(`   CPU: ${server.cpu} vCPU`);
        console.log(`   RAM: ${server.ram / 1024} GB`);
        console.log(`   Disk: ${server.disk / 1024} GB`);
      });
    } catch (error) {
      console.error('❌ Ошибка получения серверов:', getErrorMessage(error));
    }
  }

  /**
   * Список всех баз данных
   */
  async listDatabases(): Promise<void> {
    console.log('\n🗄️ Базы данных:');
    console.log('═'.repeat(80));
    
    try {
      const response = await this.apiRequest('GET', '/api/v1/databases');
      const databases = response.databases || [];

      if (databases.length === 0) {
        console.log('   Нет баз данных');
        return;
      }

      databases.forEach((db: any, index: number) => {
        console.log(`\n${index + 1}. ${db.name || db.id}`);
        console.log(`   ID: ${db.id}`);
        console.log(`   Type: ${db.type} ${db.version}`);
        console.log(`   Host: ${db.host}`);
        console.log(`   Port: ${db.port}`);
        console.log(`   Status: ${this.getStatusEmoji(db.status)} ${db.status}`);
        console.log(`   CPU: ${db.cpu} vCPU`);
        console.log(`   RAM: ${db.ram / 1024} GB`);
      });
    } catch (error) {
      console.error('❌ Ошибка получения БД:', getErrorMessage(error));
    }
  }

  /**
   * Список всех S3 buckets
   */
  async listBuckets(): Promise<void> {
    console.log('\n💾 S3 Buckets:');
    console.log('═'.repeat(80));
    
    try {
      const response = await this.apiRequest('GET', '/api/v1/storages/buckets');
      const buckets = response.buckets || [];

      if (buckets.length === 0) {
        console.log('   Нет buckets');
        return;
      }

      buckets.forEach((bucket: any, index: number) => {
        console.log(`\n${index + 1}. ${bucket.name}`);
        console.log(`   ID: ${bucket.id}`);
        console.log(`   Endpoint: ${bucket.hostname || 'N/A'}`);
        console.log(`   Type: ${bucket.type}`);
        console.log(`   Size: ${this.formatBytes(bucket.size || 0)}`);
        console.log(`   Objects: ${bucket.object_amount || 0}`);
      });
    } catch (error) {
      console.error('❌ Ошибка получения buckets:', getErrorMessage(error));
    }
  }

  /**
   * Список Firewall групп
   */
  async listFirewallGroups(): Promise<void> {
    console.log('\n🔥 Firewall Groups:');
    console.log('═'.repeat(80));
    
    try {
      const response = await this.apiRequest('GET', '/api/v1/firewall/groups');
      const groups = response.groups || [];

      if (groups.length === 0) {
        console.log('   Нет firewall групп');
        return;
      }

      groups.forEach((group: any, index: number) => {
        console.log(`\n${index + 1}. ${group.name}`);
        console.log(`   ID: ${group.id}`);
        console.log(`   Description: ${group.description || 'N/A'}`);
        console.log(`   Rules: ${group.rules_count || 0}`);
      });
    } catch (error) {
      console.error('❌ Ошибка получения firewall групп:', getErrorMessage(error));
    }
  }

  /**
   * Показать все ресурсы
   */
  async listAll(): Promise<void> {
    console.log('\n📊 Все ресурсы Timeweb Cloud');
    console.log('═'.repeat(80));
    
    await this.listServers();
    await this.listDatabases();
    await this.listBuckets();
    await this.listFirewallGroups();
    
    console.log('\n' + '═'.repeat(80));
  }

  /**
   * Статус конкретного ресурса
   */
  async getResourceStatus(type: string, id: string): Promise<void> {
    console.log(`\n🔍 Статус ${type} (ID: ${id})`);
    console.log('═'.repeat(80));

    try {
      let endpoint = '';
      
      switch (type.toLowerCase()) {
        case 'vds':
        case 'server':
          endpoint = `/api/v1/servers/${id}`;
          break;
        case 'db':
        case 'database':
          endpoint = `/api/v1/databases/${id}`;
          break;
        case 's3':
        case 'bucket':
          endpoint = `/api/v1/storages/buckets/${id}`;
          break;
        default:
          throw new Error(`Неизвестный тип ресурса: ${type}`);
      }

      const response = await this.apiRequest('GET', endpoint);
      console.log(JSON.stringify(response, null, 2));
    } catch (error) {
      console.error('❌ Ошибка получения статуса:', getErrorMessage(error));
    }
  }

  /**
   * Перезагрузка VDS сервера
   */
  async restartServer(serverId: string): Promise<void> {
    console.log(`\n🔄 Перезагрузка сервера (ID: ${serverId})`);
    console.log('═'.repeat(80));

    try {
      await this.apiRequest('POST', `/api/v1/servers/${serverId}/action`, {
        action: 'restart',
      });
      
      console.log('✅ Команда перезагрузки отправлена');
      console.log('   Сервер перезагружается...');
      console.log('   Это может занять 2-5 минут');
    } catch (error) {
      console.error('❌ Ошибка перезагрузки:', getErrorMessage(error));
    }
  }

  /**
   * Создание backup
   */
  async createBackup(resourceType: string, resourceId: string): Promise<void> {
    console.log(`\n💾 Создание резервной копии ${resourceType} (ID: ${resourceId})`);
    console.log('═'.repeat(80));

    try {
      let endpoint = '';
      
      if (resourceType.toLowerCase() === 'vds' || resourceType.toLowerCase() === 'server') {
        endpoint = `/api/v1/servers/${resourceId}/disk-backups`;
      } else if (resourceType.toLowerCase() === 'db' || resourceType.toLowerCase() === 'database') {
        endpoint = `/api/v1/databases/${resourceId}/backups`;
      } else {
        throw new Error(`Backup не поддерживается для типа: ${resourceType}`);
      }

      const response = await this.apiRequest('POST', endpoint, {
        comment: `Автоматический backup ${new Date().toISOString()}`,
      });
      
      console.log('✅ Резервная копия создается');
      console.log(`   ID backup: ${response.backup?.id || 'N/A'}`);
    } catch (error) {
      console.error('❌ Ошибка создания backup:', getErrorMessage(error));
    }
  }

  /**
   * Удаление ресурса
   */
  async deleteResource(type: string, id: string, confirm: boolean = false): Promise<void> {
    console.log(`\n⚠️  УДАЛЕНИЕ ${type} (ID: ${id})`);
    console.log('═'.repeat(80));

    if (!confirm) {
      console.log('❌ Для удаления добавьте флаг --confirm');
      console.log(`   tsx scripts/timeweb-manage.ts delete ${type} ${id} --confirm`);
      return;
    }

    console.log('⚠️  ЭТО ДЕЙСТВИЕ НЕОБРАТИМО!');
    console.log('   Ресурс будет удален без возможности восстановления');

    try {
      let endpoint = '';
      
      switch (type.toLowerCase()) {
        case 'vds':
        case 'server':
          endpoint = `/api/v1/servers/${id}`;
          break;
        case 'db':
        case 'database':
          endpoint = `/api/v1/databases/${id}`;
          break;
        case 's3':
        case 'bucket':
          endpoint = `/api/v1/storages/buckets/${id}`;
          break;
        case 'firewall':
          endpoint = `/api/v1/firewall/groups/${id}`;
          break;
        default:
          throw new Error(`Неизвестный тип ресурса: ${type}`);
      }

      await this.apiRequest('DELETE', endpoint);
      
      console.log('✅ Ресурс удален');
    } catch (error) {
      console.error('❌ Ошибка удаления:', getErrorMessage(error));
    }
  }

  /**
   * Получение статистики аккаунта
   */
  async getAccountInfo(): Promise<void> {
    console.log('\n👤 Информация об аккаунте');
    console.log('═'.repeat(80));

    try {
      const account = await this.apiRequest('GET', '/api/v1/account');
      const finances = await this.apiRequest('GET', '/api/v1/account/finances');

      console.log(`\nEmail: ${account.email || 'N/A'}`);
      console.log(`Status: ${account.status || 'N/A'}`);
      console.log(`\nБаланс: ${finances.balance || 0}₽`);
      console.log(`Авто-пополнение: ${finances.autopay_enabled ? '✅ Включено' : '❌ Выключено'}`);
    } catch (error) {
      console.error('❌ Ошибка получения информации:', getErrorMessage(error));
    }
  }

  /**
   * Загрузка информации из созданных ресурсов
   */
  async loadResourcesInfo(): Promise<any> {
    try {
      const content = await fs.readFile('timeweb-resources.json', 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      return null;
    }
  }

  /**
   * Быстрая проверка статуса проекта
   */
  async projectStatus(): Promise<void> {
    console.log('\n🚀 Статус проекта KamchaTour Hub');
    console.log('═'.repeat(80));

    const resources = await this.loadResourcesInfo();
    
    if (!resources) {
      console.log('❌ Файл timeweb-resources.json не найден');
      console.log('   Запустите сначала: tsx scripts/timeweb-setup.ts');
      return;
    }

    console.log(`\n📅 Создано: ${new Date(resources.timestamp).toLocaleString('ru-RU')}`);

    // Проверка VDS
    if (resources.resources?.vds?.id) {
      try {
        const vds = await this.apiRequest('GET', `/api/v1/servers/${resources.resources.vds.id}`);
        console.log(`\n📦 VDS: ${this.getStatusEmoji(vds.server?.status)} ${vds.server?.status}`);
        console.log(`   IP: ${vds.server?.main_ipv4}`);
        console.log(`   Uptime: ${this.formatUptime(vds.server?.uptime || 0)}`);
      } catch (error) {
        console.log(`\n📦 VDS: ❌ Недоступен`);
      }
    }

    // Проверка БД
    if (resources.resources?.database?.id) {
      try {
        const db = await this.apiRequest('GET', `/api/v1/databases/${resources.resources.database.id}`);
        console.log(`\n🗄️ Database: ${this.getStatusEmoji(db.database?.status)} ${db.database?.status}`);
        console.log(`   Host: ${db.database?.host}`);
      } catch (error) {
        console.log(`\n🗄️ Database: ❌ Недоступна`);
      }
    }

    // Проверка S3
    if (resources.resources?.s3?.id) {
      try {
        const s3 = await this.apiRequest('GET', `/api/v1/storages/buckets/${resources.resources.s3.id}`);
        console.log(`\n💾 S3 Bucket: ✅ Активен`);
        console.log(`   Size: ${this.formatBytes(s3.bucket?.size || 0)}`);
        console.log(`   Objects: ${s3.bucket?.object_amount || 0}`);
      } catch (error) {
        console.log(`\n💾 S3 Bucket: ❌ Недоступен`);
      }
    }

    console.log('\n' + '═'.repeat(80));
  }

  /**
   * Вспомогательные методы
   */

  private async apiRequest(method: string, endpoint: string, data?: any): Promise<any> {
    const url = `${this.apiUrl}${endpoint}`;
    const curlCmd = this.buildCurlCommand(method, url, data);
    
    try {
      const { stdout } = await execAsync(curlCmd);
      return JSON.parse(stdout);
    } catch (error) {
      throw new Error(`API Request failed: ${getErrorMessage(error)}`);
    }
  }

  private buildCurlCommand(method: string, url: string, data?: any): string {
    let cmd = `curl -s -X ${method} "${url}"`;
    
    Object.entries(this.headers).forEach(([key, value]) => {
      cmd += ` -H "${key}: ${value}"`;
    });

    if (data) {
      cmd += ` -d '${JSON.stringify(data)}'`;
    }

    return cmd;
  }

  private getStatusEmoji(status: string): string {
    const statusMap: Record<string, string> = {
      'on': '✅',
      'running': '✅',
      'active': '✅',
      'off': '⏸️',
      'stopped': '⏸️',
      'starting': '🔄',
      'stopping': '🔄',
      'error': '❌',
      'failed': '❌',
    };
    
    return statusMap[status?.toLowerCase()] || '❓';
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }
}

/**
 * CLI интерфейс
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const apiToken = process.env.TIMEWEB_TOKEN;
  
  if (!apiToken) {
    console.error('❌ Ошибка: API токен не найден');
    console.error('   Экспортируйте: export TIMEWEB_TOKEN=your_token');
    process.exit(1);
  }

  const manager = new TimewebManager(apiToken);

  switch (command) {
    case 'list':
      await manager.listAll();
      break;

    case 'servers':
      await manager.listServers();
      break;

    case 'databases':
      await manager.listDatabases();
      break;

    case 'buckets':
      await manager.listBuckets();
      break;

    case 'firewall':
      await manager.listFirewallGroups();
      break;

    case 'status':
      if (args.length < 3) {
        console.error('Использование: tsx timeweb-manage.ts status <type> <id>');
        process.exit(1);
      }
      await manager.getResourceStatus(args[1], args[2]);
      break;

    case 'restart':
      if (args.length < 2) {
        console.error('Использование: tsx timeweb-manage.ts restart <server_id>');
        process.exit(1);
      }
      await manager.restartServer(args[1]);
      break;

    case 'backup':
      if (args.length < 3) {
        console.error('Использование: tsx timeweb-manage.ts backup <type> <id>');
        process.exit(1);
      }
      await manager.createBackup(args[1], args[2]);
      break;

    case 'delete':
      if (args.length < 3) {
        console.error('Использование: tsx timeweb-manage.ts delete <type> <id> [--confirm]');
        process.exit(1);
      }
      await manager.deleteResource(args[1], args[2], args[3] === '--confirm');
      break;

    case 'account':
      await manager.getAccountInfo();
      break;

    case 'project':
      await manager.projectStatus();
      break;

    case 'help':
    case '--help':
    case '-h':
      console.log(`
╔══════════════════════════════════════════════════════════════╗
║           Timeweb Cloud Manager для KamchaTour Hub           ║
╚══════════════════════════════════════════════════════════════╝

Использование: tsx scripts/timeweb-manage.ts <command> [options]

Команды:

  list              Показать все ресурсы
  servers           Показать только VDS серверы
  databases         Показать только базы данных
  buckets           Показать только S3 buckets
  firewall          Показать firewall группы
  
  status <type> <id>         Статус конкретного ресурса
  restart <server_id>        Перезагрузить VDS
  backup <type> <id>         Создать резервную копию
  delete <type> <id> --confirm   Удалить ресурс
  
  account           Информация об аккаунте
  project           Статус проекта KamchaTour Hub
  help              Показать эту справку

Примеры:

  tsx scripts/timeweb-manage.ts list
  tsx scripts/timeweb-manage.ts status vds 12345678
  tsx scripts/timeweb-manage.ts restart 12345678
  tsx scripts/timeweb-manage.ts backup db 87654321
  tsx scripts/timeweb-manage.ts delete s3 bucket-id --confirm
  tsx scripts/timeweb-manage.ts project
      `);
      break;

    default:
      console.error(`❌ Неизвестная команда: ${command}`);
      console.error('   Используйте: tsx scripts/timeweb-manage.ts help');
      process.exit(1);
  }
}

// Запуск
if (require.main === module) {
  main().catch((error) => {
    console.error('💥 Ошибка:', getErrorMessage(error));
    process.exit(1);
  });
}

export { TimewebManager };
