/**
 * ЦЕНТРАЛИЗОВАННАЯ СИСТЕМА ЛОГИРОВАНИЯ
 * Для мониторинга ошибок, событий и производительности
 */

import fs from 'fs';
import path from 'path';

// =============================================
// ТИПЫ
// =============================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  user?: {
    id?: string;
    email?: string;
    role?: string;
  };
  request?: {
    method?: string;
    url?: string;
    ip?: string;
    userAgent?: string;
  };
}

// =============================================
// LOGGER CLASS
// =============================================

class Logger {
  private isDevelopment: boolean;
  private logDir: string;
  private enableFileLogging: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.logDir = path.join(process.cwd(), 'logs');
    this.enableFileLogging = process.env.ENABLE_FILE_LOGGING === 'true';

    // Создаем папку для логов если не существует
    if (this.enableFileLogging && !fs.existsSync(this.logDir)) {
      try {
        fs.mkdirSync(this.logDir, { recursive: true });
      } catch (error) {
        console.error('❌ Не удалось создать папку логов:', error);
        this.enableFileLogging = false;
      }
    }
  }

  /**
   * Отформатировать лог
   */
  private formatLog(entry: LogEntry): string {
    const emoji = this.getEmoji(entry.level);
    const coloredLevel = this.colorize(entry.level.toUpperCase(), entry.level);
    
    let output = `${emoji} [${entry.timestamp}] ${coloredLevel} ${entry.message}`;
    
    if (entry.context && Object.keys(entry.context).length > 0) {
      output += `\n   Context: ${JSON.stringify(entry.context, null, 2)}`;
    }
    
    if (entry.error) {
      output += `\n   Error: ${entry.error.name}: ${entry.error.message}`;
      if (entry.error.stack && this.isDevelopment) {
        output += `\n   Stack: ${entry.error.stack}`;
      }
    }
    
    if (entry.user) {
      output += `\n   User: ${entry.user.id || 'anonymous'} (${entry.user.email || 'N/A'})`;
    }
    
    if (entry.request) {
      output += `\n   Request: ${entry.request.method} ${entry.request.url}`;
      if (entry.request.ip) {
        output += ` from ${entry.request.ip}`;
      }
    }
    
    return output;
  }

  /**
   * Получить эмодзи для уровня
   */
  private getEmoji(level: LogLevel): string {
    const emojis: Record<LogLevel, string> = {
      debug: '🐛',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
      fatal: '💀',
    };
    return emojis[level] || 'ℹ️';
  }

  /**
   * Раскрасить текст (только для консоли)
   */
  private colorize(text: string, level: LogLevel): string {
    if (!this.isDevelopment) {
      return text;
    }

    const colors: Record<LogLevel, string> = {
      debug: '\x1b[36m', // Cyan
      info: '\x1b[32m',  // Green
      warn: '\x1b[33m',  // Yellow
      error: '\x1b[31m', // Red
      fatal: '\x1b[35m', // Magenta
    };
    const reset = '\x1b[0m';
    
    return `${colors[level]}${text}${reset}`;
  }

  /**
   * Записать лог
   */
  private writeLog(entry: LogEntry): void {
    const formatted = this.formatLog(entry);
    
    // Консоль (всегда)
    console.log(formatted);
    
    // Файл (если включено)
    if (this.enableFileLogging) {
      const date = new Date().toISOString().split('T')[0];
      const filename = `${date}.log`;
      const filepath = path.join(this.logDir, filename);
      
      try {
        // Добавляем в файл (без цветов)
        const plainEntry = this.formatLog({ ...entry }).replace(/\x1b\[\d+m/g, '');
        fs.appendFileSync(filepath, plainEntry + '\n\n');
      } catch (error) {
        console.error('❌ Не удалось записать в файл логов:', error);
      }
    }

    // Отправляем критичные ошибки во внешний сервис
    if (entry.level === 'error' || entry.level === 'fatal') {
      this.sendToExternalService(entry);
    }
  }

  /**
   * Отправить в внешний сервис мониторинга (Sentry, DataDog и т.д.)
   */
  private async sendToExternalService(entry: LogEntry): Promise<void> {
    // TODO: Интеграция с Sentry или другим сервисом
    // Пока просто пишем в отдельный файл ошибок
    if (this.enableFileLogging) {
      const filepath = path.join(this.logDir, 'errors.log');
      try {
        const json = JSON.stringify(entry, null, 2);
        fs.appendFileSync(filepath, json + '\n---\n');
      } catch (error) {
        console.error('❌ Не удалось записать ошибку:', error);
      }
    }
  }

  /**
   * Создать лог-запись
   */
  private createEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, any>
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
    };
  }

  // =============================================
  // PUBLIC API
  // =============================================

  debug(message: string, context?: Record<string, any>): void {
    if (!this.isDevelopment) return; // Debug только в dev
    const entry = this.createEntry('debug', message, context);
    this.writeLog(entry);
  }

  info(message: string, context?: Record<string, any>): void {
    const entry = this.createEntry('info', message, context);
    this.writeLog(entry);
  }

  warn(message: string, context?: Record<string, any>): void {
    const entry = this.createEntry('warn', message, context);
    this.writeLog(entry);
  }

  error(message: string, error?: Error | unknown, context?: Record<string, any>): void {
    const entry = this.createEntry('error', message, context);
    
    if (error instanceof Error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    } else if (error) {
      entry.error = {
        name: 'Unknown',
        message: String(error),
      };
    }
    
    this.writeLog(entry);
  }

  fatal(message: string, error?: Error | unknown, context?: Record<string, any>): void {
    const entry = this.createEntry('fatal', message, context);
    
    if (error instanceof Error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }
    
    this.writeLog(entry);
  }

  /**
   * Логирование с информацией о пользователе
   */
  withUser(user: { id?: string; email?: string; role?: string }) {
    return {
      debug: (message: string, context?: Record<string, any>) => {
        const entry = this.createEntry('debug', message, context);
        entry.user = user;
        this.writeLog(entry);
      },
      info: (message: string, context?: Record<string, any>) => {
        const entry = this.createEntry('info', message, context);
        entry.user = user;
        this.writeLog(entry);
      },
      warn: (message: string, context?: Record<string, any>) => {
        const entry = this.createEntry('warn', message, context);
        entry.user = user;
        this.writeLog(entry);
      },
      error: (message: string, error?: Error | unknown, context?: Record<string, any>) => {
        const entry = this.createEntry('error', message, context);
        entry.user = user;
        if (error instanceof Error) {
          entry.error = {
            name: error.name,
            message: error.message,
            stack: error.stack,
          };
        }
        this.writeLog(entry);
      },
    };
  }

  /**
   * Логирование с информацией о запросе
   */
  withRequest(request: { method?: string; url?: string; ip?: string; userAgent?: string }) {
    return {
      info: (message: string, context?: Record<string, any>) => {
        const entry = this.createEntry('info', message, context);
        entry.request = request;
        this.writeLog(entry);
      },
      warn: (message: string, context?: Record<string, any>) => {
        const entry = this.createEntry('warn', message, context);
        entry.request = request;
        this.writeLog(entry);
      },
      error: (message: string, error?: Error | unknown, context?: Record<string, any>) => {
        const entry = this.createEntry('error', message, context);
        entry.request = request;
        if (error instanceof Error) {
          entry.error = {
            name: error.name,
            message: error.message,
            stack: error.stack,
          };
        }
        this.writeLog(entry);
      },
    };
  }

  /**
   * Логирование производительности
   */
  performance(operation: string, durationMs: number, context?: Record<string, any>): void {
    const level: LogLevel = durationMs > 3000 ? 'warn' : 'info';
    const message = `${operation} завершена за ${durationMs}ms`;
    
    const entry = this.createEntry(level, message, {
      ...context,
      duration_ms: durationMs,
      operation,
    });
    
    this.writeLog(entry);
  }
}

// =============================================
// ЭКСПОРТ SINGLETON
// =============================================

export const logger = new Logger();

// =============================================
// ХЕЛПЕРЫ
// =============================================

/**
 * Обернуть async функцию с логированием ошибок
 */
export function withErrorLogging<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  operationName: string
): T {
  return (async (...args: any[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      logger.error(`Ошибка в ${operationName}`, error, { args });
      throw error;
    }
  }) as T;
}

/**
 * Измерить время выполнения функции
 */
export async function measurePerformance<T>(
  fn: () => Promise<T>,
  operationName: string,
  context?: Record<string, any>
): Promise<T> {
  const start = Date.now();
  try {
    const result = await fn();
    const duration = Date.now() - start;
    logger.performance(operationName, duration, context);
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    logger.error(`${operationName} завершилась с ошибкой`, error, {
      ...context,
      duration_ms: duration,
    });
    throw error;
  }
}
