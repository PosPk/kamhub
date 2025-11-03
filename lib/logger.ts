/**
 * CENTRALIZED LOGGING SYSTEM
 * 
 * Replaces console.log with structured logging
 * - Development: logs to console
 * - Production: logs to console + optional external service (Sentry)
 * 
 * Usage:
 *   import { logger } from '@/lib/logger';
 *   logger.info('User logged in', { userId: '123' });
 *   logger.error('Payment failed', error, { paymentId: 'pay_123' });
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

interface ErrorInfo {
  message: string;
  stack?: string;
  name?: string;
  [key: string]: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';

  /**
   * Debug logs - only in development
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, context || '');
    }
  }

  /**
   * Info logs - for general information
   */
  info(message: string, context?: LogContext): void {
    const timestamp = new Date().toISOString();
    console.info(`[INFO] ${timestamp} - ${message}`, context || '');
  }

  /**
   * Warning logs - for warnings that don't break functionality
   */
  warn(message: string, context?: LogContext): void {
    const timestamp = new Date().toISOString();
    console.warn(`[WARN] ${timestamp} - ${message}`, context || '');
    
    // In production, could send to monitoring service
    if (this.isProduction) {
      // TODO: Send to monitoring service if needed
    }
  }

  /**
   * Error logs - for errors that need attention
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const timestamp = new Date().toISOString();
    
    const errorInfo: ErrorInfo = error instanceof Error
      ? {
          message: error.message,
          stack: error.stack,
          name: error.name,
        }
      : error
      ? { error }
      : {};

    console.error(`[ERROR] ${timestamp} - ${message}`, {
      ...context,
      ...errorInfo,
    });

    // In production, send to error tracking service
    if (this.isProduction) {
      // TODO: Integrate with Sentry or similar
      // if (process.env.SENTRY_DSN) {
      //   Sentry.captureException(error, { extra: context });
      // }
    }
  }

  /**
   * Log API request
   */
  request(method: string, path: string, statusCode: number, duration?: number): void {
    const emoji = statusCode >= 500 ? '🔴' : statusCode >= 400 ? '🟡' : '🟢';
    this.info(`${emoji} ${method} ${path} → ${statusCode}${duration ? ` (${duration}ms)` : ''}`);
  }

  /**
   * Log database query (for debugging)
   */
  query(query: string, params?: any[], duration?: number): void {
    if (this.isDevelopment) {
      this.debug(`DB Query: ${query}`, {
        params: params?.slice(0, 5), // Limit params for readability
        duration: duration ? `${duration}ms` : undefined,
      });
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export type for TypeScript
export type { LogLevel, LogContext };
