/**
 * REDIS CACHE MANAGER
 * Централизованная система кэширования для высокой производительности
 */

import Redis from 'ioredis';
import { config } from '@/lib/config';

// =============================================
// ТИПЫ
// =============================================

export interface CacheOptions {
  ttl?: number; // Time to live в секундах (по умолчанию 1 час)
  prefix?: string; // Префикс для ключа
}

export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  errors: number;
}

// =============================================
// REDIS CLIENT
// =============================================

class RedisCache {
  private client: Redis | null = null;
  private isEnabled: boolean = false;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    errors: 0,
  };

  constructor() {
    this.initialize();
  }

  /**
   * Инициализация Redis подключения
   */
  private initialize() {
    try {
      // Проверяем что Redis настроен
      if (!config.cache.enabled) {
        console.log('ℹ️  Redis кэширование отключено (используется in-memory)');
        return;
      }

      this.client = new Redis({
        host: config.cache.host,
        port: config.cache.port,
        password: config.cache.password || undefined,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3,
      });

      this.client.on('connect', () => {
        console.log('✅ Redis подключен');
        this.isEnabled = true;
      });

      this.client.on('error', (error) => {
        console.error('❌ Redis ошибка:', error);
        this.stats.errors++;
        this.isEnabled = false;
      });

      this.client.on('close', () => {
        console.log('⚠️  Redis отключен');
        this.isEnabled = false;
      });

    } catch (error) {
      console.error('❌ Не удалось инициализировать Redis:', error);
      this.isEnabled = false;
    }
  }

  /**
   * Получить значение из кэша
   */
  async get<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
    const fullKey = this.buildKey(key, options.prefix);

    try {
      if (!this.isEnabled || !this.client) {
        return null;
      }

      const value = await this.client.get(fullKey);
      
      if (value) {
        this.stats.hits++;
        return JSON.parse(value) as T;
      } else {
        this.stats.misses++;
        return null;
      }
    } catch (error) {
      console.error(`❌ Redis GET ошибка для ключа ${fullKey}:`, error);
      this.stats.errors++;
      return null;
    }
  }

  /**
   * Сохранить значение в кэш
   */
  async set(key: string, value: any, options: CacheOptions = {}): Promise<boolean> {
    const fullKey = this.buildKey(key, options.prefix);
    const ttl = options.ttl || 3600; // По умолчанию 1 час

    try {
      if (!this.isEnabled || !this.client) {
        return false;
      }

      const serialized = JSON.stringify(value);
      await this.client.setex(fullKey, ttl, serialized);
      
      this.stats.sets++;
      return true;
    } catch (error) {
      console.error(`❌ Redis SET ошибка для ключа ${fullKey}:`, error);
      this.stats.errors++;
      return false;
    }
  }

  /**
   * Удалить значение из кэша
   */
  async delete(key: string, options: CacheOptions = {}): Promise<boolean> {
    const fullKey = this.buildKey(key, options.prefix);

    try {
      if (!this.isEnabled || !this.client) {
        return false;
      }

      await this.client.del(fullKey);
      this.stats.deletes++;
      return true;
    } catch (error) {
      console.error(`❌ Redis DELETE ошибка для ключа ${fullKey}:`, error);
      this.stats.errors++;
      return false;
    }
  }

  /**
   * Удалить все ключи с префиксом
   */
  async deletePattern(pattern: string): Promise<number> {
    try {
      if (!this.isEnabled || !this.client) {
        return 0;
      }

      const keys = await this.client.keys(pattern);
      if (keys.length === 0) {
        return 0;
      }

      await this.client.del(...keys);
      this.stats.deletes += keys.length;
      return keys.length;
    } catch (error) {
      console.error(`❌ Redis DELETE PATTERN ошибка для ${pattern}:`, error);
      this.stats.errors++;
      return 0;
    }
  }

  /**
   * Проверить существование ключа
   */
  async exists(key: string, options: CacheOptions = {}): Promise<boolean> {
    const fullKey = this.buildKey(key, options.prefix);

    try {
      if (!this.isEnabled || !this.client) {
        return false;
      }

      const result = await this.client.exists(fullKey);
      return result === 1;
    } catch (error) {
      console.error(`❌ Redis EXISTS ошибка для ключа ${fullKey}:`, error);
      this.stats.errors++;
      return false;
    }
  }

  /**
   * Получить или установить (cache-aside pattern)
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    // Пытаемся получить из кэша
    const cached = await this.get<T>(key, options);
    if (cached !== null) {
      return cached;
    }

    // Если нет в кэше - получаем из источника
    const value = await factory();
    
    // Сохраняем в кэш
    await this.set(key, value, options);
    
    return value;
  }

  /**
   * Инвалидация кэша (очистка устаревших данных)
   */
  async invalidate(keys: string | string[]): Promise<void> {
    const keysArray = Array.isArray(keys) ? keys : [keys];
    
    for (const key of keysArray) {
      if (key.includes('*')) {
        // Если есть wildcard - используем deletePattern
        await this.deletePattern(key);
      } else {
        // Иначе просто удаляем ключ
        await this.delete(key);
      }
    }
  }

  /**
   * Очистить весь кэш
   */
  async flush(): Promise<boolean> {
    try {
      if (!this.isEnabled || !this.client) {
        return false;
      }

      await this.client.flushdb();
      console.log('🗑️  Redis кэш очищен');
      return true;
    } catch (error) {
      console.error('❌ Redis FLUSH ошибка:', error);
      this.stats.errors++;
      return false;
    }
  }

  /**
   * Получить статистику кэша
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Сбросить статистику
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0,
    };
  }

  /**
   * Построить полный ключ с префиксом
   */
  private buildKey(key: string, prefix?: string): string {
    const parts = ['kamchatour'];
    if (prefix) parts.push(prefix);
    parts.push(key);
    return parts.join(':');
  }

  /**
   * Проверка здоровья Redis
   */
  async healthCheck(): Promise<boolean> {
    try {
      if (!this.isEnabled || !this.client) {
        return false;
      }

      await this.client.ping();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Закрыть соединение
   */
  async close(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      console.log('👋 Redis соединение закрыто');
    }
  }
}

