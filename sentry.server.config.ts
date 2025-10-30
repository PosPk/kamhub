/**
 * SENTRY SERVER CONFIGURATION
 * Мониторинг ошибок на сервере
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,
  
  // Environment
  environment: process.env.NODE_ENV,
  
  // Release tracking
  release: process.env.VERCEL_GIT_COMMIT_SHA || 'development',
  
  // Sampling rates
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Before send - фильтрация данных
  beforeSend(event, hint) {
    // Фильтруем чувствительные данные
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
      delete event.request.headers['x-csrf-token'];
    }
    
    if (event.request?.data) {
      const data = event.request.data;
      if (typeof data === 'object') {
        // Маскируем конфиденциальные поля
        const sensitiveFields = [
          'password', 'token', 'secret', 'apiKey', 'api_key',
          'privateKey', 'private_key', 'creditCard', 'credit_card',
          'ssn', 'socialSecurity', 'passport'
        ];
        
        for (const key of Object.keys(data)) {
          const lowerKey = key.toLowerCase();
          if (sensitiveFields.some(field => lowerKey.includes(field))) {
            data[key] = '[REDACTED]';
          }
        }
      }
    }
    
    // Добавляем контекст
    event.contexts = {
      ...event.contexts,
      runtime: {
        name: 'node',
        version: process.version,
      },
    };
    
    return event;
  },
  
  // Ignore errors
  ignoreErrors: [
    // Database connection timeouts (handled gracefully)
    'Connection terminated',
    'Connection timeout',
    
    // Expected validation errors
    'ValidationError',
    'VALIDATION_ERROR',
    
    // Expected business logic errors
    'INSUFFICIENT_SEATS',
    'LOCK_TIMEOUT',
  ],
});
