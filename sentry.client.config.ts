/**
 * SENTRY CLIENT CONFIGURATION
 * Мониторинг ошибок на клиенте
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,
  
  // Environment
  environment: process.env.NODE_ENV,
  
  // Release tracking (для связи с Git commits)
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || 'development',
  
  // Sampling rates
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Replay sessions (для debugging)
  replaysSessionSampleRate: 0.1, // 10% сессий
  replaysOnErrorSampleRate: 1.0, // 100% когда ошибка
  
  // Integrations
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  
  // Before send - фильтрация ошибок
  beforeSend(event, hint) {
    // Игнорируем known browser errors
    const error = hint.originalException;
    
    if (error && typeof error === 'object' && 'message' in error) {
      const message = (error as Error).message;
      
      // Игнорируем browser extensions errors
      if (message.includes('chrome-extension://')) {
        return null;
      }
      
      // Игнорируем cancellation errors
      if (message.includes('AbortError') || message.includes('cancelled')) {
        return null;
      }
    }
    
    // Фильтруем чувствительные данные
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
    }
    
    if (event.request?.data) {
      // Маскируем пароли и токены
      const data = event.request.data as Record<string, any>;
      if (typeof data === 'object' && data !== null) {
        for (const key of Object.keys(data)) {
          if (key.toLowerCase().includes('password') || 
              key.toLowerCase().includes('token') ||
              key.toLowerCase().includes('secret')) {
            data[key] = '[REDACTED]';
          }
        }
      }
    }
    
    return event;
  },
  
  // Ignore specific errors
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    'chrome-extension',
    'moz-extension',
    
    // Network errors
    'NetworkError',
    'Failed to fetch',
    'Load failed',
    
    // Random plugins/extensions
    'fb_xd_fragment',
    '__gCrWeb',
    
    // Cancelled requests
    'AbortError',
    'cancelled',
  ],
  
  // Ignore specific URLs
  denyUrls: [
    // Browser extensions
    /extensions\//i,
    /^chrome:\/\//i,
    /^moz-extension:\/\//i,
  ],
});