// =============================================
// ЭКСПОРТ SINGLETON
// =============================================

export const cache = new RedisCache();

// =============================================
// ХЕЛПЕРЫ ДЛЯ ТИПИЧНЫХ СЛУЧАЕВ
// =============================================

/**
 * Кэш для туров (TTL: 10 минут)
 */
export const toursCache = {
  get: (id: string) => cache.get(`tour:${id}`, { ttl: 600, prefix: 'tours' }),
  set: (id: string, data: any) => cache.set(`tour:${id}`, data, { ttl: 600, prefix: 'tours' }),
  invalidate: () => cache.invalidate('kamchatour:tours:*'),
};

/**
 * Кэш для трансферов (TTL: 5 минут)
 */
export const transfersCache = {
  get: (id: string) => cache.get(`transfer:${id}`, { ttl: 300, prefix: 'transfers' }),
  set: (id: string, data: any) => cache.set(`transfer:${id}`, data, { ttl: 300, prefix: 'transfers' }),
  invalidate: () => cache.invalidate('kamchatour:transfers:*'),
};

/**
 * Кэш для пользователей (TTL: 30 минут)
 */
export const usersCache = {
  get: (id: string) => cache.get(`user:${id}`, { ttl: 1800, prefix: 'users' }),
  set: (id: string, data: any) => cache.set(`user:${id}`, data, { ttl: 1800, prefix: 'users' }),
  delete: (id: string) => cache.delete(`user:${id}`, { prefix: 'users' }),
};

/**
 * Кэш для результатов поиска (TTL: 2 минуты)
 */
export const searchCache = {
  get: (query: string) => cache.get(`search:${query}`, { ttl: 120, prefix: 'search' }),
  set: (query: string, data: any) => cache.set(`search:${query}`, data, { ttl: 120, prefix: 'search' }),
};
