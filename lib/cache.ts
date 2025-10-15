// =============================================
// СИСТЕМА КЭШИРОВАНИЯ
// Kamchatour Hub - Caching System
// =============================================

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  createdAt: number;
  hits: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of entries
  strategy?: 'lru' | 'lfu' | 'fifo'; // Eviction strategy
}

class CacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private options: Required<CacheOptions>;

  constructor(options: CacheOptions = {}) {
    this.options = {
      ttl: options.ttl || 5 * 60 * 1000, // 5 minutes default
      maxSize: options.maxSize || 1000, // 1000 entries default
      strategy: options.strategy || 'lru',
    };
  }

  // Получение значения из кэша
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Проверяем, не истек ли срок действия
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    // Увеличиваем счетчик обращений
    entry.hits++;
    
    return entry.value;
  }

  // Сохранение значения в кэш
  set<T>(key: string, value: T, ttl?: number): void {
    const now = Date.now();
    const expiresAt = now + (ttl || this.options.ttl);

    // Проверяем, не превышен ли лимит размера
    if (this.cache.size >= this.options.maxSize) {
      this.evict();
    }

    this.cache.set(key, {
      value,
      expiresAt,
      createdAt: now,
      hits: 0,
    });
  }

  // Удаление из кэша
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  // Очистка всего кэша
  clear(): void {
    this.cache.clear();
  }

  // Проверка существования ключа
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  // Получение статистики кэша
  getStats() {
    const now = Date.now();
    const entries = Array.from(this.cache.values());
    
    return {
      size: this.cache.size,
      maxSize: this.options.maxSize,
      hitRate: this.calculateHitRate(),
      expiredEntries: entries.filter(entry => now > entry.expiresAt).length,
      averageHits: entries.reduce((sum, entry) => sum + entry.hits, 0) / entries.length || 0,
      oldestEntry: Math.min(...entries.map(entry => entry.createdAt)),
      newestEntry: Math.max(...entries.map(entry => entry.createdAt)),
    };
  }

  // Вытеснение записей по стратегии
  private evict(): void {
    const entries = Array.from(this.cache.entries());
    
    switch (this.options.strategy) {
      case 'lru':
        // Least Recently Used - удаляем самый старый по времени создания
        entries.sort((a, b) => a[1].createdAt - b[1].createdAt);
        break;
      case 'lfu':
        // Least Frequently Used - удаляем с наименьшим количеством обращений
        entries.sort((a, b) => a[1].hits - b[1].hits);
        break;
      case 'fifo':
        // First In, First Out - удаляем самый старый
        entries.sort((a, b) => a[1].createdAt - b[1].createdAt);
        break;
    }

    // Удаляем 10% записей
    const toDelete = Math.ceil(entries.length * 0.1);
    for (let i = 0; i < toDelete; i++) {
      this.cache.delete(entries[i][0]);
    }
  }

  // Расчет коэффициента попаданий
  private calculateHitRate(): number {
    const entries = Array.from(this.cache.values());
    const totalHits = entries.reduce((sum, entry) => sum + entry.hits, 0);
    const totalRequests = entries.length + totalHits;
    
    return totalRequests > 0 ? totalHits / totalRequests : 0;
  }

  // Очистка истекших записей
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

// Создаем глобальные экземпляры кэша для разных типов данных
export const weatherCache = new CacheManager({
  ttl: 10 * 60 * 1000, // 10 минут для погодных данных
  maxSize: 100,
  strategy: 'lru',
});

export const toursCache = new CacheManager({
  ttl: 30 * 60 * 1000, // 30 минут для туров
  maxSize: 500,
  strategy: 'lru',
});

export const transfersCache = new CacheManager({
  ttl: 5 * 60 * 1000, // 5 минут для трансферов
  maxSize: 200,
  strategy: 'lru',
});

export const userCache = new CacheManager({
  ttl: 60 * 60 * 1000, // 1 час для пользователей
  maxSize: 1000,
  strategy: 'lru',
});

// Утилиты для работы с кэшем
export const cache = {
  // Получение с автоматическим обновлением
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number,
    cacheManager: CacheManager = weatherCache
  ): Promise<T> {
    // Пытаемся получить из кэша
    const cached = cacheManager.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Если нет в кэше, получаем данные
    try {
      const data = await fetcher();
      cacheManager.set(key, data, ttl);
      return data;
    } catch (error) {
      console.error('Cache fetcher error:', error);
      throw error;
    }
  },

  // Инвалидация кэша по паттерну
  invalidatePattern(pattern: string, cacheManager: CacheManager = weatherCache): void {
    const regex = new RegExp(pattern);
    for (const key of cacheManager['cache'].keys()) {
      if (regex.test(key)) {
        cacheManager.delete(key);
      }
    }
  },

  // Получение статистики всех кэшей
  getAllStats() {
    return {
      weather: weatherCache.getStats(),
      tours: toursCache.getStats(),
      transfers: transfersCache.getStats(),
      users: userCache.getStats(),
    };
  },

  // Очистка всех кэшей
  clearAll(): void {
    weatherCache.clear();
    toursCache.clear();
    transfersCache.clear();
    userCache.clear();
  },

  // Очистка истекших записей во всех кэшах
  cleanupAll(): void {
    weatherCache.cleanup();
    toursCache.cleanup();
    transfersCache.cleanup();
    userCache.cleanup();
  },
};

// Middleware для автоматического кэширования API ответов
export function withCache<T>(
  keyGenerator: (req: any) => string,
  ttl?: number,
  cacheManager: CacheManager = weatherCache
) {
  return (handler: (req: any, res: any) => Promise<T>) => {
    return async (req: any, res: any) => {
      const cacheKey = keyGenerator(req);
      
      return cache.getOrSet(
        cacheKey,
        () => handler(req, res),
        ttl,
        cacheManager
      );
    };
  };
}

// Автоматическая очистка кэша каждые 5 минут
if (typeof window === 'undefined') {
  setInterval(() => {
    cache.cleanupAll();
  }, 5 * 60 * 1000);
}

export default cache;